import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PortfolioPoint } from "../../services/portfolioData";

interface PortfolioChartProps {
  data: PortfolioPoint[];
}

function PortfolioChart({ data }: PortfolioChartProps) {
  return (
    <div className="mt-6 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopOpacity={0.25} />

              <stop offset="100%" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />

          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Portfolio",
            ]}
          />

          <Area
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioChart;
