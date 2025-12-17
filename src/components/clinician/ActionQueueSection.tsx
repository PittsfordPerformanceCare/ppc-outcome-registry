import { useState } from "react";
import { useCommunicationTasks, TaskType, TaskStatus } from "@/hooks/useCommunicationTasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  MessageSquare, 
  Image, 
  MoreHorizontal,
  AlertTriangle,
  Plus,
  ExternalLink,
  Send,
  Calendar,
  Receipt,
  FileSearch,
  UserCog,
  ClipboardList,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AddTaskDialog } from "./AddTaskDialog";
import { PatientMessageDialog } from "./PatientMessageDialog";

type QuickFilter = "all" | "overdue" | "today" | "week";
type TypeFilter = "all" | TaskType;

const TYPE_LABELS: Record<TaskType, string> = {
  CALL_BACK: "Call",
  EMAIL_REPLY: "Email",
  IMAGING_REPORT: "Imaging Report",
  PATIENT_MESSAGE: "Portal Message",
  LETTER: "Letter",
  OTHER_ACTION: "Other",
  // Admin task types
  PATIENT_CALLBACK: "Patient Callback",
  PATIENT_EMAIL_RESPONSE: "Email Response",
  PORTAL_MESSAGE_RESPONSE: "Portal Response",
  RESEND_INTAKE_FORMS: "Resend Forms",
  FOLLOWUP_INCOMPLETE_FORMS: "Follow-up Forms",
  SEND_RECEIPT: "Send Receipt",
  ORDER_IMAGING: "Order Imaging",
  SCHEDULE_APPOINTMENT: "Schedule Appt",
  CONFIRM_APPOINTMENT: "Confirm Appt",
  REQUEST_OUTSIDE_RECORDS: "Request Records",
  SEND_RECORDS_TO_PATIENT: "Send Records",
  UPDATE_PATIENT_CONTACT: "Update Contact",
  DOCUMENT_PATIENT_REQUEST: "Document Request",
};

const SOURCE_LABELS = {
  ADMIN: "Admin",
  CLINICIAN: "Clinician",
  PATIENT_PORTAL: "Patient Portal",
};

const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  CALL_BACK: <Phone className="h-4 w-4" />,
  EMAIL_REPLY: <Mail className="h-4 w-4" />,
  IMAGING_REPORT: <Image className="h-4 w-4" />,
  PATIENT_MESSAGE: <MessageSquare className="h-4 w-4" />,
  LETTER: <FileText className="h-4 w-4" />,
  OTHER_ACTION: <MoreHorizontal className="h-4 w-4" />,
  // Admin task types
  PATIENT_CALLBACK: <Phone className="h-4 w-4" />,
  PATIENT_EMAIL_RESPONSE: <Mail className="h-4 w-4" />,
  PORTAL_MESSAGE_RESPONSE: <MessageSquare className="h-4 w-4" />,
  RESEND_INTAKE_FORMS: <Send className="h-4 w-4" />,
  FOLLOWUP_INCOMPLETE_FORMS: <FileSearch className="h-4 w-4" />,
  SEND_RECEIPT: <Receipt className="h-4 w-4" />,
  ORDER_IMAGING: <Image className="h-4 w-4" />,
  SCHEDULE_APPOINTMENT: <Calendar className="h-4 w-4" />,
  CONFIRM_APPOINTMENT: <Calendar className="h-4 w-4" />,
  REQUEST_OUTSIDE_RECORDS: <FileSearch className="h-4 w-4" />,
  SEND_RECORDS_TO_PATIENT: <FileText className="h-4 w-4" />,
  UPDATE_PATIENT_CONTACT: <UserCog className="h-4 w-4" />,
  DOCUMENT_PATIENT_REQUEST: <ClipboardList className="h-4 w-4" />,
};

export function ActionQueueSection() {
  const navigate = useNavigate();
  const {
    openTasks,
    completedTasks,
    overdueTasks,
    todayTasks,
    thisWeekTasks,
    isLoading,
    updateTaskStatus,
    markCompleted,
    openCount,
    overdueCount,
  } = useCommunicationTasks();

  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Apply filters
  const getFilteredTasks = () => {
    let filtered = openTasks;

    // Quick filter
    switch (quickFilter) {
      case "overdue":
        filtered = overdueTasks;
        break;
      case "today":
        filtered = todayTasks;
        break;
      case "week":
        filtered = thisWeekTasks;
        break;
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Sort: overdue first, then by due date
    return filtered.sort((a, b) => {
      const aOverdue = isPast(new Date(a.due_at));
      const bOverdue = isPast(new Date(b.due_at));
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
  };

  const filteredTasks = getFilteredTasks();

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus.mutate({ taskId, status });
  };

  const handleMarkCompleted = (taskId: string) => {
    markCompleted.mutate(taskId);
  };

  const handleOpenTask = (task: typeof openTasks[0]) => {
    // For patient messages, open the message dialog
    if (task.type === "PATIENT_MESSAGE" && task.patient_message_id) {
      setSelectedMessageId(task.patient_message_id);
      setMessageDialogOpen(true);
      return;
    }
    
    // For other tasks with an episode, navigate to episode summary
    if (task.episode_id) {
      navigate(`/episode-summary?id=${task.episode_id}`);
    }
  };

  const handleMessageHandled = () => {
    // Refetch tasks when a message is handled
    // The task completion will be handled separately
  };

  const getEpisodeBadge = (task: typeof openTasks[0]) => {
    const episodeType = task.episode?.episode_type || task.episode?.region;
    if (!episodeType) return null;

    const colors: Record<string, string> = {
      neuro: "bg-purple-500/10 text-purple-700 border-purple-200",
      msk: "bg-blue-500/10 text-blue-700 border-blue-200",
      MSK: "bg-blue-500/10 text-blue-700 border-blue-200",
      pediatric: "bg-green-500/10 text-green-700 border-green-200",
      Neuro: "bg-purple-500/10 text-purple-700 border-purple-200",
    };

    return (
      <Badge className={`text-xs ${colors[episodeType] || "bg-muted text-muted-foreground"}`}>
        {episodeType}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              My Action Queue
              {openCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {openCount} open {openCount === 1 ? "item" : "items"}
                </Badge>
              )}
              {overdueCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {overdueCount} overdue
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              These are your patient communication and action items. Clear this list to finish your day.
            </CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick:</span>
            <Select value={quickFilter} onValueChange={(v) => setQuickFilter(v as QuickFilter)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CALL_BACK">Calls</SelectItem>
                <SelectItem value="EMAIL_REPLY">Emails</SelectItem>
                <SelectItem value="LETTER">Letters</SelectItem>
                <SelectItem value="IMAGING_REPORT">Imaging</SelectItem>
                <SelectItem value="PATIENT_MESSAGE">Portal Messages</SelectItem>
                <SelectItem value="OTHER_ACTION">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
            <h3 className="text-lg font-medium">Your action queue is clear.</h3>
            <p className="text-muted-foreground mt-1">
              You're caught up on all patient communication and tasks.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = isPast(new Date(task.due_at)) && task.status !== "COMPLETED";
            const isDueToday = isToday(new Date(task.due_at));

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isOverdue 
                    ? "border-destructive/50 bg-destructive/5" 
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Type Icon */}
                  <div className={`p-2 rounded-full ${
                    task.priority === "HIGH" 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {TYPE_ICONS[task.type]}
                  </div>

                  {/* Patient & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {task.patient_name || "Unknown Patient"}
                      </p>
                      {getEpisodeBadge(task)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[task.type]}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        {SOURCE_LABELS[task.source]}
                      </Badge>
                      {task.priority === "HIGH" && (
                        <Badge variant="destructive" className="text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="text-right min-w-[100px]">
                    <div className={`text-sm font-medium ${
                      isOverdue 
                        ? "text-destructive" 
                        : isDueToday 
                          ? "text-amber-600" 
                          : "text-muted-foreground"
                    }`}>
                      {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                      {format(new Date(task.due_at), "MMM d")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(task.due_at), "h:mm a")}
                    </div>
                  </div>

                  {/* Status */}
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {task.episode_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenTask(task)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCompleted(task.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Show Completed Toggle */}
        {completedTasks.length > 0 && (
          <div className="pt-4 border-t mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
              <Label htmlFor="show-completed" className="text-sm text-muted-foreground">
                Show completed items ({completedTasks.length})
              </Label>
            </div>

            {showCompleted && (
              <div className="space-y-2 mt-4">
                {completedTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium line-through">
                          {task.patient_name || "Unknown Patient"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {TYPE_LABELS[task.type]} • Completed {task.completed_at && format(new Date(task.completed_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddTaskDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} source="CLINICIAN" />
      
      <PatientMessageDialog 
        open={messageDialogOpen} 
        onOpenChange={setMessageDialogOpen}
        messageId={selectedMessageId}
        onMessageHandled={handleMessageHandled}
      />
    </Card>
  );
}
