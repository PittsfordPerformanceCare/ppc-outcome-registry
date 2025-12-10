import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SchedulingStats {
  readyToSchedule: number;
  formsPending: number;
  scheduledToday: number;
}

interface SchedulingSectionProps {
  stats: SchedulingStats;
  loading: boolean;
}

export function SchedulingSection({ stats, loading }: SchedulingSectionProps) {
  const cards = [
    {
      title: "Ready to Schedule",
      count: stats.readyToSchedule,
      icon: CalendarCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: "Completed intake, awaiting NPE scheduling",
      link: "/admin-shell/registry"
    },
    {
      title: "New Patient Forms Pending",
      count: stats.formsPending,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      description: "Scheduled but forms not returned",
      link: "/intake-review"
    },
    {
      title: "Scheduled Today",
      count: stats.scheduledToday,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "NPE or key visits today",
      link: "/admin-shell/registry"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Scheduling & New Patient Prep
          </h2>
          <p className="text-sm text-muted-foreground">Track scheduling pipeline and paperwork</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin-shell/registry">
            Open Registry <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{loading ? "—" : card.count}</p>
                      <p className="text-sm font-medium">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
