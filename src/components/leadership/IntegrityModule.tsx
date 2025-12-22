import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IntegrityMetrics } from '@/hooks/useLeadershipAnalytics';
import { Shield, CheckCircle2, AlertTriangle, FileX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface IntegrityModuleProps {
  metrics: IntegrityMetrics;
}

export function IntegrityModule({ metrics }: IntegrityModuleProps) {
  const getIntegrityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-info" />
          Data Quality & Integrity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registry defensibility metrics. Non-punitive framing for internal use only.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Integrity Score */}
        <div className="p-4 rounded-lg bg-info-soft border border-info/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Complete Baseline + Discharge Symmetry</p>
            <Badge variant="outline" className={getIntegrityColor(metrics.completeSymmetryPercentage)}>
              {metrics.completeSymmetryPercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={metrics.completeSymmetryPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.completeSymmetryCount} of {metrics.totalCareTargets} Care Targets have full outcome symmetry
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border bg-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-medium">Complete</p>
            </div>
            <p className="text-xl font-bold">{metrics.completeSymmetryCount}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.completeSymmetryPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 rounded-lg border bg-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium">Overrides</p>
            </div>
            <p className="text-xl font-bold">{metrics.overrideCount}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.overridePercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Missingness by Instrument */}
        {Object.keys(metrics.missingnessByInstrument).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileX className="h-4 w-4 text-muted-foreground" />
              Incomplete Records by Instrument
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.missingnessByInstrument)
                .sort(([, a], [, b]) => b - a)
                .map(([instrument, count]) => (
                  <div
                    key={instrument}
                    className="flex items-center justify-between p-2 rounded bg-destructive-soft"
                  >
                    <span className="text-sm">{instrument}</span>
                    <Badge variant="destructive" className="text-xs">
                      {count} incomplete
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {Object.keys(metrics.missingnessByInstrument).length === 0 && (
          <div className="p-3 rounded-lg bg-success-soft border border-success/20 text-center">
            <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-sm text-success font-medium">No incomplete instrument records</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
