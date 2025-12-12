import type { DispositionItem } from "@/data/professionalOutcomes";

interface DispositionChartProps {
  items: DispositionItem[];
  minCellSize: number;
}

export function DispositionChart({ items, minCellSize }: DispositionChartProps) {
  const hasData = items && items.length > 0;

  if (!hasData) {
    return (
      <div className="border border-slate-200 border-dashed rounded-lg p-6 bg-slate-50/50">
        <p className="text-sm text-slate-500 italic">
          Coming soon — will display once sufficient episodes are available.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white">
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isSuppressed = item.n < minCellSize;

          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-700">{item.label}</p>
              </div>
              <div className="w-32 relative">
                <div className="h-6 bg-slate-100 rounded overflow-hidden">
                  {isSuppressed ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-slate-400">—</span>
                    </div>
                  ) : (
                    <div
                      className="h-full bg-slate-400 rounded"
                      style={{ width: `${item.percentage}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="w-12 text-right">
                {isSuppressed ? (
                  <span className="text-sm text-slate-400">—</span>
                ) : (
                  <span className="text-sm font-medium text-slate-700">
                    {item.percentage}%
                  </span>
                )}
              </div>
              <div className="w-14 text-right">
                <span className="text-xs text-slate-400">n={item.n}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
