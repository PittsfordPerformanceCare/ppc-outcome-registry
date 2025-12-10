import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, RefreshCw, UserPlus, ArrowRight, ExternalLink, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface LeadStats {
  newUncontacted: number;
  needsFollowUpToday: number;
  returningPatients: number;
  referralLeads: number;
  recentLeads: Array<{
    id: string;
    name: string;
    source: string;
    created_at: string;
    status: string;
  }>;
}

interface LeadManagementSectionProps {
  stats: LeadStats;
  loading: boolean;
}

export function LeadManagementSection({ stats, loading }: LeadManagementSectionProps) {
  const cards = [
    {
      title: "New Leads",
      count: stats.newUncontacted,
      icon: Users,
      gradient: "from-rose-500/15 to-rose-500/5",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      borderAccent: "hover:border-rose-300 dark:hover:border-rose-800",
      description: "Awaiting first contact",
      priority: stats.newUncontacted > 0
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
      priority: stats.needsFollowUpToday > 0
    },
    {
      title: "Returning Patients",
      count: stats.returningPatients,
      icon: RefreshCw,
      gradient: "from-teal-500/15 to-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-600",
      borderAccent: "hover:border-teal-300 dark:hover:border-teal-800",
      description: "Previous patients returning",
      priority: false
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
      priority: false
    }
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      new: { variant: "destructive" },
      contacted: { variant: "secondary" },
      in_progress: { variant: "default" },
      completed: { variant: "outline" }
    };
    const { variant, className } = config[status] || { variant: "secondary" as const };
    return <Badge variant={variant} className={className}>{status}</Badge>;
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

      {/* Lead Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to="/admin/leads" className="group">
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent} ${card.priority ? 'ring-2 ring-rose-500/20' : ''}`}>
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
            </Link>
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
                    {getStatusBadge(lead.status)}
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
