import { formatPrice } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import type { FailedPaymentRow } from "@/actions/analytics/types";

export function FailedPaymentsPanel({
  data,
  totalCount,
  totalAmount,
}: {
  data: FailedPaymentRow[];
  totalCount: number;
  totalAmount: number;
}) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-semibold text-primary-text">
              Failed Payments
            </h3>
          </div>
          <p className="text-sm text-secondary-text">
            {totalCount} total &middot; {formatPrice(totalAmount)} lost
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </p>
          <p className="text-xs text-secondary-text">last 6 months</p>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="py-8 text-center text-secondary-text text-sm">
          No failed payments recorded.
        </div>
      ) : (
        <div className="flex items-end gap-3 h-36">
          {data.map((point, idx) => {
            const heightPercent = maxVal > 0 ? (point.count / maxVal) * 100 : 0;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] font-medium text-secondary-text tabular-nums">
                  {point.count > 0 ? point.count : "–"}
                </span>
                <div className="w-full flex items-end h-24">
                  <div
                    className="w-full rounded-t-md transition-all bg-red-500 dark:bg-red-400"
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                      minHeight: "3px",
                      opacity: point.count === 0 ? 0.2 : 1,
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
      )}
    </div>
  );
}
