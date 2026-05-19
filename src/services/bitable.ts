import {
  bitable,
  type IFieldMeta,
  type IRecord,
  type ITable,
  type ITableMeta,
} from '@lark-base-open/js-sdk'
import type { FieldInfo, FlatRow } from '@/types'
import { normalizeCellValue } from '@/lib/cellValue'

/** 飞书 SDK 单次记录操作上限为 200（见 SingleRecordOperationLimitExceeded） */
const PAGE_SIZE = 200

export function toFieldInfo(meta: IFieldMeta): FieldInfo {
  return {
    id: meta.id,
    name: meta.name,
    type: meta.type,
    isPrimary: meta.isPrimary,
  }
}

export async function listTables(): Promise<ITableMeta[]> {
  return bitable.base.getTableMetaList()
}

export async function getTableRecordTotal(table: ITable): Promise<number> {
  const res = await table.getRecordsByPage({ pageSize: 1 })
  return res.total
}

/** 优先当前表；否则用第一张表（避免初始化时遍历全库触发限流） */
export async function pickDefaultTableId(
  tableMetas: ITableMeta[],
): Promise<string | null> {
  if (!tableMetas.length) return null
  const activeId = await getActiveTableId()
  if (activeId && tableMetas.some((t) => t.id === activeId)) return activeId
  return tableMetas[0].id
}

export async function loadAllRecords(
  table: ITable,
  fieldIds: string[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<FlatRow[]> {
  const rows: FlatRow[] = []
  let pageToken: number | undefined
  let total = 0

  do {
    const res = await table.getRecordsByPage({
      pageSize: PAGE_SIZE,
      pageToken,
      stringValue: true,
    })
    total = res.total
    for (const record of res.records) {
      rows.push(recordToFlatRow(record, fieldIds))
    }
    onProgress?.(rows.length, total)
    pageToken = res.hasMore ? res.pageToken : undefined
  } while (pageToken !== undefined)

  return rows
}

function recordToFlatRow(record: IRecord, fieldIds: string[]): FlatRow {
  const row: FlatRow = { __recordId: record.recordId }
  for (const fieldId of fieldIds) {
    const raw = record.fields[fieldId]
    row[fieldId] = normalizeCellValue(raw)
  }
  return row
}

export async function getActiveTableId(): Promise<string | null> {
  try {
    const table = await bitable.base.getActiveTable()
    const meta = await table.getMeta()
    return meta.id
  } catch {
    return null
  }
}

export function subscribeTableChanges(
  table: ITable,
  onChange: () => void,
): () => void {
  const offs = [
    table.onRecordAdd(() => onChange()),
    table.onRecordDelete(() => onChange()),
    table.onRecordModify(() => onChange()),
    table.onFieldAdd(() => onChange()),
    table.onFieldDelete(() => onChange()),
    table.onFieldModify(() => onChange()),
  ]
  return () => offs.forEach((off) => off())
}

export function subscribeBaseChanges(onChange: () => void): () => void {
  const offs = [
    bitable.base.onSelectionChange(() => onChange()),
    bitable.base.onTableAdd(() => onChange()),
    bitable.base.onTableDelete(() => onChange()),
  ]
  return () => offs.forEach((off) => off())
}
