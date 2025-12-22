import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplexityMetrics } from '@/hooks/useLeadershipAnalytics';
import { Layers, GitBranch, Clock } from 'lucide-react';

interface ComplexityModuleProps {
  metrics: ComplexityMetrics;
}

export function ComplexityModule({ metrics }: ComplexityModuleProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Multi-Complaint Complexity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          PPC's differentiator: managing multiple Care Targets per episode. Descriptive only.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Multi-Target Episodes</p>
            <p className="text-2xl font-bold text-primary">
              {metrics.multiCareTargetPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              ({metrics.multiCareTargetEpisodeCount} episodes)
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 border text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg. Targets/Episode</p>
            <p className="text-2xl font-bold">
              {metrics.averageCareTargetsPerEpisode.toFixed(1)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-warning-soft border border-warning/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Staggered Resolution</p>
            <p className="text-2xl font-bold text-warning">
              {metrics.staggeredResolutionPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              ({metrics.staggeredResolutionCount} episodes)
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <GitBranch className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Multi-Target Episodes</p>
              <p className="text-xs text-muted-foreground">
                Episodes addressing more than one complaint simultaneously
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Staggered Resolution</p>
              <p className="text-xs text-muted-foreground">
                Care Targets discharged at different times within the same episode
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
