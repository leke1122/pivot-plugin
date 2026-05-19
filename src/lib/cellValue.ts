import type { IOpenCellValue } from '@lark-base-open/js-sdk'
import { FieldType } from '@lark-base-open/js-sdk'

/** 将单元格值规范为透视可用的原始值 */
export function normalizeCellValue(
  raw: IOpenCellValue | string | null | undefined,
): string | number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'string') return raw.trim() === '' ? null : raw
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  if (typeof raw === 'boolean') return raw ? 1 : 0

  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => {
        if (item == null) return ''
        if (typeof item === 'string') return item
        if (typeof item === 'number') return String(item)
        if (typeof item === 'object') {
          const obj = item as Record<string, unknown>
          if (typeof obj.text === 'string') return obj.text
          if (typeof obj.name === 'string') return obj.name
          if (typeof obj.option_id === 'string' && typeof obj.text === 'string')
            return obj.text as string
        }
        return ''
      })
      .filter(Boolean)
    return parts.length ? parts.join(', ') : null
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (typeof obj.text === 'string') return obj.text
    if (typeof obj.name === 'string') return obj.name
    if (Array.isArray(obj.value)) return normalizeCellValue(obj.value as IOpenCellValue)
    if (typeof obj.value === 'number') return obj.value
    if (typeof obj.value === 'string') return obj.value
    if (Array.isArray(obj.segments)) {
      return normalizeCellValue(obj.segments as IOpenCellValue)
    }
  }

  return String(raw)
}

export function isNumericField(type: FieldType): boolean {
  return [
    FieldType.Number,
    FieldType.Currency,
    FieldType.Progress,
    FieldType.Rating,
    FieldType.AutoNumber,
  ].includes(type)
}

export function defaultAggForField(type: FieldType): 'sum' | 'count' {
  return isNumericField(type) ? 'sum' : 'count'
}

export function formatDisplayValue(value: string | number | null): string {
  if (value === null) return '(空)'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  return value
}
