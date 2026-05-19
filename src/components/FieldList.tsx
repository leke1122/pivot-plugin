import type { FieldInfo } from '@/types'
import { isNumericField } from '@/lib/cellValue'

interface FieldListProps {
  fields: FieldInfo[]
  usedFieldIds: Set<string>
  onDragStart: (fieldId: string) => void
}

export function FieldList({ fields, usedFieldIds, onDragStart }: FieldListProps) {
  return (
    <div className="field-list">
      <div className="field-list__title">字段列表</div>
      <ul className="field-list__items">
        {fields.map((field) => (
          <li
            key={field.id}
            className={`field-chip ${usedFieldIds.has(field.id) ? 'field-chip--used' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/field-id', field.id)
              e.dataTransfer.effectAllowed = 'copy'
              onDragStart(field.id)
            }}
          >
            <span className="field-chip__name">{field.name}</span>
            <span className="field-chip__type">
              {isNumericField(field.type) ? '数值' : '维度'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
