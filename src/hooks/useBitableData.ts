import { useCallback, useEffect, useRef, useState } from 'react'
import { bitable, type ITable, type ITableMeta } from '@lark-base-open/js-sdk'
import type { FieldInfo, FlatRow } from '@/types'
import {
  getActiveTableId,
  listTables,
  loadAllRecords,
  pickDefaultTableId,
  subscribeBaseChanges,
  subscribeTableChanges,
  toFieldInfo,
} from '@/services/bitable'

export interface BitableDataState {
  loading: boolean
  error: string | null
  tables: ITableMeta[]
  tableId: string | null
  tableName: string
  fields: FieldInfo[]
  rows: FlatRow[]
  recordTotal: number
  reload: () => void
  setTableId: (id: string) => void
}

export function useBitableData(): BitableDataState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<ITableMeta[]>([])
  const [tableId, setTableIdState] = useState<string | null>(null)
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [rows, setRows] = useState<FlatRow[]>([])
  const [recordTotal, setRecordTotal] = useState(0)
  const tableRef = useRef<ITable | null>(null)
  const reloadToken = useRef(0)

  const loadTableData = useCallback(async (targetId: string) => {
    const token = ++reloadToken.current
    setLoading(true)
    setError(null)
    try {
      const table = await bitable.base.getTable(targetId)
      tableRef.current = table
      const name = await table.getName()
      const metas = await table.getFieldMetaList()
      const fieldList = metas.map(toFieldInfo)
      const fieldIds = fieldList.map((f) => f.id)

      const data = await loadAllRecords(table, fieldIds, (_loaded, total) => {
        if (token === reloadToken.current) setRecordTotal(total)
      })

      if (token !== reloadToken.current) return

      setTableIdState(targetId)
      setTableName(name)
      setFields(fieldList)
      setRows(data)
      setRecordTotal(data.length)
    } catch (e) {
      if (token !== reloadToken.current) return
      setError(e instanceof Error ? e.message : '加载数据失败')
    } finally {
      if (token === reloadToken.current) setLoading(false)
    }
  }, [])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tableMetas = await listTables()
      setTables(tableMetas)
      if (!tableMetas.length) {
        setError('当前多维表格中没有数据表，请先创建数据表并添加记录。')
        setLoading(false)
        return
      }

      const activeId = await getActiveTableId()
      const defaultId =
        activeId && tableMetas.some((t) => t.id === activeId)
          ? activeId
          : await pickDefaultTableId(tableMetas)

      if (defaultId) await loadTableData(defaultId)
    } catch (e) {
      setError(e instanceof Error ? e.message : '初始化失败')
      setLoading(false)
    }
  }, [loadTableData])

  const reload = useCallback(() => {
    if (tableId) void loadTableData(tableId)
    else void init()
  }, [tableId, loadTableData, init])

  const setTableId = useCallback(
    (id: string) => {
      void loadTableData(id)
    },
    [loadTableData],
  )

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    const offBase = subscribeBaseChanges(() => {
      void getActiveTableId().then((activeId) => {
        if (activeId && activeId !== tableId) void loadTableData(activeId)
      })
    })
    return offBase
  }, [tableId, loadTableData])

  useEffect(() => {
    const table = tableRef.current
    if (!table) return
    return subscribeTableChanges(table, reload)
  }, [tableId, reload])

  return {
    loading,
    error,
    tables,
    tableId,
    tableName,
    fields,
    rows,
    recordTotal,
    reload,
    setTableId,
  }
}
