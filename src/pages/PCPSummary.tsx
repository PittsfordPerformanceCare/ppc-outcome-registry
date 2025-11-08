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

  const handleExport = () => {
    if (!episode || !followup) return;

    const summary = {
      patient: episode.patientName,
      episodeId: episode.episodeId,
      region: episode.region,
      dateOfService: episode.dateOfService,
      followupDate: followup.completedDate,
      status: followup.status,
      results: episode.indices.map((index) => {
        const baseline = episode.baselineScores?.[index] || 0;
        const followupScore = followup.scores?.[index] || 0;
        const mcid = calculateMCID(index as any, baseline, followupScore);
        return {
          index,
          baseline,
          followup: followupScore,
          change: mcid.change,
          percentage: mcid.percentage,
          status: mcid.status,
          clinicallySignificant: mcid.isClinicallySignificant,
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

  if (!episode || !followup) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No follow-up data available. Please complete a follow-up assessment first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const results = episode.indices.map((index) => {
    const baseline = episode.baselineScores?.[index] || 0;
    const followupScore = followup.scores?.[index] || 0;
    return {
      index,
      ...calculateMCID(index as any, baseline, followupScore),
      baseline,
      followup: followupScore,
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
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Service</p>
              <p className="text-lg">{episode.dateOfService}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Follow-up Date</p>
              <p className="text-lg">{followup.completedDate}</p>
            </div>
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
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">{result.index}</h4>
                  <Badge
                    className={`clinical-badge ${
                      result.status === "improving"
                        ? "badge-improving"
                        : result.status === "declining"
                        ? "badge-declining"
                        : "badge-stable"
                    }`}
                  >
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Baseline</p>
                    <p className="text-lg font-semibold">{result.baseline.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Discharge</p>
                    <p className="text-lg font-semibold">{result.followup.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className="text-lg font-semibold">
                      {result.change > 0 ? "+" : ""}
                      {result.change.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">% Change</p>
                    <p className="text-lg font-semibold">
                      {result.percentage > 0 ? "+" : ""}
                      {result.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {result.isClinicallySignificant && (
                  <div className="mt-3 rounded-md bg-success/10 px-3 py-2">
                    <p className="text-xs font-medium text-success">
                      ✓ Clinically significant change (MCID: {result.mcidThreshold})
                    </p>
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
