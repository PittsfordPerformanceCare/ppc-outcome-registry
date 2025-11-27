import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllEpisodes, getEpisode, updateEpisode, saveOutcomeScore, createFollowup } from "@/lib/dbOperations";
import type { Episode } from "@/lib/dbOperations";
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
import { FileText, Send, Link2, Mail, AlertCircle, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { NDIForm } from "@/components/forms/NDIForm";
import { ODIForm } from "@/components/forms/ODIForm";
import { QuickDASHForm } from "@/components/forms/QuickDASHForm";
import { LEFSForm } from "@/components/forms/LEFSForm";
import { RPQForm } from "@/components/forms/RPQForm";
import { MetricCard } from "@/components/MetricCard";
import { DiagnosisSelector } from "@/components/DiagnosisSelector";
import { FunctionalLimitationResolutionTracker, type LimitationResolution } from "@/components/FunctionalLimitationResolutionTracker";
import { PriorTreatmentSelector, type PriorTreatment } from "@/components/PriorTreatmentSelector";
import { TreatmentGoalsSelector, type GoalItem } from "@/components/TreatmentGoalsSelector";
import { useNavigationShortcuts } from "@/hooks/useNavigationShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { PendingComplaintConfirmation } from "@/components/PendingComplaintConfirmation";
import { supabase } from "@/integrations/supabase/client";

interface DischargeScores {
  NDI?: number;
  ODI?: number;
  QuickDASH?: number;
  LEFS?: number;
  RPQ?: number;
}

export default function Discharge() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const episodeParam = searchParams.get("episode") || "";

  const [episodeId, setEpisodeId] = useState(episodeParam);

  // Enable keyboard shortcuts
  const { showHelp, setShowHelp } = useNavigationShortcuts();
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
  const [availableEpisodes, setAvailableEpisodes] = useState<Episode[]>([]);
  const [cisPre, setCisPre] = useState<number | null>(null);
  const [cisPost, setCisPost] = useState<number | null>(null);
  const [painPre, setPainPre] = useState<number | null>(null);
  const [painPost, setPainPost] = useState<number | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [functionalLimitation, setFunctionalLimitation] = useState("");
  const [functionalLimitationsArray, setFunctionalLimitationsArray] = useState<string[]>([]);
  const [limitationResolutions, setLimitationResolutions] = useState<LimitationResolution[]>([]);
  const [priorTreatmentsData, setPriorTreatmentsData] = useState<PriorTreatment[]>([]);
  const [priorTreatmentsOther, setPriorTreatmentsOther] = useState("");
  const [goalsData, setGoalsData] = useState<GoalItem[]>([]);
  const [goalsOther, setGoalsOther] = useState("");
  const [showPendingComplaints, setShowPendingComplaints] = useState(false);

  useEffect(() => {
    // Load all available episodes for dropdown
    const loadEpisodes = async () => {
      try {
        const episodes = await getAllEpisodes();
        setAvailableEpisodes(episodes);
      } catch (error) {
        console.error("Error loading episodes:", error);
      }
    };
    loadEpisodes();
  }, []);

  useEffect(() => {
    if (episodeId) {
      const loadEpisode = async () => {
        try {
          const episode = await getEpisode(episodeId);
          if (episode) {
            setPatientName(episode.patient_name || "");
            setRegion(episode.region || "");
            setDob(episode.date_of_birth || "");
            setClinician(episode.clinician || "");
            
            // Load compliance and referral info
            setComplianceRating(episode.compliance_rating || "");
            setComplianceNotes(episode.compliance_notes || "");
            setReferredOut(episode.referred_out || false);
            setReferralReason(episode.referral_reason || "");

            // Load metrics
            setCisPre(episode.cis_pre ?? null);
            setCisPost(episode.cis_post ?? null);
            setPainPre(episode.pain_pre ?? null);
            setPainPost(episode.pain_post ?? null);
            setDiagnosis(episode.diagnosis || "");
            setFunctionalLimitation(episode.functional_limitation || "");
            setFunctionalLimitationsArray(episode.functional_limitations || []);
            
            // Initialize limitation resolutions from intake limitations
            const initialResolutions: LimitationResolution[] = 
              (episode.functional_limitations || []).map(limitation => ({
                limitation,
                status: null
              }));
            setLimitationResolutions(initialResolutions);
            
            setPriorTreatmentsData((episode.prior_treatments as PriorTreatment[]) || []);
            setPriorTreatmentsOther(episode.prior_treatments_other || "");
            setGoalsData((episode.treatment_goals as GoalItem[]) || []);
            setGoalsOther(episode.goals_other || "");
          }
        } catch (error) {
          console.error("Error loading episode:", error);
          toast.error("Failed to load episode");
        }
      };
      loadEpisode();
    }
  }, [episodeId]);

  const activeIndices = region ? PPC_CONFIG.regionToIndices(region) : [];

  const canGeneratePCP = () => {
    const scoresValid = activeIndices.every((idx) => scores[idx as keyof DischargeScores] != null);
    return scoresValid && pcpName && pcpContact && pcpConsent;
  };

  const handleGeneratePCP = async () => {
    if (!canGeneratePCP()) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      // Calculate deltas for metrics
      const cisDelta = cisPre != null && cisPost != null ? cisPost - cisPre : null;
      const painDelta = painPre != null && painPost != null ? painPre - painPost : null;

      const dischargeDate = new Date().toISOString().split("T")[0];

      // Update episode with discharge information
      await updateEpisode(episodeId, {
        discharge_date: dischargeDate,
        compliance_rating: complianceRating,
        compliance_notes: complianceNotes,
        referred_out: referredOut,
        referral_reason: referralReason,
        date_of_birth: dob,
        clinician: clinician,
        cis_post: cisPost ?? undefined,
        cis_delta: cisDelta ?? undefined,
        pain_post: painPost ?? undefined,
        pain_delta: painDelta ?? undefined,
        diagnosis: diagnosis,
        functional_limitation: functionalLimitation,
        functional_limitations: functionalLimitationsArray,
        prior_treatments: priorTreatmentsData,
        prior_treatments_other: priorTreatmentsOther,
        treatment_goals: goalsData,
        goals_other: goalsOther,
      });

      // Save discharge scores to database
      for (const [indexType, score] of Object.entries(scores)) {
        if (score != null) {
          await saveOutcomeScore(episodeId, indexType, "discharge", score);
        }
      }

      // Send discharge notification to patient
      try {
        const { data: intakeForm } = await supabase
          .from("intake_forms")
          .select("email, phone")
          .eq("converted_to_episode_id", episodeId)
          .maybeSingle();

        if (intakeForm?.email || intakeForm?.phone) {
          // Build improvement summary
          const improvements: string[] = [];
          if (cisDelta !== null && cisDelta > 0) {
            improvements.push(`CIS improved by ${cisDelta.toFixed(1)} points`);
          }
          if (painDelta !== null && painDelta > 0) {
            improvements.push(`Pain reduced by ${painDelta.toFixed(1)} points`);
          }
          const improvementSummary = improvements.length > 0 
            ? improvements.join(", ")
            : "Great progress throughout treatment";

          const { data: { user } } = await supabase.auth.getUser();
          const { data: profile } = await supabase
            .from("profiles")
            .select("clinic_id")
            .eq("id", user?.id || "")
            .single();

          await supabase.functions.invoke('send-discharge-notification', {
            body: {
              episodeId,
              patientName,
              patientEmail: intakeForm.email,
              patientPhone: intakeForm.phone,
              clinicianName: clinician,
              dischargeDate,
              improvementSummary,
              userId: user?.id,
              clinicId: profile?.clinic_id
            }
          });
          
          console.log('Discharge notification sent');
        }
      } catch (notifError: any) {
        console.error('Failed to send discharge notification:', notifError);
        // Don't fail the discharge if notification fails
      }

      // Check for pending complaints before navigating
      setShowPendingComplaints(true);
      toast.success("Discharge saved. Checking for pending complaints...");
    } catch (error: any) {
      toast.error(`Failed to save discharge: ${error.message}`);
    }
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

  const generateFollowupLink = async () => {
    if (!enrollFollowup) {
      toast.error("Enable 90-day enrollment first");
      return;
    }
    if (!episodeId) {
      toast.error("Please enter an Episode ID");
      return;
    }

    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 90);

      // Create followup record in database
      await createFollowup(episodeId, scheduledDate.toISOString().split("T")[0]);

      const link = `${window.location.origin}/follow-up?episode=${encodeURIComponent(episodeId)}`;
      setFollowupLink(link);
      navigator.clipboard.writeText(link);
      toast.success("Follow-up link created and copied to clipboard");
    } catch (error: any) {
      toast.error(`Failed to create follow-up: ${error.message}`);
    }
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
      <KeyboardShortcutsDialog 
        open={showHelp} 
        onOpenChange={setShowHelp}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discharge Assessment</h1>
          <p className="mt-2 text-muted-foreground">Complete discharge, generate PCP summary, and enroll in 90-day follow-up</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
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
                      <SelectItem key={ep.id} value={ep.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{ep.patient_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {ep.id} • {ep.region} • {ep.date_of_service}
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
          
          {/* Functional Limitation Resolution Tracker */}
          <div className="mt-6">
            <FunctionalLimitationResolutionTracker
              intakeLimitations={functionalLimitationsArray}
              resolutions={limitationResolutions}
              onChange={setLimitationResolutions}
            />
          </div>

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

          {/* Smart Treatment Goals Selector */}
          <div className="mt-6">
            <TreatmentGoalsSelector
              stage="Final"
              region={region}
              initialGoals={goalsData}
              initialOther={goalsOther}
              onChange={({ goals, goals_other }) => {
                setGoalsData(goals);
                setGoalsOther(goals_other);
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

          {activeIndices.includes("RPQ") && (
            <RPQForm onScoreChange={(score) => {
              console.log("RPQ score changed:", score);
              setScores(prev => ({ ...prev, RPQ: score }));
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

      {/* Pending Complaints Confirmation */}
      {showPendingComplaints && episodeId && (
        <PendingComplaintConfirmation
          currentEpisodeId={episodeId}
          patientName={patientName}
          onComplete={() => {
            setShowPendingComplaints(false);
            navigate(`/pcp-summary?episode=${episodeId}`);
          }}
        />
      )}
    </div>
  );
}
