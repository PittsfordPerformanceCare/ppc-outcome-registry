import { Card, CardContent } from "@/components/ui/card";
import { Users, FileCheck, Activity, LogOut, Sun, Moon, Cloud } from "lucide-react";
import { Link } from "react-router-dom";

interface TodayStats {
  newLeadsToday: number;
  intakesCompletedToday: number;
  episodesStartedToday: number;
  episodesDischargedToday: number;
}

interface TodayAtAGlanceProps {
  stats: TodayStats;
  loading: boolean;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 17) return { text: "Good afternoon", icon: Cloud };
  return { text: "Good evening", icon: Moon };
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export function TodayAtAGlance({ stats, loading }: TodayAtAGlanceProps) {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const metrics = [
    {
      label: "New Leads Today",
      value: stats.newLeadsToday,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/admin/leads"
    },
    {
      label: "Intakes Completed",
      value: stats.intakesCompletedToday,
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      link: "/admin-shell/registry"
    },
    {
      label: "Episodes Started",
      value: stats.episodesStartedToday,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      link: "/admin-shell/episodes"
    },
    {
      label: "Discharged Today",
      value: stats.episodesDischargedToday,
      icon: LogOut,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      link: "/admin-shell/episodes"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GreetingIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{greeting.text}, Jennifer!</h1>
          <p className="text-muted-foreground text-sm">{formatDate()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link key={metric.label} to={metric.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">
                        {loading ? "—" : metric.value}
                      </p>
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
