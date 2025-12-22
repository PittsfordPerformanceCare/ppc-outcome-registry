import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { IntegrityMetrics } from '@/hooks/useLeadershipAnalytics';

interface SnapshotIntegritySectionProps {
  integrity: IntegrityMetrics;
  asOfDate: string;
}

export function SnapshotIntegritySection({ integrity, asOfDate }: SnapshotIntegritySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Data Integrity
        </CardTitle>
        <p className="text-xs text-muted-foreground">As of {asOfDate}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-2xl font-bold text-success">
              {integrity.completeSymmetryPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Baseline ↔ Discharge Symmetry</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">
              {integrity.overridePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Override Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
