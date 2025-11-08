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
import { FileText, Send, Link2, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (episodeId) {
      const meta = PPC_STORE.getEpisodeMeta(episodeId);
      if (meta) {
        setPatientName(meta.patientName || "");
        setRegion(meta.region || "");
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

    const baselineScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, value]) => {
      if (value != null) baselineScores[key] = value;
    });

    const meta: EpisodeMeta = {
      episodeId,
      patientName,
      region,
      dateOfService: new Date().toISOString().split("T")[0],
      indices: activeIndices,
      baselineScores,
    };
    PPC_STORE.setEpisodeMeta(episodeId, meta);

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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="episodeId">Episode ID *</Label>
              <Input
                id="episodeId"
                value={episodeId}
                onChange={(e) => setEpisodeId(e.target.value)}
                placeholder="e.g., PPC-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
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
          </div>

          <div>
            <Label>Primary Anatomical Region *</Label>
            <RadioGroup value={region} onValueChange={setRegion} className="mt-2 grid grid-cols-3 gap-2">
              {PPC_CONFIG.regionEnum.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={`region-${r}`} />
                  <Label htmlFor={`region-${r}`} className="cursor-pointer font-normal">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Discharge Scores */}
      {region && (
        <Card>
          <CardHeader>
            <CardTitle>Discharge Outcome Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {activeIndices.map((idx) => (
                <div key={idx}>
                  <Label htmlFor={`score-${idx}`}>
                    {idx} Score * <Badge variant="outline">{region}</Badge>
                  </Label>
                  <Input
                    id={`score-${idx}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={scores[idx as keyof DischargeScores] ?? ""}
                    onChange={(e) => setScores({ ...scores, [idx]: parseFloat(e.target.value) || 0 })}
                    placeholder="0-100"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
            <RadioGroup value={complianceRating} onValueChange={setComplianceRating} className="mt-2">
              {["Excellent", "Good", "Fair", "Poor"].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating} id={`compliance-${rating}`} />
                  <Label htmlFor={`compliance-${rating}`} className="cursor-pointer font-normal">
                    {rating}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
