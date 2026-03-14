"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    month: string;
    value: number;
  }>;
}

const currencyFormatter = (value: number): string => {
  return `₦${(value / 100000).toFixed(1)}k`;
};

const TooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-lg border border-slate-700 dark:border-slate-600 shadow-lg">
      <p className="text-sm text-slate-300 font-medium">{data.name}</p>
      <p className="text-base font-bold text-blue-400">
        ₦
        {(data.value / 100).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="currentColor"
          className="text-slate-600 dark:text-slate-400"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="currentColor"
          className="text-slate-600 dark:text-slate-400"
          tickFormatter={currencyFormatter}
          style={{ fontSize: "12px" }}
        />
        <Tooltip content={<TooltipContent />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
