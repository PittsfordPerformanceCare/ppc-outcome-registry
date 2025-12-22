import { format } from 'date-fns';
import { useLeadershipAnalytics } from '@/hooks/useLeadershipAnalytics';
import { ExternalInterpretationPanel } from '@/components/snapshot/ExternalInterpretationPanel';
import { SnapshotVolumeSection } from '@/components/snapshot/SnapshotVolumeSection';
import { SnapshotResolutionSection } from '@/components/snapshot/SnapshotResolutionSection';
import { SnapshotTimeSection } from '@/components/snapshot/SnapshotTimeSection';
import { SnapshotOutcomesSection } from '@/components/snapshot/SnapshotOutcomesSection';
import { SnapshotIntegritySection } from '@/components/snapshot/SnapshotIntegritySection';
import { Loader2, BarChart3 } from 'lucide-react';

export default function ExternalSnapshotPage() {
  // Fixed filters for external snapshot: 90 days, discharged only, integrity passed
  const analytics = useLeadershipAnalytics({
    timeWindow: '90d',
    includeOverrides: false,
  });

  const asOfDate = format(new Date(), 'MMMM d, yyyy');

  if (analytics.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Unable to load snapshot data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">By the Numbers</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregate Performance Snapshot • As of {asOfDate}
          </p>
        </div>

        {/* Interpretation Panel - Always Visible */}
        <ExternalInterpretationPanel />

        {/* Snapshot Sections */}
        <div className="grid gap-6">
          <SnapshotVolumeSection 
            volume={analytics.volume} 
            complexity={analytics.complexity}
            asOfDate={asOfDate} 
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <SnapshotResolutionSection 
              resolution={analytics.resolution} 
              asOfDate={asOfDate} 
            />
            <SnapshotTimeSection 
              time={analytics.time} 
              asOfDate={asOfDate} 
            />
          </div>

          <SnapshotOutcomesSection 
            outcomes={analytics.outcomes} 
            asOfDate={asOfDate} 
          />

          <SnapshotIntegritySection 
            integrity={analytics.integrity} 
            asOfDate={asOfDate} 
          />
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            This snapshot presents de-identified, aggregate data only. No patient-level information is disclosed.
          </p>
        </div>
      </div>
    </div>
  );
}
