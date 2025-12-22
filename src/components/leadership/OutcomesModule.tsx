import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OutcomeMetrics } from '@/hooks/useLeadershipAnalytics';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OutcomesModuleProps {
  metrics: OutcomeMetrics;
}

export function OutcomesModule({ metrics }: OutcomesModuleProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Outcome Improvement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Per-instrument improvement metrics. Instruments are never blended into a single score.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-accent-soft border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Care Targets Improved</p>
            <p className="text-2xl font-bold text-accent">
              {metrics.improvedPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.improvedCount} of {metrics.totalWithOutcomes}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-sm text-muted-foreground">MCID Achieved</p>
              <Badge variant="outline" className="text-xs px-1 py-0">ref</Badge>
            </div>
            <p className="text-2xl font-bold text-primary">
              {metrics.mcidPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.mcidAchievedCount} of {metrics.totalWithOutcomes}
            </p>
          </div>
        </div>

        {/* MCID Note */}
        <Alert variant="default" className="border-warning/50 bg-warning-soft">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            MCID (Minimal Clinically Important Difference) is an <strong>interpretive reference only</strong>. 
            Thresholds may vary by population and should not be treated as universal.
          </AlertDescription>
        </Alert>

        {/* Median Delta by Instrument */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Median Delta by Instrument
          </h4>
          <div className="space-y-3">
            {Object.entries(metrics.medianDeltaByInstrument).map(([instrument, data]) => {
              const isPositive = data.median >= 0;
              return (
                <div key={instrument} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{instrument}</span>
                    <span className={isPositive ? 'text-success' : 'text-destructive'}>
                      {isPositive ? '+' : ''}{data.median.toFixed(1)} (n={data.count})
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(Math.abs(data.median) * 5, 100)} 
                    className={`h-2 ${isPositive ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
                  />
                </div>
              );
            })}
            {Object.keys(metrics.medianDeltaByInstrument).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No instrument data available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
