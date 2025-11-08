import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PPC_STORE, EpisodeMeta } from "@/lib/ppcStore";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, Link2, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { NDIForm } from "@/components/forms/NDIForm";
import { ODIForm } from "@/components/forms/ODIForm";
import { QuickDASHForm } from "@/components/forms/QuickDASHForm";
import { LEFSForm } from "@/components/forms/LEFSForm";
import { MetricCard } from "@/components/MetricCard";
import { DiagnosisSelector } from "@/components/DiagnosisSelector";
import { FunctionalLimitationSelector } from "@/components/FunctionalLimitationSelector";
import { PriorTreatmentSelector, type PriorTreatment } from "@/components/PriorTreatmentSelector";

interface DischargeScores {
  NDI?: number;
  ODI?: number;
  QuickDASH?: number;
  LEFS?: number;
}

export default function Discharge() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const episodeParam = searchParams.get("episode") || "";

  const [episodeId, setEpisodeId] = useState(episodeParam);
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [region, setRegion] = useState("");
  const [clinician, setClinician] = useState("");
  const [scores, setScores] = useState<DischargeScores>({});
  
  const [pcpName, setPcpName] = useState("");
  const [pcpPractice, setPcpPractice] = useState("");
  const [pcpContact, setPcpContact] = useState("");
  const [pcpConsent, setPcpConsent] = useState(false);
  const [savedPdf, setSavedPdf] = useState(false);

  const [enrollFollowup, setEnrollFollowup] = useState(false);
  const [patientEmail, setPatientEmail] = useState("");
  const [followupLink, setFollowupLink] = useState("");

  const [complianceRating, setComplianceRating] = useState("");
  const [complianceNotes, setComplianceNotes] = useState("");
  const [referredOut, setReferredOut] = useState(false);
  const [referralReason, setReferralReason] = useState("");
  const [availableEpisodes, setAvailableEpisodes] = useState<EpisodeMeta[]>([]);
  const [cisPre, setCisPre] = useState<number | null>(null);
  const [cisPost, setCisPost] = useState<number | null>(null);
  const [painPre, setPainPre] = useState<number | null>(null);
  const [painPost, setPainPost] = useState<number | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [functionalLimitation, setFunctionalLimitation] = useState("");
  const [priorTreatmentsData, setPriorTreatmentsData] = useState<PriorTreatment[]>([]);
  const [priorTreatmentsOther, setPriorTreatmentsOther] = useState("");

  useEffect(() => {
    // Load all available episodes for dropdown
    const episodeIds = PPC_STORE.getAllEpisodes();
    const episodes = episodeIds
      .map((id) => PPC_STORE.getEpisodeMeta(id))
      .filter((ep): ep is EpisodeMeta => ep !== null)
      .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime());
    setAvailableEpisodes(episodes);
  }, []);

  useEffect(() => {
    if (episodeId) {
      const meta = PPC_STORE.getEpisodeMeta(episodeId);
      if (meta) {
        setPatientName(meta.patientName || "");
        setRegion(meta.region || "");
        setDob(meta.dob || "");
        setClinician(meta.clinician || "");
        
        // Load discharge scores if they exist
        if (meta.dischargeScores) {
          setScores(meta.dischargeScores as DischargeScores);
        }
        
        // Load compliance and referral info
        setComplianceRating(meta.compliance_rating || "");
        setComplianceNotes(meta.compliance_notes || "");
        setReferredOut(meta.referred_out || false);
        setReferralReason(meta.referral_reason || "");

        // Load metrics
        setCisPre(meta.cis_pre ?? null);
        setCisPost(meta.cis_post ?? null);
        setPainPre(meta.pain_pre ?? null);
        setPainPost(meta.pain_post ?? null);
        setDiagnosis(meta.diagnosis || "");
        setFunctionalLimitation(meta.functional_limitation || "");
        setPriorTreatmentsData(meta.prior_treatments || []);
        setPriorTreatmentsOther(meta.prior_treatments_other || "");
      }
    }
  }, [episodeId]);

  const activeIndices = region ? PPC_CONFIG.regionToIndices(region) : [];

  const canGeneratePCP = () => {
    const scoresValid = activeIndices.every((idx) => scores[idx as keyof DischargeScores] != null);
    return scoresValid && pcpName && pcpContact && pcpConsent;
  };

  const handleGeneratePCP = () => {
    if (!canGeneratePCP()) {
      toast.error("Please complete all required fields");
      return;
    }

    const dischargeScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, value]) => {
      if (value != null) dischargeScores[key] = value;
    });

    console.log("=== Discharge: Generate PCP Debug ===");
    console.log("Current scores state:", scores);
    console.log("Discharge scores to save:", dischargeScores);

    // Load existing episode data and preserve ALL fields
    const existingMeta = PPC_STORE.getEpisodeMeta(episodeId);
    if (!existingMeta) {
      toast.error("Episode data not found");
      return;
    }

    console.log("Existing episode meta:", existingMeta);
    console.log("Existing baseline scores:", existingMeta.baselineScores);

    // Calculate deltas for metrics
    const cisDelta = cisPre != null && cisPost != null ? cisPost - cisPre : null;
    const painDelta = painPre != null && painPost != null ? painPre - painPost : null;

    // Only update discharge-specific fields, preserve all intake/treatment data
    const meta: EpisodeMeta = {
      ...existingMeta, // Preserve ALL existing fields
      dischargeScores,
      dischargeDate: new Date().toISOString().split("T")[0],
      compliance_rating: complianceRating,
      compliance_notes: complianceNotes,
      referred_out: referredOut,
      referral_reason: referralReason,
      dob: dob || existingMeta.dob,
      clinician: clinician || existingMeta.clinician,
      cis_post: cisPost,
      cis_delta: cisDelta,
      pain_post: painPost,
      pain_delta: painDelta,
      diagnosis: diagnosis || existingMeta.diagnosis,
      functional_limitation: functionalLimitation || existingMeta.functional_limitation,
      prior_treatments: priorTreatmentsData,
      prior_treatments_other: priorTreatmentsOther,
    };
    
    console.log("Meta to save:", meta);
    PPC_STORE.setEpisodeMeta(episodeId, meta);
    
    // Verify it was saved
    const savedMeta = PPC_STORE.getEpisodeMeta(episodeId);
    console.log("Verified saved meta:", savedMeta);

    navigate(`/pcp-summary?episode=${episodeId}`);
    toast.success("Opening PCP Summary...");
  };

  const handleSendToPCP = () => {
    if (!savedPdf) {
      toast.error("Please save the summary as PDF first");
      return;
    }

    const subject = encodeURIComponent(`Discharge Summary — ${patientName}${episodeId ? " — " + episodeId : ""}`);
    const body = encodeURIComponent(
      `Dear ${pcpName},\n\nAttached is the discharge summary for ${patientName}. I appreciate the opportunity to collaborate in their care.\n\n— ${clinician}\nPittsford Performance Care`
    );

    if (pcpContact.includes("@")) {
      window.location.href = `mailto:${pcpContact}?subject=${subject}&body=${body}`;
      toast.success("Opening email client...");
    } else {
      toast.info("Please send the saved PDF via your secure fax channel");
    }

    // Navigate to PCP summary for viewing/printing
    setTimeout(() => {
      navigate(`/pcp-summary?episode=${episodeId}`);
    }, 1000);
  };

  const generateFollowupLink = () => {
    if (!enrollFollowup) {
      toast.error("Enable 90-day enrollment first");
      return;
    }
    if (!episodeId) {
      toast.error("Please enter an Episode ID");
      return;
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 90);

    PPC_STORE.setFollowupMeta(episodeId, {
      episodeId,
      scheduledDate: scheduledDate.toISOString().split("T")[0],
      scores: undefined,
      status: undefined,
    });

    const baselineScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, value]) => {
      if (value != null) baselineScores[key] = value;
    });

    const meta = PPC_STORE.getEpisodeMeta(episodeId) || {
      episodeId,
      patientName,
      region,
      dateOfService: new Date().toISOString().split("T")[0],
      indices: activeIndices,
      baselineScores,
    };
    PPC_STORE.setEpisodeMeta(episodeId, meta);

    const link = `${window.location.origin}/follow-up?episode=${encodeURIComponent(episodeId)}`;
    setFollowupLink(link);
    navigator.clipboard.writeText(link);
    toast.success("Follow-up link created and copied to clipboard");
  };

  const handleMailInvite = () => {
    if (!patientEmail || !followupLink) {
      toast.error("Please enter patient email and generate the follow-up link first");
      return;
    }

    const subject = encodeURIComponent("Quick 90-day check-in");
    const body = encodeURIComponent(
      `Hi ${patientName || "there"},\n\nAs part of your recovery with Pittsford Performance Care, we do a quick 90-day check to be sure your progress is holding steady. It takes about 2 minutes.\n\nPlease click this secure link:\n${followupLink}\n\nIf your results remain stable, you're fully cleared. If they dip, we'll invite you back for a brief re-examination to keep you on track.\n\nThank you,\n${clinician}`
    );

    window.location.href = `mailto:${patientEmail}?subject=${subject}&body=${body}`;
    toast.success("Opening email client...");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discharge Assessment</h1>
          <p className="mt-2 text-muted-foreground">Complete discharge, generate PCP summary, and enroll in 90-day follow-up</p>
        </div>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="episodeSelect">Select Episode *</Label>
              <Select value={episodeId} onValueChange={setEpisodeId}>
                <SelectTrigger id="episodeSelect" className="bg-background">
                  <SelectValue placeholder="Choose an episode to discharge..." />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableEpisodes.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No episodes found. Create one first.
                    </div>
                  ) : (
                    availableEpisodes.map((ep) => (
                      <SelectItem key={ep.episodeId} value={ep.episodeId}>
                        <div className="flex flex-col">
                          <span className="font-medium">{ep.patientName}</span>
                          <span className="text-xs text-muted-foreground">
                            {ep.episodeId} • {ep.region} • {ep.dateOfService}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {episodeId && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clinician">Discharging Clinician *</Label>
                  <Input
                    id="clinician"
                    value={clinician}
                    onChange={(e) => setClinician(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input value={region} readOnly className="bg-muted" />
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Smart Diagnosis Selector - Discharge Update */}
      {episodeId && region && (
        <>
          <DiagnosisSelector
            region={region}
            diagnosis={diagnosis}
            onChange={({ diagnosis: newDiagnosis }) => {
              setDiagnosis(newDiagnosis);
            }}
          />
          
          {/* Smart Functional Limitation Selector */}
          <div className="mt-6">
            <FunctionalLimitationSelector
              region={region}
              initialLimitation={functionalLimitation}
              onChange={setFunctionalLimitation}
            />
          </div>

          {/* Smart Prior Treatment Selector */}
          <div className="mt-6">
            <PriorTreatmentSelector
              initialTreatments={priorTreatmentsData}
              initialOther={priorTreatmentsOther}
              onChange={({ prior_treatments, prior_treatments_other }) => {
                setPriorTreatmentsData(prior_treatments);
                setPriorTreatmentsOther(prior_treatments_other);
              }}
            />
          </div>
        </>
      )}

      {/* Discharge Outcome Assessments */}
      {region && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Discharge Outcome Assessments</h2>
            <Badge variant="outline">{region}</Badge>
          </div>

          {/* Discharge Metrics: CIS Standing and Pain Scale */}
          <div className="grid gap-6 md:grid-cols-2">
            <MetricCard
              title="CIS Standing"
              description="Neurologic readiness (0-10)"
              preLabel="Pre (from Intake)"
              postLabel="Post (0-10)"
              preValue={cisPre}
              postValue={cisPost}
              onPreChange={setCisPre}
              onPostChange={setCisPost}
              isIntake={false}
              deltaInverted={false}
              icon="activity"
            />
            <MetricCard
              title="Patient Verbal Pain Scale"
              description="Self-reported 0-10"
              preLabel="Pre (from Intake)"
              postLabel="Post (0-10)"
              preValue={painPre}
              postValue={painPost}
              onPreChange={setPainPre}
              onPostChange={setPainPost}
              isIntake={false}
              deltaInverted={true}
              icon="alert"
            />
          </div>
          
          {activeIndices.includes("NDI") && (
            <NDIForm onScoreChange={(score) => {
              console.log("NDI score changed:", score);
              setScores(prev => ({ ...prev, NDI: score }));
            }} />
          )}
          
          {activeIndices.includes("ODI") && (
            <ODIForm onScoreChange={(score) => {
              console.log("ODI score changed:", score);
              setScores(prev => ({ ...prev, ODI: score }));
            }} />
          )}
          
          {activeIndices.includes("QuickDASH") && (
            <QuickDASHForm onScoreChange={(score) => {
              console.log("QuickDASH score changed:", score);
              setScores(prev => ({ ...prev, QuickDASH: score }));
            }} />
          )}
          
          {activeIndices.includes("LEFS") && (
            <LEFSForm onScoreChange={(score) => {
              console.log("LEFS score changed:", score);
              setScores(prev => ({ ...prev, LEFS: score }));
            }} />
          )}
        </div>
      )}

      {/* PCP Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate PCP Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pcpName">PCP Name *</Label>
              <Input
                id="pcpName"
                value={pcpName}
                onChange={(e) => setPcpName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pcpPractice">PCP Practice</Label>
              <Input
                id="pcpPractice"
                value={pcpPractice}
                onChange={(e) => setPcpPractice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pcpContact">PCP Contact (Email/Fax) *</Label>
              <Input
                id="pcpContact"
                value={pcpContact}
                onChange={(e) => setPcpContact(e.target.value)}
                placeholder="email@example.com or fax number"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="pcpConsent"
              checked={pcpConsent}
              onCheckedChange={(checked) => setPcpConsent(checked as boolean)}
            />
            <Label htmlFor="pcpConsent" className="cursor-pointer text-sm">
              Patient consents to share clinical summary with their PCP
            </Label>
          </div>

          <Button onClick={handleGeneratePCP} disabled={!canGeneratePCP()} className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Generate PCP Summary
          </Button>

          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="savedPdf"
                checked={savedPdf}
                onCheckedChange={(checked) => setSavedPdf(checked as boolean)}
              />
              <Label htmlFor="savedPdf" className="cursor-pointer text-sm">
                I have saved the summary as PDF
              </Label>
            </div>

            <Button onClick={handleSendToPCP} disabled={!savedPdf} variant="secondary" className="w-full gap-2">
              <Send className="h-4 w-4" />
              Send to PCP Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 90-Day Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            90-Day Follow-up Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="enrollFollowup"
              checked={enrollFollowup}
              onCheckedChange={(checked) => setEnrollFollowup(checked as boolean)}
            />
            <Label htmlFor="enrollFollowup" className="cursor-pointer">
              Enroll patient in 90-day outcome tracking
            </Label>
          </div>

          {enrollFollowup && (
            <>
              <Button onClick={generateFollowupLink} className="w-full gap-2">
                <Link2 className="h-4 w-4" />
                Create Follow-up Link
              </Button>

              {followupLink && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="followupLink">Secure Follow-up Link</Label>
                    <Input
                      id="followupLink"
                      value={followupLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patientEmail">Patient Email</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                    />
                  </div>

                  <Button onClick={handleMailInvite} variant="secondary" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Send Invitation Email
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Compliance & Referral */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Referral Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="complianceRating">Compliance Rating</Label>
            <Select value={complianceRating} onValueChange={setComplianceRating}>
              <SelectTrigger id="complianceRating" className="bg-background">
                <SelectValue placeholder="Select compliance rating..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Excellent (90-100%)">Excellent (90-100%)</SelectItem>
                <SelectItem value="Good (75-89%)">Good (75-89%)</SelectItem>
                <SelectItem value="Fair (50-74%)">Fair (50-74%)</SelectItem>
                <SelectItem value="Poor (<50%)">Poor (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="complianceNotes">Compliance Notes</Label>
            <Textarea
              id="complianceNotes"
              value={complianceNotes}
              onChange={(e) => setComplianceNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="referredOut"
                checked={referredOut}
                onCheckedChange={(checked) => setReferredOut(checked as boolean)}
              />
              <Label htmlFor="referredOut" className="cursor-pointer">
                Patient referred out to specialist
              </Label>
            </div>

            {referredOut && (
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="referralReason">Referral Reason</Label>
                  <Textarea
                    id="referralReason"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    rows={2}
                    placeholder="Reason for referral to specialist..."
                  />
                </div>
                <div className="rounded-md bg-warning/10 p-3">
                  <p className="flex items-center gap-2 text-sm text-warning">
                    <AlertCircle className="h-4 w-4" />
                    Generate referral packet before sending to specialist
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
