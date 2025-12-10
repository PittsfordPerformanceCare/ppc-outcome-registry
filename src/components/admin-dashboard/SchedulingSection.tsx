import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, FileText, CalendarDays, ArrowRight, Calendar } from "lucide-react";
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
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-800",
      description: "Completed intake, awaiting NPE scheduling",
      link: "/admin-shell/registry",
      status: stats.readyToSchedule > 0 ? "ready" : null
    },
    {
      title: "Forms Pending",
      count: stats.formsPending,
      icon: FileText,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      borderAccent: "hover:border-amber-300 dark:hover:border-amber-800",
      description: "Scheduled but forms not returned",
      link: "/intake-review",
      status: stats.formsPending > 0 ? "pending" : null
    },
    {
      title: "Scheduled Today",
      count: stats.scheduledToday,
      icon: CalendarDays,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
      description: "NPE or key visits today",
      link: "/admin-shell/registry",
      status: null
    }
  ];

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    if (status === "ready") {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5">Ready</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5">Pending</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Scheduling & New Patient Prep</h2>
            <p className="text-sm text-muted-foreground">Track scheduling pipeline and paperwork</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/admin-shell/registry">
            Open Registry <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Scheduling Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link} className="group">
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <CardContent className="relative pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    {getStatusBadge(card.status)}
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">
                      {loading ? "—" : card.count}
                    </p>
                    <p className="text-sm font-medium mt-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
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
