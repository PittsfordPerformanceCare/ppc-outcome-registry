import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CommunicationsStats {
  pcpSummariesPending: number;
  messagesToAddress: number;
}

interface CommunicationsSectionProps {
  stats: CommunicationsStats;
  loading: boolean;
}

export function CommunicationsSection({ stats, loading }: CommunicationsSectionProps) {
  const cards = [
    {
      title: "PCP Summaries Pending",
      count: stats.pcpSummariesPending,
      icon: FileText,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      borderAccent: "hover:border-blue-300 dark:hover:border-blue-800",
      description: "Discharged episodes awaiting PCP summary",
      link: "/pcp-summary",
      priority: stats.pcpSummariesPending > 0
    },
    {
      title: "Messages to Address",
      count: stats.messagesToAddress,
      icon: MessageSquare,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      borderAccent: "hover:border-emerald-300 dark:hover:border-emerald-800",
      description: "Patient messages requiring action",
      link: "/clinician-inbox",
      priority: stats.messagesToAddress > 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Communications & PCP Summaries</h2>
            <p className="text-sm text-muted-foreground">Outstanding communication tasks</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/admin-shell/communications">
            All Communications <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Communication Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link} className="group">
              <Card className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${card.borderAccent} ${card.priority ? 'ring-2 ring-blue-500/20' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                <CardContent className="relative pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${card.iconBg} rounded-xl`}>
                      <Icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold tracking-tight">
                          {loading ? "—" : card.count}
                        </p>
                        {card.priority && (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-1.5">
                            Action
                          </Badge>
                        )}
                      </div>
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
