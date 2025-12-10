import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, RefreshCw, UserPlus, ArrowRight, ExternalLink, Inbox, Pause, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface LeadStats {
  newUncontacted: number;
  needsFollowUpToday: number;
  returningPatients: number;
  referralLeads: number;
  pausedLeads: number;
  readyToRewarm: number;
  recentLeads: Array<{
    id: string;
    name: string;
    source: string;
    created_at: string;
    status: string;
    lead_status: string;
  }>;
}

interface LeadManagementSectionProps {
  stats: LeadStats;
  loading: boolean;
}

export function LeadManagementSection({ stats, loading }: LeadManagementSectionProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: "New Leads",
      count: stats.newUncontacted,
      icon: Users,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
      description: "Awaiting first contact",
      priority: stats.newUncontacted > 0,
      filter: "new"
    },
    {
      title: "Follow-Up Today",
      count: stats.needsFollowUpToday,
      icon: Clock,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      borderAccent: "hover:border-amber-300 dark:hover:border-amber-800",
      description: "Scheduled for today",
      priority: stats.needsFollowUpToday > 0,
      filter: "followup_today"
    },
    {
      title: "Ready to Rewarm",
      count: stats.readyToRewarm,
      icon: Flame,
      gradient: "from-orange-500/15 to-orange-500/5",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
      borderAccent: "hover:border-orange-300 dark:hover:border-orange-800",
      description: "30-day pause complete",
      priority: stats.readyToRewarm > 0,
      filter: "rewarm"
    },
    {
      title: "Paused",
      count: stats.pausedLeads,
      icon: Pause,
      gradient: "from-slate-500/15 to-slate-500/5",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600",
      borderAccent: "hover:border-slate-300 dark:hover:border-slate-800",
      description: "Try again later",
      priority: false,
      filter: "paused"
    },
    {
      title: "Referral Leads",
      count: stats.referralLeads,
      icon: UserPlus,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-800",
      description: "Provider-referred leads",
      priority: false,
      filter: "referral"
    },
    {
      title: "Returning",
      count: stats.returningPatients,
      icon: RefreshCw,
      gradient: "from-teal-500/15 to-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600",
      borderAccent: "hover:border-teal-300 dark:hover:border-teal-800",
      description: "Previous patients",
      priority: false,
      filter: "returning"
    }
  ];

  const getStatusBadge = (leadStatus: string) => {
    const config: Record<string, { label: string; className: string }> = {
      new: { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
      attempting: { label: "Attempting", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
      scheduled: { label: "Scheduled", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
      paused: { label: "Paused", className: "bg-slate-500/10 text-slate-600 border-slate-200" },
    };
    const { label, className } = config[leadStatus] || { label: leadStatus, className: "" };
    return <Badge className={className}>{label}</Badge>;
  };

  const handleCardClick = (filter: string) => {
    navigate(`/admin/leads?filter=${filter}`);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Lead Management</h2>
            <p className="text-sm text-muted-foreground">Priority inbox for lead follow-up</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/admin/leads">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Lead Cards - 3x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => handleCardClick(card.filter)}
              className="cursor-pointer group"
            >
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent} ${card.priority ? 'ring-2 ring-primary/20' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <CardContent className="relative pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    {card.priority && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Action
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
            </div>
          );
        })}
      </div>

      {/* Recent Leads Table */}
      {stats.recentLeads.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.recentLeads.slice(0, 5).map((lead, index) => (
                <div 
                  key={lead.id} 
                  className={`flex items-center justify-between py-3 px-3 rounded-lg transition-colors hover:bg-muted/50 ${index !== stats.recentLeads.length - 1 ? 'border-b border-border/50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lead.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.source || "Direct"} • {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(lead.lead_status || "new")}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to="/admin/leads">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
