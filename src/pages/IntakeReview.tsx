import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, Calendar, Phone, Mail, AlertCircle, CheckCircle, CheckCircle2, ArrowRight, FileText, CheckSquare, Layers, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { IntakeToEpisodeConverter } from "@/components/IntakeToEpisodeConverter";
import { BulkIntakeConverter } from "@/components/BulkIntakeConverter";
import { validateBulkIntakes, checkForDuplicatePatients } from "@/lib/bulkIntakeValidation";

interface IntakeForm {
  id: string;
  access_code: string;
  status: string;
  patient_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  insurance_provider: string;
  insurance_id: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  primary_care_physician: string;
  referring_physician: string;
  current_medications: string;
  allergies: string;
  medical_history: string;
  chief_complaint: string;
  injury_date: string;
  injury_mechanism: string;
  pain_level: number;
  symptoms: string;
  submitted_at: string;
  reviewed_at: string;
  converted_to_episode_id: string;
  complaints: any;
  review_of_systems: any;
}

export default function IntakeReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [intakeForms, setIntakeForms] = useState<IntakeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<IntakeForm | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [formToConvert, setFormToConvert] = useState<IntakeForm | null>(null);
  const [preparingConversion, setPreparingConversion] = useState(false);
  
  // Bulk selection states
  const [selectedIntakes, setSelectedIntakes] = useState<Set<string>>(new Set());
  const [bulkConvertDialogOpen, setBulkConvertDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [preparingBulkConversion, setPreparingBulkConversion] = useState(false);

  useEffect(() => {
    loadIntakeForms();
  }, []);

  // Auto-select form if coming from notification
  useEffect(() => {
    if (location.state?.intakeId && intakeForms.length > 0) {
      const form = intakeForms.find(f => f.id === location.state.intakeId);
      if (form) {
        setSelectedForm(form);
        // Clear the state to prevent re-opening on navigation
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, intakeForms, navigate, location.pathname]);

  const loadIntakeForms = async () => {
    try {
      const { data, error } = await supabase
        .from("intake_forms")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      
      // Parse JSON fields
      const parsedData = (data || []).map(form => ({
        ...form,
        complaints: typeof form.complaints === 'string' ? JSON.parse(form.complaints) : form.complaints || [],
        review_of_systems: typeof form.review_of_systems === 'string' ? JSON.parse(form.review_of_systems) : form.review_of_systems || []
      }));
      
      setIntakeForms(parsedData);
    } catch (error: any) {
      toast.error(`Failed to load intake forms: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToEpisode = async (form: IntakeForm) => {
    try {
      setPreparingConversion(true);
      
      // Get clinician name for notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinician_name")
        .eq("id", user?.id)
        .single();

      // Send post-review notification (non-blocking)
      if (form.email) {
        supabase.functions.invoke("send-post-review-notification", {
          body: {
            intakeFormId: form.id,
            patientEmail: form.email,
            patientName: form.patient_name,
            clinicianName: profile?.clinician_name || "Your provider",
          },
        }).catch(error => {
          console.log("Notification skipped:", error.message);
        });
      }

      // Update referral if exists (non-blocking)
      if ((form as any).referral_code) {
        try {
          await supabase
            .from("patient_referrals")
            .update({ status: "converted", converted_at: new Date().toISOString() })
            .eq("referral_code", (form as any).referral_code);
        } catch (error) {
          console.log("Referral update skipped:", error);
        }
      }
      
      // Brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      setFormToConvert(form);
      setConvertDialogOpen(true);
    } catch (error) {
      console.error("Error preparing conversion:", error);
      toast.error("Failed to prepare conversion. Please try again.");
    } finally {
      setPreparingConversion(false);
    }
  };

  const handleConversionSuccess = () => {
    loadIntakeForms();
    setSelectedForm(null);
    setSelectedIntakes(new Set());
  };

  const handleViewEpisode = (episodeId: string) => {
    navigate(`/episode-summary?id=${episodeId}`);
  };

  const handleMarkReviewed = async (formId: string) => {
    try {
      const { error } = await supabase
        .from("intake_forms")
        .update({
          status: "reviewed",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", formId);

      if (error) throw error;
      toast.success("Intake marked as reviewed");
      loadIntakeForms();
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const toggleSelectIntake = (intakeId: string) => {
    const newSelected = new Set(selectedIntakes);
    if (newSelected.has(intakeId)) {
      newSelected.delete(intakeId);
    } else {
      newSelected.add(intakeId);
    }
    setSelectedIntakes(newSelected);
  };

  const toggleSelectAll = () => {
    const availableIntakes = intakeForms.filter(f => !f.converted_to_episode_id);
    if (selectedIntakes.size === availableIntakes.length) {
      setSelectedIntakes(new Set());
    } else {
      setSelectedIntakes(new Set(availableIntakes.map(f => f.id)));
    }
  };

  const handleBulkConvert = async () => {
    const selectedForms = intakeForms.filter(f => selectedIntakes.has(f.id));
    
    if (selectedForms.length === 0) {
      toast.error("No intakes selected");
      return;
    }

    setPreparingBulkConversion(true);

    try {
      // Validate selected intakes
      const result = validateBulkIntakes(selectedForms);
      
      // Check for all intakes already converted
      if (result.alreadyConverted === result.totalSelected) {
        toast.error("All selected intakes have already been converted to episodes");
        setPreparingBulkConversion(false);
        return;
      }

      // Check if no intakes are valid for conversion
      if (result.validForConversion === 0) {
        const errorCount = result.validatedIntakes.filter(v => 
          v.issues.some(i => i.severity === "error")
        ).length;
        
        toast.error(
          `Cannot convert any of the selected intakes. ${errorCount} have validation errors that must be fixed first.`,
          { duration: 5000 }
        );
        setPreparingBulkConversion(false);
        return;
      }

      // Check for duplicate patients
      const duplicates = await checkForDuplicatePatients(selectedForms);
      
      // Add duplicate warnings to validation result
      duplicates.forEach((episodeId, intakeId) => {
        const validated = result.validatedIntakes.find(v => v.id === intakeId);
        if (validated) {
          validated.issues.push({
            severity: "warning",
            message: `Patient may have an existing active episode (ID: ${episodeId})`,
            field: "duplicate"
          });
          validated.hasExistingEpisode = true;
          validated.existingEpisodeId = episodeId;
        }
      });

      // Show validation summary
      if (result.requiresReview > 0 || duplicates.size > 0) {
        const messages = [];
        if (result.validForConversion > 0) {
          messages.push(`${result.validForConversion} ready to convert`);
        }
        if (result.requiresReview > 0) {
          messages.push(`${result.requiresReview} need review`);
        }
        if (duplicates.size > 0) {
          messages.push(`${duplicates.size} potential duplicates detected`);
        }
        
        toast.warning(
          messages.join(", "),
          { duration: 4000 }
        );
      } else {
        toast.success(
          `${result.validForConversion} intakes validated successfully`,
          { duration: 3000 }
        );
      }

      setValidationResult(result);
      setBulkConvertDialogOpen(true);
    } catch (error: any) {
      console.error("Bulk validation error:", error);
      toast.error(
        `Validation failed: ${error.message || "Unknown error occurred"}`,
        { duration: 5000 }
      );
    } finally {
      setPreparingBulkConversion(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "reviewed":
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case "converted":
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Converted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading intake forms...</p>
      </div>
    );
  }

  const detailView = selectedForm ? (
    <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Intake Form Details</h1>
            <p className="text-muted-foreground">Review patient intake information</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedForm(null)}>
            Back to List
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedForm.patient_name}</CardTitle>
                  <CardDescription>
                    Access Code: {selectedForm.access_code} • Submitted {format(new Date(selectedForm.submitted_at), "MMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                {getStatusBadge(selectedForm.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">DOB:</span>
                    <span>{format(new Date(selectedForm.date_of_birth), "MMM d, yyyy")}</span>
                  </div>
                  {selectedForm.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedForm.phone}</span>
                    </div>
                  )}
                  {selectedForm.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedForm.email}</span>
                    </div>
                  )}
                  {selectedForm.address && (
                    <div>
                      <span className="text-muted-foreground">Address:</span> {selectedForm.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance */}
              {(selectedForm.insurance_provider || selectedForm.insurance_id) && (
                <div>
                  <h3 className="font-semibold mb-3">Insurance</h3>
                  <div className="grid gap-2 text-sm">
                    {selectedForm.insurance_provider && (
                      <div><span className="text-muted-foreground">Provider:</span> {selectedForm.insurance_provider}</div>
                    )}
                    {selectedForm.insurance_id && (
                      <div><span className="text-muted-foreground">ID:</span> {selectedForm.insurance_id}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedForm.emergency_contact_name && (
                <div>
                  <h3 className="font-semibold mb-3">Emergency Contact</h3>
                  <div className="grid gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> {selectedForm.emergency_contact_name}</div>
                    {selectedForm.emergency_contact_phone && (
                      <div><span className="text-muted-foreground">Phone:</span> {selectedForm.emergency_contact_phone}</div>
                    )}
                    {selectedForm.emergency_contact_relationship && (
                      <div><span className="text-muted-foreground">Relationship:</span> {selectedForm.emergency_contact_relationship}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div>
                <h3 className="font-semibold mb-3">Medical Information</h3>
                <div className="grid gap-3 text-sm">
                  {selectedForm.primary_care_physician && (
                    <div><span className="text-muted-foreground">PCP:</span> {selectedForm.primary_care_physician}</div>
                  )}
                  {selectedForm.referring_physician && (
                    <div><span className="text-muted-foreground">Referring Physician:</span> {selectedForm.referring_physician}</div>
                  )}
                  {selectedForm.current_medications && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Current Medications:</span>
                      <p className="whitespace-pre-wrap">{selectedForm.current_medications}</p>
                    </div>
                  )}
                  {selectedForm.allergies && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Allergies:</span>
                      <p className="whitespace-pre-wrap">{selectedForm.allergies}</p>
                    </div>
                  )}
                  {selectedForm.medical_history && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Medical History:</span>
                      <p className="whitespace-pre-wrap">{selectedForm.medical_history}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <h3 className="font-semibold mb-3">Reason for Visit</h3>
                <div className="grid gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Chief Complaint:</span>
                    <p className="whitespace-pre-wrap">{selectedForm.chief_complaint}</p>
                  </div>
                  {selectedForm.injury_date && (
                    <div><span className="text-muted-foreground">Date of Onset:</span> {format(new Date(selectedForm.injury_date), "MMM d, yyyy")}</div>
                  )}
                  {selectedForm.pain_level && (
                    <div><span className="text-muted-foreground">Pain Level:</span> {selectedForm.pain_level}/10</div>
                  )}
                  {selectedForm.injury_mechanism && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Mechanism:</span>
                      <p className="whitespace-pre-wrap">{selectedForm.injury_mechanism}</p>
                    </div>
                  )}
                  {selectedForm.symptoms && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Symptoms:</span>
                      <p className="whitespace-pre-wrap">{selectedForm.symptoms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Complaints */}
              {selectedForm.complaints && Array.isArray(selectedForm.complaints) && selectedForm.complaints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Detailed Complaints</h3>
                  <div className="space-y-3">
                    {selectedForm.complaints.map((complaint: any, idx: number) => (
                      <div key={idx} className="rounded-lg bg-muted p-3 text-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{complaint.category}</div>
                          {complaint.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        {complaint.description && (
                          <p className="text-muted-foreground mb-2">{complaint.description}</p>
                        )}
                        <div className="grid gap-1">
                          {complaint.severity && (
                            <div><span className="text-muted-foreground">Severity:</span> {complaint.severity}</div>
                          )}
                          {complaint.duration && (
                            <div><span className="text-muted-foreground">Duration:</span> {complaint.duration}</div>
                          )}
                          {complaint.activities && complaint.activities.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Affected Activities:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {complaint.activities.map((activity: string, aIdx: number) => (
                                  <Badge key={aIdx} variant="outline" className="text-xs">{activity}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {complaint.treatments && complaint.treatments.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Prior Treatments:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {complaint.treatments.map((treatment: string, tIdx: number) => (
                                  <Badge key={tIdx} variant="outline" className="text-xs">{treatment}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {selectedForm.converted_to_episode_id ? (
              <div className="space-y-3 flex-1">
                <Alert className="border-green-600/20 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-900 dark:text-green-100">
                    This intake has been converted to episode <span className="font-mono font-semibold">{selectedForm.converted_to_episode_id}</span>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => handleViewEpisode(selectedForm.converted_to_episode_id)}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Episode Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => handleConvertToEpisode(selectedForm)}
                  className="flex-1"
                  size="lg"
                  disabled={preparingConversion}
                >
                  {preparingConversion ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Convert to Episode
                    </>
                  )}
                </Button>
                {selectedForm.status === "pending" && (
                  <Button
                    onClick={() => handleMarkReviewed(selectedForm.id)}
                    variant="outline"
                    size="lg"
                  >
                    Mark as Reviewed
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
  ) : null;

  const availableForSelection = intakeForms.filter(f => !f.converted_to_episode_id);

  const listView = (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Intake Forms</h1>
          <p className="text-muted-foreground">Review and process new patient intake submissions</p>
        </div>
        {availableForSelection.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedIntakes.size > 0 && (
              <>
                <Badge variant="secondary" className="h-8 px-3">
                  {selectedIntakes.size} selected
                </Badge>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkConvert}
                  className="gap-2"
                  disabled={preparingBulkConversion}
                >
                  {preparingBulkConversion ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4" />
                      Convert Selected
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              {selectedIntakes.size === availableForSelection.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        )}
      </div>

      {intakeForms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No intake forms submitted yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {intakeForms.map((form) => {
            const isSelected = selectedIntakes.has(form.id);
            const canSelect = !form.converted_to_episode_id;

            return (
              <Card 
                key={form.id} 
                className={`transition-colors ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${canSelect ? 'cursor-pointer hover:bg-muted/50' : 'opacity-60'}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {canSelect && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectIntake(form.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select intake for ${form.patient_name}`}
                      />
                    )}
                    <div className="flex-1" onClick={() => setSelectedForm(form)}>
                      <CardTitle className="flex items-center gap-2">
                        {form.patient_name}
                        {getStatusBadge(form.status)}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span>Access Code: {form.access_code}</span>
                          <span>DOB: {format(new Date(form.date_of_birth), "MMM d, yyyy")}</span>
                          <span>Submitted: {format(new Date(form.submitted_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent onClick={() => setSelectedForm(form)}>
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Chief Complaint:</p>
                    <p className="line-clamp-2">{form.chief_complaint}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {selectedForm ? detailView : listView}
      
      {/* Single Conversion Dialog */}
      {formToConvert && (
        <IntakeToEpisodeConverter
          intakeForm={formToConvert}
          open={convertDialogOpen}
          onClose={() => {
            setConvertDialogOpen(false);
            setFormToConvert(null);
          }}
          onSuccess={handleConversionSuccess}
        />
      )}

      {/* Bulk Conversion Dialog */}
      {validationResult && (
        <BulkIntakeConverter
          intakes={intakeForms.filter(f => selectedIntakes.has(f.id))}
          validationResult={validationResult}
          open={bulkConvertDialogOpen}
          onClose={() => {
            setBulkConvertDialogOpen(false);
            setValidationResult(null);
          }}
          onSuccess={handleConversionSuccess}
        />
      )}
    </>
  );
}
