import type { AggFn, FieldInfo } from '@/types'
import type { ZoneId } from '@/hooks/usePivotConfig'
import type { ValueFieldConfig } from '@/types'
import { FieldList } from './FieldList'

const ZONES: { id: ZoneId; label: string; hint: string }[] = [
  { id: 'filters', label: '筛选', hint: '仅保留非空记录' },
  { id: 'rows', label: '行', hint: '拖入作为行维度' },
  { id: 'columns', label: '列', hint: '拖入作为列维度' },
  { id: 'values', label: '值', hint: '拖入数值字段并汇总' },
]

interface PivotSidebarProps {
  fields: FieldInfo[]
  usedFieldIds: Set<string>
  rowFieldIds: string[]
  colFieldIds: string[]
  valueFields: ValueFieldConfig[]
  filterFieldIds: string[]
  fieldMap: Map<string, FieldInfo>
  onAddToZone: (zone: ZoneId, fieldId: string) => void
  onRemoveFromZone: (zone: ZoneId, fieldId: string) => void
  onSetValueAgg: (fieldId: string, agg: AggFn) => void
  onClear: () => void
}

export function PivotSidebar({
  fields,
  usedFieldIds,
  rowFieldIds,
  colFieldIds,
  valueFields,
  filterFieldIds,
  fieldMap,
  onAddToZone,
  onRemoveFromZone,
  onSetValueAgg,
  onClear,
}: PivotSidebarProps) {
  const zoneFields: Record<ZoneId, string[]> = {
    rows: rowFieldIds,
    columns: colFieldIds,
    values: valueFields.map((v) => v.fieldId),
    filters: filterFieldIds,
  }

  const handleDrop = (zone: ZoneId, e: React.DragEvent) => {
    e.preventDefault()
    const fieldId = e.dataTransfer.getData('text/field-id')
    if (fieldId) onAddToZone(zone, fieldId)
  }

  return (
    <aside className="pivot-sidebar">
      <div className="pivot-sidebar__header">
        <h2>透视字段</h2>
        <button type="button" className="btn btn--ghost" onClick={onClear}>
          清空
        </button>
      </div>

      <FieldList
        fields={fields}
        usedFieldIds={usedFieldIds}
        onDragStart={() => {}}
      />

      <div className="pivot-zones">
        {ZONES.map((zone) => (
          <div key={zone.id} className="pivot-zone">
            <div className="pivot-zone__label">
              <span>{zone.label}</span>
              <span className="pivot-zone__hint">{zone.hint}</span>
            </div>
            <div
              className="pivot-zone__drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(zone.id, e)}
            >
              {zoneFields[zone.id].length === 0 && (
                <span className="pivot-zone__placeholder">拖放字段到此处</span>
              )}
              {zoneFields[zone.id].map((fieldId) => {
                const field = fieldMap.get(fieldId)
                if (!field) return null
                const vf = valueFields.find((v) => v.fieldId === fieldId)
                return (
                  <div key={fieldId} className="zone-field">
                    <span>{field.name}</span>
                    {zone.id === 'values' && vf && (
                      <select
                        value={vf.agg}
                        onChange={(e) =>
                          onSetValueAgg(fieldId, e.target.value as AggFn)
                        }
                      >
                        <option value="sum">求和</option>
                        <option value="count">计数</option>
                        <option value="avg">平均值</option>
                        <option value="min">最小值</option>
                        <option value="max">最大值</option>
                      </select>
                    )}
                    <button
                      type="button"
                      className="zone-field__remove"
                      onClick={() => onRemoveFromZone(zone.id, fieldId)}
                      aria-label="移除"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
