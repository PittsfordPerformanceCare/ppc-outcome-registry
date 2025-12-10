import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Brain, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface EpisodePivotStats {
  pivotsPending: number;
  neuroReferralsActive: number;
  pendingDischarge: number;
}

interface EpisodePivotSectionProps {
  stats: EpisodePivotStats;
  loading: boolean;
}

export function EpisodePivotSection({ stats, loading }: EpisodePivotSectionProps) {
  const cards = [
    {
      title: "Pivots Pending Return",
      count: stats.pivotsPending,
      icon: GitBranch,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      description: "Imaging or external referrals awaiting return",
      link: "/admin-shell/episodes",
      priority: stats.pivotsPending > 0
    },
    {
      title: "Internal Neuro Referrals",
      count: stats.neuroReferralsActive,
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "Active or recently closed neuro episodes",
      link: "/admin-shell/episodes",
      priority: false
    },
    {
      title: "Pending Discharge",
      count: stats.pendingDischarge,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      description: "Clinically complete, not formally discharged",
      link: "/admin-shell/episodes",
      priority: stats.pendingDischarge > 0
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Episode & Pivot Alerts
          </h2>
          <p className="text-sm text-muted-foreground">Monitor loop-closure and episode status</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin-shell/episodes">
            View Episodes <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${card.priority ? 'border-amber-200 dark:border-amber-900' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    {card.priority && (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                        Attention
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{loading ? "—" : card.count}</p>
                    <p className="text-sm font-medium">{card.title}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
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
