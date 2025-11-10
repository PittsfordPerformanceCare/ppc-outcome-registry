import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, CheckCircle, PlayCircle, ClipboardCheck, Activity, 
  Calendar, TrendingUp, Flag, CheckCircle2, Clock, ClipboardList,
  AlertCircle, ArrowRight, Sparkles
} from "lucide-react";
import { PatientJourney, JourneyMilestone } from "@/lib/journeyMilestones";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PatientJourneyTimelineProps {
  journey: PatientJourney;
  onActionClick?: (milestoneType: string) => void;
  compact?: boolean;
}

const iconMap = {
  FileText,
  CheckCircle,
  PlayCircle,
  ClipboardCheck,
  ClipboardList,
  Activity,
  Calendar,
  TrendingUp,
  Flag,
  CheckCircle2,
  Clock,
};

export function PatientJourneyTimeline({ 
  journey, 
  onActionClick,
  compact = false 
}: PatientJourneyTimelineProps) {
  const getStatusColor = (status: JourneyMilestone["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-300";
      case "in_progress":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "pending":
        return "text-gray-500 bg-gray-100 border-gray-300";
      case "overdue":
        return "text-red-600 bg-red-100 border-red-300";
    }
  };

  const getStatusBadgeVariant = (status: JourneyMilestone["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Patient Journey</CardTitle>
              <CardDescription className="text-sm">
                {journey.daysInCare} days in care
              </CardDescription>
            </div>
            <Badge variant={journey.isComplete ? "default" : "secondary"}>
              {journey.overallProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={journey.overallProgress} className="h-2" />
          
          {journey.nextMilestone && (
            <Alert className={cn(
              "border-l-4",
              journey.nextMilestone.status === "overdue" 
                ? "border-l-red-500" 
                : "border-l-blue-500"
            )}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Next Step</AlertTitle>
              <AlertDescription className="text-sm">
                {journey.nextMilestone.label}
                {journey.nextMilestone.description && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {journey.nextMilestone.description}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Patient Care Journey
            </CardTitle>
            <CardDescription>
              Complete timeline from intake to discharge • {journey.daysInCare} days in care
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{journey.overallProgress}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={journey.overallProgress} 
            className={cn("h-3 transition-all", getProgressColor(journey.overallProgress))}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started {format(new Date(journey.startDate), "MMM d, yyyy")}</span>
            {journey.isComplete ? (
              <span className="text-green-600 font-medium">Journey Complete</span>
            ) : (
              <span>{journey.milestones.filter(m => m.status === "completed").length} of {journey.milestones.length} milestones</span>
            )}
          </div>
        </div>

        {/* Next Action Alert */}
        {journey.nextMilestone && !journey.isComplete && (
          <Alert className={cn(
            "border-l-4",
            journey.nextMilestone.status === "overdue" 
              ? "border-l-red-500 bg-red-50" 
              : "border-l-blue-500 bg-blue-50"
          )}>
            <AlertCircle className={cn(
              "h-4 w-4",
              journey.nextMilestone.status === "overdue" ? "text-red-600" : "text-blue-600"
            )} />
            <AlertTitle className="flex items-center justify-between">
              <span>Next Action Required</span>
              {journey.nextMilestone.status === "overdue" && (
                <Badge variant="destructive" className="text-xs">Overdue</Badge>
              )}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium text-foreground">{journey.nextMilestone.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {journey.nextMilestone.description}
                </p>
                {journey.nextMilestone.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {journey.nextMilestone.status === "overdue" ? "Was due" : "Due"}: {format(new Date(journey.nextMilestone.date), "PPP")}
                  </p>
                )}
              </div>
              {onActionClick && (
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => onActionClick(journey.nextMilestone!.type)}
                >
                  Take Action <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Timeline */}
        <div className="relative space-y-6 pl-8">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

          {journey.milestones.map((milestone, index) => {
            const Icon = iconMap[milestone.icon as keyof typeof iconMap] || Clock;
            const isLast = index === journey.milestones.length - 1;

            return (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute -left-8 mt-1.5 h-8 w-8 rounded-full border-2 flex items-center justify-center",
                  getStatusColor(milestone.status)
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Milestone content */}
                <div className={cn(
                  "rounded-lg border-l-4 p-4 transition-all",
                  milestone.status === "completed" 
                    ? "border-l-green-500 bg-green-50/50" 
                    : milestone.status === "in_progress"
                    ? "border-l-blue-500 bg-blue-50/50"
                    : milestone.status === "overdue"
                    ? "border-l-red-500 bg-red-50/50"
                    : "border-l-gray-300 bg-gray-50/50"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{milestone.label}</h4>
                        <Badge 
                          variant={getStatusBadgeVariant(milestone.status)}
                          className="text-xs"
                        >
                          {milestone.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                      {milestone.date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(milestone.date), "PPP")}
                          {milestone.daysFromStart !== undefined && (
                            <span className="ml-2">
                              • Day {milestone.daysFromStart}
                            </span>
                          )}
                          {milestone.status === "completed" && (
                            <span className="ml-2 text-green-600">
                              • {formatDistanceToNow(new Date(milestone.date), { addSuffix: true })}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        {journey.isComplete && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Journey Complete!</AlertTitle>
            <AlertDescription className="text-green-800">
              Patient successfully completed treatment in {journey.daysInCare} days.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
