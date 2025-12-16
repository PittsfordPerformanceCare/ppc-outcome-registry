import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTaskSummary } from "@/hooks/useCommunicationTasks";
import { 
  ClipboardList, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Plus, 
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Hourglass,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddTaskDialog } from "@/components/clinician/AddTaskDialog";

const statusConfig = {
  waitingOnClinician: { 
    label: "Waiting on Clinician", 
    icon: UserCheck, 
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30"
  },
  waitingOnPatient: { 
    label: "Waiting on Patient", 
    icon: Hourglass, 
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30"
  },
  inProgress: { 
    label: "In Progress", 
    icon: Loader2, 
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30"
  },
  blocked: { 
    label: "Blocked", 
    icon: AlertTriangle, 
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30"
  },
  open: { 
    label: "Open", 
    icon: ClipboardList, 
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/30"
  },
};

export function OutstandingTasksTile() {
  const navigate = useNavigate();
  const { summary, isLoading } = useTaskSummary();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  if (isHidden) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsHidden(false)}
        className="gap-2 text-muted-foreground"
      >
        <Eye className="h-4 w-4" />
        Show Communication Tasks
      </Button>
    );
  }

  const groups = [
    { key: "waitingOnClinician", count: summary.waitingOnClinician },
    { key: "waitingOnPatient", count: summary.waitingOnPatient },
    { key: "inProgress", count: summary.inProgress },
    { key: "blocked", count: summary.blocked },
    { key: "open", count: summary.open },
  ].filter(g => g.count > 0) as { key: keyof typeof statusConfig; count: number }[];

  const hasOutstanding = summary.total > 0;

  return (
    <>
      <Card className="overflow-hidden">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 hover:text-primary transition-colors text-left">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      Communication Tasks
                      {hasOutstanding && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {summary.total}
                        </span>
                      )}
                    </CardTitle>
                    {!isExpanded && hasOutstanding && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {groups.length} status group{groups.length !== 1 ? 's' : ''} active
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                  )}
                </button>
              </CollapsibleTrigger>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsHidden(true)}
                  title="Hide this section"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : hasOutstanding ? (
                <div className="space-y-4">
                  {/* Status Groups */}
                  <div className="grid gap-2">
                    {groups.map((group) => {
                      const config = statusConfig[group.key];
                      const Icon = config.icon;
                      return (
                        <button
                          key={group.key}
                          onClick={() => navigate("/admin/clinician-queues")}
                          className={`flex items-center justify-between p-3 rounded-lg ${config.bg} hover:opacity-80 transition-opacity text-left w-full`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-semibold ${config.color}`}>
                              {group.count}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Recently Completed */}
                  {summary.recentlyCompleted > 0 && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 pt-2 border-t">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{summary.recentlyCompleted} completed in last 24h</span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setShowAddTask(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Task
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate("/admin/clinician-queues")}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View All
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* All Clear State */}
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">All Clear</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No outstanding communication tasks
                    </p>
                  </div>

                  {/* Recently Completed */}
                  {summary.recentlyCompleted > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{summary.recentlyCompleted} completed recently</span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setShowAddTask(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate("/admin/clinician-queues")}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View History
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        source="ADMIN"
      />
    </>
  );
}
