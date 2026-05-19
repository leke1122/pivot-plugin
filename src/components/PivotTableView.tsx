import type { PivotResult } from '@/types'

interface PivotTableViewProps {
  result: PivotResult
  emptyHint?: string
}

export function PivotTableView({ result, emptyHint }: PivotTableViewProps) {
  const valueCount = Math.max(result.valueHeaders.length, 1)
  const colKeys = result.colKeys.length ? result.colKeys : ['(值)']
  const rowDimCount = Math.max(result.rowLabels[0]?.length ?? 1, 1)

  if (!result.valueHeaders.length) {
    return (
      <div className="pivot-empty">
        {emptyHint ?? '请在右侧将字段拖入行、列、值区域以生成透视表'}
      </div>
    )
  }

  return (
    <div className="pivot-table-wrap">
      <table className="pivot-table">
        <thead>
          <tr>
            <th colSpan={rowDimCount} className="pivot-table__corner">
              行 \ 列
            </th>
            {colKeys.flatMap((ck, ci) =>
              result.valueHeaders.map((vh, vi) => (
                <th key={`${ck}-${ci}-${vi}`}>
                  <div>{result.colLabels[ci]?.join(' / ') || '(值)'}</div>
                  <div className="pivot-table__sub">{vh}</div>
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {result.rowLabels.map((rl, ri) => (
            <tr key={result.rowKeys[ri] ?? ri}>
              {rl.length ? (
                rl.map((label, li) => (
                  <th key={li} className="pivot-table__row-head">
                    {label}
                  </th>
                ))
              ) : (
                <th className="pivot-table__row-head">(总计)</th>
              )}
              {Array.from({ length: colKeys.length * valueCount }, (_, ci) => {
                const cell = result.matrix[ri]?.[ci]
                return (
                  <td key={ci} className="pivot-table__cell">
                    {cell === null || cell === undefined ? '—' : formatNumber(cell)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString('zh-CN')
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}
