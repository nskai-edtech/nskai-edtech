"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { UserGrowthPoint } from "@/actions/analytics/types";

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

const TooltipContent = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-lg border border-slate-700 dark:border-slate-600 shadow-lg">
      <p className="text-sm text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
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
          style={{ fontSize: "12px" }}
          allowDecimals={false}
        />
        <Tooltip content={<TooltipContent />} />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Bar
          dataKey="learners"
          name="Learners"
          fill="#06b6d4"
          radius={[4, 4, 0, 0]}
          stackId="stack"
        />
        <Bar
          dataKey="tutors"
          name="Tutors"
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
          stackId="stack"
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
