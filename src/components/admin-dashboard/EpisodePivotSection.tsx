import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Brain, AlertTriangle, ArrowRight, Layers } from "lucide-react";
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
      title: "Pivots Pending",
      count: stats.pivotsPending,
      icon: GitBranch,
      gradient: "from-purple-500/15 to-purple-500/5",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      borderAccent: "hover:border-purple-300 dark:hover:border-purple-800",
      description: "Imaging or external referrals awaiting return",
      link: "/admin-shell/episodes",
      priority: stats.pivotsPending > 0
    },
    {
      title: "Neuro Referrals",
      count: stats.neuroReferralsActive,
      icon: Brain,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
      description: "Active or recently closed neuro episodes",
      link: "/admin-shell/episodes",
      priority: false
    },
    {
      title: "Pending Discharge",
      count: stats.pendingDischarge,
      icon: AlertTriangle,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      borderAccent: "hover:border-amber-300 dark:hover:border-amber-800",
      description: "Clinically complete, not formally discharged",
      link: "/admin-shell/episodes",
      priority: stats.pendingDischarge > 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Episode & Pivot Alerts</h2>
            <p className="text-sm text-muted-foreground">Monitor loop-closure and episode status</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/admin-shell/episodes">
            View Episodes <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Episode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link} className="group">
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent} ${card.priority ? 'ring-2 ring-amber-500/20' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <CardContent className="relative pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    {card.priority && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5">
                        Attention
                      </Badge>
                    )}
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
