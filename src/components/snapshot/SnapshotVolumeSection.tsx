import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { VolumeMetrics, ComplexityMetrics } from '@/hooks/useLeadershipAnalytics';

interface SnapshotVolumeSectionProps {
  volume: VolumeMetrics;
  complexity: ComplexityMetrics;
  asOfDate: string;
}

export function SnapshotVolumeSection({ volume, complexity, asOfDate }: SnapshotVolumeSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Volume & Scope
        </CardTitle>
        <p className="text-xs text-muted-foreground">As of {asOfDate}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{volume.episodesClosed}</p>
            <p className="text-xs text-muted-foreground">Episodes Closed</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{volume.careTargetsDischarged}</p>
            <p className="text-xs text-muted-foreground">Care Targets Discharged</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{complexity.multiCareTargetPercentage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Multi-Target Episodes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
