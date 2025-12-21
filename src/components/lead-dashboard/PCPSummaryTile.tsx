import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight, Clock, Send, AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PCPSummaryTileProps {
  count: number;
  oldestDays?: number | null;
  resendCount?: number;
  alwaysShow?: boolean;
}

export function PCPSummaryTile({ count, oldestDays, resendCount = 0, alwaysShow = false }: PCPSummaryTileProps) {
  const navigate = useNavigate();

  // Show "all clear" state when alwaysShow is true but no pending summaries
  if (count === 0 && !alwaysShow) return null;

  const hasUrgent = (oldestDays !== null && oldestDays !== undefined && oldestDays > 1) || resendCount > 0;
  const hasPending = count > 0;

  // All clear state
  if (count === 0 && alwaysShow) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">PCP Summaries</h3>
              <p className="text-sm text-muted-foreground">All caught up! No summaries awaiting delivery.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all ${
        hasUrgent 
          ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-600 ring-2 ring-orange-200 dark:ring-orange-800"
          : "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700"
      }`}
      onClick={() => navigate("/pcp-queue")}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`relative p-2 rounded-lg ${hasUrgent ? "bg-orange-100 dark:bg-orange-900/50" : "bg-amber-100 dark:bg-amber-900/50"}`}>
              <FileText className={`h-5 w-5 ${hasUrgent ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"}`} />
              {/* Pulsing notification indicator */}
              {hasPending && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasUrgent ? "bg-orange-500" : "bg-amber-500"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${hasUrgent ? "bg-orange-500" : "bg-amber-500"}`}></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  PCP Summaries Ready to Send
                </h3>
                {hasPending && (
                  <Bell className={`h-4 w-4 ${hasUrgent ? "text-orange-500 animate-bounce" : "text-amber-500"}`} />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge 
                  variant="secondary" 
                  className={`font-semibold ${
                    hasUrgent 
                      ? "bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100" 
                      : "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                  }`}
                >
                  {count} {count === 1 ? "patient" : "patients"} discharged
                </Badge>
                {resendCount > 0 && (
                  <Badge variant="destructive" className="gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    {resendCount} need resend
                  </Badge>
                )}
                {oldestDays !== null && oldestDays !== undefined && oldestDays > 0 && (
                  <Badge 
                    variant="outline" 
                    className={oldestDays > 1 
                      ? "text-orange-600 border-orange-400 font-medium" 
                      : "text-muted-foreground"
                    }
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {oldestDays === 0 ? "Today" : oldestDays === 1 ? "1 day ago" : `${oldestDays} days waiting`}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Click to review and fax summaries to referring providers
              </p>
            </div>
          </div>
          <Button 
            variant={hasUrgent ? "default" : "secondary"} 
            size="sm" 
            className={`gap-1 ${hasUrgent ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
          >
            <Send className="h-4 w-4" />
            Send Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
