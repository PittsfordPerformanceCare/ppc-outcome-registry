import { Card, CardContent } from "@/components/ui/card";
import { Users, FileCheck, Activity, LogOut, Sun, Moon, Cloud, Sparkles, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TodayStats {
  newLeadsToday: number;
  intakesCompletedToday: number;
  episodesStartedToday: number;
  episodesDischargedToday: number;
  newCareRequests?: number;
}

interface TodayAtAGlanceProps {
  stats: TodayStats;
  loading: boolean;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun, accent: "from-amber-500/20 to-orange-500/10" };
  if (hour < 17) return { text: "Good afternoon", icon: Cloud, accent: "from-sky-500/20 to-blue-500/10" };
  return { text: "Good evening", icon: Moon, accent: "from-indigo-500/20 to-purple-500/10" };
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
  const [userName, setUserName] = useState<string>("");
  const [careRequestModeEnabled, setCareRequestModeEnabled] = useState(false);
  const [careRequestCount, setCareRequestCount] = useState(0);
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          const firstName = profile.full_name.split(" ")[0];
          setUserName(firstName);
        }
      }
    };

    const checkCareRequestMode = async () => {
      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("care_request_mode_enabled")
        .limit(1)
        .single();

      if (settings?.care_request_mode_enabled) {
        setCareRequestModeEnabled(true);
        const { count } = await supabase
          .from("care_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "SUBMITTED");
        setCareRequestCount(count || 0);
      }
    };

    fetchUserName();
    checkCareRequestMode();
  }, []);

  const baseMetrics = [
    ...(careRequestModeEnabled ? [{
      label: "Care Requests",
      value: careRequestCount,
      icon: Inbox,
      gradient: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-600",
      link: "/intake-review"
    }] : []),
    {
      label: "New Leads",
      value: stats.newLeadsToday,
      icon: Users,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
      link: "/admin/leads"
    },
    {
      label: "Intakes Completed",
      value: stats.intakesCompletedToday,
      icon: FileCheck,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-600",
      link: "/admin-shell/registry"
    },
    {
      label: "Episodes Started",
      value: stats.episodesStartedToday,
      icon: Activity,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-600",
      link: "/admin-shell/episodes"
    },
    {
      label: "Discharged",
      value: stats.episodesDischargedToday,
      icon: LogOut,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-600",
      link: "/admin-shell/episodes"
    }
  ];

  const metrics = baseMetrics.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${greeting.accent} p-6 border border-border/50`}>
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="h-32 w-32 -mt-4 -mr-4" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-background/80 backdrop-blur-sm rounded-xl shadow-sm">
            <GreetingIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting.text}{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening today — <span className="font-medium text-foreground">{formatDate()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link key={metric.label} to={metric.link} className="group">
              <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-border/50 group-hover:border-primary/30">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-50`} />
                <CardContent className="relative pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-background/80 backdrop-blur-sm rounded-xl shadow-sm">
                      <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-bold tracking-tight mt-0.5">
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
