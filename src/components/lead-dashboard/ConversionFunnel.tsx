import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface FunnelStats {
  submitted: number;
  approved: number;
  firstVisitScheduled: number;
  formsComplete: number;
  episodeActive: number;
}

interface ConversionFunnelProps {
  funnel: FunnelStats;
  loading: boolean;
}

function calculatePercentage(current: number, previous: number): string {
  if (previous === 0) return "—";
  const pct = Math.round((current / previous) * 100);
  return `${pct}%`;
}

export function ConversionFunnel({ funnel, loading }: ConversionFunnelProps) {
  const stages = [
    { label: "Care Requests Submitted", value: funnel.submitted, prev: null },
    { label: "Approved for Care", value: funnel.approved, prev: funnel.submitted },
    { label: "First Visit Scheduled", value: funnel.firstVisitScheduled, prev: funnel.approved },
    { label: "New Patient Forms Complete", value: funnel.formsComplete, prev: funnel.firstVisitScheduled },
    { label: "Episode Active", value: funnel.episodeActive, prev: funnel.formsComplete },
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {stages.map((stage, index) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{stage.label}</p>
                {stage.prev !== null && (
                  <p className="text-xs text-muted-foreground">
                    {loading ? "—" : calculatePercentage(stage.value, stage.prev)} from prior
                  </p>
                )}
              </div>
              <span className="text-lg font-semibold tabular-nums">
                {loading ? "—" : stage.value}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
