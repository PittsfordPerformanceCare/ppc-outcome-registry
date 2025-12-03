import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, CheckCircle2, XCircle, Eye, RefreshCw, Brain, Activity, Zap } from "lucide-react";
import { format } from "date-fns";

interface Intake {
  id: string;
  lead_id: string | null;
  progress: number;
  timestamp_started: string;
  timestamp_completed: string | null;
  status: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  form_data: any;
  created_at: string;
  updated_at: string;
  lead?: {
    severity_score: number | null;
    system_category: string | null;
    utm_source: string | null;
  } | null;
}

const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
  visual: { icon: Eye, color: "text-blue-500" },
  vestibular: { icon: Activity, color: "text-purple-500" },
  cerebellar: { icon: Brain, color: "text-teal-500" },
  autonomic: { icon: Zap, color: "text-orange-500" },
};

const IntakesReviewQueue = () => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadIntakes = async () => {
    setLoading(true);
    try {
      // First get completed intakes
      const { data: intakesData, error: intakesError } = await supabase
        .from("intakes")
        .select("*")
        .eq("status", "completed")
        .order("timestamp_completed", { ascending: false });

      if (intakesError) throw intakesError;

      // Then get leads for each intake
      const intakesWithLeads = await Promise.all(
        (intakesData || []).map(async (intake) => {
          if (intake.lead_id) {
            const { data: leadData } = await supabase
              .from("leads")
              .select("severity_score, system_category, utm_source")
              .eq("id", intake.lead_id)
              .single();
            return { ...intake, lead: leadData };
          }
          return { ...intake, lead: null };
        })
      );

      setIntakes(intakesWithLeads);
    } catch (error) {
      console.error("Error loading intakes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntakes();

    const channel = supabase
      .channel("intakes-review-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "intakes" },
        () => loadIntakes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (intake: Intake) => {
    setProcessing(true);
    try {
      // Update intake status
      await supabase
        .from("intakes")
        .update({ status: "approved" })
        .eq("id", intake.id);

      // Update lead status
      if (intake.lead_id) {
        await supabase
          .from("leads")
          .update({ checkpoint_status: "approved" })
          .eq("id", intake.lead_id);
      }

      // Send approval notification
      try {
        await supabase.functions.invoke("send-intake-approval", {
          body: {
            intakeId: intake.id,
            patientName: intake.patient_name,
            patientEmail: intake.patient_email,
          },
        });
      } catch (e) {
        console.error("Notification error:", e);
      }

      toast({ title: "Intake approved", description: "Patient has been notified." });
      loadIntakes();
    } catch (error: any) {
      toast({ title: "Error approving intake", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedIntake) return;
    
    setProcessing(true);
    try {
      // Update intake status
      await supabase
        .from("intakes")
        .update({ status: "declined" })
        .eq("id", selectedIntake.id);

      // Update lead status
      if (selectedIntake.lead_id) {
        await supabase
          .from("leads")
          .update({ checkpoint_status: "declined" })
          .eq("id", selectedIntake.lead_id);
      }

      // Send decline notification
      try {
        await supabase.functions.invoke("send-intake-decline", {
          body: {
            intakeId: selectedIntake.id,
            patientName: selectedIntake.patient_name,
            patientEmail: selectedIntake.patient_email,
            declineReason,
          },
        });
      } catch (e) {
        console.error("Notification error:", e);
      }

      toast({ title: "Intake declined", description: "Patient has been notified." });
      setIsDeclineOpen(false);
      setDeclineReason("");
      loadIntakes();
    } catch (error: any) {
      toast({ title: "Error declining intake", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getSeverityBadge = (score: number | null) => {
    if (score === null) return null;
    if (score <= 16) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mild ({score})</Badge>;
    if (score <= 32) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate ({score})</Badge>;
    if (score <= 48) return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Significant ({score})</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Severe ({score})</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Intakes Ready for Review
            </CardTitle>
            <CardDescription>Completed neurologic intakes awaiting clinician approval</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadIntakes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {intakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No intakes pending review</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intakes.map((intake) => {
                    const categoryInfo = intake.lead?.system_category 
                      ? categoryIcons[intake.lead.system_category] 
                      : null;
                    const CategoryIcon = categoryInfo?.icon;

                    return (
                      <TableRow key={intake.id}>
                        <TableCell>
                          <div className="font-medium">{intake.patient_name || "—"}</div>
                          <div className="text-sm text-muted-foreground">{intake.patient_email || "No email"}</div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(intake.lead?.severity_score ?? null)}
                        </TableCell>
                        <TableCell>
                          {CategoryIcon && categoryInfo ? (
                            <div className="flex items-center gap-1.5">
                              <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                              <span className="text-sm capitalize">{intake.lead?.system_category}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {intake.timestamp_completed 
                            ? format(new Date(intake.timestamp_completed), "MMM d, h:mm a")
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          {intake.lead?.utm_source ? (
                            <Badge variant="outline" className="text-xs">{intake.lead.utm_source}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Direct</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedIntake(intake);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(intake)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedIntake(intake);
                                setIsDeclineOpen(true);
                              }}
                              disabled={processing}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Not a Fit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Intake Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Intake Details</DialogTitle>
            <DialogDescription>
              Review the patient's submitted intake information
            </DialogDescription>
          </DialogHeader>
          {selectedIntake && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Patient Name</Label>
                  <p className="font-medium">{selectedIntake.patient_name || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedIntake.patient_email || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedIntake.patient_phone || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity Score</Label>
                  <p>{getSeverityBadge(selectedIntake.lead?.severity_score ?? null)}</p>
                </div>
              </div>
              
              {selectedIntake.form_data && Object.keys(selectedIntake.form_data).length > 0 && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground mb-2 block">Form Responses</Label>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    {Object.entries(selectedIntake.form_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium text-right max-w-[60%]">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value) || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Intake</DialogTitle>
            <DialogDescription>
              Provide a reason for declining this intake. The patient will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="declineReason">Reason (optional)</Label>
              <Textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Symptoms better suited for another specialist..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeclineOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDecline}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntakesReviewQueue;