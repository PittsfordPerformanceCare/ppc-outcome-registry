import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadKPICardsProps {
  totalLeads30d: number;
  totalLeadsPrev30d: number;
  intakeCompletionRate30d: number;
  episodeConversionRate30d: number;
  leads7d: number;
  episodes7d: number;
}

function getChangeIndicator(current: number, previous: number) {
  if (previous === 0) return { change: 0, trend: "neutral" as const };
  const change = ((current - previous) / previous) * 100;
  if (change > 10) return { change, trend: "up" as const };
  if (change < -10) return { change, trend: "down" as const };
  return { change, trend: "neutral" as const };
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "N/A";
  const hours = seconds / 3600;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}

export function LeadKPICards({
  totalLeads30d,
  totalLeadsPrev30d,
  intakeCompletionRate30d,
  episodeConversionRate30d,
  leads7d,
  episodes7d,
}: LeadKPICardsProps) {
  const leadChange = getChangeIndicator(totalLeads30d, totalLeadsPrev30d);

  const kpis = [
    {
      title: "Total Leads (30d)",
      value: totalLeads30d,
      icon: Users,
      change: leadChange,
      format: "number" as const,
    },
    {
      title: "Intake Completion Rate",
      value: intakeCompletionRate30d,
      icon: CheckCircle2,
      format: "percent" as const,
    },
    {
      title: "Episode Conversion Rate",
      value: episodeConversionRate30d,
      icon: TrendingUp,
      format: "percent" as const,
    },
    {
      title: "Leads This Week",
      value: leads7d,
      icon: Calendar,
      format: "number" as const,
    },
    {
      title: "Episodes This Week",
      value: episodes7d,
      icon: CheckCircle2,
      format: "number" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpi.format === "percent"
                ? `${(kpi.value * 100).toFixed(1)}%`
                : kpi.value.toLocaleString()}
            </div>
            {kpi.change && (
              <div className="flex items-center gap-1 mt-1">
                {kpi.change.trend === "up" && (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{kpi.change.change.toFixed(1)}%
                    </span>
                  </>
                )}
                {kpi.change.trend === "down" && (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">
                      {kpi.change.change.toFixed(1)}%
                    </span>
                  </>
                )}
                {kpi.change.trend === "neutral" && (
                  <span className="text-xs text-muted-foreground">
                    vs prev 30d
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
