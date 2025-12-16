import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
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
  User,
  Calendar,
  MapPin,
  SkipForward,
  ArrowLeft,
  Mail,
  Download,
  Printer,
  AlertTriangle,
  RefreshCw,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, formatDistanceToNow } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Canonical delivery statuses
type DeliveryStatus = "READY" | "SENT" | "FAILED" | "RESEND_REQUIRED" | "SKIPPED";

// Canonical delivery methods
type DeliveryMethod = "FAX" | "SECURE_EMAIL" | "PORTAL_UPLOAD" | "MANUAL_EXPORT";

interface PCPSummaryTask {
  id: string;
  episode_id: string;
  patient_name: string;
  clinician_name: string | null;
  discharge_date: string;
  region: string | null;
  pcp_name: string | null;
  pcp_contact: string | null;
  status: DeliveryStatus;
  created_at: string;
  sent_at: string | null;
  notes: string | null;
  delivery_method_used: DeliveryMethod | null;
  preferred_delivery_method: DeliveryMethod | null;
}

const statusConfig: Record<DeliveryStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  READY: { label: "Ready", variant: "outline", className: "border-amber-500 text-amber-700 dark:text-amber-400" },
  SENT: { label: "Sent", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
  RESEND_REQUIRED: { label: "Resend Required", variant: "destructive" },
  SKIPPED: { label: "Skipped", variant: "secondary" },
};

const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  FAX: "Fax",
  SECURE_EMAIL: "Secure Email",
  PORTAL_UPLOAD: "Portal Upload",
  MANUAL_EXPORT: "Manual Export",
};

const PCPQueue = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PCPSummaryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<PCPSummaryTask | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [failReason, setFailReason] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("FAX");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("actionable");

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

  const logLifecycleEvent = async (
    entityId: string,
    eventType: string,
    metadata: Record<string, unknown>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("lifecycle_events").insert([{
        entity_type: "PCP_SUMMARY",
        entity_id: entityId,
        event_type: eventType,
        actor_type: "admin",
        actor_id: user?.id || null,
        metadata: metadata as Json,
      }]);
    } catch (err) {
      console.error("Failed to log lifecycle event:", err);
    }
  };

  const handleSendSummary = async () => {
    if (!selectedTask) return;
    
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: taskError } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "SENT",
          sent_at: new Date().toISOString(),
          sent_by: user?.id,
          delivery_method_used: deliveryMethod,
          notes: deliveryNotes || `Sent via ${deliveryMethodLabels[deliveryMethod]}`
        })
        .eq("id", selectedTask.id);

      if (taskError) throw taskError;

      const { error: episodeError } = await supabase
        .from("episodes")
        .update({ pcp_summary_sent_at: new Date().toISOString() })
        .eq("id", selectedTask.episode_id);

      if (episodeError) throw episodeError;

      await logLifecycleEvent(selectedTask.id, "PCP_SUMMARY_SENT", {
        episode_id: selectedTask.episode_id,
        patient_name: selectedTask.patient_name,
        delivery_method: deliveryMethod,
        pcp_name: selectedTask.pcp_name,
        sent_by: user?.id,
      });

      toast.success("PCP Summary marked as sent");
      setShowSendDialog(false);
      setSelectedTask(null);
      setDeliveryMethod("FAX");
      setDeliveryNotes("");
      fetchTasks();
    } catch (error: any) {
      console.error("Error sending summary:", error);
      toast.error("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!selectedTask) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "FAILED",
          notes: failReason || "Delivery failed"
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      await logLifecycleEvent(selectedTask.id, "PCP_SUMMARY_FAILED", {
        episode_id: selectedTask.episode_id,
        patient_name: selectedTask.patient_name,
        reason: failReason,
      });

      toast.error("Summary marked as failed");
      setShowFailDialog(false);
      setSelectedTask(null);
      setFailReason("");
      fetchTasks();
    } catch (error: any) {
      console.error("Error marking failed:", error);
      toast.error("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleRetry = async (task: PCPSummaryTask) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "RESEND_REQUIRED",
          notes: task.notes ? `${task.notes} - Marked for retry` : "Marked for retry"
        })
        .eq("id", task.id);

      if (error) throw error;

      await logLifecycleEvent(task.id, "PCP_SUMMARY_RETRY_REQUESTED", {
        episode_id: task.episode_id,
        patient_name: task.patient_name,
      });

      toast.info("Summary marked for resend");
      fetchTasks();
    } catch (error: any) {
      console.error("Error marking for retry:", error);
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
          status: "SKIPPED",
          notes: skipReason || "Skipped by admin"
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      await logLifecycleEvent(selectedTask.id, "PCP_SUMMARY_SKIPPED", {
        episode_id: selectedTask.episode_id,
        patient_name: selectedTask.patient_name,
        reason: skipReason,
      });

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

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === "all") return true;
    if (statusFilter === "actionable") return t.status === "READY" || t.status === "RESEND_REQUIRED" || t.status === "FAILED";
    if (statusFilter === "READY") return t.status === "READY";
    if (statusFilter === "SENT") return t.status === "SENT";
    if (statusFilter === "FAILED") return t.status === "FAILED" || t.status === "RESEND_REQUIRED";
    if (statusFilter === "SKIPPED") return t.status === "SKIPPED";
    return true;
  });

  const actionableCount = tasks.filter(t => t.status === "READY" || t.status === "RESEND_REQUIRED" || t.status === "FAILED").length;
  const failedCount = tasks.filter(t => t.status === "FAILED" || t.status === "RESEND_REQUIRED").length;

  const getTimeSinceGeneration = (createdAt: string): { text: string; isUrgent: boolean } => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return { text: "Same day", isUrgent: false };
    } else if (hoursDiff < 48) {
      return { text: "1 day ago", isUrgent: false };
    } else {
      const days = Math.floor(hoursDiff / 24);
      return { text: `${days} days ago`, isUrgent: days > 2 };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                PCP Summary Delivery Queue
              </CardTitle>
              <CardDescription>
                Review and send summaries to referring providers after discharge
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {actionableCount > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {actionableCount} awaiting delivery
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  {failedCount} need attention
                </Badge>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actionable">Actionable</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="FAILED">Failed/Resend</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="SKIPPED">Skipped</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No {statusFilter === "all" ? "" : statusFilter === "actionable" ? "actionable" : statusFilter.toLowerCase()} PCP summaries</p>
              <p className="text-sm mt-1">
                {statusFilter === "actionable" 
                  ? "Summaries will appear here when episodes are discharged"
                  : "No summaries match the selected filter"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const config = statusConfig[task.status];
                const timeSince = getTimeSinceGeneration(task.created_at);
                const isActionable = task.status === "READY" || task.status === "RESEND_REQUIRED" || task.status === "FAILED";
                
                return (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      task.status === "READY"
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        : task.status === "SENT"
                        ? "bg-green-50/30 dark:bg-green-950/10 border-green-200 dark:border-green-800"
                        : task.status === "FAILED" || task.status === "RESEND_REQUIRED"
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{task.patient_name}</span>
                          <Badge 
                            variant={config.variant}
                            className={config.className}
                          >
                            {task.status === "FAILED" && <XCircle className="h-3 w-3 mr-1" />}
                            {task.status === "RESEND_REQUIRED" && <RefreshCw className="h-3 w-3 mr-1" />}
                            {config.label}
                          </Badge>
                          {isActionable && (
                            <Badge 
                              variant="outline" 
                              className={timeSince.isUrgent ? "text-orange-600 border-orange-300" : ""}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {timeSince.text}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Discharged: {format(parseISO(task.discharge_date), "MMM d, yyyy")}</span>
                          </div>
                          {task.region && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{task.region}</span>
                            </div>
                          )}
                          {task.clinician_name && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span>{task.clinician_name}</span>
                            </div>
                          )}
                          {task.pcp_name && (
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              <span>PCP: {task.pcp_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Preferred delivery method hint */}
                        {task.preferred_delivery_method && isActionable && (
                          <p className="text-xs text-blue-600 mt-2">
                            Preferred: {deliveryMethodLabels[task.preferred_delivery_method]}
                          </p>
                        )}

                        {task.status === "SENT" && task.sent_at && (
                          <p className="text-xs text-green-600 mt-2">
                            Sent on {format(parseISO(task.sent_at), "MMM d, yyyy 'at' h:mm a")}
                            {task.delivery_method_used && ` via ${deliveryMethodLabels[task.delivery_method_used]}`}
                          </p>
                        )}
                        {task.notes && (task.status === "SKIPPED" || task.status === "FAILED") && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {task.status === "FAILED" ? "Failure reason: " : "Reason: "}{task.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSummary(task)}
                          className="gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        
                        {(task.status === "READY" || task.status === "RESEND_REQUIRED") && (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" className="gap-1.5">
                                  <Send className="h-3.5 w-3.5" />
                                  Send
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTask(task);
                                  setDeliveryMethod(task.preferred_delivery_method || "FAX");
                                  setShowSendDialog(true);
                                }}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Send via Fax
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTask(task);
                                  setDeliveryMethod("SECURE_EMAIL");
                                  setShowSendDialog(true);
                                }}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send via Secure Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTask(task);
                                  setDeliveryMethod("MANUAL_EXPORT");
                                  setShowSendDialog(true);
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Manual Export/Print
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowFailDialog(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Mark as Failed
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowSkipDialog(true);
                              }}
                              className="gap-1.5 text-muted-foreground"
                            >
                              <SkipForward className="h-3.5 w-3.5" />
                              Skip
                            </Button>
                          </>
                        )}

                        {task.status === "FAILED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(task)}
                            disabled={updating}
                            className="gap-1.5"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Summary Delivery</DialogTitle>
            <DialogDescription>
              Send PCP summary for {selectedTask?.patient_name} to {selectedTask?.pcp_name || "provider"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAX">Fax</SelectItem>
                  <SelectItem value="SECURE_EMAIL">Secure Email</SelectItem>
                  <SelectItem value="PORTAL_UPLOAD">Portal Upload</SelectItem>
                  <SelectItem value="MANUAL_EXPORT">Manual Export/Print</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">Delivery Notes (optional)</Label>
              <Textarea
                id="deliveryNotes"
                placeholder="e.g., Fax confirmation #, recipient name..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSendDialog(false);
                setSelectedTask(null);
                setDeliveryNotes("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSendSummary} disabled={updating}>
              <Send className="h-4 w-4 mr-2" />
              Confirm Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fail Dialog */}
      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Mark Delivery as Failed
            </DialogTitle>
            <DialogDescription>
              Record that delivery failed for {selectedTask?.patient_name}'s PCP summary.
              This will keep the item visible for retry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="failReason">Failure Reason</Label>
              <Textarea
                id="failReason"
                placeholder="e.g., Fax number invalid, email bounced, no response..."
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFailDialog(false);
                setSelectedTask(null);
                setFailReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMarkFailed} disabled={updating}>
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Failed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip This Summary?</DialogTitle>
            <DialogDescription>
              Skip sending PCP summary for {selectedTask?.patient_name}.
              Please provide a reason for skipping.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skipReason">Reason for Skipping</Label>
              <Textarea
                id="skipReason"
                placeholder="e.g., No PCP on file, patient declined..."
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
            <Button variant="secondary" onClick={handleSkip} disabled={updating}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip This Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PCPQueue;
