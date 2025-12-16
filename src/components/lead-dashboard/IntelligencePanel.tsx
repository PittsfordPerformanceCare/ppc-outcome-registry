import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Globe, Stethoscope, Users, School, Building2 } from "lucide-react";

interface SourceStats {
  website: number;
  physicianReferral: number;
  athleteProgram: number;
  schoolCommunity: number;
  internal: number;
  other: number;
}

interface SLAStats {
  averageReviewTimeHours: number | null;
  oldestOpenRequestHours: number | null;
}

interface IntelligencePanelProps {
  sources: SourceStats;
  sla: SLAStats;
  loading: boolean;
}

export function IntelligencePanel({ sources, sla, loading }: IntelligencePanelProps) {
  const sourceItems = [
    { label: "Website", value: sources.website, icon: Globe, color: "text-blue-600" },
    { label: "Physician Referral", value: sources.physicianReferral, icon: Stethoscope, color: "text-purple-600" },
    { label: "Athlete Program", value: sources.athleteProgram, icon: Users, color: "text-emerald-600" },
    { label: "School / Community", value: sources.schoolCommunity, icon: School, color: "text-amber-600" },
    { label: "Internal", value: sources.internal, icon: Building2, color: "text-gray-600" },
  ];

  const totalSources = Object.values(sources).reduce((a, b) => a + b, 0);

  function formatHours(hours: number | null): string {
    if (hours === null) return "—";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${Math.round(hours)} hr`;
    return `${Math.round(hours / 24)} days`;
  }

  return (
    <div className="space-y-4">
      {/* Source Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Care Request Sources
            <span className="font-normal normal-case text-xs">(Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sourceItems.map((item) => {
            const Icon = item.icon;
            const percentage = totalSources > 0 ? Math.round((item.value / totalSources) * 100) : 0;
            
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.label}</span>
                    <span className="font-medium tabular-nums">
                      {loading ? "—" : item.value}
                    </span>
                  </div>
                  {!loading && totalSources > 0 && (
                    <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}/30`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* SLA Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Avg. Time to First Review</span>
            <span className="font-medium">
              {loading ? "—" : formatHours(sla.averageReviewTimeHours)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Oldest Open Request</span>
            <span className={`font-medium ${
              sla.oldestOpenRequestHours && sla.oldestOpenRequestHours > 24 
                ? "text-rose-600" 
                : ""
            }`}>
              {loading ? "—" : formatHours(sla.oldestOpenRequestHours)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
