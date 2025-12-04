import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Send, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  SkipForward
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PCPSummaryTask {
  id: string;
  episode_id: string;
  patient_name: string;
  clinician_name: string | null;
  discharge_date: string;
  region: string | null;
  pcp_name: string | null;
  pcp_contact: string | null;
  status: "pending" | "sent" | "skipped";
  created_at: string;
  sent_at: string | null;
  notes: string | null;
}

export function PCPSummaryTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PCPSummaryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<PCPSummaryTask | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("pcp_summary_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data as PCPSummaryTask[]) || []);
    } catch (error: any) {
      console.error("Error fetching PCP summary tasks:", error);
      toast.error("Failed to load PCP summary tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSummary = (task: PCPSummaryTask) => {
    navigate(`/pcp-summary?episode=${task.episode_id}`);
  };

  const handleMarkAsSent = async (task: PCPSummaryTask) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update the task
      const { error: taskError } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_by: user?.id
        })
        .eq("id", task.id);

      if (taskError) throw taskError;

      // Update the episode
      const { error: episodeError } = await supabase
        .from("episodes")
        .update({ pcp_summary_sent_at: new Date().toISOString() })
        .eq("id", task.episode_id);

      if (episodeError) throw episodeError;

      toast.success("PCP Summary marked as sent");
      fetchTasks();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedTask) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "skipped",
          notes: skipReason || "Skipped by admin"
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      toast.success("Task skipped");
      setShowSkipDialog(false);
      setSelectedTask(null);
      setSkipReason("");
      fetchTasks();
    } catch (error: any) {
      console.error("Error skipping task:", error);
      toast.error("Failed to skip task");
    } finally {
      setUpdating(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "sent" || t.status === "skipped");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                PCP Summary Tasks
              </CardTitle>
              <CardDescription>
                Review and send PCP summaries for discharged patients
              </CardDescription>
            </div>
            {pendingTasks.length > 0 && (
              <Badge variant="destructive" className="text-sm">
                {pendingTasks.length} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No PCP summary tasks at this time</p>
              <p className="text-sm mt-1">Tasks will appear here when episodes are discharged</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{task.patient_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Discharged: {format(parseISO(task.discharge_date), "MMM d, yyyy")}</span>
                              </div>
                              {task.region && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{task.region}</span>
                                </div>
                              )}
                              {task.clinician_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.clinician_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewSummary(task)}
                              className="gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsSent(task)}
                              disabled={updating}
                              className="gap-1"
                            >
                              <Send className="h-3 w-3" />
                              Mark Sent
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowSkipDialog(true);
                              }}
                              className="gap-1 text-muted-foreground"
                            >
                              <SkipForward className="h-3 w-3" />
                              Skip
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-3 bg-muted/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{task.patient_name}</span>
                            <Badge 
                              variant={task.status === "sent" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {task.status === "sent" ? "Sent" : "Skipped"}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.sent_at 
                              ? format(parseISO(task.sent_at), "MMM d, yyyy")
                              : format(parseISO(task.created_at), "MMM d, yyyy")
                            }
                          </span>
                        </div>
                        {task.notes && task.status === "skipped" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {task.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip PCP Summary Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to skip sending the PCP summary for {selectedTask?.patient_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skipReason">Reason (optional)</Label>
              <Textarea
                id="skipReason"
                placeholder="e.g., No PCP on file, Patient declined..."
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSkipDialog(false);
                setSelectedTask(null);
                setSkipReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSkip} disabled={updating}>
              Skip Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}