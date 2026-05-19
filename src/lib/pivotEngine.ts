import type { AggFn, FieldInfo, FlatRow, PivotConfig, PivotResult, ValueFieldConfig } from '@/types'
import { formatDisplayValue } from './cellValue'

const KEY_SEP = '\u0001'

function compositeKey(row: FlatRow, fieldIds: string[]): string {
  if (!fieldIds.length) return '(总计)'
  return fieldIds.map((id) => String(row[id] ?? '')).join(KEY_SEP)
}

function splitKey(key: string, depth: number): string[] {
  if (depth <= 0) return [key]
  const parts = key.split(KEY_SEP)
  while (parts.length < depth) parts.push('')
  return parts.slice(0, depth)
}

function aggregate(values: number[], agg: AggFn): number | null {
  if (!values.length) return null
  switch (agg) {
    case 'count':
      return values.length
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    default:
      return null
  }
}

function collectNumbers(rows: FlatRow[], fieldId: string): number[] {
  const nums: number[] = []
  for (const row of rows) {
    const v = row[fieldId]
    if (typeof v === 'number' && Number.isFinite(v)) nums.push(v)
    else if (v !== null && v !== undefined && v !== '') {
      const n = Number(v)
      if (Number.isFinite(n)) nums.push(n)
    }
  }
  return nums
}

function aggLabel(agg: AggFn, fieldName: string): string {
  const map: Record<AggFn, string> = {
    sum: '求和',
    count: '计数',
    avg: '平均值',
    min: '最小值',
    max: '最大值',
  }
  return `${map[agg]}:${fieldName}`
}

export function buildPivot(
  data: FlatRow[],
  config: PivotConfig,
  fields: FieldInfo[],
): PivotResult {
  const fieldMap = new Map(fields.map((f) => [f.id, f]))
  const { rowFieldIds, colFieldIds, valueFields } = config

  const filtered = applyFilters(data, config.filterFieldIds)

  const rowKeySet = new Set<string>()
  const colKeySet = new Set<string>()

  if (!colFieldIds.length) colKeySet.add('(值)')

  for (const row of filtered) {
    rowKeySet.add(compositeKey(row, rowFieldIds))
    colKeySet.add(compositeKey(row, colFieldIds))
  }

  const rowKeys = [...rowKeySet].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  const colKeys = [...colKeySet].sort((a, b) => a.localeCompare(b, 'zh-CN'))

  const buckets = new Map<string, FlatRow[]>()
  for (const row of filtered) {
    const rk = compositeKey(row, rowFieldIds)
    const ck = compositeKey(row, colFieldIds)
    const key = `${rk}${KEY_SEP}::${KEY_SEP}${ck}`
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }

  const valueHeaders = valueFields.map((vf) => {
    const name = fieldMap.get(vf.fieldId)?.name ?? vf.fieldId
    return aggLabel(vf.agg, name)
  })

  const matrix: (number | null)[][] = rowKeys.map((rk) => {
    return colKeys.flatMap((ck) =>
      valueFields.map((vf) => {
        const key = `${rk}${KEY_SEP}::${KEY_SEP}${ck}`
        const bucket = buckets.get(key) ?? []
        return computeValue(bucket, vf)
      }),
    )
  })

  const grandTotals = valueFields.map((vf, vi) => {
    const allCols = colKeys.length || 1
    const colTotals: number[] = []
    for (let ci = 0; ci < allCols; ci++) {
      for (let ri = 0; ri < rowKeys.length; ri++) {
        const v = matrix[ri]?.[ci * valueFields.length + vi]
        if (typeof v === 'number') colTotals.push(v)
      }
    }
    if (vf.agg === 'count' || vf.agg === 'sum') {
      return colTotals.reduce((a, b) => a + b, 0)
    }
    return aggregate(colTotals, vf.agg)
  })

  return {
    rowKeys,
    colKeys,
    rowLabels: rowKeys.map((k) =>
      splitKey(k, rowFieldIds.length).map((p) => formatDisplayValue(p || null)),
    ),
    colLabels: colKeys.map((k) =>
      splitKey(k, Math.max(colFieldIds.length, 1)).map((p) =>
        formatDisplayValue(p || null),
      ),
    ),
    matrix,
    valueHeaders,
    grandTotals,
  }
}

function applyFilters(data: FlatRow[], filterFieldIds: string[]): FlatRow[] {
  if (!filterFieldIds.length) return data
  return data.filter((row) =>
    filterFieldIds.every((id) => {
      const v = row[id]
      return v !== null && v !== undefined && v !== ''
    }),
  )
}

function computeValue(rows: FlatRow[], vf: ValueFieldConfig): number | null {
  if (vf.agg === 'count') {
    return rows.length
  }
  const nums = collectNumbers(rows, vf.fieldId)
  if (!nums.length) return null
  return aggregate(nums, vf.agg)
}

export function emptyPivot(): PivotResult {
  return {
    rowKeys: [],
    colKeys: [],
    rowLabels: [],
    colLabels: [],
    matrix: [],
    valueHeaders: [],
    grandTotals: [],
  }
}
