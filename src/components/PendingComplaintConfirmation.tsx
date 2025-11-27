import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createEpisode } from "@/lib/dbOperations";

interface PendingEpisode {
  id: string;
  intake_form_id: string;
  complaint_priority: number;
  complaint_text: string;
  complaint_category: string;
  patient_name: string;
  status: string;
  previous_episode_id: string;
}

interface PendingComplaintConfirmationProps {
  currentEpisodeId: string;
  patientName: string;
  onComplete: () => void;
}

export function PendingComplaintConfirmation({
  currentEpisodeId,
  patientName,
  onComplete,
}: PendingComplaintConfirmationProps) {
  const [pendingEpisodes, setPendingEpisodes] = useState<PendingEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<PendingEpisode | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [deferralReason, setDeferralReason] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load pending episodes when component mounts
  useEffect(() => {
    loadPendingEpisodes();
  }, []);

  const loadPendingEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episodes")
        .select("*")
        .eq("patient_name", patientName)
        .eq("previous_episode_id", currentEpisodeId)
        .eq("status", "pending")
        .order("complaint_priority", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setPendingEpisodes(data);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Error loading pending episodes:", error);
    }
  };

  const handleConfirmNext = async (episode: PendingEpisode) => {
    if (!scheduledDate) {
      toast.error("Please select a scheduled date");
      return;
    }

    setLoading(true);
    try {
      // Load the original intake form
      const { data: intakeData, error: intakeError } = await supabase
        .from("intake_forms")
        .select("*")
        .eq("id", episode.intake_form_id)
        .single();

      if (intakeError) throw intakeError;

      // Get the specific complaint data
      const complaints = intakeData.complaints as any[];
      const complaint = complaints.find((c: any) => c.priority === episode.complaint_priority);

      if (!complaint) throw new Error("Complaint not found in intake form");

      // Create new episode from intake data with the new complaint
      const newEpisode = await createEpisode({
        patient_name: intakeData.patient_name,
        date_of_birth: intakeData.date_of_birth,
        region: complaint.region,
        diagnosis: complaint.diagnosis || "",
        date_of_service: scheduledDate,
        injury_date: intakeData.injury_date,
        injury_mechanism: intakeData.injury_mechanism,
        pain_level: intakeData.pain_level?.toString(),
        referring_physician: intakeData.referring_physician,
        insurance: intakeData.insurance_provider,
        emergency_contact: intakeData.emergency_contact_name,
        emergency_phone: intakeData.emergency_contact_phone,
        medications: intakeData.current_medications,
        medical_history: intakeData.medical_history,
      } as any);

      // Update the created episode with complaint priority and source
      await supabase
        .from("episodes")
        .update({
          complaint_priority: episode.complaint_priority,
          source_intake_form_id: episode.intake_form_id,
        })
        .eq("id", newEpisode.id);

      // Update pending episode status
      const { error: updateError } = await supabase
        .from("pending_episodes")
        .update({
          status: "converted",
          converted_to_episode_id: newEpisode.id,
          converted_at: new Date().toISOString(),
          scheduled_date: scheduledDate,
        })
        .eq("id", episode.id);

      if (updateError) throw updateError;

      toast.success(`New episode created for complaint #${episode.complaint_priority}`);
      
      // Reload pending episodes
      await loadPendingEpisodes();
      setSelectedEpisode(null);
      setScheduledDate("");
    } catch (error: any) {
      toast.error(`Failed to create episode: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDefer = async (episode: PendingEpisode) => {
    if (!deferralReason.trim()) {
      toast.error("Please provide a reason for deferral");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pending_episodes")
        .update({
          status: "deferred",
          deferred_reason: deferralReason,
        })
        .eq("id", episode.id);

      if (error) throw error;

      toast.success("Complaint deferred");
      
      // Reload pending episodes
      await loadPendingEpisodes();
      setSelectedEpisode(null);
      setDeferralReason("");
    } catch (error: any) {
      toast.error(`Failed to defer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = () => {
    setShowConfirmation(false);
    onComplete();
  };

  if (!showConfirmation || pendingEpisodes.length === 0) {
    return null;
  }

  const nextEpisode = pendingEpisodes[0];

  return (
    <Card className="border-primary/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Additional Complaints Pending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This patient has {pendingEpisodes.length} additional ranked complaint{pendingEpisodes.length > 1 ? "s" : ""} from their original intake.
            Would you like to schedule the next episode?
          </AlertDescription>
        </Alert>

        {/* Show next pending complaint */}
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Priority #{nextEpisode.complaint_priority}</Badge>
                <Badge variant="outline">{nextEpisode.complaint_category || "General"}</Badge>
              </div>
              <p className="font-medium">{nextEpisode.complaint_text}</p>
            </div>
          </div>

          {!selectedEpisode && (
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedEpisode(nextEpisode)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Schedule Next Episode
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEpisode(nextEpisode);
                  setDeferralReason("");
                }}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Defer Treatment
              </Button>
            </div>
          )}

          {/* Schedule form */}
          {selectedEpisode?.id === nextEpisode.id && !deferralReason && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmNext(nextEpisode)}
                  disabled={loading || !scheduledDate}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Confirm & Create Episode
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedEpisode(null);
                    setScheduledDate("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Deferral form */}
          {selectedEpisode?.id === nextEpisode.id && deferralReason !== null && scheduledDate === "" && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="deferralReason">Reason for Deferral *</Label>
                <Textarea
                  id="deferralReason"
                  value={deferralReason}
                  onChange={(e) => setDeferralReason(e.target.value)}
                  placeholder="e.g., Patient requested to postpone due to cost/scheduling..."
                  rows={3}
                  className="bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDefer(nextEpisode)}
                  disabled={loading || !deferralReason.trim()}
                  variant="outline"
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Confirm Deferral
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedEpisode(null);
                    setDeferralReason("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Show remaining complaints */}
        {pendingEpisodes.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Remaining Complaints ({pendingEpisodes.length - 1}):
            </p>
            {pendingEpisodes.slice(1).map((ep) => (
              <div key={ep.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">#{ep.complaint_priority}</Badge>
                <span>{ep.complaint_text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleSkipAll}
            disabled={loading}
            className="w-full"
          >
            Complete Discharge Without Scheduling
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
