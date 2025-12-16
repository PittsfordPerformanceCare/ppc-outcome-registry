import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PCPSummaryTileProps {
  count: number;
  oldestDays?: number | null;
}

export function PCPSummaryTile({ count, oldestDays }: PCPSummaryTileProps) {
  const navigate = useNavigate();

  // Only show when there are pending summaries
  if (count === 0) return null;

  return (
    <Card 
      className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate("/pcp-queue")}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                PCP Summaries Awaiting Delivery
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {count} {count === 1 ? "summary" : "summaries"} ready
                </Badge>
                {oldestDays !== null && oldestDays !== undefined && oldestDays > 2 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Oldest: {oldestDays}d
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Review and send summaries to referring providers
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <Send className="h-4 w-4" />
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
