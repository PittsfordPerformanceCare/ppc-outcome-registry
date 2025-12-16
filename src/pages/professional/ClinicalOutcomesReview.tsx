import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useProfessionalAccess } from "@/hooks/useProfessionalAccess";
import { useTraumaHistory } from "@/hooks/useTraumaHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Calendar, Stethoscope, Activity, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { CareStatusDisplay } from "@/components/CareStatusDisplay";
import { TraumaHistorySummary } from "@/components/professional-portal";

interface EpisodeData {
  id: string;
  patient_name: string;
  region: string;
  diagnosis: string | null;
  start_date: string | null;
  discharge_date: string | null;
  clinician: string | null;
  current_status: string | null;
}

interface OutcomeScore {
  id: string;
  index_type: string;
  score_type: string;
  score: number;
  recorded_at: string;
}

// Map region to primary outcome measure
function getPrimaryMeasure(region: string): string {
  const regionLower = region?.toLowerCase() || "";
  if (regionLower.includes("brain") || regionLower.includes("head") || regionLower.includes("concussion")) {
    return "RPQ";
  }
  if (regionLower.includes("neck") || regionLower.includes("cervical")) {
    return "NDI";
  }
  if (regionLower.includes("back") || regionLower.includes("lumbar") || regionLower.includes("spine")) {
    return "ODI";
  }
  if (regionLower.includes("shoulder") || regionLower.includes("arm") || regionLower.includes("hand") || regionLower.includes("upper")) {
    return "QuickDASH";
  }
  if (regionLower.includes("leg") || regionLower.includes("knee") || regionLower.includes("ankle") || regionLower.includes("hip") || regionLower.includes("lower extremity")) {
    return "LEFS";
  }
  return "NDI"; // Default
}

// Get MCID threshold for measure
function getMCIDThreshold(measure: string): number {
  const thresholds: Record<string, number> = {
    NDI: 7.5,
    ODI: 6,
    QuickDASH: 10,
    LEFS: 9,
    RPQ: 8,
  };
  return thresholds[measure] || 7;
}

// Get condition cluster from region
function getConditionCluster(region: string): string {
  const regionLower = region?.toLowerCase() || "";
  if (regionLower.includes("brain") || regionLower.includes("head") || regionLower.includes("concussion")) {
    return "Concussion";
  }
  if (regionLower.includes("performance") || regionLower.includes("athlete")) {
    return "Performance";
  }
  return "Musculoskeletal";
}

// Get episode phase
function getEpisodePhase(startDate: string | null, dischargeDate: string | null): string {
  if (dischargeDate) return "Return to Function";
  if (!startDate) return "Acute";
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceStart <= 14) return "Acute";
  if (daysSinceStart <= 42) return "Subacute";
  return "Return to Function";
}

// Get patient initials
function getPatientInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ClinicalOutcomesReview() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const { isVerifiedProfessional, isAuthenticated, loading: accessLoading } = useProfessionalAccess();
  const { data: traumaData } = useTraumaHistory(episodeId);
  
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [scores, setScores] = useState<OutcomeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!episodeId || !isAuthenticated) return;
      
      try {
        setLoading(true);
        
        // Check if professional has access to this episode
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          return;
        }

        const { data: accessData, error: accessError } = await supabase
          .from("professional_shared_episodes")
          .select("id")
          .eq("professional_user_id", user.id)
          .eq("episode_id", episodeId)
          .maybeSingle();

        if (accessError || !accessData) {
          setError("You do not have access to view this episode.");
          return;
        }

        // Fetch episode data
        const { data: episodeData, error: episodeError } = await supabase
          .from("episodes")
          .select("id, patient_name, region, diagnosis, start_date, discharge_date, clinician, current_status")
          .eq("id", episodeId)
          .maybeSingle();

        if (episodeError || !episodeData) {
          setError("Episode not found.");
          return;
        }

        setEpisode(episodeData);

        // Fetch outcome scores
        const { data: scoresData } = await supabase
          .from("outcome_scores")
          .select("id, index_type, score_type, score, recorded_at")
          .eq("episode_id", episodeId)
          .order("recorded_at", { ascending: true });

        setScores(scoresData || []);
      } catch (err) {
        setError("An error occurred while loading the case summary.");
      } finally {
        setLoading(false);
      }
    }

    if (!accessLoading && isAuthenticated) {
      fetchData();
    }
  }, [episodeId, isAuthenticated, accessLoading]);

  // Redirect if not authenticated or not a verified professional
  useEffect(() => {
    if (!accessLoading && !isAuthenticated) {
      navigate("/auth");
    } else if (!accessLoading && isAuthenticated && !isVerifiedProfessional) {
      navigate("/resources/professional-outcomes");
    }
  }, [accessLoading, isAuthenticated, isVerifiedProfessional, navigate]);

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-amber-900 mb-2">Access Restricted</h2>
              <p className="text-amber-700">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!episode) return null;

  const primaryMeasure = getPrimaryMeasure(episode.region);
  const mcidThreshold = getMCIDThreshold(primaryMeasure);
  const conditionCluster = getConditionCluster(episode.region);
  const episodePhase = getEpisodePhase(episode.start_date, episode.discharge_date);
  const patientInitials = getPatientInitials(episode.patient_name);

  // Get primary measure scores
  const primaryScores = scores.filter((s) => s.index_type === primaryMeasure);
  const baselineScore = primaryScores.find((s) => s.score_type === "baseline");
  const latestScore = primaryScores.filter((s) => s.score_type !== "baseline").pop();
  
  const absoluteChange = baselineScore && latestScore 
    ? Math.round((baselineScore.score - latestScore.score) * 10) / 10 
    : null;

  // Determine MCID status
  let mcidStatus = "Below threshold";
  if (absoluteChange !== null) {
    if (absoluteChange >= mcidThreshold) {
      mcidStatus = "Clinically meaningful improvement achieved";
    } else if (absoluteChange >= mcidThreshold * 0.7) {
      mcidStatus = "Approaching threshold";
    }
  }

  // Determine trajectory signal
  let trajectorySignal = "Improving as expected";
  let trajectoryInterpretation = "Recovery trajectory is progressing within expected parameters for this condition and phase of care.";
  
  if (primaryScores.length >= 3) {
    const recentScores = primaryScores.slice(-3).map((s) => s.score);
    const isDecreasing = recentScores.every((s, i) => i === 0 || s <= recentScores[i - 1]);
    const isFlat = recentScores.every((s) => Math.abs(s - recentScores[0]) < 2);
    
    if (isFlat && !isDecreasing) {
      trajectorySignal = "Plateau risk identified";
      trajectoryInterpretation = "Recent outcome measures indicate a potential plateau in recovery progress.";
    }
  }

  // Clinical direction
  const clinicalDirection = absoluteChange && absoluteChange >= mcidThreshold
    ? "Progress consistent with current plan of care"
    : latestScore
    ? "Monitoring recovery trajectory"
    : "Awaiting follow up assessment";

  // Unique measures tracked
  const measuresTracked = [...new Set(scores.map((s) => s.index_type))];
  const lastEntryDate = scores.length > 0 
    ? format(new Date(scores[scores.length - 1].recorded_at), "MMM d, yyyy")
    : null;

  return (
    <>
      <Helmet>
        <title>Clinical Outcomes Review | PPC</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-slate-900">
            Clinical Outcomes Review
          </h1>
          
          {/* Introductory Framing */}
          <p className="text-slate-600 leading-relaxed">
            This review provides patient-specific, episode-level progress and outcome summaries for shared patients to support coordinated clinical decision-making. Outcome data informs clinical reassessment and shared discussion, guided by clinical judgment and patient response.
          </p>

          {/* Section 1: Case Context */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <User className="h-4 w-4" />
                Case Context
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Patient Identifier</p>
                <p className="text-lg font-semibold text-slate-900">{patientInitials}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Condition Cluster</p>
                <p className="text-lg font-semibold text-slate-900">{conditionCluster}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Episode Phase</p>
                <p className="text-lg font-semibold text-slate-900">{episodePhase}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Treating Clinician</p>
                <p className="text-lg font-semibold text-slate-900">{episode.clinician || "Assigned"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">Episode Start Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {episode.start_date ? format(new Date(episode.start_date), "MMMM d, yyyy") : "Pending"}
                </p>
              </div>
              {episodeId && <CareStatusDisplay episodeId={episodeId} />}
            </CardContent>
          </Card>

          {/* Relevant Trauma History */}
          {traumaData.hasTraumaHistory && (
            <Card className="border-slate-200">
              <CardContent className="py-4">
                <TraumaHistorySummary 
                  hasTraumaHistory={traumaData.hasTraumaHistory} 
                  traumaHistoryItems={traumaData.traumaHistoryItems} 
                />
              </CardContent>
            </Card>
          )}

          {/* Section 2: Outcome Signal */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Outcome Signal ({primaryMeasure})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {baselineScore ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Baseline</p>
                      <p className="text-2xl font-semibold text-slate-900">{baselineScore.score}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Most Recent</p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {latestScore ? latestScore.score : "—"}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Change</p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {absoluteChange !== null ? `${absoluteChange > 0 ? "+" : ""}${absoluteChange}` : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">MCID Status:</span> {mcidStatus}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Minimal Clinically Important Difference threshold: {mcidThreshold} points
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Baseline assessment not yet recorded.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Trajectory Signal */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Trajectory Signal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-base font-medium text-slate-900 mb-2">{trajectorySignal}</p>
                <p className="text-sm text-slate-600">{trajectoryInterpretation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Clinical Direction */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Clinical Direction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-slate-700">{clinicalDirection}</p>
            </CardContent>
          </Card>

          {/* Section 5: Episode Snapshot (Collapsed) */}
          <Collapsible open={snapshotOpen} onOpenChange={setSnapshotOpen}>
            <Card className="border-slate-200">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Episode Snapshot
                  </CardTitle>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${snapshotOpen ? "rotate-180" : ""}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div>
                    <p className="text-xs text-slate-500">Outcome Measures Tracked</p>
                    <p className="text-sm text-slate-900">
                      {measuresTracked.length > 0 ? measuresTracked.join(", ") : "None recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last Outcome Entry</p>
                    <p className="text-sm text-slate-900">{lastEntryDate || "No entries"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Episode Status</p>
                    <p className="text-sm text-slate-900">
                      {episode.discharge_date ? "Completed" : "Active"}
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 6: Governance Footer */}
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
            <p className="text-xs text-slate-500 leading-relaxed">
              This Clinical Outcomes Review reflects longitudinal outcome tracking within the current 
              episode of care and is intended to support coordinated clinical decision making. It does 
              not replace independent clinical judgment.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
