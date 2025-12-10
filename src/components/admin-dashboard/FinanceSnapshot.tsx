import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FinanceStats {
  dischargesToday: number;
  dischargesThisWeek: number;
}

interface FinanceSnapshotProps {
  stats: FinanceStats;
  loading: boolean;
}

export function FinanceSnapshot({ stats, loading }: FinanceSnapshotProps) {
  const cards = [
    {
      title: "Discharges Today",
      count: stats.dischargesToday,
      icon: CalendarDays,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-800",
      description: "Ready for billing processing",
      link: "/admin-shell/episodes"
    },
    {
      title: "Discharges This Week",
      count: stats.dischargesThisWeek,
      icon: TrendingUp,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
      description: "Last 7 days total",
      link: "/admin-shell/episodes"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Finance / Discharge Snapshot</h2>
            <p className="text-sm text-muted-foreground">Discharge activity for billing workflows</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/admin-shell/episodes">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Finance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link} className="group">
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <CardContent className="relative pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${card.iconBg} rounded-xl`}>
                      <Icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold tracking-tight">
                        {loading ? "—" : card.count}
                      </p>
                      <p className="text-sm font-medium mt-1">{card.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
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
