import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PPC_STORE, EpisodeMeta, FollowupMeta } from "@/lib/ppcStore";
import { calculateMCID } from "@/lib/mcidUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer } from "lucide-react";
import { toast } from "sonner";

export default function PCPSummary() {
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("episode");

  const [episode, setEpisode] = useState<EpisodeMeta | null>(null);
  const [followup, setFollowup] = useState<FollowupMeta | null>(null);

  useEffect(() => {
    if (episodeId) {
      const ep = PPC_STORE.getEpisodeMeta(episodeId);
      const fu = PPC_STORE.getFollowupMeta(episodeId);

      if (ep) setEpisode(ep);
      if (fu) setFollowup(fu);
    }
  }, [episodeId]);

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleLoadDemo = () => {
    const demoEpisodeId = "DEMO-2024-001";
    
    // Create demo episode data
    const demoEpisode: EpisodeMeta = {
      episodeId: demoEpisodeId,
      patientName: "Sarah Johnson",
      region: "Cervical",
      dateOfService: "2024-01-15",
      dob: "1985-06-20",
      clinician: "Dr. Michael Chen, PT, DPT",
      diagnosis: "Cervical radiculopathy, right C6-C7",
      npi: "1234567890",
      indices: ["NDI"],
      baselineScores: { NDI: 48 },
      dischargeScores: { NDI: 16 },
      dischargeDate: "2024-04-15",
      injuryDate: "2023-12-28",
      injuryMechanism: "Motor vehicle accident - rear-end collision. Patient reports immediate onset of neck pain with radiation to right shoulder and arm.",
      painLevel: "8",
      referringPhysician: "Dr. Lisa Martinez, MD",
      insurance: "Blue Cross Blue Shield - PPO",
      emergencyContact: "John Johnson (spouse)",
      emergencyPhone: "(555) 123-4567",
      medications: "Ibuprofen 600mg TID for pain management\nCyclobenzaprine 5mg QHS for muscle spasms\nGabapentin 300mg TID for neuropathic pain",
      medicalHistory: "No significant past medical history. No prior episodes of neck pain. Non-smoker. Exercises regularly (yoga 2x/week prior to injury).",
      priorTreatments: "ER visit on date of injury - X-rays negative for fracture. Prescribed muscle relaxants and NSAIDs. One week of rest recommended by PCP before referral to PT.",
      functionalLimitations: "Unable to look over shoulder while driving\nDifficulty sleeping due to pain\nLimited ability to lift or carry objects >5 lbs\nUnable to perform overhead activities at work\nIntermittent numbness in right thumb and index finger",
      treatmentGoals: "Return to full-time work without restrictions\nEliminate radiating arm pain and numbness\nRestore full cervical range of motion\nReturn to regular yoga practice\nImprove sleep quality",
      start_date: "2024-01-22",
      visits: "12",
      resolution_days: "84",
      compliance_rating: "Excellent (95%)",
      compliance_notes: "Patient was highly compliant with home exercise program. Attended all scheduled appointments. Maintained detailed symptom journal. Gradually reduced medication use as symptoms improved.",
      referred_out: false,
    };

    // Create demo follow-up data
    const demoFollowup: FollowupMeta = {
      episodeId: demoEpisodeId,
      scheduledDate: "2024-07-15",
      completedDate: "2024-07-15",
      scores: { NDI: 12 },
      status: "improving",
    };

    // Save to storage
    PPC_STORE.setEpisodeMeta(demoEpisodeId, demoEpisode);
    PPC_STORE.setFollowupMeta(demoEpisodeId, demoFollowup);
    PPC_STORE.setFollowupCompleted(demoEpisodeId, true);

    // Reload page with demo episode
    window.location.href = `/pcp-summary?episode=${demoEpisodeId}`;
    
    toast.success("Demo patient data loaded!");
  };

  const handleExport = () => {
    if (!episode) return;

    const summary = {
      patient: episode.patientName,
      episodeId: episode.episodeId,
      region: episode.region,
      dateOfService: episode.dateOfService,
      dischargeDate: episode.dischargeDate,
      followupDate: followup?.completedDate,
      status: followup?.status,
      results: episode.indices.map((index) => {
        const baseline = episode.baselineScores?.[index] || 0;
        const discharge = episode.dischargeScores?.[index] || 0;
        const followupScore = followup?.scores?.[index] || 0;
        const dischargeVsBaseline = calculateMCID(index as any, baseline, discharge);
        const followupVsDischarge = calculateMCID(index as any, discharge, followupScore);
        return {
          index,
          baseline,
          discharge,
          followup: followupScore,
          dischargeChange: dischargeVsBaseline.change,
          dischargePercentage: dischargeVsBaseline.percentage,
          followupChange: followupVsDischarge.change,
          followupPercentage: followupVsDischarge.percentage,
          overallStatus: followupScore ? followupVsDischarge.status : dischargeVsBaseline.status,
          clinicallySignificant: followupScore ? followupVsDischarge.isClinicallySignificant : dischargeVsBaseline.isClinicallySignificant,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PCP_Summary_${episode.episodeId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Summary exported successfully!");
  };

  if (!episode) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No episode data available. Please complete a discharge assessment first.
            </p>
            <Button onClick={handleLoadDemo} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Load Demo Patient
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const results = episode.indices.map((index) => {
    const baseline = episode.baselineScores?.[index] || 0;
    const discharge = episode.dischargeScores?.[index] || 0;
    const followupScore = followup?.scores?.[index] || 0;
    
    // Calculate discharge vs baseline
    const dischargeVsBaseline = calculateMCID(index as any, baseline, discharge);
    
    // Calculate 90-day vs discharge (if available)
    const followupVsDischarge = followupScore ? calculateMCID(index as any, discharge, followupScore) : null;

    return {
      index,
      baseline,
      discharge,
      followup: followupScore,
      dischargeChange: dischargeVsBaseline.change,
      dischargePercentage: dischargeVsBaseline.percentage,
      dischargeStatus: dischargeVsBaseline.status,
      followupChange: followupVsDischarge?.change || 0,
      followupPercentage: followupVsDischarge?.percentage || 0,
      followupStatus: followupVsDischarge?.status || 'stable',
      hasFollowup: !!followupScore,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PCP Summary Report</h1>
          <p className="mt-2 text-muted-foreground">Primary Care Provider Outcome Summary</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="print:shadow-none">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Patient Outcome Summary</CardTitle>
            <Badge className="clinical-badge badge-complete">90-Day Follow-up</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Patient Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
              <p className="text-lg font-semibold">{episode.patientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Episode ID</p>
              <p className="text-lg font-semibold">{episode.episodeId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Anatomical Region</p>
              <Badge variant="outline" className="mt-1">
                {episode.region}
              </Badge>
            </div>
            {followup?.status && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Status</p>
                <Badge
                  className={`clinical-badge mt-1 ${
                    followup.status === "improving"
                      ? "badge-improving"
                      : followup.status === "declining"
                      ? "badge-declining"
                      : "badge-stable"
                  }`}
                >
                  {followup.status?.charAt(0).toUpperCase() + (followup.status?.slice(1) || "")}
                </Badge>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Initial Evaluation</p>
              <p className="text-lg">{episode.dateOfService}</p>
            </div>
            {episode.dischargeDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discharge Date</p>
                <p className="text-lg">{episode.dischargeDate}</p>
              </div>
            )}
            {followup?.completedDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">90-Day Follow-up</p>
                <p className="text-lg">{followup.completedDate}</p>
              </div>
            )}
          </div>

          {/* Intake Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Intake Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {episode.dob && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-base">{episode.dob}</p>
                </div>
              )}
              {episode.diagnosis && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                  <p className="text-base">{episode.diagnosis}</p>
                </div>
              )}
              {episode.clinician && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Treating Clinician</p>
                  <p className="text-base">{episode.clinician}</p>
                </div>
              )}
              {episode.npi && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NPI</p>
                  <p className="text-base">{episode.npi}</p>
                </div>
              )}
              {episode.injuryDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Injury Date</p>
                  <p className="text-base">{episode.injuryDate}</p>
                </div>
              )}
              {episode.painLevel && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Initial Pain Level</p>
                  <p className="text-base">{episode.painLevel}/10</p>
                </div>
              )}
              {episode.referringPhysician && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referring Physician</p>
                  <p className="text-base">{episode.referringPhysician}</p>
                </div>
              )}
              {episode.insurance && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Insurance</p>
                  <p className="text-base">{episode.insurance}</p>
                </div>
              )}
            </div>
            
            {episode.injuryMechanism && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Injury Mechanism</p>
                <p className="text-base">{episode.injuryMechanism}</p>
              </div>
            )}
            
            {episode.medications && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medications</p>
                <p className="text-base whitespace-pre-wrap">{episode.medications}</p>
              </div>
            )}
            
            {episode.medicalHistory && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                <p className="text-base whitespace-pre-wrap">{episode.medicalHistory}</p>
              </div>
            )}
            
            {episode.priorTreatments && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prior Treatments</p>
                <p className="text-base whitespace-pre-wrap">{episode.priorTreatments}</p>
              </div>
            )}
            
            {episode.functionalLimitations && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Functional Limitations</p>
                <p className="text-base whitespace-pre-wrap">{episode.functionalLimitations}</p>
              </div>
            )}
            
            {episode.treatmentGoals && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treatment Goals</p>
                <p className="text-base whitespace-pre-wrap">{episode.treatmentGoals}</p>
              </div>
            )}
          </div>

          {/* Treatment Summary */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Treatment Summary</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {episode.start_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Treatment Start Date</p>
                  <p className="text-base">{episode.start_date}</p>
                </div>
              )}
              {episode.visits && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                  <p className="text-base">{episode.visits}</p>
                </div>
              )}
              {episode.resolution_days && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days to Resolution</p>
                  <p className="text-base">{episode.resolution_days} days</p>
                </div>
              )}
              {episode.compliance_rating && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Rating</p>
                  <p className="text-base">{episode.compliance_rating}</p>
                </div>
              )}
            </div>
            
            {episode.compliance_notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Notes</p>
                <p className="text-base whitespace-pre-wrap">{episode.compliance_notes}</p>
              </div>
            )}
            
            {episode.referred_out && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Referral Status</p>
                <Badge variant="outline" className="mt-1">Referred Out</Badge>
                {episode.referral_reason && (
                  <p className="text-base mt-2">{episode.referral_reason}</p>
                )}
              </div>
            )}
          </div>

          {/* Clinical Findings */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Outcome Measures</h3>
            {results.map((result) => (
              <div key={result.index} className="rounded-lg border bg-card p-4">
                <h4 className="mb-4 font-medium">{result.index}</h4>

                {/* Baseline to Discharge */}
                <div className="mb-4 rounded-md bg-muted/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Baseline → Discharge</p>
                    <Badge
                      className={`clinical-badge text-xs ${
                        result.dischargeStatus === "improving"
                          ? "badge-improving"
                          : result.dischargeStatus === "declining"
                          ? "badge-declining"
                          : "badge-stable"
                      }`}
                    >
                      {result.dischargeStatus.charAt(0).toUpperCase() + result.dischargeStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Baseline</p>
                      <p className="text-base font-semibold">{result.baseline.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discharge</p>
                      <p className="text-base font-semibold">{result.discharge.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Change</p>
                      <p className="text-base font-semibold">
                        {result.dischargeChange > 0 ? "+" : ""}
                        {result.dischargeChange.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">% Change</p>
                      <p className="text-base font-semibold">
                        {result.dischargePercentage > 0 ? "+" : ""}
                        {result.dischargePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 90-Day Follow-up (if available) */}
                {result.hasFollowup && (
                  <div className="rounded-md bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Discharge → 90-Day Follow-up</p>
                      <Badge
                        className={`clinical-badge text-xs ${
                          result.followupStatus === "improving"
                            ? "badge-improving"
                            : result.followupStatus === "declining"
                            ? "badge-declining"
                            : "badge-stable"
                        }`}
                      >
                        {result.followupStatus.charAt(0).toUpperCase() + result.followupStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Discharge</p>
                        <p className="text-base font-semibold">{result.discharge.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">90-Day</p>
                        <p className="text-base font-semibold">{result.followup.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Change</p>
                        <p className="text-base font-semibold">
                          {result.followupChange > 0 ? "+" : ""}
                          {result.followupChange.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">% Change</p>
                        <p className="text-base font-semibold">
                          {result.followupPercentage > 0 ? "+" : ""}
                          {result.followupPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>
              Generated by PPC Outcome Registry v1.0 | Report Date:{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p className="mt-1">
              MCID = Minimal Clinically Important Difference. Changes exceeding MCID thresholds are
              considered clinically significant.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
