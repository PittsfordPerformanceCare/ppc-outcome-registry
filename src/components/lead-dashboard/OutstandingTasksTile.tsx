import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTaskSummary, useAllCommunicationTasks, type CommunicationTask } from "@/hooks/useCommunicationTasks";
import { 
  ClipboardList, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Plus, 
  CheckCircle2,
  UserCheck,
  Hourglass,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  Pencil
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AddTaskDialog } from "@/components/clinician/AddTaskDialog";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  WAITING_ON_CLINICIAN: { 
    label: "Waiting on Clinician", 
    icon: UserCheck, 
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30"
  },
  WAITING_ON_PATIENT: { 
    label: "Waiting on Patient", 
    icon: Hourglass, 
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30"
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    icon: Loader2, 
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/30"
  },
  BLOCKED: { 
    label: "Blocked", 
    icon: AlertTriangle, 
    color: "text-destructive",
    bg: "bg-destructive/10"
  },
  OPEN: { 
    label: "Open", 
    icon: ClipboardList, 
    color: "text-primary",
    bg: "bg-primary/10"
  },
};

const taskTypeIcons: Record<string, typeof Phone> = {
  CALL_BACK: Phone,
  EMAIL_REPLY: Mail,
  PATIENT_MESSAGE: MessageSquare,
  LETTER: FileText,
  OTHER_ACTION: Clock,
  IMAGING_REPORT: FileText,
};

function getTaskTypeIcon(type: string) {
  return taskTypeIcons[type] || ClipboardList;
}

function getStatusBadge(status: string) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN;
  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} border-0 text-xs`}>
      {config.label}
    </Badge>
  );
}

export function OutstandingTasksTile() {
  const navigate = useNavigate();
  const { summary, isLoading } = useTaskSummary();
  const { data: allTasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useAllCommunicationTasks();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CommunicationTask | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState<"HIGH" | "NORMAL">("NORMAL");
  const [updating, setUpdating] = useState(false);

  const hasOutstanding = summary.total > 0;
  
  // Auto-expand when there are tasks
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter to only show open/active tasks, sorted by due date
  const activeTasks = allTasks
    .filter(t => 
      ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLINICIAN', 'WAITING_ON_PATIENT', 'BLOCKED'].includes(t.status)
    )
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  const openEditDialog = (task: CommunicationTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setShowEditDialog(true);
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("communication_tasks")
        .update({
          description: editDescription,
          status: editStatus,
          priority: editPriority,
          updated_at: new Date().toISOString(),
          status_changed_at: editStatus !== selectedTask.status ? new Date().toISOString() : undefined,
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      toast.success("Task updated");
      setShowEditDialog(false);
      setSelectedTask(null);
      refetchTasks();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card className={`overflow-hidden ${hasOutstanding ? 'border-primary/30 shadow-sm' : ''}`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 hover:text-primary transition-colors text-left">
                  <div className={`p-2 rounded-lg ${hasOutstanding ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
                    <ClipboardList className={`h-4 w-4 ${hasOutstanding ? '' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      Outstanding Communication Tasks
                      {hasOutstanding && (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                          {summary.total}
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasOutstanding 
                        ? "Tasks requiring action today"
                        : "All tasks complete"
                      }
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                  )}
                </button>
              </CollapsibleTrigger>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              {isLoading || tasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : hasOutstanding ? (
                <div className="space-y-4">
                  {/* Individual Task List */}
                  <div className="divide-y divide-border rounded-lg border overflow-hidden">
                    {activeTasks.slice(0, 5).map((task) => {
                      const TaskIcon = getTaskTypeIcon(task.type);
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
                        >
                          <div className="p-1.5 rounded bg-muted mt-0.5">
                            <TaskIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-sm truncate">
                                {task.patient_name || "Unknown Patient"}
                              </span>
                              {getStatusBadge(task.status)}
                              {task.priority === "HIGH" && (
                                <Badge variant="destructive" className="text-xs">High</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {task.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Due {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => openEditDialog(task, e)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => navigate("/admin/clinician-queues")}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary by Status */}
                  <div className="flex flex-wrap gap-2">
                    {summary.open > 0 && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                        {summary.open} Open
                      </Badge>
                    )}
                    {summary.waitingOnClinician > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 dark:bg-amber-950/30">
                        {summary.waitingOnClinician} Waiting on Clinician
                      </Badge>
                    )}
                    {summary.blocked > 0 && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">
                        {summary.blocked} Blocked
                      </Badge>
                    )}
                  </div>

                  {/* View All Link */}
                  {activeTasks.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => navigate("/admin/clinician-queues")}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View All {summary.total} Tasks
                    </Button>
                  )}

                  {/* Recently Completed */}
                  {summary.recentlyCompleted > 0 && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 pt-2 border-t">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{summary.recentlyCompleted} completed in last 24h</span>
                    </div>
                  )}
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
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => navigate("/admin/clinician-queues")}
                    >
                      <ClipboardList className="h-4 w-4" />
                      View Task History
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

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task for {selectedTask?.patient_name || "Unknown Patient"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WAITING_ON_CLINICIAN">Waiting on Clinician</SelectItem>
                    <SelectItem value="WAITING_ON_PATIENT">Waiting on Patient</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={editPriority} 
                  onValueChange={(v) => setEditPriority(v as "HIGH" | "NORMAL")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={updating}>
              <Pencil className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
