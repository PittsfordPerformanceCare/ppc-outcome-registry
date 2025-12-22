import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResolutionMetrics } from '@/hooks/useLeadershipAnalytics';
import { CheckCircle, PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ResolutionModuleProps {
  metrics: ResolutionMetrics;
}

export function ResolutionModule({ metrics }: ResolutionModuleProps) {
  const sortedReasons = Object.entries(metrics.dischargeReasonDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalReasons = Object.values(metrics.dischargeReasonDistribution).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          Resolution & Completion
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Care Target discharge status by domain. Uses "discharged" framing, not "success."
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Discharged */}
        <div className="p-4 rounded-lg bg-success-soft border border-success/20">
          <p className="text-sm text-muted-foreground mb-1">Total Care Targets Discharged</p>
          <p className="text-3xl font-bold text-success">{metrics.totalDischarged.toLocaleString()}</p>
        </div>

        {/* Discharge Rate by Domain */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            Discharge Rate by Domain
          </h4>
          <div className="space-y-3">
            {Object.entries(metrics.dischargeRateByDomain).map(([domain, data]) => (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{domain}</span>
                  <span className="text-muted-foreground">
                    {data.discharged}/{data.total} ({data.rate.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={data.rate} className="h-2" />
              </div>
            ))}
            {Object.keys(metrics.dischargeRateByDomain).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No domain data available</p>
            )}
          </div>
        </div>

        {/* Discharge Reason Distribution */}
        <div>
          <h4 className="text-sm font-medium mb-3">Discharge Reason Distribution</h4>
          <div className="space-y-2">
            {sortedReasons.map(([reason, count]) => {
              const percentage = totalReasons > 0 ? (count / totalReasons) * 100 : 0;
              return (
                <div key={reason} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{reason}</span>
                  <span className="text-muted-foreground ml-2">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
            {sortedReasons.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No discharge reasons recorded</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
