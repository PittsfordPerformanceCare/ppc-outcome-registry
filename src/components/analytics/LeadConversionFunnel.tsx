import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadConversionFunnelProps {
  funnelData: {
    leadsCreated: number;
    intakesCompleted: number;
    episodesOpened: number;
  };
  medianLeadToIntake: number | null;
  medianIntakeToEpisode: number | null;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return "N/A";
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}

export function LeadConversionFunnel({
  funnelData,
  medianLeadToIntake,
  medianIntakeToEpisode,
}: LeadConversionFunnelProps) {
  const { leadsCreated, intakesCompleted, episodesOpened } = funnelData;
  
  const stages = [
    {
      label: "Leads Created",
      value: leadsCreated,
      icon: Users,
      percentage: 100,
      color: "bg-blue-500",
    },
    {
      label: "Intakes Completed",
      value: intakesCompleted,
      icon: FileCheck,
      percentage: leadsCreated > 0 ? (intakesCompleted / leadsCreated) * 100 : 0,
      color: "bg-purple-500",
    },
    {
      label: "Episodes Opened",
      value: episodesOpened,
      icon: Calendar,
      percentage: leadsCreated > 0 ? (episodesOpened / leadsCreated) * 100 : 0,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Funnel Visualization */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Intake Funnel (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <stage.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stage.value.toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs">
                      ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", stage.color)}
                    style={{ width: `${stage.percentage}%` }}
                  />
                  {index < stages.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pr-2">
                      ↓ {((stages[index + 1].value / Math.max(stage.value, 1)) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Metrics */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Median: Lead → Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(medianLeadToIntake)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time from lead creation to intake completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Median: Intake → Episode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(medianIntakeToEpisode)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time from intake completion to episode creation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
