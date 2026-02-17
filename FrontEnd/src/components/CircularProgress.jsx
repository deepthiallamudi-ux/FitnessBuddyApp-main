import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"

export default function CircularProgress({ value }) {
  const data = [{ name: "progress", value }]

  return (
    <div className="w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            minAngle={15}
            dataKey="value"
            fill="#0F2A1D"
            cornerRadius={20}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
        {Math.round(value)}%
      </div>
    </div>
  )
}
