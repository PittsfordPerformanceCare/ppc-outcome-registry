import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getEpisode, getOutcomeScores, getFollowup } from "@/lib/dbOperations";
import type { Episode } from "@/lib/dbOperations";
import { calculateMCID } from "@/lib/mcidUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PPC_CONFIG } from "@/lib/ppcConfig";

interface OutcomeScore {
  index_type: string;
  score_type: string;
  score: number;
}

interface ProcessedEpisode {
  episodeId: string;
  patientName: string;
  region: string;
  dateOfService: string;
  dob?: string;
  clinician?: string;
  diagnosis?: string;
  npi?: string;
  indices: string[];
  baselineScores?: Record<string, number>;
  dischargeScores?: Record<string, number>;
  followupScores?: Record<string, number>;
  dischargeDate?: string;
  injuryDate?: string;
  injuryMechanism?: string;
  painLevel?: string;
  painPre?: number;
  painPost?: number;
  painDelta?: number;
  referringPhysician?: string;
  insurance?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medications?: string;
  medicalHistory?: string;
  priorTreatments?: string;
  functionalLimitations?: string;
  treatmentGoals?: Array<{
    name: string;
    result?: string;
    priority?: number;
    timeframe_weeks?: number;
    notes?: string;
  }>;
  start_date?: string;
  visits?: string;
  resolution_days?: string;
  compliance_rating?: string;
  compliance_notes?: string;
  referred_out?: boolean;
  referral_reason?: string;
}

interface FollowupData {
  scheduledDate?: string;
  completedDate?: string;
  status?: string;
  scores?: Record<string, number>;
}

export default function PCPSummary() {
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("episodeId");

  const [episode, setEpisode] = useState<ProcessedEpisode | null>(null);
  const [followup, setFollowup] = useState<FollowupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (episodeId) {
      loadEpisodeData();
    }
  }, [episodeId]);

  const loadEpisodeData = async () => {
    if (!episodeId) return;
    
    setLoading(true);
    try {
      // Fetch episode data
      const episodeData = await getEpisode(episodeId);
      if (!episodeData) {
        setLoading(false);
        return;
      }

      // Fetch outcome scores
      const scores = await getOutcomeScores(episodeId);
      
      // Process scores into baseline, discharge, and followup
      const baselineScores: Record<string, number> = {};
      const dischargeScores: Record<string, number> = {};
      const followupScores: Record<string, number> = {};
      
      scores.forEach((score: OutcomeScore) => {
        if (score.score_type === "baseline") {
          baselineScores[score.index_type] = score.score;
        } else if (score.score_type === "discharge") {
          dischargeScores[score.index_type] = score.score;
        } else if (score.score_type === "followup") {
          followupScores[score.index_type] = score.score;
        }
      });

      // Get indices for the region
      const indices = PPC_CONFIG.regionToIndices(episodeData.region);

      // Process episode data
      const processedEpisode: ProcessedEpisode = {
        episodeId: episodeData.id,
        patientName: episodeData.patient_name,
        region: episodeData.region,
        dateOfService: episodeData.date_of_service,
        dob: episodeData.date_of_birth || undefined,
        clinician: episodeData.clinician || undefined,
        diagnosis: episodeData.diagnosis || undefined,
        npi: episodeData.npi || undefined,
        indices,
        baselineScores,
        dischargeScores,
        followupScores: Object.keys(followupScores).length > 0 ? followupScores : undefined,
        dischargeDate: episodeData.discharge_date || undefined,
        injuryDate: episodeData.injury_date || undefined,
        injuryMechanism: episodeData.injury_mechanism || undefined,
        painLevel: episodeData.pain_level || undefined,
        painPre: episodeData.pain_pre || undefined,
        painPost: episodeData.pain_post || undefined,
        painDelta: episodeData.pain_delta || undefined,
        referringPhysician: episodeData.referring_physician || undefined,
        insurance: episodeData.insurance || undefined,
        emergencyContact: episodeData.emergency_contact || undefined,
        emergencyPhone: episodeData.emergency_phone || undefined,
        medications: episodeData.medications || undefined,
        medicalHistory: episodeData.medical_history || undefined,
        priorTreatments: episodeData.prior_treatments_other || undefined,
        functionalLimitations: episodeData.functional_limitations?.join("\n") || undefined,
        treatmentGoals: episodeData.treatment_goals as any || undefined,
        start_date: episodeData.start_date || undefined,
        visits: episodeData.visits || undefined,
        resolution_days: episodeData.resolution_days || undefined,
        compliance_rating: episodeData.compliance_rating || undefined,
        compliance_notes: episodeData.compliance_notes || undefined,
        referred_out: episodeData.referred_out || false,
        referral_reason: episodeData.referral_reason || undefined,
      };

      setEpisode(processedEpisode);

      // Fetch followup data if exists
      const followupData = await getFollowup(episodeId);
      if (followupData) {
        setFollowup({
          scheduledDate: followupData.scheduled_date,
          completedDate: followupData.completed_date || undefined,
          status: followupData.status || undefined,
          scores: Object.keys(followupScores).length > 0 ? followupScores : undefined,
        });
      }
    } catch (error) {
      console.error("Error loading episode:", error);
      toast.error("Failed to load episode data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading episode data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No episode data available. Please complete a discharge assessment first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("=== PCP Summary: Results Calculation Debug ===");
  console.log("Episode data:", episode);
  console.log("Episode indices:", episode.indices);
  console.log("Baseline scores:", episode.baselineScores);
  console.log("Discharge scores:", episode.dischargeScores);
  console.log("Followup data:", followup);

  const results = episode.indices.map((index) => {
    const baseline = episode.baselineScores?.[index] || 0;
    const discharge = episode.dischargeScores?.[index] || 0;
    const followupScore = followup?.scores?.[index] || 0;
    
    console.log(`Index ${index}: baseline=${baseline}, discharge=${discharge}, followup=${followupScore}`);
    
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
          <p className="mt-2 text-muted-foreground print:hidden">Primary Care Provider Outcome Summary</p>
        </div>
        <div className="flex gap-2 print:hidden">
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
          </div>

          {/* Pain Level Changes */}
          {(episode.painPre !== undefined || episode.painPost !== undefined) && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Pain Level Changes</h3>
              <div className="rounded-lg border bg-card p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {episode.painPre !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Initial Pain Level</p>
                      <p className="text-2xl font-bold">{episode.painPre}/10</p>
                    </div>
                  )}
                  {episode.painPost !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Discharge Pain Level</p>
                      <p className="text-2xl font-bold">{episode.painPost}/10</p>
                    </div>
                  )}
                  {episode.painPre !== undefined && episode.painPost !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Change</p>
                      <p className="text-2xl font-bold text-success">
                        {episode.painPre - episode.painPost} points
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {((episode.painPre - episode.painPost) / episode.painPre * 100).toFixed(0)}% reduction
                      </p>
                    </div>
                  )}
                </div>
                {episode.painPre !== undefined && episode.painPost !== undefined && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Clinical Interpretation</p>
                    <p className="text-base">
                      {(() => {
                        const reduction = episode.painPre - episode.painPost;
                        const percentReduction = (reduction / episode.painPre * 100).toFixed(0);
                        
                        if (episode.painPost === 0) {
                          return `Patient achieved complete pain resolution, demonstrating a ${reduction}-point reduction from the initial pain rating of ${episode.painPre}/10. This represents a 100% improvement and indicates excellent treatment response with full symptom resolution.`;
                        } else if (reduction >= 5) {
                          return `Patient experienced substantial pain reduction of ${reduction} points (${percentReduction}% improvement), decreasing from ${episode.painPre}/10 at intake to ${episode.painPost}/10 at discharge. This clinically significant improvement indicates highly effective pain management and strong treatment response.`;
                        } else if (reduction >= 3) {
                          return `Patient demonstrated significant pain improvement with a ${reduction}-point reduction (${percentReduction}% improvement), progressing from ${episode.painPre}/10 to ${episode.painPost}/10. This represents a meaningful clinical improvement that typically correlates with enhanced function and quality of life.`;
                        } else if (reduction >= 2) {
                          return `Patient showed moderate pain reduction of ${reduction} points (${percentReduction}% improvement). Pain decreased from ${episode.painPre}/10 at intake to ${episode.painPost}/10 at discharge. While this represents positive progress, the patient may benefit from continued pain management strategies.`;
                        } else if (reduction >= 1) {
                          return `Patient reported mild pain reduction of ${reduction} point(s) (${percentReduction}% improvement), with pain levels decreasing from ${episode.painPre}/10 to ${episode.painPost}/10. This modest improvement suggests partial treatment response; additional interventions may be warranted.`;
                        } else if (reduction === 0) {
                          return `Pain levels remained stable at ${episode.painPre}/10 throughout treatment. The absence of improvement may indicate a need for treatment plan modification or consideration of alternative therapeutic approaches.`;
                        } else {
                          return `Pain levels increased by ${Math.abs(reduction)} point(s) from ${episode.painPre}/10 to ${episode.painPost}/10 during treatment. This finding warrants clinical attention and may require further diagnostic evaluation or treatment plan reassessment.`;
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Functional Improvement Summary */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Functional Improvement Summary</h3>
            {results.length > 0 && (episode.baselineScores && Object.keys(episode.baselineScores).length > 0) && (episode.dischargeScores && Object.keys(episode.dischargeScores).length > 0) ? (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                {results.map((result) => {
                  if (result.baseline === 0 && result.discharge === 0) return null;
                  
                  const improvement = result.baseline - result.discharge;
                  const percentChange = Math.abs(result.dischargePercentage);
                  
                  return (
                    <div key={result.index} className="pb-3 border-b last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{result.index}</p>
                        <Badge
                          className={`clinical-badge text-xs ${
                            result.dischargeStatus === "improving"
                              ? "badge-improving"
                              : result.dischargeStatus === "declining"
                              ? "badge-declining"
                              : "badge-stable"
                          }`}
                        >
                          {result.dischargeStatus === "improving" ? "Improved" : 
                           result.dischargeStatus === "declining" ? "Declined" : "Stable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {improvement > 0 ? (
                          <>Patient demonstrated a {improvement.toFixed(1)}-point improvement ({percentChange.toFixed(0)}% change), 
                          indicating {percentChange >= 50 ? "substantial" : percentChange >= 30 ? "significant" : "moderate"} functional gains 
                          in this domain.</>
                        ) : improvement < 0 ? (
                          <>Scores indicate a {Math.abs(improvement).toFixed(1)}-point decline, suggesting potential areas for continued monitoring.</>
                        ) : (
                          <>Scores remained stable with no significant change from baseline.</>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Complete baseline and discharge assessments to view functional improvement analysis.
              </div>
            )}
          </div>

          {/* Treatment Goals Assessment */}
          {episode.treatmentGoals && episode.treatmentGoals.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Treatment Goals Assessment</h3>
              <div className="space-y-3">
                {episode.treatmentGoals.map((goal, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{goal.name}</p>
                        {goal.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.notes}</p>
                        )}
                      </div>
                      <Badge
                        className={`ml-2 ${
                          goal.result === "achieved"
                            ? "bg-success/15 text-success border-success/30"
                            : goal.result === "partial"
                            ? "bg-warning/15 text-warning border-warning/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {goal.result === "achieved" ? "✓ Achieved" :
                         goal.result === "partial" ? "◐ Partially Achieved" :
                         "○ In Progress"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {goal.result === "achieved" ? (
                        <>Patient successfully met this treatment objective within the established timeframe.</>
                      ) : goal.result === "partial" ? (
                        <>Patient made progress toward this goal but did not fully achieve the target outcome. Continued therapeutic intervention may be beneficial.</>
                      ) : (
                        <>This goal remains an active treatment target.</>
                      )}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-2">Overall Goal Achievement</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const achieved = episode.treatmentGoals.filter(g => g.result === "achieved").length;
                      const partial = episode.treatmentGoals.filter(g => g.result === "partial").length;
                      const total = episode.treatmentGoals.length;
                      const percentage = ((achieved + partial * 0.5) / total * 100).toFixed(0);
                      
                      return (
                        <>Patient achieved {achieved} of {total} treatment goals ({percentage}% success rate).
                        {partial > 0 && ` ${partial} goal(s) were partially met.`}
                        {achieved === total ? " Excellent treatment outcomes with all goals successfully achieved." :
                         parseInt(percentage) >= 70 ? " Good overall progress with majority of goals met." :
                         parseInt(percentage) >= 50 ? " Moderate progress toward treatment objectives." :
                         " Patient may benefit from continued care or alternative treatment approaches."}
                        </>
                      );
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

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
            
            {(!episode.baselineScores || Object.keys(episode.baselineScores).length === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Missing Baseline Scores</p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      No baseline scores were recorded for this episode. Baseline scores must be entered when creating a new episode.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {(!episode.dischargeScores || Object.keys(episode.dischargeScores).length === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Missing Discharge Scores</p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      No discharge scores were recorded for this episode. Complete the discharge assessment with outcome measures.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result) => (
              <div key={result.index} className="rounded-lg border bg-card p-4">
                <h4 className="mb-4 font-medium">{result.index}</h4>

                {/* Baseline to Discharge */}
                {result.baseline > 0 || result.discharge > 0 ? (
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
                ) : (
                  <div className="mb-4 rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                    No baseline or discharge scores available for this index
                  </div>
                )}

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
