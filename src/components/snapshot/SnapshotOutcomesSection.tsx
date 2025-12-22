import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Info } from 'lucide-react';
import { OutcomeMetrics } from '@/hooks/useLeadershipAnalytics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SnapshotOutcomesSectionProps {
  outcomes: OutcomeMetrics;
  asOfDate: string;
}

export function SnapshotOutcomesSection({ outcomes, asOfDate }: SnapshotOutcomesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Outcome Improvement
        </CardTitle>
        <p className="text-xs text-muted-foreground">As of {asOfDate}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-2xl font-bold text-success">
              {outcomes.improvedPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Care Targets Improved</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{outcomes.mcidPercentage.toFixed(1)}%</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-48">MCID is an interpretive reference threshold and may vary by population and context.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">Achieved MCID*</p>
          </div>
        </div>

        {Object.keys(outcomes.medianDeltaByInstrument).length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">By Instrument</p>
            <div className="space-y-2">
              {Object.entries(outcomes.medianDeltaByInstrument).map(([instrument, data]) => (
                <div key={instrument} className="flex justify-between items-center text-sm p-2 rounded bg-muted/30">
                  <span className="text-muted-foreground">{instrument}</span>
                  <div className="text-right">
                    <span className="font-medium">Δ {data.median.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground ml-2">(n={data.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic pt-2">
          *MCID = Minimal Clinically Important Difference (interpretive reference only)
        </p>
      </CardContent>
    </Card>
  );
}
