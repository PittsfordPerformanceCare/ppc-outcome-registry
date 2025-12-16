import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  ArrowLeft, User, Calendar, Phone, Mail, FileText,
  CheckCircle, XCircle, MessageSquare, Loader2, AlertCircle
} from "lucide-react";

interface CareRequest {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  admin_owner_id: string | null;
  assigned_clinician_id: string | null;
  source: string;
  intake_payload: Record<string, unknown>;
  primary_complaint: string | null;
  triage_notes: string | null;
  approval_reason: string | null;
  archive_reason: string | null;
  patient_id: string | null;
  episode_id: string | null;
  approved_at: string | null;
}

interface Clinician {
  id: string;
  full_name: string;
  clinician_name: string | null;
}

interface CareRequestDetailProps {
  request: CareRequest;
  clinicians: Clinician[];
  onBack: () => void;
  onAssignClinician: (requestId: string, clinicianId: string) => void;
  onUpdateStatus: (requestId: string, status: string, reason?: string) => void;
  onRefresh: () => void;
}

export function CareRequestDetail({ 
  request, 
  clinicians, 
  onBack, 
  onAssignClinician,
  onUpdateStatus,
  onRefresh
}: CareRequestDetailProps) {
  const navigate = useNavigate();
  const [approving, setApproving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [triageNotes, setTriageNotes] = useState(request.triage_notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const payload = request.intake_payload as Record<string, unknown>;
  const patientName = (payload?.patient_name || payload?.legalName || "Unknown") as string;

  const handleSaveTriageNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("care_requests")
        .update({ 
          triage_notes: triageNotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;
      toast.success("Triage notes saved");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save notes: ${message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleApproveForCare = async () => {
    if (!request.assigned_clinician_id) {
      toast.error("Please assign a clinician before approving");
      return;
    }

    setApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("approve-care-request", {
        body: { careRequestId: request.id }
      });

      if (error) throw error;

      toast.success("Care request approved! Episode created successfully.");
      
      // Log lifecycle event
      await supabase.from("lifecycle_events").insert({
        entity_type: "CARE_REQUEST",
        entity_id: request.id,
        event_type: "APPROVED_FOR_CARE",
        actor_type: "admin",
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: { episode_id: data?.episodeId, patient_id: data?.patientId }
      });

      setShowApproveDialog(false);
      
      // Navigate to the new episode
      if (data?.episodeId) {
        navigate(`/episode-summary?id=${data.episodeId}`);
      } else {
        onBack();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Approval failed: ${message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleArchive = () => {
    onUpdateStatus(request.id, "ARCHIVED", archiveReason);
    setShowArchiveDialog(false);
    onBack();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
      SUBMITTED: { variant: "default", color: "bg-blue-500" },
      IN_REVIEW: { variant: "secondary", color: "bg-yellow-500" },
      CLARIFICATION_REQUESTED: { variant: "outline", color: "bg-orange-500" },
      APPROVED_FOR_CARE: { variant: "secondary", color: "bg-green-500" },
      ARCHIVED: { variant: "destructive", color: "bg-gray-500" }
    };

    const config = statusConfig[status] || { variant: "default" as const, color: "bg-gray-500" };
    return <Badge variant={config.variant}>{status.replace(/_/g, " ")}</Badge>;
  };

  const isApprovalReady = request.assigned_clinician_id && 
    ["SUBMITTED", "IN_REVIEW", "CLARIFICATION_REQUESTED"].includes(request.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Button>
        <div className="flex items-center gap-2">
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{patientName}</p>
                </div>
                {payload?.date_of_birth && (
                  <div>
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(payload.date_of_birth as string), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
                {payload?.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {payload.phone as string}
                    </p>
                  </div>
                )}
                {payload?.email && (
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {payload.email as string}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Chief Complaint</label>
                <p className="font-medium">{(payload?.chief_complaint as string) || "Not specified"}</p>
              </div>
              {payload?.injury_mechanism && (
                <div>
                  <label className="text-sm text-muted-foreground">Mechanism of Injury</label>
                  <p>{payload.injury_mechanism as string}</p>
                </div>
              )}
              {payload?.symptoms && (
                <div>
                  <label className="text-sm text-muted-foreground">Symptoms</label>
                  <p className="whitespace-pre-wrap">{payload.symptoms as string}</p>
                </div>
              )}
              {payload?.medical_history && (
                <div>
                  <label className="text-sm text-muted-foreground">Medical History</label>
                  <p className="whitespace-pre-wrap">{payload.medical_history as string}</p>
                </div>
              )}
              {payload?.current_medications && (
                <div>
                  <label className="text-sm text-muted-foreground">Current Medications</label>
                  <p className="whitespace-pre-wrap">{payload.current_medications as string}</p>
                </div>
              )}
              {payload?.allergies && (
                <div>
                  <label className="text-sm text-muted-foreground">Allergies</label>
                  <p>{payload.allergies as string}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Intake Payload (collapsible) */}
          <Card>
            <CardHeader>
              <CardTitle>Full Intake Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assign Clinician */}
              <div>
                <label className="text-sm font-medium mb-2 block">Assign Clinician</label>
                <Select 
                  value={request.assigned_clinician_id || ""} 
                  onValueChange={(value) => onAssignClinician(request.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicians.map((clinician) => (
                      <SelectItem key={clinician.id} value={clinician.id}>
                        {clinician.clinician_name || clinician.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Actions */}
              <div className="space-y-2">
                {request.status !== "APPROVED_FOR_CARE" && request.status !== "ARCHIVED" && (
                  <>
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setShowApproveDialog(true)}
                      disabled={!isApprovalReady}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve for Care
                    </Button>
                    
                    {request.status !== "CLARIFICATION_REQUESTED" && (
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => onUpdateStatus(request.id, "CLARIFICATION_REQUESTED")}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Request Clarification
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2"
                      onClick={() => setShowArchiveDialog(true)}
                    >
                      <XCircle className="h-4 w-4" />
                      Archive
                    </Button>
                  </>
                )}

                {request.status === "APPROVED_FOR_CARE" && request.episode_id && (
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/episode-summary?id=${request.episode_id}`)}
                  >
                    View Episode
                  </Button>
                )}
              </div>

              {!request.assigned_clinician_id && request.status !== "ARCHIVED" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Assign a clinician before approving for care
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Triage Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Triage Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Add notes about this care request..."
                rows={4}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveTriageNotes}
                disabled={savingNotes}
              >
                {savingNotes && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Request Info */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{request.source.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(request.updated_at), "MMM d, yyyy")}</span>
              </div>
              {request.approved_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span>{format(new Date(request.approved_at), "MMM d, yyyy")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Care Request</DialogTitle>
            <DialogDescription>
              This will create a new patient record (if needed) and episode for {patientName}.
              The assigned clinician will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Assigned Clinician:</p>
            <p className="font-medium">
              {clinicians.find(c => c.id === request.assigned_clinician_id)?.clinician_name || 
               clinicians.find(c => c.id === request.assigned_clinician_id)?.full_name || 
               "Not assigned"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveForCare} disabled={approving}>
              {approving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Approve & Create Episode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Care Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for archiving this request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder="Reason for archiving..."
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive}>
              Archive Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
