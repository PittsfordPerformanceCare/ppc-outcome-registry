import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getEpisode, getOutcomeScores, getFollowup } from "@/lib/dbOperations";
import type { Episode } from "@/lib/dbOperations";
import { calculateMCID } from "@/lib/mcidUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer, AlertCircle, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { useNavigationShortcuts } from "@/hooks/useNavigationShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { format } from "date-fns";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("episode");

  const [episode, setEpisode] = useState<ProcessedEpisode | null>(null);
  const [followup, setFollowup] = useState<FollowupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTextRichFormat, setIsTextRichFormat] = useState(false);

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

  // Enable keyboard shortcuts with print and export handlers
  const { showHelp, setShowHelp } = useNavigationShortcuts({
    onPrint: handlePrint,
    onExport: handleExport,
  });

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

  const results = episode.indices.map((index) => {
    const baseline = episode.baselineScores?.[index] || 0;
    const discharge = episode.dischargeScores?.[index] || 0;
    const followupScore = followup?.scores?.[index] || 0;
    
    const dischargeVsBaseline = calculateMCID(index as any, baseline, discharge);
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
      <KeyboardShortcutsDialog 
        open={showHelp} 
        onOpenChange={setShowHelp}
        additionalShortcuts={[
          { keys: ["P"], description: "Print summary", category: "Actions" },
          { keys: ["E"], description: "Export summary", category: "Actions" },
        ]}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PCP Summary Report</h1>
          <p className="mt-2 text-muted-foreground print:hidden">Primary Care Provider Outcome Summary</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsTextRichFormat(!isTextRichFormat)} 
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {isTextRichFormat ? "Standard" : "Text-Rich"}
          </Button>
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
            <div>
              <CardTitle className="text-xl">
                {isTextRichFormat ? "Comprehensive Narrative Report" : "Patient Outcome Summary"}
              </CardTitle>
              <CardDescription className="mt-1">
                {isTextRichFormat ? "Detailed clinical narrative with supporting data" : "Structured clinical data summary"}
              </CardDescription>
            </div>
            <Badge className="clinical-badge badge-complete">
              {isTextRichFormat ? "Text-Rich Format" : "Standard Format"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {!isTextRichFormat ? (
            <>
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
              <section className="mt-6">
                <h2 className="text-lg font-semibold border-b pb-1 mb-3">Intake Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {episode.dob && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{episode.dob}</p>
                    </div>
                  )}
                  {episode.clinician && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Clinician</p>
                      <p>{episode.clinician}</p>
                    </div>
                  )}
                  {episode.diagnosis && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                      <p>{episode.diagnosis}</p>
                    </div>
                  )}
                  {episode.npi && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NPI</p>
                      <p>{episode.npi}</p>
                    </div>
                  )}
                  {episode.injuryDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Injury Date</p>
                      <p>{episode.injuryDate}</p>
                    </div>
                  )}
                  {episode.injuryMechanism && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Injury Mechanism</p>
                      <p>{episode.injuryMechanism}</p>
                    </div>
                  )}
                  {episode.referringPhysician && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Referring Physician</p>
                      <p>{episode.referringPhysician}</p>
                    </div>
                  )}
                  {episode.insurance && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Insurance</p>
                      <p>{episode.insurance}</p>
                    </div>
                  )}
                  {episode.emergencyContact && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                      <p>{episode.emergencyContact}</p>
                    </div>
                  )}
                  {episode.emergencyPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                      <p>{episode.emergencyPhone}</p>
                    </div>
                  )}
                  {episode.medications && (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Medications</p>
                      <p>{episode.medications}</p>
                    </div>
                  )}
                  {episode.medicalHistory && (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                      <p>{episode.medicalHistory}</p>
                    </div>
                  )}
                  {episode.priorTreatments && (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Prior Treatments</p>
                      <p>{episode.priorTreatments}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Side-by-Side Comparison */}
              <section className="mt-6">
                <h2 className="text-lg font-semibold border-b pb-1 mb-3">Outcome Measures Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border p-3 text-left">Measure</th>
                        <th className="border border-border p-3 text-center">Baseline</th>
                        <th className="border border-border p-3 text-center">Discharge</th>
                        <th className="border border-border p-3 text-center">Change</th>
                        <th className="border border-border p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {episode.painPre !== undefined && episode.painPost !== undefined && (
                        <tr>
                          <td className="border border-border p-3 font-medium">Pain Level (0-10 scale)</td>
                          <td className="border border-border p-3 text-center">{episode.painPre}</td>
                          <td className="border border-border p-3 text-center">{episode.painPost}</td>
                          <td className="border border-border p-3 text-center">
                            {episode.painPre - episode.painPost} point{Math.abs(episode.painPre - episode.painPost) !== 1 ? 's' : ''} reduction
                          </td>
                          <td className="border border-border p-3 text-center">
                            {(episode.painPre - episode.painPost) >= 2 ? 
                              <Badge className="bg-success/15 text-success border-success/30">Clinically Significant</Badge> : 
                              <Badge variant="secondary">Stable</Badge>
                            }
                          </td>
                        </tr>
                      )}
                      
                      {results.filter(r => r.baseline > 0 || r.discharge > 0).map((result, idx) => (
                        <tr key={idx}>
                          <td className="border border-border p-3 font-medium">{result.index}</td>
                          <td className="border border-border p-3 text-center">{result.baseline.toFixed(1)}</td>
                          <td className="border border-border p-3 text-center">{result.discharge.toFixed(1)}</td>
                          <td className="border border-border p-3 text-center">
                            {result.dischargeChange.toFixed(1)} point{Math.abs(result.dischargeChange) !== 1 ? 's' : ''}
                          </td>
                          <td className="border border-border p-3 text-center">
                            {result.dischargeStatus === "improving" ? 
                              <Badge className="bg-success/15 text-success border-success/30">Improved</Badge> : 
                              result.dischargeStatus === "declining" ?
                              <Badge className="bg-destructive/15 text-destructive border-destructive/30">Declined</Badge> :
                              <Badge variant="secondary">Stable</Badge>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pain Level Changes */}
              <section className="mt-6">
                <h2 className="text-lg font-semibold border-b pb-1 mb-3">Pain Level Changes</h2>
                {episode.painPre !== undefined && episode.painPost !== undefined ? (
                  <p>
                    The patient reported a pain level reduction from {episode.painPre}/10 at baseline to {episode.painPost}/10 at discharge, 
                    representing a {((episode.painPre - episode.painPost) / episode.painPre * 100).toFixed(0)}% improvement.
                  </p>
                ) : (
                  <p>No pain level data available.</p>
                )}
              </section>

              {/* Additional standard format sections can be added here as needed */}
            </>
          ) : (
            // Text-Rich Hybrid Format
            <div className="space-y-6">
              {/* Executive Summary */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold border-b pb-2">Executive Summary</h2>
                <p className="text-base leading-relaxed">
                  {episode.patientName} was evaluated and treated for {episode.diagnosis || 'musculoskeletal condition'} affecting the {episode.region.toLowerCase()} region. 
                  The patient presented with {episode.functionalLimitations?.split('\n')[0] || 'pain and functional limitations'} beginning {episode.injuryDate ? `on ${format(new Date(episode.injuryDate), 'MMMM d, yyyy')}` : 'at an unspecified time'}.
                  Treatment commenced on {episode.start_date ? format(new Date(episode.start_date), 'MMMM d, yyyy') : episode.dateOfService} and 
                  {episode.dischargeDate ? ` was completed on ${format(new Date(episode.dischargeDate), 'MMMM d, yyyy')}` : ' is ongoing'}, 
                  totaling {episode.visits || 'multiple'} visits{episode.start_date && episode.dischargeDate ? ` over approximately ${
                    Math.round((new Date(episode.dischargeDate).getTime() - new Date(episode.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
                  } weeks` : ''}.
                </p>
              </section>

              {/* Clinical Presentation */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold border-b pb-2">Clinical Presentation & History</h2>
                <p className="text-base leading-relaxed">
                  Initial assessment revealed a chief complaint of {episode.functionalLimitations?.split('\n')[0] || 'pain and dysfunction'}.
                  The mechanism of injury was reported as {episode.injuryMechanism || 'gradual onset or traumatic event'}. 
                  Patient reported an initial pain level of {episode.painPre || 'N/A'}/10 on a numeric rating scale. 
                  {episode.priorTreatments && 
                    ` Prior to presentation, the patient had received treatment including ${episode.priorTreatments}.`
                  }
                </p>
                
                {episode.functionalLimitations && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Primary Functional Limitations:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      {episode.functionalLimitations.split('\n').map((limitation, idx) => (
                        <li key={idx} className="text-base">{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Treatment Course */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold border-b pb-2">Treatment Course & Interventions</h2>
                <p className="text-base leading-relaxed">
                  Physical therapy was administered by {episode.clinician || 'licensed clinician'} over the course of {episode.visits || 'multiple'} sessions. 
                  The treatment plan was designed to address the patient's specific functional goals{episode.treatmentGoals && episode.treatmentGoals.length > 0 ? ', which included:' : '.'}
                </p>
                
                {episode.treatmentGoals && episode.treatmentGoals.length > 0 && (
                  <div className="mt-3">
                    <ul className="list-disc pl-6 space-y-1">
                      {episode.treatmentGoals.map((goal, idx) => (
                        <li key={idx} className="text-base">{goal.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-base leading-relaxed mt-3">
                  Patient compliance was rated as {episode.compliance_rating || 'good'}.
                  {episode.compliance_notes && ` Clinical notes indicate: ${episode.compliance_notes}`}
                </p>
              </section>

              {/* Outcome Measures Summary */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold border-b pb-2">Functional Outcomes Assessment</h2>
                <p className="text-base leading-relaxed">
                  Standardized outcome measures were utilized to objectively track progress throughout the episode of care. 
                  The following results demonstrate the patient's functional improvement:
                </p>

                {/* Intake vs Discharge Table */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-3">Baseline to Discharge Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border border-border p-3 text-left">Measure</th>
                          <th className="border border-border p-3 text-center">Baseline</th>
                          <th className="border border-border p-3 text-center">Discharge</th>
                          <th className="border border-border p-3 text-center">Change</th>
                          <th className="border border-border p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {episode.painPre !== undefined && episode.painPost !== undefined && (
                          <tr>
                            <td className="border border-border p-3 font-medium">Pain Level (0-10 scale)</td>
                            <td className="border border-border p-3 text-center">{episode.painPre}</td>
                            <td className="border border-border p-3 text-center">{episode.painPost}</td>
                            <td className="border border-border p-3 text-center">
                              {episode.painPre - episode.painPost} point{Math.abs(episode.painPre - episode.painPost) !== 1 ? 's' : ''} reduction
                            </td>
                            <td className="border border-border p-3 text-center">
                              {(episode.painPre - episode.painPost) >= 2 ? 
                                <Badge className="bg-success/15 text-success border-success/30">Clinically Significant</Badge> : 
                                <Badge variant="secondary">Stable</Badge>
                              }
                            </td>
                          </tr>
                        )}
                        
                        {results.filter(r => r.baseline > 0 || r.discharge > 0).map((result, idx) => (
                          <tr key={idx}>
                            <td className="border border-border p-3 font-medium">{result.index}</td>
                            <td className="border border-border p-3 text-center">{result.baseline.toFixed(1)}</td>
                            <td className="border border-border p-3 text-center">{result.discharge.toFixed(1)}</td>
                            <td className="border border-border p-3 text-center">
                              {result.dischargeChange.toFixed(1)} point{Math.abs(result.dischargeChange) !== 1 ? 's' : ''}
                            </td>
                            <td className="border border-border p-3 text-center">
                              {result.dischargeStatus === "improving" ? 
                                <Badge className="bg-success/15 text-success border-success/30">Improved</Badge> : 
                                result.dischargeStatus === "declining" ?
                                <Badge className="bg-destructive/15 text-destructive border-destructive/30">Declined</Badge> :
                                <Badge variant="secondary">Stable</Badge>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-base leading-relaxed mt-4">
                  {results.some(r => r.dischargeStatus === "improving") ? (
                    <>
                      The patient achieved clinically significant improvements in functional status as measured by standardized outcome tools. 
                      These improvements indicate meaningful functional gains that are both statistically and clinically relevant.
                    </>
                  ) : (
                    <>
                      While objective measurements were obtained, changes did not reach clinically significant thresholds at discharge. 
                      Continued monitoring and potential follow-up may be beneficial.
                    </>
                  )}
                </p>
              </section>

              {/* Follow-up Data if Available */}
              {followup && followup.scores && Object.keys(followup.scores).length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold border-b pb-2">90-Day Follow-Up Assessment</h2>
                  <p className="text-base leading-relaxed">
                    Post-discharge follow-up was conducted approximately 90 days after treatment completion to assess long-term functional maintenance. 
                    Results demonstrate {results.some(r => r.hasFollowup && r.followupStatus === "improving") ? 
                      'sustained or continued improvement in functional status' : 
                      'stable functional status'
                    }.
                  </p>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-3">Discharge to Follow-Up Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="border border-border p-3 text-left">Measure</th>
                            <th className="border border-border p-3 text-center">Discharge</th>
                            <th className="border border-border p-3 text-center">90-Day Follow-Up</th>
                            <th className="border border-border p-3 text-center">Change</th>
                            <th className="border border-border p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.filter(r => r.hasFollowup).map((result, idx) => (
                            <tr key={idx}>
                              <td className="border border-border p-3 font-medium">{result.index}</td>
                              <td className="border border-border p-3 text-center">{result.discharge.toFixed(1)}</td>
                              <td className="border border-border p-3 text-center">{result.followup.toFixed(1)}</td>
                              <td className="border border-border p-3 text-center">
                                {result.followupChange.toFixed(1)} point{Math.abs(result.followupChange) !== 1 ? 's' : ''}
                              </td>
                              <td className="border border-border p-3 text-center">
                                {result.followupStatus === "improving" ? 
                                  <Badge className="bg-success/15 text-success border-success/30">Continued Improvement</Badge> : 
                                  <Badge variant="outline">Maintained</Badge>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Clinical Summary & Recommendations */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold border-b pb-2">Clinical Summary & Recommendations</h2>
                <p className="text-base leading-relaxed">
                  {episode.patientName} successfully completed a course of physical therapy for {episode.diagnosis || 'their condition'} with 
                  {results.some(r => r.dischargeStatus === "improving") ? 
                    ' clinically significant functional improvements documented through standardized outcome measures' : 
                    ' documented improvements in functional status'
                  }. 
                  The patient demonstrated {episode.compliance_rating || 'good'} compliance with the prescribed treatment plan and home exercise program.
                </p>
                
                <p className="text-base leading-relaxed">
                  At discharge, the patient reported a pain level of {episode.painPost || 'N/A'}/10{episode.painPre && episode.painPost ? 
                    `, representing a ${((episode.painPre - episode.painPost) / episode.painPre * 100).toFixed(0)}% reduction from baseline` : 
                    ''
                  }. 
                  {results.some(r => r.dischargeStatus === "improving") && 
                    ' Achievement of functional improvements confirms that changes are clinically meaningful to the patient.'
                  }
                </p>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li className="text-base">Continue home exercise program as prescribed</li>
                    <li className="text-base">Monitor for any recurrence of symptoms</li>
                    <li className="text-base">Return to physical therapy if symptoms worsen or functional decline is noted</li>
                    <li className="text-base">Consider prophylactic measures to prevent re-injury</li>
                    {followup && followup.scores && Object.keys(followup.scores).length > 0 && (
                      <li className="text-base">90-day follow-up completed with {results.some(r => r.hasFollowup && r.followupStatus === "improving") ? 'continued' : 'maintained'} functional status</li>
                    )}
                  </ul>
                </div>
              </section>

              {/* Provider Information */}
              <section className="space-y-2 text-sm">
                <p className="font-semibold">Treating Clinician:</p>
                <p>{episode.clinician || 'Not specified'}</p>
                {episode.npi && <p>NPI: {episode.npi}</p>}
                {episode.start_date && (
                  <p>Treatment Period: {format(new Date(episode.start_date), 'MMM d, yyyy')} - {episode.dischargeDate ? format(new Date(episode.dischargeDate), 'MMM d, yyyy') : 'Ongoing'}</p>
                )}
              </section>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t text-center text-sm text-muted-foreground space-y-2">
            <p>Report generated on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
            <p className="text-xs">
              This summary documents functional outcomes and clinical progress for primary care provider reference.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
