import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { TimeMetrics } from '@/hooks/useLeadershipAnalytics';

interface SnapshotTimeSectionProps {
  time: TimeMetrics;
  asOfDate: string;
}

export function SnapshotTimeSection({ time, asOfDate }: SnapshotTimeSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Time-to-Resolution
        </CardTitle>
        <p className="text-xs text-muted-foreground">As of {asOfDate}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-2xl font-bold text-primary">
              {time.medianDaysToResolution !== null ? `${time.medianDaysToResolution.toFixed(0)}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Median Days</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">
              {time.percentile25 !== null && time.percentile75 !== null 
                ? `${time.percentile25.toFixed(0)}–${time.percentile75.toFixed(0)}`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">IQR (25th–75th)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
