import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingDown, CheckCircle2, Bell } from "lucide-react";
import { format } from "date-fns";

interface RecoverySnapshotProps {
  nextVisit?: {
    date: string;
    time?: string;
    clinician?: string;
  };
  lastScore?: {
    index: string;
    score: number;
    date: string;
    improvement?: number;
  };
  nextAction?: {
    title: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

export default function RecoverySnapshot({ nextVisit, lastScore, nextAction }: RecoverySnapshotProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today's Recovery Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Visit */}
        {nextVisit && (
          <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Next Visit</p>
                <p className="font-semibold">
                  {format(new Date(nextVisit.date), "EEEE, MMM dd")}
                </p>
                {nextVisit.time && (
                  <p className="text-sm text-muted-foreground">{nextVisit.time}</p>
                )}
                {nextVisit.clinician && (
                  <p className="text-sm text-muted-foreground mt-1">with {nextVisit.clinician}</p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-20" />
            </div>
          </div>
        )}

        {/* Last Score */}
        {lastScore && (
          <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Latest Score</p>
                <p className="font-semibold">{lastScore.index}: {lastScore.score}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(lastScore.date), "MMM dd, yyyy")}
                </p>
                {lastScore.improvement !== undefined && lastScore.improvement > 0 && (
                  <Badge className="mt-2 bg-success/15 text-success border-success/30">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {lastScore.improvement}% improvement
                  </Badge>
                )}
              </div>
              <TrendingDown className="h-8 w-8 text-primary opacity-20" />
            </div>
          </div>
        )}

        {/* Next Action */}
        {nextAction && (
          <div className="p-3 rounded-lg bg-background/80 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Next Action</p>
                <p className="font-semibold">{nextAction.title}</p>
                {nextAction.dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {format(new Date(nextAction.dueDate), "MMM dd")}
                  </p>
                )}
                {nextAction.priority && (
                  <Badge 
                    variant={nextAction.priority === 'high' ? 'destructive' : 'secondary'}
                    className="mt-2"
                  >
                    {nextAction.priority} priority
                  </Badge>
                )}
              </div>
              {nextAction.priority === 'high' ? (
                <Bell className="h-8 w-8 text-destructive opacity-20" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-primary opacity-20" />
              )}
            </div>
          </div>
        )}

        {!nextVisit && !lastScore && !nextAction && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming activities scheduled
          </p>
        )}
      </CardContent>
    </Card>
  );
}