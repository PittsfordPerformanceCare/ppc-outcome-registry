import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createEpisode, saveOutcomeScore } from "@/lib/dbOperations";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { DiagnosisSelector } from "@/components/DiagnosisSelector";
import { FunctionalLimitationSelector } from "@/components/FunctionalLimitationSelector";
import { TreatmentGoalsSelector, type GoalItem } from "@/components/TreatmentGoalsSelector";
import { SmartOutcomeMeasureSelector } from "@/components/SmartOutcomeMeasureSelector";
import { PatientSearch } from "@/components/PatientSearch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSuggestedEpisodeType } from "@/lib/routingSuggestion";
import { ReauthDialog } from "@/components/ReauthDialog";
import { type PriorTreatment } from "@/components/PriorTreatmentSelector";

// New focused components
import { ReferralSourceSelector } from "@/components/episode/ReferralSourceSelector";
import { PatientConcernsInput } from "@/components/episode/PatientConcernsInput";
import { OnsetTypeSelector, type OnsetType } from "@/components/episode/OnsetTypeSelector";
import { StructuredInjuryHistory, type StructuredInjuryItem } from "@/components/episode/StructuredInjuryHistory";
import { PainDysfunctionScale } from "@/components/episode/PainDysfunctionScale";
import { CollapsiblePatientProfile } from "@/components/episode/CollapsiblePatientProfile";
import { EnhancedPriorTreatments } from "@/components/episode/EnhancedPriorTreatments";
import { CollapsibleOutcomeMeasures } from "@/components/episode/CollapsibleOutcomeMeasures";

export default function NewEpisode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // === Episode Setup ===
  const [patientName, setPatientName] = useState("");
  const [episodeType, setEpisodeType] = useState<"MSK" | "Neurology" | "Performance">("MSK");
  const [region, setRegion] = useState<string>("");
  const [dateOfService, setDateOfService] = useState(() => new Date().toISOString().split("T")[0]);
  const [clinician, setClinician] = useState("");
  const [npi, setNpi] = useState("");
  
  // === How did you find us? ===
  const [referralSource, setReferralSource] = useState("");
  const [referringPhysician, setReferringPhysician] = useState("");
  
  // === What is bothering you? ===
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [secondaryConcern, setSecondaryConcern] = useState("");
  
  // === Onset Type ===
  const [onsetType, setOnsetType] = useState<OnsetType | "">("");
  const [injuryDate, setInjuryDate] = useState("");
  const [injuryMechanism, setInjuryMechanism] = useState("");
  
  // === Structured Injury History ===
  const [structuredInjuryHistory, setStructuredInjuryHistory] = useState<StructuredInjuryItem[]>([]);
  
  // === Prior Treatments (Enhanced) ===
  const [priorTreatmentsData, setPriorTreatmentsData] = useState<PriorTreatment[]>([]);
  const [priorTreatmentsOther, setPriorTreatmentsOther] = useState("");
  const [helpfulTreatments, setHelpfulTreatments] = useState<string[]>([]);
  const [worseningFactors, setWorseningFactors] = useState("");
  
  // === Pain & Dysfunction (replaces CIS) ===
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [dysfunctionLevel, setDysfunctionLevel] = useState<number | null>(null);
  
  // === Functional Limitations (single source) ===
  const [functionalLimitationsArray, setFunctionalLimitationsArray] = useState<string[]>([]);
  const [functionalLimitationsOther, setFunctionalLimitationsOther] = useState("");
  
  // === Diagnosis ===
  const [diagnosis, setDiagnosis] = useState("");
  
  // === Treatment Goals ===
  const [goalsData, setGoalsData] = useState<GoalItem[]>([]);
  const [goalsOther, setGoalsOther] = useState("");
  
  // === Medical Background ===
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medications, setMedications] = useState("");
  
  // === Patient Profile (Demographics - Prefilled) ===
  const [dob, setDob] = useState("");
  const [insurance, setInsurance] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [isPrefilled, setIsPrefilled] = useState(false);
  
  // === Outcome Measures ===
  const [selectedIndices, setSelectedIndices] = useState<IndexType[]>([]);
  const [baselineScores, setBaselineScores] = useState<Record<string, string>>({});
  const [formCompletionStatus, setFormCompletionStatus] = useState<Record<string, boolean>>({});
  
  // === Internal State ===
  const [sourceIntakeFormId, setSourceIntakeFormId] = useState<string | null>(null);
  const [sourceCareRequestId, setSourceCareRequestId] = useState<string | null>(null);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const pendingSubmitRef = useRef<React.FormEvent | null>(null);

  // Auto-populate clinician and NPI from logged-in user
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

  // Load care request data from query parameter
  useEffect(() => {
    const careRequestId = searchParams.get('care_request');
    if (!careRequestId) return;

    const loadCareRequest = async () => {
      const { data: careRequest, error } = await supabase
        .from('care_requests')
        .select('*')
        .eq('id', careRequestId)
        .single();

      if (error || !careRequest) {
        console.error('Failed to load care request:', error);
        toast.error('Failed to load patient data');
        return;
      }

      setSourceCareRequestId(careRequestId);
      const payload = careRequest.intake_payload as Record<string, unknown>;
      
      // Populate form fields from care request
      const name = (payload?.patientName || payload?.name || payload?.patient_name || '') as string;
      setPatientName(name);
      setDob((payload?.date_of_birth || payload?.dateOfBirth || '') as string);
      setIsPrefilled(true);
      
      // Use centralized routing logic to determine episode type
      const systemCategory = (payload?.system_category as string) || null;
      const complaint = (careRequest.primary_complaint || payload?.primary_concern || payload?.chiefComplaint || '') as string;
      const suggestedRoute = getSuggestedEpisodeType(systemCategory, complaint);
      
      if (suggestedRoute === "NEURO") {
        setEpisodeType('Neurology');
        setSelectedIndices(['RPQ']);
        setBaselineScores({ RPQ: '' });
        toast.info('Episode type auto-set to Neurology based on intake data');
      } else if (suggestedRoute === "MSK") {
        setEpisodeType('MSK');
        toast.info('Episode type auto-set to MSK based on intake data');
      }
      
      // Set primary concern from complaint
      if (complaint) {
        setPrimaryConcern(complaint);
      }
      
      // Set pain level if available
      if (payload?.pain_level) {
        setPainLevel(Number(payload.pain_level));
      }
      
      // Set contact info
      if (payload?.phone) {
        setEmergencyPhone((payload.phone as string) || '');
      }

      // Check for clinical data from sessionStorage
      const clinicalDataStr = sessionStorage.getItem('newEpisodeFromClinical');
      if (clinicalDataStr) {
        try {
          const clinicalData = JSON.parse(clinicalDataStr);
          if (clinicalData.episodeType === 'Neurologic') {
            setEpisodeType('Neurology');
            setSelectedIndices(['RPQ']);
            setBaselineScores({ RPQ: '' });
          } else if (clinicalData.episodeType === 'MSK') {
            setEpisodeType('MSK');
          }
          sessionStorage.removeItem('newEpisodeFromClinical');
        } catch (e) {
          console.error('Failed to parse clinical data:', e);
        }
      }

      toast.success(`Patient data loaded: ${name}`);
    };

    loadCareRequest();
  }, [searchParams]);

  const handlePatientSelect = (patient: any) => {
    const recentEpisode = patient.episodes[0];
    
    setPatientName(patient.patient_name);
    setDob(patient.date_of_birth);
    setIsPrefilled(true);
    
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
        
        if (intakeData.intake_form_id) {
          setSourceIntakeFormId(intakeData.intake_form_id);
        }
        
        setPatientName(intakeData.patient_name || "");
        setDob(intakeData.date_of_birth || "");
        setInsurance(intakeData.insurance_provider || "");
        setEmergencyContact(intakeData.emergency_contact_name || "");
        setEmergencyPhone(intakeData.emergency_contact_phone || "");
        setReferringPhysician(intakeData.referring_physician || "");
        setMedications(intakeData.current_medications || "");
        setInjuryDate(intakeData.injury_date || "");
        setInjuryMechanism(intakeData.injury_mechanism || "");
        setPainLevel(intakeData.pain_level || null);
        setIsPrefilled(true);
        
        // Build medical history
        const medicalHistoryParts: string[] = [];
        if (intakeData.medical_history) medicalHistoryParts.push(`Medical History: ${intakeData.medical_history}`);
        if (intakeData.allergies) medicalHistoryParts.push(`Allergies: ${intakeData.allergies}`);
        if (intakeData.surgery_history) medicalHistoryParts.push(`Surgery History: ${intakeData.surgery_history}`);
        if (intakeData.hospitalization_history) medicalHistoryParts.push(`Hospitalization History: ${intakeData.hospitalization_history}`);
        if (intakeData.specialist_seen) medicalHistoryParts.push(`Specialists Seen: ${intakeData.specialist_seen}`);
        if (intakeData.primary_care_physician) medicalHistoryParts.push(`Primary Care Physician: ${intakeData.primary_care_physician}`);
        setMedicalHistory(medicalHistoryParts.join('\n\n'));
        
        if (intakeData.selected_region) {
          setRegion(intakeData.selected_region);
          const indicesToUse = intakeData.selected_indices && intakeData.selected_indices.length > 0
            ? intakeData.selected_indices as IndexType[]
            : PPC_CONFIG.regionToIndices(intakeData.selected_region, "MSK") as IndexType[];
          setSelectedIndices(indicesToUse);
          const scores: Record<string, string> = {};
          indicesToUse.forEach((index) => { scores[index] = ""; });
          setBaselineScores(scores);
        }
        
        if (intakeData.selected_diagnosis) {
          setDiagnosis(intakeData.selected_diagnosis);
        } else if (intakeData.chief_complaint) {
          setPrimaryConcern(intakeData.chief_complaint);
        }
        
        if (intakeData.functional_limitations && Array.isArray(intakeData.functional_limitations)) {
          setFunctionalLimitationsArray(intakeData.functional_limitations);
        }
        
        if (intakeData.prior_treatments && Array.isArray(intakeData.prior_treatments)) {
          setPriorTreatmentsData(intakeData.prior_treatments);
        }
        
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
      setSelectedIndices(["RPQ"]);
      setBaselineScores({ RPQ: "" });
      setRegion("");
    } else {
      setSelectedIndices([]);
      setBaselineScores({});
    }
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    const recommendedIndices = PPC_CONFIG.regionToIndices(value, episodeType) as IndexType[];
    setSelectedIndices(recommendedIndices);
    
    const scores: Record<string, string> = {};
    recommendedIndices.forEach((index) => { scores[index] = ""; });
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

  const allFormsComplete = selectedIndices.length > 0 && selectedIndices.every(index => {
    const score = parseFloat(baselineScores[index]);
    return !isNaN(score) && score >= 0 && formCompletionStatus[index] === true;
  });

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
    if (!primaryConcern.trim()) {
      toast.error("Please enter the patient's primary concern");
      return;
    }
    
    // Conditional validation for injury date/mechanism based on onset type
    const isDateRequired = onsetType === "acute" || onsetType === "post_surgical";
    const isMechanismRequired = onsetType === "acute";
    
    if (isDateRequired && !injuryDate) {
      toast.error("Please enter injury/onset date");
      return;
    }
    if (isMechanismRequired && !injuryMechanism.trim()) {
      toast.error("Please enter mechanism of injury");
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
      const serviceDate = new Date(dateOfService);
      const followupDate = new Date(serviceDate);
      followupDate.setDate(followupDate.getDate() + 90);

      // Build diagnosis from primary concern if not set
      const finalDiagnosis = diagnosis.trim() || primaryConcern.trim();

      const createdEpisode = await createEpisode({
        patient_name: patientName.trim(),
        date_of_birth: dob.trim(),
        episode_type: episodeType,
        region: episodeType === "MSK" ? region : episodeType === "Neurology" ? "Neurology" : "Performance",
        diagnosis: finalDiagnosis,
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
        functional_limitation: functionalLimitationsOther.trim(),
        treatment_goals: goalsData,
        goals_other: goalsOther.trim(),
        start_date: dateOfService,
        followup_date: followupDate.toISOString().split("T")[0],
        clinician: clinician.trim(),
        npi: npi.trim(),
        pain_pre: painLevel ?? undefined,
        source_intake_form_id: sourceIntakeFormId || undefined,
      });

      // Save baseline scores
      for (const [indexType, score] of Object.entries(scores)) {
        await saveOutcomeScore(createdEpisode.id, indexType, "baseline", score);
      }

      // Mark intake as converted if applicable
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

      // Link care request if applicable
      if (sourceCareRequestId) {
        await supabase
          .from("care_requests")
          .update({
            episode_id: createdEpisode.id,
            status: 'CONVERTED'
          })
          .eq("id", sourceCareRequestId);
      }

      toast.success("Episode created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      const isAuthError = error.message?.toLowerCase().includes('auth') ||
        error.message?.toLowerCase().includes('jwt') ||
        error.message?.toLowerCase().includes('token') ||
        error.message?.toLowerCase().includes('session') ||
        error.code === 'PGRST301' ||
        error.code === '401';
      
      if (isAuthError) {
        pendingSubmitRef.current = e;
        setShowReauthDialog(true);
        toast.error("Session expired. Please sign in again to save your episode.");
      } else {
        toast.error(`Failed to create episode: ${error.message}`);
      }
    }
  };

  const handleReauthSuccess = () => {
    if (pendingSubmitRef.current) {
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
      pendingSubmitRef.current = null;
    }
  };

  const showFullForm = (episodeType === "MSK" && region) || episodeType === "Neurology" || episodeType === "Performance";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ReauthDialog
        open={showReauthDialog}
        onOpenChange={setShowReauthDialog}
        onSuccess={handleReauthSuccess}
      />

      <div>
        <h1 className="text-3xl font-bold">Create New Episode</h1>
        <p className="mt-2 text-muted-foreground">
          Clinical consult workflow
        </p>
      </div>

      {/* Patient Search */}
      <PatientSearch onPatientSelect={handlePatientSelect} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Episode Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Episode Setup</CardTitle>
            <CardDescription>Basic episode information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="episodeType">Episode Type *</Label>
                <Select value={episodeType} onValueChange={handleEpisodeTypeChange}>
                  <SelectTrigger id="episodeType">
                    <SelectValue placeholder="Select episode type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PPC_CONFIG.episodeTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {episodeType === "Neurology" && (
                  <p className="text-sm text-muted-foreground">RPQ will be automatically assigned</p>
                )}
              </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  readOnly={isPrefilled && patientName !== ""}
                  className={isPrefilled && patientName !== "" ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinician">Treating Clinician *</Label>
                <Input
                  id="clinician"
                  placeholder="Auto-populated from profile"
                  value={clinician}
                  onChange={(e) => setClinician(e.target.value)}
                  className="bg-muted"
                  readOnly
                />
                {npi && (
                  <p className="text-xs text-muted-foreground">NPI: {npi}</p>
                )}
              </div>
            </div>

            {episodeType === "MSK" && (
              <div className="space-y-2">
                <Label htmlFor="region">Anatomical Region *</Label>
                <Select value={region} onValueChange={handleRegionChange}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {PPC_CONFIG.regionEnum.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {showFullForm && (
          <>
            {/* 2. How did you find us? */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ReferralSourceSelector
                  referralSource={referralSource}
                  onReferralSourceChange={setReferralSource}
                  referringPhysician={referringPhysician}
                  onReferringPhysicianChange={setReferringPhysician}
                />
              </CardContent>
            </Card>

            {/* 3. What is bothering you? */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Concerns</CardTitle>
                <CardDescription>What brought the patient in today?</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientConcernsInput
                  primaryConcern={primaryConcern}
                  onPrimaryConcernChange={setPrimaryConcern}
                  secondaryConcern={secondaryConcern}
                  onSecondaryConcernChange={setSecondaryConcern}
                />
              </CardContent>
            </Card>

            {/* 4. Onset Type */}
            <Card>
              <CardHeader>
                <CardTitle>Onset Details</CardTitle>
                <CardDescription>When and how did this develop?</CardDescription>
              </CardHeader>
              <CardContent>
                <OnsetTypeSelector
                  onsetType={onsetType}
                  onOnsetTypeChange={setOnsetType}
                  injuryDate={injuryDate}
                  onInjuryDateChange={setInjuryDate}
                  injuryMechanism={injuryMechanism}
                  onInjuryMechanismChange={setInjuryMechanism}
                />
              </CardContent>
            </Card>

            {/* 5. Structured Injury/Surgical History */}
            <Card>
              <CardHeader>
                <CardTitle>Injury & Surgical History</CardTitle>
                <CardDescription>Prior injuries or surgeries relevant to this visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StructuredInjuryHistory
                  items={structuredInjuryHistory}
                  onChange={setStructuredInjuryHistory}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Additional Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    placeholder="Other relevant medical conditions or history..."
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    rows={3}
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

            {/* 6. Prior Treatments (Enhanced) */}
            <EnhancedPriorTreatments
              region={region}
              priorTreatments={priorTreatmentsData}
              priorTreatmentsOther={priorTreatmentsOther}
              onPriorTreatmentsChange={({ prior_treatments, prior_treatments_other }) => {
                setPriorTreatmentsData(prior_treatments);
                setPriorTreatmentsOther(prior_treatments_other);
              }}
              helpfulTreatments={helpfulTreatments}
              onHelpfulTreatmentsChange={setHelpfulTreatments}
              worseningFactors={worseningFactors}
              onWorseningFactorsChange={setWorseningFactors}
            />

            {/* 7. Pain & Dysfunction (replaces CIS) */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>Pain and functional limitation levels</CardDescription>
              </CardHeader>
              <CardContent>
                <PainDysfunctionScale
                  painLevel={painLevel}
                  onPainLevelChange={setPainLevel}
                  dysfunctionLevel={dysfunctionLevel}
                  onDysfunctionLevelChange={setDysfunctionLevel}
                />
              </CardContent>
            </Card>

            {/* 8. Functional Limitations (single source) */}
            <FunctionalLimitationSelector
              region={region}
              initialLimitations={functionalLimitationsArray}
              onChange={setFunctionalLimitationsArray}
            />
            
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="functionalLimitationsOther">Anything else this limits? (optional)</Label>
                  <Input
                    id="functionalLimitationsOther"
                    placeholder="Other activities affected..."
                    value={functionalLimitationsOther}
                    onChange={(e) => setFunctionalLimitationsOther(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 9. Diagnosis (moved after story collection) */}
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

            {/* Smart Outcome Measure Recommendations */}
            <SmartOutcomeMeasureSelector 
              region={region}
              diagnosis={diagnosis}
              showFullDetails={true}
            />

            {/* 10. Outcome Measures (collapsible) */}
            <CollapsibleOutcomeMeasures
              episodeType={episodeType}
              selectedIndices={selectedIndices}
              baselineScores={baselineScores}
              formCompletionStatus={formCompletionStatus}
              onIndexToggle={handleIndexToggle}
              onScoreChange={handleScoreChange}
            />

            {/* Treatment Goals */}
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

            {/* 11. Patient Profile (Demographics - Prefilled & Collapsible) */}
            <CollapsiblePatientProfile
              dob={dob}
              onDobChange={setDob}
              insurance={insurance}
              onInsuranceChange={setInsurance}
              emergencyContact={emergencyContact}
              onEmergencyContactChange={setEmergencyContact}
              emergencyPhone={emergencyPhone}
              onEmergencyPhoneChange={setEmergencyPhone}
              isPrefilled={isPrefilled}
            />

            {/* Score Summary */}
            {selectedIndices.length > 0 && (
              <Card className={allFormsComplete ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {allFormsComplete ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-green-700 dark:text-green-400">Ready to Create Episode</span>
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
                              <Badge className="bg-green-600 text-xs">Complete</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          {isComplete && !isNaN(score) && (
                            <p className="text-2xl font-bold">
                              {index === "LEFS" ? `${score.toFixed(0)}/80` : `${score.toFixed(1)}%`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4">
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
          </>
        )}
      </form>
    </div>
  );
}
