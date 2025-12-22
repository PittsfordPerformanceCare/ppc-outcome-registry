import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeMetrics } from '@/hooks/useLeadershipAnalytics';
import { Clock, TrendingUp } from 'lucide-react';

interface TimeModuleProps {
  metrics: TimeMetrics;
}

export function TimeModule({ metrics }: TimeModuleProps) {
  const formatDays = (days: number | null) => {
    if (days === null) return '—';
    return `${Math.round(days)} days`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" />
          Time-to-Resolution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Duration from baseline to discharge per Care Target. Median is the primary metric.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Metric */}
        <div className="p-4 rounded-lg bg-warning-soft border border-warning/20">
          <p className="text-sm text-muted-foreground mb-1">Median Days to Resolution</p>
          <p className="text-3xl font-bold text-warning">
            {formatDays(metrics.medianDaysToResolution)}
          </p>
        </div>

        {/* IQR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-secondary/30 border">
            <p className="text-xs text-muted-foreground mb-1">25th Percentile</p>
            <p className="text-lg font-semibold">{formatDays(metrics.percentile25)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border">
            <p className="text-xs text-muted-foreground mb-1">75th Percentile</p>
            <p className="text-lg font-semibold">{formatDays(metrics.percentile75)}</p>
          </div>
        </div>

        {/* By Domain */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            By Domain
          </h4>
          <div className="space-y-2">
            {Object.entries(metrics.byDomain).map(([domain, data]) => (
              <div
                key={domain}
                className="flex items-center justify-between p-2 rounded bg-secondary/20"
              >
                <span className="font-medium">{domain}</span>
                <div className="text-right">
                  <span className="font-semibold">{formatDays(data.median)}</span>
                  <span className="text-xs text-muted-foreground ml-2">(n={data.count})</span>
                </div>
              </div>
            ))}
            {Object.keys(metrics.byDomain).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No resolution data available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
