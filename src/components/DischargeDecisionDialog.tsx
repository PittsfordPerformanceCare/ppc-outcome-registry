import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Pause, 
  FileText, 
  Plus,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Categories for episode classification
const EPISODE_CATEGORIES = [
  { value: "MSK", label: "Musculoskeletal (MSK)" },
  { value: "Neuro", label: "Neurology" },
  { value: "Vestibular", label: "Vestibular" },
  { value: "Performance", label: "Performance" },
  { value: "Concussion", label: "Concussion" },
  { value: "Other", label: "Other" },
];

type DischargeOutcome = "care_complete" | "continuing_new_episode" | "care_paused";
type ContinuationSource = "documented" | "newly_identified";

interface DocumentedComplaint {
  id: string;
  complaint: string;
  category: string;
}

const newConcernSchema = z.object({
  primaryComplaint: z.string().min(1, "Primary complaint is required"),
  category: z.string().min(1, "Category is required"),
  outcomeToolsSuggestion: z.string().optional(),
});

type NewConcernFormValues = z.infer<typeof newConcernSchema>;

interface DischargeDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  patientName: string;
  region: string;
  documentedComplaints?: DocumentedComplaint[];
  onSuccess?: () => void;
}

export function DischargeDecisionDialog({
  open,
  onOpenChange,
  episodeId,
  patientName,
  region,
  documentedComplaints = [],
  onSuccess,
}: DischargeDecisionDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dischargeOutcome, setDischargeOutcome] = useState<DischargeOutcome | null>(null);
  const [continuationSource, setContinuationSource] = useState<ContinuationSource | null>(null);
  const [selectedDocumentedComplaint, setSelectedDocumentedComplaint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalVisits, setTotalVisits] = useState<string>("");
  const [visitError, setVisitError] = useState<string | null>(null);

  const form = useForm<NewConcernFormValues>({
    resolver: zodResolver(newConcernSchema),
    defaultValues: {
      primaryComplaint: "",
      category: "",
      outcomeToolsSuggestion: "",
    },
  });

  const resetDialog = () => {
    setStep(1);
    setDischargeOutcome(null);
    setContinuationSource(null);
    setSelectedDocumentedComplaint(null);
    setTotalVisits("");
    setVisitError(null);
    form.reset();
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const handleOutcomeSelection = (outcome: DischargeOutcome) => {
    setDischargeOutcome(outcome);
    if (outcome === "continuing_new_episode") {
      setStep(2);
    }
  };

  const handleSourceSelection = (source: ContinuationSource) => {
    setContinuationSource(source);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setContinuationSource(null);
      setSelectedDocumentedComplaint(null);
      form.reset();
    } else if (step === 2) {
      setStep(1);
      setDischargeOutcome(null);
    }
  };

  const validateVisitCount = (): boolean => {
    const visits = parseInt(totalVisits, 10);
    if (!totalVisits || isNaN(visits)) {
      setVisitError("Total visits is required");
      return false;
    }
    if (visits < 1) {
      setVisitError("Visits must be at least 1");
      return false;
    }
    setVisitError(null);
    return true;
  };

  const handleSubmit = async (formValues?: NewConcernFormValues) => {
    if (!dischargeOutcome) return;

    // Validate visit count for all discharge types
    if (!validateVisitCount()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id, full_name")
        .eq("id", user.id)
        .single();

      // Prepare continuation details if applicable
      let continuationDetails: any = null;
      if (dischargeOutcome === "continuing_new_episode" && continuationSource) {
        if (continuationSource === "documented" && selectedDocumentedComplaint) {
          const selectedComplaint = documentedComplaints.find(c => c.id === selectedDocumentedComplaint);
          continuationDetails = {
            primary_complaint: selectedComplaint?.complaint || region,
            category: selectedComplaint?.category || region,
            documented_complaint_ref: selectedDocumentedComplaint,
          };
        } else if (continuationSource === "newly_identified" && formValues) {
          continuationDetails = {
            primary_complaint: formValues.primaryComplaint,
            category: formValues.category,
            outcome_tools_suggestion: formValues.outcomeToolsSuggestion || null,
          };
        }
      }

      // Update episode with discharge outcome and visit count
      const { error: episodeError } = await supabase
        .from("episodes")
        .update({
          discharge_date: new Date().toISOString().split('T')[0],
          discharge_outcome: dischargeOutcome,
          continuation_episode_source: continuationSource,
          continuation_details: continuationDetails,
          total_visits_to_discharge: parseInt(totalVisits, 10),
        })
        .eq("id", episodeId);

      if (episodeError) throw episodeError;

      // If continuing with new episode, create pending continuation record for admin
      if (dischargeOutcome === "continuing_new_episode" && continuationDetails) {
        const { error: continuationError } = await supabase
          .from("pending_episode_continuations")
          .insert({
            source_episode_id: episodeId,
            patient_name: patientName,
            clinician_id: user.id,
            clinician_name: profile?.full_name,
            continuation_source: continuationSource,
            primary_complaint: continuationDetails.primary_complaint,
            category: continuationDetails.category,
            documented_complaint_ref: continuationDetails.documented_complaint_ref || null,
            outcome_tools_suggestion: continuationDetails.outcome_tools_suggestion 
              ? [continuationDetails.outcome_tools_suggestion] 
              : null,
            clinic_id: profile?.clinic_id,
            user_id: user.id,
          });

        if (continuationError) throw continuationError;
      }

      const outcomeMessages: Record<DischargeOutcome, string> = {
        care_complete: "Episode discharged - care complete",
        continuing_new_episode: "Episode discharged - continuation episode queued for admin setup",
        care_paused: "Episode discharged - care paused",
      };

      toast.success(outcomeMessages[dischargeOutcome]);
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error processing discharge:", error);
      toast.error(error.message || "Failed to process discharge");
    } finally {
      setLoading(false);
    }
  };

  const handleCareCompleteOrPaused = () => {
    if (dischargeOutcome === "care_complete" || dischargeOutcome === "care_paused") {
      handleSubmit();
    }
  };

  const handleDocumentedConcernSubmit = () => {
    if (selectedDocumentedComplaint) {
      handleSubmit();
    }
  };

  const onNewConcernSubmit = (values: NewConcernFormValues) => {
    handleSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            Discharge Episode
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "After resolving this episode, what is the next step?"}
            {step === 2 && "Is the next episode based on an already documented concern, or a new concern identified during care?"}
            {step === 3 && continuationSource === "documented" && "Select the documented concern for the continuation episode"}
            {step === 3 && continuationSource === "newly_identified" && "Provide details for the newly identified concern"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            step >= 1 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-0.5 w-8",
            step >= 2 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-2 w-2 rounded-full",
            step >= 2 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-0.5 w-8",
            step >= 3 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-2 w-2 rounded-full",
            step >= 3 ? "bg-primary" : "bg-muted"
          )} />
        </div>

        {/* Step 1: Discharge Outcome */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setDischargeOutcome("care_complete");
                }}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  dischargeOutcome === "care_complete" && "border-primary bg-primary/5"
                )}
              >
                <div className="rounded-full p-2 bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Care complete – no further episode needed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Patient has achieved goals and is ready for discharge
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOutcomeSelection("continuing_new_episode")}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  dischargeOutcome === "continuing_new_episode" && "border-primary bg-primary/5"
                )}
              >
                <div className="rounded-full p-2 bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Care complete – patient continuing with a new episode</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current concern resolved, but additional care needed for different concern
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDischargeOutcome("care_paused");
                }}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  dischargeOutcome === "care_paused" && "border-primary bg-primary/5"
                )}
              >
                <div className="rounded-full p-2 bg-warning/10">
                  <Pause className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Care temporarily paused — awaiting external input</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use when care cannot safely continue without imaging, consult, or records
                  </p>
                </div>
              </button>
            </div>

            {(dischargeOutcome === "care_complete" || dischargeOutcome === "care_paused") && (
              <div className="space-y-4 pt-4 border-t">
                {/* Visit Count Input - Required for Discharge */}
                <div className="space-y-2">
                  <Label htmlFor="total-visits" className="text-sm font-medium">
                    Total Visits for This Episode *
                  </Label>
                  <Input
                    id="total-visits"
                    type="number"
                    min="1"
                    placeholder="Enter number of visits (including evaluation)"
                    value={totalVisits}
                    onChange={(e) => {
                      setTotalVisits(e.target.value);
                      setVisitError(null);
                    }}
                    className={cn(visitError && "border-destructive")}
                  />
                  {visitError && (
                    <p className="text-sm text-destructive">{visitError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Used for quality improvement and outcome tracking. Not shown to patients.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleCareCompleteOrPaused} disabled={loading}>
                    {loading ? "Processing..." : "Complete Discharge"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Continuation Source */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleSourceSelection("documented")}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  continuationSource === "documented" && "border-primary bg-primary/5"
                )}
              >
                <div className="rounded-full p-2 bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Already documented concern</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Concern was identified during intake or earlier visits
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSourceSelection("newly_identified")}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  continuationSource === "newly_identified" && "border-primary bg-primary/5"
                )}
              >
                <div className="rounded-full p-2 bg-amber-500/10">
                  <Plus className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">New concern identified during care</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Concern discovered during treatment that wasn't initially documented
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3a: Select Documented Concern */}
        {step === 3 && continuationSource === "documented" && (
          <div className="space-y-4">
            {documentedComplaints.length > 0 ? (
              <RadioGroup
                value={selectedDocumentedComplaint || ""}
                onValueChange={setSelectedDocumentedComplaint}
                className="space-y-3"
              >
                {documentedComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                      selectedDocumentedComplaint === complaint.id && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={complaint.id} id={complaint.id} />
                    <Label htmlFor={complaint.id} className="flex-1 cursor-pointer">
                      <p className="font-medium">{complaint.complaint}</p>
                      <Badge variant="outline" className="mt-1">{complaint.category}</Badge>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">No documented complaints found</p>
                  <p className="text-sm text-muted-foreground">
                    Using current episode region ({region}) as the reference
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Visit Count Input - Required for Discharge */}
            <div className="space-y-2">
              <Label htmlFor="total-visits-doc" className="text-sm font-medium">
                Total Visits for This Episode *
              </Label>
              <Input
                id="total-visits-doc"
                type="number"
                min="1"
                placeholder="Enter number of visits (including evaluation)"
                value={totalVisits}
                onChange={(e) => {
                  setTotalVisits(e.target.value);
                  setVisitError(null);
                }}
                className={cn(visitError && "border-destructive")}
              />
              {visitError && (
                <p className="text-sm text-destructive">{visitError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used for quality improvement and outcome tracking. Not shown to patients.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleDocumentedConcernSubmit} 
                disabled={loading || (documentedComplaints.length > 0 && !selectedDocumentedComplaint)}
              >
                {loading ? "Processing..." : "Complete Discharge"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3b: New Concern Form */}
        {step === 3 && continuationSource === "newly_identified" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onNewConcernSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="primaryComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Complaint *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Right shoulder pain, Cervical stiffness" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category / System *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EPISODE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcomeToolsSuggestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Outcome Tool (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-mapped based on category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NDI">NDI (Neck Disability Index)</SelectItem>
                        <SelectItem value="ODI">ODI (Oswestry Disability Index)</SelectItem>
                        <SelectItem value="QuickDASH">QuickDASH (Upper Extremity)</SelectItem>
                        <SelectItem value="LEFS">LEFS (Lower Extremity)</SelectItem>
                        <SelectItem value="RPQ">RPQ (Rivermead Post-Concussion)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave blank to auto-map based on category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Visit Count Input - Required for Discharge */}
              <div className="space-y-2">
                <Label htmlFor="total-visits-new" className="text-sm font-medium">
                  Total Visits for This Episode *
                </Label>
                <Input
                  id="total-visits-new"
                  type="number"
                  min="1"
                  placeholder="Enter number of visits (including evaluation)"
                  value={totalVisits}
                  onChange={(e) => {
                    setTotalVisits(e.target.value);
                    setVisitError(null);
                  }}
                  className={cn(visitError && "border-destructive")}
                />
                {visitError && (
                  <p className="text-sm text-destructive">{visitError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used for quality improvement and outcome tracking. Not shown to patients.
                </p>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Complete Discharge"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}