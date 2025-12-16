import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode, saveOutcomeScore } from "@/lib/dbOperations";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { NDIForm } from "@/components/forms/NDIForm";
import { ODIForm } from "@/components/forms/ODIForm";
import { QuickDASHForm } from "@/components/forms/QuickDASHForm";
import { LEFSForm } from "@/components/forms/LEFSForm";
import { RPQForm } from "@/components/forms/RPQForm";
import { MetricCard } from "@/components/MetricCard";
import { DiagnosisSelector } from "@/components/DiagnosisSelector";
import { FunctionalLimitationSelector } from "@/components/FunctionalLimitationSelector";
import { PriorTreatmentSelector, type PriorTreatment } from "@/components/PriorTreatmentSelector";
import { TreatmentGoalsSelector, type GoalItem } from "@/components/TreatmentGoalsSelector";
import { SmartOutcomeMeasureSelector } from "@/components/SmartOutcomeMeasureSelector";
import { PatientSearch } from "@/components/PatientSearch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewEpisode() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [episodeType, setEpisodeType] = useState<"MSK" | "Neurology" | "Performance">("MSK");
  const [region, setRegion] = useState<string>("");
  const [dateOfService, setDateOfService] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<IndexType[]>([]);
  const [baselineScores, setBaselineScores] = useState<Record<string, string>>({});
  const [dob, setDob] = useState("");
  const [clinician, setClinician] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [npi, setNpi] = useState("");
  const [injuryDate, setInjuryDate] = useState("");
  const [injuryMechanism, setInjuryMechanism] = useState("");
  const [referringPhysician, setReferringPhysician] = useState("");
  const [insurance, setInsurance] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [priorTreatments, setPriorTreatments] = useState("");
  const [functionalLimitations, setFunctionalLimitations] = useState("");
  const [treatmentGoals, setTreatmentGoals] = useState("");
  const [functionalLimitation, setFunctionalLimitation] = useState("");
  const [functionalLimitationsArray, setFunctionalLimitationsArray] = useState<string[]>([]);
  const [priorTreatmentsData, setPriorTreatmentsData] = useState<PriorTreatment[]>([]);
  const [priorTreatmentsOther, setPriorTreatmentsOther] = useState("");
  const [goalsData, setGoalsData] = useState<GoalItem[]>([]);
  const [goalsOther, setGoalsOther] = useState("");
  const [cisPre, setCisPre] = useState<number | null>(null);
  const [cisPost, setCisPost] = useState<number | null>(null);
  const [painPre, setPainPre] = useState<number | null>(null);
  const [painPost, setPainPost] = useState<number | null>(null);
  // Track if this episode is being created from an intake form
  const [sourceIntakeFormId, setSourceIntakeFormId] = useState<string | null>(null);
  // Track form completion status for each index
  const [formCompletionStatus, setFormCompletionStatus] = useState<Record<string, boolean>>({});
  // Auto-populate clinician from logged-in user
  useEffect(() => {
    const loadClinicianInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, clinician_name, npi")
        .eq("id", user.id)
        .single();

      if (profile) {
        setClinician(profile.clinician_name || profile.full_name || "");
        setNpi(profile.npi || "");
      }
    };
    loadClinicianInfo();
  }, []);

  const handlePatientSelect = (patient: any) => {
    // Get the most recent episode for this patient
    const recentEpisode = patient.episodes[0];
    
    // Populate form with patient data
    setPatientName(patient.patient_name);
    setDob(patient.date_of_birth);
    
    // Populate with data from most recent episode if available
    if (recentEpisode) {
      setInsurance(recentEpisode.insurance || "");
      setEmergencyContact(recentEpisode.emergency_contact || "");
      setEmergencyPhone(recentEpisode.emergency_phone || "");
      setReferringPhysician(recentEpisode.referring_physician || "");
      setMedications(recentEpisode.medications || "");
      setMedicalHistory(recentEpisode.medical_history || "");
    }
    
    toast.success(`Patient ${patient.patient_name} selected - ${patient.episodes.length} previous episode(s) found`);
  };

  // Check for intake data from sessionStorage
  useEffect(() => {
    const intakeDataStr = sessionStorage.getItem("intakeData");
    if (intakeDataStr) {
      try {
        const intakeData = JSON.parse(intakeDataStr);
        
        // Store source intake form ID for linking after creation
        if (intakeData.intake_form_id) {
          setSourceIntakeFormId(intakeData.intake_form_id);
        }
        
        // Populate form fields from intake data
        setPatientName(intakeData.patient_name || "");
        setDob(intakeData.date_of_birth || "");
        setInsurance(intakeData.insurance_provider || "");
        setEmergencyContact(intakeData.emergency_contact_name || "");
        setEmergencyPhone(intakeData.emergency_contact_phone || "");
        setReferringPhysician(intakeData.referring_physician || "");
        setMedications(intakeData.current_medications || "");
        setInjuryDate(intakeData.injury_date || "");
        setInjuryMechanism(intakeData.injury_mechanism || "");
        setPainPre(intakeData.pain_level || null);
        
        // Build comprehensive medical history from intake form
        const medicalHistoryParts: string[] = [];
        if (intakeData.medical_history) {
          medicalHistoryParts.push(`Medical History: ${intakeData.medical_history}`);
        }
        if (intakeData.allergies) {
          medicalHistoryParts.push(`Allergies: ${intakeData.allergies}`);
        }
        if (intakeData.surgery_history) {
          medicalHistoryParts.push(`Surgery History: ${intakeData.surgery_history}`);
        }
        if (intakeData.hospitalization_history) {
          medicalHistoryParts.push(`Hospitalization History: ${intakeData.hospitalization_history}`);
        }
        if (intakeData.specialist_seen) {
          medicalHistoryParts.push(`Specialists Seen: ${intakeData.specialist_seen}`);
        }
        if (intakeData.primary_care_physician) {
          medicalHistoryParts.push(`Primary Care Physician: ${intakeData.primary_care_physician}`);
        }
        setMedicalHistory(medicalHistoryParts.join('\n\n'));
        
        // Pre-select region if provided
        if (intakeData.selected_region) {
          setRegion(intakeData.selected_region);
          // Use selected indices from converter if provided, otherwise calculate from region
          const indicesToUse = intakeData.selected_indices && intakeData.selected_indices.length > 0
            ? intakeData.selected_indices as IndexType[]
            : PPC_CONFIG.regionToIndices(intakeData.selected_region, "MSK") as IndexType[];
          setSelectedIndices(indicesToUse);
          const scores: Record<string, string> = {};
          indicesToUse.forEach((index) => {
            scores[index] = "";
          });
          setBaselineScores(scores);
        }
        
        // Pre-fill diagnosis if provided
        if (intakeData.selected_diagnosis) {
          setDiagnosis(intakeData.selected_diagnosis);
        } else if (intakeData.chief_complaint) {
          setDiagnosis(intakeData.chief_complaint);
        }
        
        // Pre-fill functional limitations if provided
        if (intakeData.functional_limitations && Array.isArray(intakeData.functional_limitations)) {
          setFunctionalLimitationsArray(intakeData.functional_limitations);
        }
        
        // Pre-fill prior treatments if provided
        if (intakeData.prior_treatments && Array.isArray(intakeData.prior_treatments)) {
          setPriorTreatmentsData(intakeData.prior_treatments);
        }
        
        // Clear the sessionStorage after loading
        sessionStorage.removeItem("intakeData");
        
        toast.success("Patient data loaded from intake form");
      } catch (error) {
        console.error("Failed to parse intake data:", error);
      }
    }
  }, []);

  // Handle episode type change
  const handleEpisodeTypeChange = (value: "MSK" | "Neurology" | "Performance") => {
    setEpisodeType(value);
    if (value === "Neurology") {
      // Automatically select RPQ for Neurology episodes
      setSelectedIndices(["RPQ"]);
      setBaselineScores({ RPQ: "" });
      setRegion(""); // Clear region for neurology
    } else {
      // Clear selections for MSK - wait for region selection
      setSelectedIndices([]);
      setBaselineScores({});
    }
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    const recommendedIndices = PPC_CONFIG.regionToIndices(value, episodeType) as IndexType[];
    setSelectedIndices(recommendedIndices);
    
    // Initialize baseline scores
    const scores: Record<string, string> = {};
    recommendedIndices.forEach((index) => {
      scores[index] = "";
    });
    setBaselineScores(scores);
  };

  const handleIndexToggle = (index: IndexType, checked: boolean) => {
    if (checked) {
      setSelectedIndices([...selectedIndices, index]);
      setBaselineScores({ ...baselineScores, [index]: "" });
    } else {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
      const newScores = { ...baselineScores };
      delete newScores[index];
      setBaselineScores(newScores);
    }
  };

  const handleScoreChange = (index: string, value: string, isComplete?: boolean) => {
    setBaselineScores({ ...baselineScores, [index]: value });
    if (isComplete !== undefined) {
      setFormCompletionStatus(prev => ({ ...prev, [index]: isComplete }));
    }
  };

  // Check if all selected indices have valid scores
  const allFormsComplete = selectedIndices.length > 0 && selectedIndices.every(index => {
    const score = parseFloat(baselineScores[index]);
    return !isNaN(score) && score >= 0 && formCompletionStatus[index] === true;
  });

  // Get interpretation for a score
  const getScoreInterpretation = (index: IndexType, score: number): string => {
    if (index === "LEFS") {
      const percentage = (score / 80) * 100;
      if (percentage >= 80) return "Minimal disability";
      if (percentage >= 60) return "Mild disability";
      if (percentage >= 40) return "Moderate disability";
      if (percentage >= 20) return "Severe disability";
      return "Very severe disability";
    }
    // For disability indices (ODI, NDI, QuickDASH) - lower is better
    if (score <= 20) return "Minimal disability";
    if (score <= 40) return "Moderate disability";
    if (score <= 60) return "Severe disability";
    if (score <= 80) return "Crippling disability";
    return "Bed-bound or exaggerating";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }
    if (episodeType === "MSK" && !region) {
      toast.error("Please select a region for MSK episode");
      return;
    }
    if (!dateOfService) {
      toast.error("Please enter date of service");
      return;
    }
    if (!dob.trim()) {
      toast.error("Please enter date of birth");
      return;
    }
    if (!clinician.trim()) {
      toast.error("Please enter clinician name");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Please enter diagnosis");
      return;
    }
    if (!injuryDate) {
      toast.error("Please enter injury/onset date");
      return;
    }
    if (selectedIndices.length === 0) {
      toast.error("Please select at least one outcome index");
      return;
    }

    // Validate scores
    const scores: Record<string, number> = {};
    for (const index of selectedIndices) {
      const score = parseFloat(baselineScores[index]);
      if (isNaN(score) || score < 0 || score > 100) {
        toast.error(`Invalid score for ${index}. Must be between 0 and 100.`);
        return;
      }
      scores[index] = score;
    }

    try {
      // Calculate follow-up date (90 days from service date)
      const serviceDate = new Date(dateOfService);
      const followupDate = new Date(serviceDate);
      followupDate.setDate(followupDate.getDate() + 90);

      // Calculate deltas for metrics
      const cisDelta = cisPre != null && cisPost != null ? cisPost - cisPre : null;
      const painDelta = painPre != null && painPost != null ? painPre - painPost : null;

      // Save episode to database and get the created episode with its actual ID
      const createdEpisode = await createEpisode({
        patient_name: patientName.trim(),
        date_of_birth: dob.trim(),
        episode_type: episodeType,
        region: episodeType === "MSK" ? region : episodeType === "Neurology" ? "Neurology" : "Performance",
        diagnosis: diagnosis.trim(),
        date_of_service: dateOfService,
        injury_date: injuryDate,
        injury_mechanism: injuryMechanism.trim(),
        referring_physician: referringPhysician.trim(),
        insurance: insurance.trim(),
        emergency_contact: emergencyContact.trim(),
        emergency_phone: emergencyPhone.trim(),
        medications: medications.trim(),
        medical_history: medicalHistory.trim(),
        prior_treatments: priorTreatmentsData,
        prior_treatments_other: priorTreatmentsOther.trim(),
        functional_limitations: functionalLimitationsArray,
        functional_limitation: functionalLimitation.trim(),
        treatment_goals: goalsData,
        goals_other: goalsOther.trim(),
        start_date: dateOfService,
        followup_date: followupDate.toISOString().split("T")[0],
        clinician: clinician.trim(),
        npi: npi.trim(),
        cis_pre: cisPre ?? undefined,
        cis_post: cisPost ?? undefined,
        cis_delta: cisDelta ?? undefined,
        pain_pre: painPre ?? undefined,
        pain_post: painPost ?? undefined,
        pain_delta: painDelta ?? undefined,
        source_intake_form_id: sourceIntakeFormId || undefined,
      });

      // Save baseline scores to database using the actual episode ID
      for (const [indexType, score] of Object.entries(scores)) {
        await saveOutcomeScore(createdEpisode.id, indexType, "baseline", score);
      }

      // If this episode was created from an intake form, mark it as converted
      if (sourceIntakeFormId) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from("intake_forms")
          .update({
            status: "converted",
            reviewed_at: new Date().toISOString(),
            converted_to_episode_id: createdEpisode.id,
            reviewed_by: user?.id
          })
          .eq("id", sourceIntakeFormId);
      }

      toast.success("Episode created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(`Failed to create episode: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Episode</h1>
        <p className="mt-2 text-muted-foreground">
          Enter baseline patient information and outcome scores
        </p>
      </div>

      {/* Patient Search */}
      <PatientSearch onPatientSelect={handlePatientSelect} />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Episode Type & Patient Information</CardTitle>
            <CardDescription>Select episode type and enter basic demographics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="episodeType">Episode Type *</Label>
              <Select value={episodeType} onValueChange={handleEpisodeTypeChange}>
                <SelectTrigger id="episodeType">
                  <SelectValue placeholder="Select episode type" />
                </SelectTrigger>
                <SelectContent>
                  {PPC_CONFIG.episodeTypeEnum.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {episodeType === "Neurology" && (
                <p className="text-sm text-muted-foreground mt-1">
                  RPQ (Rivermead Post-Concussion Symptoms Questionnaire) will be automatically assigned
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {episodeType === "MSK" && (
                <div className="space-y-2">
                  <Label htmlFor="region">Anatomical Region *</Label>
                  <Select value={region} onValueChange={handleRegionChange}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {PPC_CONFIG.regionEnum.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dateOfService">Date of Service *</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={dateOfService}
                  onChange={(e) => setDateOfService(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {((episodeType === "MSK" && region) || episodeType === "Neurology") && (
          <>
            {/* Smart Outcome Measure Recommendations */}
            <div className="mt-6">
              <SmartOutcomeMeasureSelector 
                region={region}
                diagnosis={diagnosis}
                showFullDetails={true}
              />
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>Personal and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance Provider</Label>
                    <Input
                      id="insurance"
                      placeholder="Enter insurance provider"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Enter emergency contact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      placeholder="Enter phone number"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Clinical Information</CardTitle>
                <CardDescription>Provider and diagnosis details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinician">Treating Clinician *</Label>
                    <Input
                      id="clinician"
                      placeholder="Enter clinician name"
                      value={clinician}
                      onChange={(e) => setClinician(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="npi">Provider NPI</Label>
                    <Input
                      id="npi"
                      placeholder="Enter NPI number"
                      value={npi}
                      onChange={(e) => setNpi(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referringPhysician">Referring Physician</Label>
                  <Input
                    id="referringPhysician"
                    placeholder="Enter referring physician name"
                    value={referringPhysician}
                    onChange={(e) => setReferringPhysician(e.target.value)}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Smart Diagnosis Selector */}
            <div className="mt-6">
              <DiagnosisSelector
                region={region}
                diagnosis={diagnosis}
                onChange={({ region: newRegion, diagnosis: newDiagnosis }) => {
                  if (newRegion !== region) {
                    setRegion(newRegion);
                    handleRegionChange(newRegion);
                  }
                  setDiagnosis(newDiagnosis);
                }}
              />
            </div>

            {/* Smart Functional Limitation Selector */}
            <div className="mt-6">
              <FunctionalLimitationSelector
                region={region}
                initialLimitations={functionalLimitationsArray}
                onChange={setFunctionalLimitationsArray}
              />
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Injury/Condition Details</CardTitle>
                <CardDescription>Information about the presenting condition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="injuryDate">Injury/Onset Date *</Label>
                    <Input
                      id="injuryDate"
                      type="date"
                      value={injuryDate}
                      onChange={(e) => setInjuryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="injuryMechanism">Mechanism of Injury/Onset</Label>
                  <Input
                    id="injuryMechanism"
                    placeholder="Describe how the injury/condition occurred"
                    value={injuryMechanism}
                    onChange={(e) => setInjuryMechanism(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functionalLimitations">Functional Limitations</Label>
                  <Input
                    id="functionalLimitations"
                    placeholder="What activities are limited by this condition?"
                    value={functionalLimitations}
                    onChange={(e) => setFunctionalLimitations(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Smart Prior Treatment Selector */}
            <div className="mt-6">
              <PriorTreatmentSelector
                region={region}
                initialTreatments={priorTreatmentsData}
                initialOther={priorTreatmentsOther}
                onChange={({ prior_treatments, prior_treatments_other }) => {
                  setPriorTreatmentsData(prior_treatments);
                  setPriorTreatmentsOther(prior_treatments_other);
                }}
              />
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Medical Background</CardTitle>
                <CardDescription>Medical history and current medications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Relevant Medical History</Label>
                  <Input
                    id="medicalHistory"
                    placeholder="List relevant medical conditions or history"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Input
                    id="medications"
                    placeholder="List current medications"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Smart Treatment Goals Selector */}
            <div className="mt-6">
              <TreatmentGoalsSelector
                stage="Intake"
                region={region}
                initialGoals={goalsData}
                initialOther={goalsOther}
                onChange={({ goals, goals_other }) => {
                  setGoalsData(goals);
                  setGoalsOther(goals_other);
                }}
              />
            </div>

            {/* Intake Metrics: CIS Standing and Pain Scale - MSK Only */}
            {episodeType === "Neurology" ? (
              <div className="mt-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> For Neurology episodes, the intake is an examination day without treatment. 
                      CIS and Pain scales are not collected at intake and will be captured during follow-up visits when treatment begins.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <MetricCard
                  title="CIS Standing"
                  description="Neurologic readiness (0-10)"
                  preLabel="Pre (0-10)"
                  postLabel="Post (captured at Final)"
                  preValue={cisPre}
                  postValue={cisPost}
                  onPreChange={setCisPre}
                  onPostChange={setCisPost}
                  isIntake={true}
                  deltaInverted={false}
                  icon="activity"
                />
                <MetricCard
                  title="Patient Verbal Pain Scale"
                  description="Self-reported 0-10"
                  preLabel="Pre (0-10)"
                  postLabel="Post (captured at Final)"
                  preValue={painPre}
                  postValue={painPost}
                  onPreChange={setPainPre}
                  onPostChange={setPainPost}
                  isIntake={true}
                  deltaInverted={true}
                  icon="alert"
                />
              </div>
            )}

            <div className="mt-6 space-y-6">
              {episodeType === "Neurology" && selectedIndices.includes("RPQ") && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="RPQ"
                      checked={true}
                      disabled={true}
                    />
                    <Label htmlFor="RPQ" className="text-lg font-semibold">
                      Rivermead Post-Concussion Symptoms Questionnaire (RPQ) - Required
                    </Label>
                  </div>
                  <RPQForm
                    onScoreChange={(score) => handleScoreChange("RPQ", score.toString())}
                    initialScore={parseFloat(baselineScores["RPQ"] || "0")}
                  />
                </div>
              )}

              {episodeType === "MSK" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="NDI"
                      checked={selectedIndices.includes("NDI")}
                      onCheckedChange={(checked) => handleIndexToggle("NDI", checked as boolean)}
                    />
                    <Label htmlFor="NDI" className="text-lg font-semibold cursor-pointer">
                      Complete Neck Disability Index (NDI)
                    </Label>
                  </div>
                  
                  {selectedIndices.includes("NDI") && (
                    <NDIForm
                      onScoreChange={(score, isComplete) => handleScoreChange("NDI", score.toString(), isComplete)}
                      initialScore={parseFloat(baselineScores["NDI"] || "0")}
                    />
                  )}
                </>
              )}

              {episodeType === "MSK" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ODI"
                      checked={selectedIndices.includes("ODI")}
                      onCheckedChange={(checked) => handleIndexToggle("ODI", checked as boolean)}
                    />
                    <Label htmlFor="ODI" className="text-lg font-semibold cursor-pointer">
                      Complete Oswestry Disability Index (ODI)
                    </Label>
                  </div>
                  
                  {selectedIndices.includes("ODI") && (
                    <ODIForm
                      onScoreChange={(score, isComplete) => handleScoreChange("ODI", score.toString(), isComplete)}
                      initialScore={parseFloat(baselineScores["ODI"] || "0")}
                    />
                  )}
                </>
              )}

              {episodeType === "MSK" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="QuickDASH"
                      checked={selectedIndices.includes("QuickDASH")}
                      onCheckedChange={(checked) => handleIndexToggle("QuickDASH", checked as boolean)}
                    />
                    <Label htmlFor="QuickDASH" className="text-lg font-semibold cursor-pointer">
                      Complete QuickDASH Assessment
                    </Label>
                  </div>
                  
                  {selectedIndices.includes("QuickDASH") && (
                    <QuickDASHForm
                      onScoreChange={(score, isComplete) => handleScoreChange("QuickDASH", score.toString(), isComplete)}
                      initialScore={parseFloat(baselineScores["QuickDASH"] || "0")}
                    />
                  )}
                </>
              )}

              {episodeType === "MSK" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="LEFS"
                      checked={selectedIndices.includes("LEFS")}
                      onCheckedChange={(checked) => handleIndexToggle("LEFS", checked as boolean)}
                    />
                    <Label htmlFor="LEFS" className="text-lg font-semibold cursor-pointer">
                      Complete Lower Extremity Functional Scale (LEFS)
                    </Label>
                  </div>
                  
                  {selectedIndices.includes("LEFS") && (
                    <LEFSForm
                      onScoreChange={(score, isComplete) => handleScoreChange("LEFS", score.toString(), isComplete)}
                      initialScore={parseFloat(baselineScores["LEFS"] || "0")}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Score Summary Card */}
        {selectedIndices.length > 0 && (
          <Card className={`mt-6 ${allFormsComplete ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {allFormsComplete ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 dark:text-green-400">Outcome Measures Complete</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-400">Complete Outcome Measures</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedIndices.map((index) => {
                  const score = parseFloat(baselineScores[index] || "0");
                  const isComplete = formCompletionStatus[index] === true;
                  const interpretation = !isNaN(score) && score > 0 ? getScoreInterpretation(index, score) : "Not scored";
                  
                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-3 ${
                        isComplete 
                          ? 'border-green-300 bg-white dark:bg-background' 
                          : 'border-amber-300 bg-white dark:bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{index}</span>
                        {isComplete ? (
                          <Badge variant="default" className="bg-green-600 text-xs">Complete</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      {isComplete && !isNaN(score) && (
                        <>
                          <p className="text-2xl font-bold">
                            {index === "LEFS" ? `${score.toFixed(0)}/80` : `${score.toFixed(1)}%`}
                          </p>
                          <p className="text-sm text-muted-foreground">{interpretation}</p>
                        </>
                      )}
                      {!isComplete && (
                        <p className="text-sm text-muted-foreground">Complete the form above</p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {allFormsComplete && (
                <Alert className="mt-4 border-green-300 bg-green-100 dark:bg-green-950/30">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700 dark:text-green-400">Ready to Create Episode</AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-500">
                    All outcome measures have been completed. You can now create the episode.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="gap-2"
            disabled={selectedIndices.length > 0 && !allFormsComplete}
          >
            <Save className="h-4 w-4" />
            {allFormsComplete || selectedIndices.length === 0 ? "Create Episode" : "Complete Forms First"}
          </Button>
        </div>
      </form>
    </div>
  );
}
