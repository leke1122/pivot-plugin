import { useCallback, useMemo, useState } from 'react'
import type { FieldInfo, PivotConfig, ValueFieldConfig } from '@/types'
import { defaultAggForField } from '@/lib/cellValue'

export type ZoneId = 'rows' | 'columns' | 'values' | 'filters'

const ZONE_LIMITS: Record<ZoneId, number> = {
  rows: 8,
  columns: 4,
  values: 6,
  filters: 10,
}

export function usePivotConfig(fields: FieldInfo[]) {
  const [rowFieldIds, setRowFieldIds] = useState<string[]>([])
  const [colFieldIds, setColFieldIds] = useState<string[]>([])
  const [valueFields, setValueFields] = useState<ValueFieldConfig[]>([])
  const [filterFieldIds, setFilterFieldIds] = useState<string[]>([])

  const fieldMap = useMemo(() => new Map(fields.map((f) => [f.id, f])), [fields])

  const usedInOtherZones = useCallback(
    (fieldId: string, except: ZoneId) => {
      const map: Record<ZoneId, string[]> = {
        rows: rowFieldIds,
        columns: colFieldIds,
        values: valueFields.map((v) => v.fieldId),
        filters: filterFieldIds,
      }
      return (Object.keys(map) as ZoneId[])
        .filter((z) => z !== except)
        .some((z) => map[z].includes(fieldId))
    },
    [rowFieldIds, colFieldIds, valueFields, filterFieldIds],
  )

  const addToZone = useCallback(
    (zone: ZoneId, fieldId: string) => {
      if (!fieldMap.has(fieldId) || usedInOtherZones(fieldId, zone)) return

      const field = fieldMap.get(fieldId)!
      switch (zone) {
        case 'rows':
          if (rowFieldIds.length >= ZONE_LIMITS.rows) return
          if (!rowFieldIds.includes(fieldId))
            setRowFieldIds((prev) => [...prev, fieldId])
          break
        case 'columns':
          if (colFieldIds.length >= ZONE_LIMITS.columns) return
          if (!colFieldIds.includes(fieldId))
            setColFieldIds((prev) => [...prev, fieldId])
          break
        case 'values':
          if (valueFields.length >= ZONE_LIMITS.values) return
          if (valueFields.some((v) => v.fieldId === fieldId)) return
          setValueFields((prev) => [
            ...prev,
            { fieldId, agg: defaultAggForField(field.type) },
          ])
          break
        case 'filters':
          if (filterFieldIds.length >= ZONE_LIMITS.filters) return
          if (!filterFieldIds.includes(fieldId))
            setFilterFieldIds((prev) => [...prev, fieldId])
          break
      }
    },
    [fieldMap, usedInOtherZones, rowFieldIds, colFieldIds, valueFields, filterFieldIds],
  )

  const removeFromZone = useCallback((zone: ZoneId, fieldId: string) => {
    switch (zone) {
      case 'rows':
        setRowFieldIds((prev) => prev.filter((id) => id !== fieldId))
        break
      case 'columns':
        setColFieldIds((prev) => prev.filter((id) => id !== fieldId))
        break
      case 'values':
        setValueFields((prev) => prev.filter((v) => v.fieldId !== fieldId))
        break
      case 'filters':
        setFilterFieldIds((prev) => prev.filter((id) => id !== fieldId))
        break
    }
  }, [])

  const setValueAgg = useCallback((fieldId: string, agg: ValueFieldConfig['agg']) => {
    setValueFields((prev) =>
      prev.map((v) => (v.fieldId === fieldId ? { ...v, agg } : v)),
    )
  }, [])

  const clearAll = useCallback(() => {
    setRowFieldIds([])
    setColFieldIds([])
    setValueFields([])
    setFilterFieldIds([])
  }, [])

  const config: PivotConfig = useMemo(
    () => ({
      rowFieldIds,
      colFieldIds,
      valueFields,
      filterFieldIds,
    }),
    [rowFieldIds, colFieldIds, valueFields, filterFieldIds],
  )

  return {
    config,
    rowFieldIds,
    colFieldIds,
    valueFields,
    filterFieldIds,
    addToZone,
    removeFromZone,
    setValueAgg,
    clearAll,
    fieldMap,
  }
}
