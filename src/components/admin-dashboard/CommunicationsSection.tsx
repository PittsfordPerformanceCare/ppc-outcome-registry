import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      description: "Discharged episodes awaiting PCP summary",
      link: "/pcp-summary",
      priority: stats.pcpSummariesPending > 0
    },
    {
      title: "Messages to Address",
      count: stats.messagesToAddress,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      description: "Patient messages requiring action",
      link: "/clinician-inbox",
      priority: stats.messagesToAddress > 0
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Communications & PCP Summaries
          </h2>
          <p className="text-sm text-muted-foreground">Outstanding communication tasks</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin-shell/communications">
            All Communications <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${card.priority ? 'border-blue-200 dark:border-blue-900' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${card.bgColor} rounded-lg`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold">{loading ? "—" : card.count}</p>
                      <p className="text-sm font-medium mt-1">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
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
