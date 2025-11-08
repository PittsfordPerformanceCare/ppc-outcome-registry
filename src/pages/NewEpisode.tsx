import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PPC_STORE } from "@/lib/ppcStore";
import { PPC_CONFIG, IndexType } from "@/lib/ppcConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { NDIForm } from "@/components/forms/NDIForm";
import { MetricCard } from "@/components/MetricCard";
import { DiagnosisSelector } from "@/components/DiagnosisSelector";

export default function NewEpisode() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
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
  const [painLevel, setPainLevel] = useState("");
  const [referringPhysician, setReferringPhysician] = useState("");
  const [insurance, setInsurance] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [priorTreatments, setPriorTreatments] = useState("");
  const [functionalLimitations, setFunctionalLimitations] = useState("");
  const [treatmentGoals, setTreatmentGoals] = useState("");
  const [cisPre, setCisPre] = useState<number | null>(null);
  const [cisPost, setCisPost] = useState<number | null>(null);
  const [painPre, setPainPre] = useState<number | null>(null);
  const [painPost, setPainPost] = useState<number | null>(null);

  const handleRegionChange = (value: string) => {
    setRegion(value);
    const recommendedIndices = PPC_CONFIG.regionToIndices(value) as IndexType[];
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

  const handleScoreChange = (index: string, value: string) => {
    setBaselineScores({ ...baselineScores, [index]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }
    if (!region) {
      toast.error("Please select a region");
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
    if (!painLevel) {
      toast.error("Please rate current pain level");
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

    // Generate episode ID
    const episodeId = `EP${Date.now()}`;

    // Calculate follow-up date (90 days from service date)
    const serviceDate = new Date(dateOfService);
    const followupDate = new Date(serviceDate);
    followupDate.setDate(followupDate.getDate() + 90);

    // Calculate deltas for metrics
    const cisDelta = cisPre != null && cisPost != null ? cisPost - cisPre : null;
    const painDelta = painPre != null && painPost != null ? painPre - painPost : null;

    // Save episode
    PPC_STORE.setEpisodeMeta(episodeId, {
      episodeId,
      patientName: patientName.trim(),
      region,
      dateOfService,
      indices: selectedIndices,
      baselineScores: scores,
      followupDate: followupDate.toISOString().split("T")[0],
      dob: dob.trim(),
      clinician: clinician.trim(),
      diagnosis: diagnosis.trim(),
      npi: npi.trim(),
      start_date: dateOfService,
      injuryDate,
      injuryMechanism: injuryMechanism.trim(),
      painLevel,
      referringPhysician: referringPhysician.trim(),
      insurance: insurance.trim(),
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      medications: medications.trim(),
      medicalHistory: medicalHistory.trim(),
      priorTreatments: priorTreatments.trim(),
      functionalLimitations: functionalLimitations.trim(),
      treatmentGoals: treatmentGoals.trim(),
      cis_pre: cisPre,
      cis_post: cisPost,
      cis_delta: cisDelta,
      pain_pre: painPre,
      pain_post: painPost,
      pain_delta: painDelta,
    });

    toast.success("Episode created successfully!");
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Episode</h1>
        <p className="mt-2 text-muted-foreground">
          Enter baseline patient information and outcome scores
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Basic demographics and episode details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">Anatomical Region *</Label>
                <Select value={region} onValueChange={handleRegionChange} required>
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

              <div className="space-y-2">
                <Label htmlFor="dateOfService">Date of Service *</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={dateOfService}
                  onChange={(e) => setDateOfService(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {region && (
          <>
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
                      required
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
                    <Select value={clinician} onValueChange={setClinician} required>
                      <SelectTrigger id="clinician">
                        <SelectValue placeholder="Select clinician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Luckey">Dr. Luckey</SelectItem>
                        <SelectItem value="Dr. Fink">Dr. Fink</SelectItem>
                      </SelectContent>
                    </Select>
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="painLevel">Current Pain Level (0-10) *</Label>
                    <Select value={painLevel} onValueChange={setPainLevel} required>
                      <SelectTrigger id="painLevel">
                        <SelectValue placeholder="Select pain level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level} {level === 0 && "- No pain"} {level === 10 && "- Worst pain"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div className="space-y-2">
                  <Label htmlFor="priorTreatments">Prior Treatments</Label>
                  <Input
                    id="priorTreatments"
                    placeholder="List any previous treatments received"
                    value={priorTreatments}
                    onChange={(e) => setPriorTreatments(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

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

                <div className="space-y-2">
                  <Label htmlFor="treatmentGoals">Treatment Goals</Label>
                  <Input
                    id="treatmentGoals"
                    placeholder="What are the patient's goals for treatment?"
                    value={treatmentGoals}
                    onChange={(e) => setTreatmentGoals(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Intake Metrics: CIS Standing and Pain Scale */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <MetricCard
                title="CIS Standing"
                description="Neurologic readiness (0–10)"
                preLabel="Pre (0–10)"
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
                description="Self-reported 0–10"
                preLabel="Pre (0–10)"
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

            <div className="mt-6 space-y-6">
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
                  onScoreChange={(score) => handleScoreChange("NDI", score.toString())}
                  initialScore={parseFloat(baselineScores["NDI"] || "0")}
                />
              )}

              {(["ODI", "QuickDASH", "LEFS"] as IndexType[]).map((index) => (
                <div key={index}>
                  <div className="flex items-start space-x-4 rounded-lg border p-4">
                    <Checkbox
                      id={index}
                      checked={selectedIndices.includes(index)}
                      onCheckedChange={(checked) => handleIndexToggle(index, checked as boolean)}
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={index} className="text-base font-medium">
                        {index}
                      </Label>
                      {selectedIndices.includes(index) && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter baseline score"
                            value={baselineScores[index] || ""}
                            onChange={(e) => handleScoreChange(index, e.target.value)}
                            className="max-w-xs"
                            required
                          />
                          <span className="text-sm text-muted-foreground">
                            MCID: {PPC_CONFIG.mcid[index]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Create Episode
          </Button>
        </div>
      </form>
    </div>
  );
}
