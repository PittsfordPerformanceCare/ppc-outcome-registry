import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { ResolutionMetrics } from '@/hooks/useLeadershipAnalytics';

interface SnapshotResolutionSectionProps {
  resolution: ResolutionMetrics;
  asOfDate: string;
}

export function SnapshotResolutionSection({ resolution, asOfDate }: SnapshotResolutionSectionProps) {
  const goalsMetPercentage = resolution.totalDischarged > 0
    ? ((resolution.dischargeReasonDistribution['goals_met'] || 0) / resolution.totalDischarged * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Resolution Patterns
        </CardTitle>
        <p className="text-xs text-muted-foreground">As of {asOfDate}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-2xl font-bold text-success">{goalsMetPercentage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Discharged with Goals Met</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{resolution.totalDischarged}</p>
            <p className="text-xs text-muted-foreground">Total Discharged</p>
          </div>
        </div>
        
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Discharge Reason Distribution</p>
          <div className="space-y-2">
            {Object.entries(resolution.dischargeReasonDistribution).map(([reason, count]) => {
              const percentage = resolution.totalDischarged > 0 
                ? (count / resolution.totalDischarged * 100).toFixed(1) 
                : '0';
              return (
                <div key={reason} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{reason.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
