import { MonthlyDataPoint } from "@/actions/analytics/types";

export function BarChart({
  data,
  title,
  subtitle,
  icon: Icon,
  barColor,
  formatValue,
}: {
  data: MonthlyDataPoint[];
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  barColor: string;
  formatValue: (val: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-secondary-text" />
            <h3 className="text-base font-semibold text-primary-text">
              {title}
            </h3>
          </div>
          <p className="text-sm text-secondary-text">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-text">
            {formatValue(data.reduce((sum, d) => sum + d.value, 0))}
          </p>
          <p className="text-xs text-secondary-text">6-month total</p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-36">
        {data.map((point, idx) => {
          const heightPercent = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-secondary-text tabular-nums">
                {point.value > 0 ? formatValue(point.value) : "–"}
              </span>
              <div className="w-full flex items-end h-24">
                <div
                  className={`w-full rounded-t-md transition-all ${barColor}`}
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    minHeight: "3px",
                    opacity: point.value === 0 ? 0.2 : 1,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-secondary-text">
                {point.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
