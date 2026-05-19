import { useMemo } from 'react'
import { useBitableData } from '@/hooks/useBitableData'
import { usePivotConfig } from '@/hooks/usePivotConfig'
import { buildPivot, emptyPivot } from '@/lib/pivotEngine'
import { PivotSidebar } from '@/components/PivotSidebar'
import { PivotTableView } from '@/components/PivotTableView'
import './App.css'

function App() {
  const data = useBitableData()
  const pivot = usePivotConfig(data.fields)

  const usedFieldIds = useMemo(() => {
    const ids = new Set<string>()
    pivot.rowFieldIds.forEach((id) => ids.add(id))
    pivot.colFieldIds.forEach((id) => ids.add(id))
    pivot.valueFields.forEach((v) => ids.add(v.fieldId))
    pivot.filterFieldIds.forEach((id) => ids.add(id))
    return ids
  }, [pivot.rowFieldIds, pivot.colFieldIds, pivot.valueFields, pivot.filterFieldIds])

  const pivotResult = useMemo(() => {
    if (!pivot.config.valueFields.length || !data.rows.length) return emptyPivot()
    return buildPivot(data.rows, pivot.config, data.fields)
  }, [data.rows, data.fields, pivot.config])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__title">
          <h1>多维表透视分析</h1>
          <p className="app-header__meta">
            {data.tableName ? `当前表：${data.tableName}` : '未选择数据表'}
            {data.recordTotal > 0 && ` · ${data.recordTotal.toLocaleString()} 条记录`}
          </p>
        </div>
        <div className="app-header__actions">
          {data.tables.length > 1 && (
            <select
              className="select"
              value={data.tableId ?? ''}
              disabled={data.loading}
              onChange={(e) => data.setTableId(e.target.value)}
            >
              {data.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="btn"
            disabled={data.loading}
            onClick={data.reload}
          >
            {data.loading ? '加载中…' : '刷新数据'}
          </button>
        </div>
      </header>

      {data.error && <div className="app-banner app-banner--error">{data.error}</div>}

      <main className="app-main">
        <section className="app-main__content">
          {data.loading && !data.rows.length ? (
            <div className="pivot-loading">正在读取多维表格数据…</div>
          ) : (
            <PivotTableView
              result={pivotResult}
              emptyHint={
                data.rows.length
                  ? '请在右侧将字段拖入「值」区域（可选行、列）'
                  : '当前数据表没有记录，请先添加数据'
              }
            />
          )}
        </section>
        <PivotSidebar
          fields={data.fields}
          usedFieldIds={usedFieldIds}
          rowFieldIds={pivot.rowFieldIds}
          colFieldIds={pivot.colFieldIds}
          valueFields={pivot.valueFields}
          filterFieldIds={pivot.filterFieldIds}
          fieldMap={pivot.fieldMap}
          onAddToZone={pivot.addToZone}
          onRemoveFromZone={pivot.removeFromZone}
          onSetValueAgg={pivot.setValueAgg}
          onClear={pivot.clearAll}
        />
      </main>
    </div>
  )
}

export default App
