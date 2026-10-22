import React from 'react'

/**
 * Lightweight dependency-free SVG line chart for labour-market trends.
 * props:
 *  series  : [{ name, color, values: (number|null)[] }]
 *  dates   : string[] (e.g. '2026-09')  — must be same length as each series' values
 *  height  : number (px)
 *  formatValue : (v) => string
 *  yLabel  : short axis label (bilingual)
 *  emptyText : shown when no data
 *  integerTicks : force whole-number y-axis ticks (for counts — never show decimals)
 */
export default function TrendChart({ series, dates, height = 190, formatValue = (v) => v.toFixed(1), yLabel = '', emptyText = '—', integerTicks = false }) {
  const [hover, setHover] = React.useState(null)
  const W = 640
  const H = height
  const pad = { top: 16, right: 16, bottom: 28, left: 54 }
  const iw = W - pad.left - pad.right
  const ih = H - pad.top - pad.bottom

  const numSeries = (series || []).map(s => ({
    ...s,
    nums: (s.values || []).map(v => (typeof v === 'number' && Number.isFinite(v) ? v : null)),
  }))
  const allVals = numSeries.flatMap(s => s.nums.filter(v => v != null))
  const n = (dates || []).length

  if (n === 0 || allVals.length === 0) {
    return <div className="trend-empty">{emptyText}</div>
  }

  const min = Math.min(...allVals)
  const max = Math.max(...allVals)
  const span = (max - min) || 1
  const yMin = min - span * 0.18
  const yMax = max + span * 0.18

  const ticks = 4
  // Whole-number ticks for counts (job postings) — never show decimals on counts
  let yMin2 = yMin, yMax2 = yMax, yTicks
  if (integerTicks) {
    const lo = Math.floor(yMin)
    const step = Math.max(1, Math.ceil((yMax - lo) / ticks))
    yMin2 = lo
    yMax2 = lo + step * ticks
    yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin2 + step * i)
  } else {
    yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin2 + ((yMax2 - yMin2) * i) / ticks)
  }

  const x = (i) => pad.left + (n === 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v) => pad.top + ih - ((v - yMin2) / (yMax2 - yMin2)) * ih
  const xStep = Math.max(1, Math.ceil(n / 7))
  const xTicks = dates.map((d, i) => ({ i, label: d })).filter((_, i) => i % xStep === 0 || i === n - 1)

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rx = ((e.clientX - rect.left) / rect.width) * W
    const ratio = Math.min(1, Math.max(0, (rx - pad.left) / iw))
    const idx = Math.round(ratio * (n - 1))
    setHover(idx)
  }

  const linePath = (nums) => {
    let d = ''
    let started = false
    nums.forEach((v, i) => {
      if (v == null) { started = false; return }
      const px = x(i), py = y(v)
      d += started ? ` L${px.toFixed(1)},${py.toFixed(1)}` : ` M${px.toFixed(1)},${py.toFixed(1)}`
      started = true
    })
    return d
  }
  const areaPath = (nums, color) => {
    const base = linePath(nums)
    if (!base) return ''
    // close along the last/first real point
    const realIdx = nums.map((v, i) => v == null ? -1 : i).filter(i => i >= 0)
    if (!realIdx.length) return ''
    const first = realIdx[0], last = realIdx[realIdx.length - 1]
    return `${base} L${x(last).toFixed(1)},${pad.top + ih} L${x(first).toFixed(1)},${pad.top + ih} Z`
  }

  const hoverVals = hover != null
    ? numSeries.map(s => ({ name: s.name, color: s.color, v: s.nums[hover] }))
    : null

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="trend-svg"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* grid + y labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
              {formatValue(t)}
            </text>
          </g>
        ))}
        {/* x labels */}
        {xTicks.map(({ i, label }) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7280">
            {label.length > 7 ? label.slice(0, 7) : label}
          </text>
        ))}
        {yLabel && (
          <text x={12} y={pad.top + ih / 2} textAnchor="middle" fontSize="10" fill="#9ca3af"
            transform={`rotate(-90 12 ${pad.top + ih / 2})`}>
            {yLabel}
          </text>
        )}
        {/* areas + lines */}
        {numSeries.map(s => {
          const ap = areaPath(s.nums, s.color)
          const lp = linePath(s.nums)
          return (
            <g key={s.name}>
              {ap && <path d={ap} fill={s.color} opacity="0.08" stroke="none" />}
              {lp && <path d={lp} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
            </g>
          )
        })}
        {/* hover crosshair */}
        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + ih} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 3" />
        )}
        {hover != null && numSeries.map(s => (
          s.nums[hover] != null && (
            <circle key={s.name} cx={x(hover)} cy={y(s.nums[hover])} r="3.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />
          )
        ))}
      </svg>
      {/* legend */}
      {numSeries.length > 1 && (
        <div className="trend-legend">
          {numSeries.map(s => (
            <span key={s.name} className="trend-legend-item">
              <span className="trend-legend-dot" style={{ background: s.color }}></span>
              {s.name}
            </span>
          ))}
        </div>
      )}
      {/* tooltip */}
      {hoverVals && hover != null && dates[hover] != null && (
        <div className="trend-tooltip" style={{ left: `${Math.min(88, Math.max(8, (x(hover) / W) * 100))}%`, top: 4 }}>
          <div className="trend-tooltip-date">{dates[hover]}</div>
          {hoverVals.map(hv => (
            hv.v != null && (
              <div key={hv.name} className="trend-tooltip-row">
                <span className="trend-legend-dot" style={{ background: hv.color }}></span>
                {hv.name}: <strong>{formatValue(hv.v)}</strong>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
