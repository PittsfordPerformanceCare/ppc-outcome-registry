import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, PhoneCall, RefreshCw, UserPlus, ArrowRight, ExternalLink } from "lucide-react";
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
      title: "New Leads (Uncontacted)",
      count: stats.newUncontacted,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      description: "Leads awaiting first contact",
      priority: stats.newUncontacted > 0
    },
    {
      title: "Needs Follow-Up Today",
      count: stats.needsFollowUpToday,
      icon: PhoneCall,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      description: "Scheduled for follow-up today",
      priority: stats.needsFollowUpToday > 0
    },
    {
      title: "Returning Patients",
      count: stats.returningPatients,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "Previous patients returning",
      priority: false
    },
    {
      title: "Referral Leads",
      count: stats.referralLeads,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: "From referral sources",
      priority: false
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive",
      contacted: "secondary",
      in_progress: "default",
      completed: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lead Management
          </h2>
          <p className="text-sm text-muted-foreground">Priority inbox for lead follow-up</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/leads">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to="/admin/leads">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${card.priority ? 'border-red-200 dark:border-red-900' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    {card.priority && (
                      <Badge variant="destructive" className="text-xs">Action</Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{loading ? "—" : card.count}</p>
                    <p className="text-xs font-medium mt-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Leads Table */}
      {stats.recentLeads.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Leads (Last 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lead.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.source || "Direct"} • {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(lead.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin/leads">
                        <ExternalLink className="h-3 w-3" />
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
