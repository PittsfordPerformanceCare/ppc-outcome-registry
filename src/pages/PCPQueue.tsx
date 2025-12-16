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
  Phone,
  Download,
  Printer
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const PCPQueue = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PCPSummaryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<PCPSummaryTask | null>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("fax");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

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
      
      // Update the task
      const { error: taskError } = await supabase
        .from("pcp_summary_tasks")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_by: user?.id,
          notes: deliveryNotes || `Sent via ${deliveryMethod}`
        })
        .eq("id", selectedTask.id);

      if (taskError) throw taskError;

      // Update the episode
      const { error: episodeError } = await supabase
        .from("episodes")
        .update({ pcp_summary_sent_at: new Date().toISOString() })
        .eq("id", selectedTask.episode_id);

      if (episodeError) throw episodeError;

      // Log lifecycle event
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
      setDeliveryMethod("fax");
      setDeliveryNotes("");
      fetchTasks();
    } catch (error: any) {
      console.error("Error sending summary:", error);
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

      // Log lifecycle event
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
    if (statusFilter === "pending") return t.status === "pending";
    if (statusFilter === "sent") return t.status === "sent";
    if (statusFilter === "skipped") return t.status === "skipped";
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === "pending").length;

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
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {pendingCount} awaiting delivery
                </Badge>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
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
              <p className="font-medium">No {statusFilter === "all" ? "" : statusFilter} PCP summaries</p>
              <p className="text-sm mt-1">
                {statusFilter === "pending" 
                  ? "Summaries will appear here when episodes are discharged"
                  : "No summaries match the selected filter"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    task.status === "pending"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      : task.status === "sent"
                      ? "bg-green-50/30 dark:bg-green-950/10 border-green-200 dark:border-green-800"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{task.patient_name}</span>
                        <Badge 
                          variant={task.status === "pending" ? "outline" : task.status === "sent" ? "default" : "secondary"}
                          className={task.status === "pending" ? "border-amber-500 text-amber-700" : ""}
                        >
                          {task.status === "pending" ? "Ready" : task.status === "sent" ? "Sent" : "Skipped"}
                        </Badge>
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

                      {task.status === "sent" && task.sent_at && (
                        <p className="text-xs text-green-600 mt-2">
                          Sent on {format(parseISO(task.sent_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {task.notes && task.status === "skipped" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reason: {task.notes}
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
                      
                      {task.status === "pending" && (
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
                                setDeliveryMethod("fax");
                                setShowSendDialog(true);
                              }}>
                                <Printer className="h-4 w-4 mr-2" />
                                Send via Fax
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                setDeliveryMethod("secure_email");
                                setShowSendDialog(true);
                              }}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send via Secure Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                setDeliveryMethod("manual");
                                setShowSendDialog(true);
                              }}>
                                <Download className="h-4 w-4 mr-2" />
                                Manual Export/Print
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
                    </div>
                  </div>
                </div>
              ))}
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
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fax">Fax</SelectItem>
                  <SelectItem value="secure_email">Secure Email</SelectItem>
                  <SelectItem value="manual">Manual Export/Print</SelectItem>
                  <SelectItem value="phone">Phone/Verbal</SelectItem>
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

      {/* Skip Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip PCP Summary</DialogTitle>
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
            <Button variant="secondary" onClick={handleSkip} disabled={updating}>
              Skip Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PCPQueue;
