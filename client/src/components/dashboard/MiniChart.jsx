import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getMonthLabel, formatNumber } from '../../lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-nude-medium/40 rounded-xl px-3 py-2 shadow-soft">
        <p className="text-xs font-body text-dark/50 mb-0.5">{label}</p>
        <p className="text-sm font-body font-semibold text-gold">
          {formatNumber(payload[0].value)} seguidores
        </p>
      </div>
    )
  }
  return null
}

export default function MiniChart({ data = [], className }) {
  // data: [{ month: "2026-01", followers: 1234 }, ...]
  const chartData = data.map((d) => ({
    ...d,
    label: getMonthLabel(d.month),
  }))

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center h-32 text-sm font-body text-dark/30 ${className}`}>
        Sem dados históricos
      </div>
    )
  }

  return (
    <div className={`h-36 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#2D2D2D80', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#C9A84C"
            strokeWidth={2}
            dot={{ fill: '#C9A84C', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#C9A84C' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
