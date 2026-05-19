import type { FieldType } from '@lark-base-open/js-sdk'

export type AggFn = 'sum' | 'count' | 'avg' | 'min' | 'max'

export interface FieldInfo {
  id: string
  name: string
  type: FieldType
  isPrimary: boolean
}

export interface ValueFieldConfig {
  fieldId: string
  agg: AggFn
}

export interface PivotZone {
  id: 'rows' | 'columns' | 'values' | 'filters'
  label: string
  acceptMultiple: boolean
}

export type FlatRow = Record<string, string | number | null>

export interface PivotResult {
  rowKeys: string[]
  colKeys: string[]
  rowLabels: string[][]
  colLabels: string[][]
  /** [rowIndex][colIndex * valueFields + valueIndex] */
  matrix: (number | null)[][]
  valueHeaders: string[]
  grandTotals: (number | null)[]
}

export interface PivotConfig {
  rowFieldIds: string[]
  colFieldIds: string[]
  valueFields: ValueFieldConfig[]
  filterFieldIds: string[]
}
