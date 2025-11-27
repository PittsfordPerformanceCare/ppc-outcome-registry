import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getEpisode, getOutcomeScores, getFollowup } from "@/lib/dbOperations";
import { supabase } from "@/integrations/supabase/client";
import { calculatePatientJourney } from "@/lib/journeyMilestones";
import { calculateMCIDSummary } from "@/lib/mcidTracking";
import { PatientJourneyTimeline } from "@/components/PatientJourneyTimeline";
import { MCIDSummaryCard } from "@/components/MCIDSummaryCard";
import { MCIDAchievementCard } from "@/components/MCIDAchievementCard";
import { MCIDReportDialog } from "@/components/MCIDReportDialog";
import { PatientAccessManager } from "@/components/PatientAccessManager";
import { NeuroExamDisplay } from "@/components/NeuroExamDisplay";
import { NeuroExamComparison } from "@/components/NeuroExamComparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigationShortcuts } from "@/hooks/useNavigationShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Activity,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Printer,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { getMCIDThreshold } from "@/lib/mcidUtils";
import { toast } from "sonner";

interface ProcessedEpisode {
  episodeId: string;
  patientName: string;
  region: string;
  dateOfService: string;
  dob?: string;
  clinician?: string;
  npi?: string;
  diagnosis?: string;
  injuryDate?: string;
  injuryMechanism?: string;
  painLevel?: string;
  functional_limitations?: string[];
  prior_treatments?: Array<{ name: string; result?: string }>;
  goals?: Array<{ name: string; notes?: string; result?: string; priority?: string; timeframe_weeks?: number }>;
  dischargeDate?: string;
  baselineScores?: Record<string, number>;
  dischargeScores?: Record<string, number>;
  visits?: string;
  compliance_rating?: string;
  compliance_notes?: string;
  referred_out?: boolean;
  referral_reason?: string;
  episode_type?: string;
}

interface FollowupData {
  scheduledDate: string;
  completedDate?: string;
  status?: string;
  scores?: Record<string, number>;
}

export default function EpisodeSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("id");
  const [episode, setEpisode] = useState<ProcessedEpisode | null>(null);
  const [followup, setFollowup] = useState<FollowupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<ReturnType<typeof calculatePatientJourney> | null>(null);
  const [baselineExam, setBaselineExam] = useState<any | null>(null);
  const [finalExam, setFinalExam] = useState<any | null>(null);

  useEffect(() => {
    const loadEpisodeData = async () => {
      if (!episodeId) {
        setLoading(false);
        return;
      }

      try {
        const [episodeData, scoresData, followupData] = await Promise.all([
          getEpisode(episodeId),
          getOutcomeScores(episodeId),
          getFollowup(episodeId)
        ]);

        if (!episodeData) {
          setEpisode(null);
          setLoading(false);
          return;
        }

        // Fetch intake form and all followups for journey tracking
        const { data: intakeForm } = await supabase
          .from('intake_forms')
          .select('*')
          .eq('converted_to_episode_id', episodeId)
          .maybeSingle();

        const { data: allFollowups } = await supabase
          .from('followups')
          .select('*')
          .eq('episode_id', episodeId)
          .order('scheduled_date', { ascending: true });

        // Process baseline and discharge scores
        const baselineScores: Record<string, number> = {};
        const dischargeScores: Record<string, number> = {};
        const followupScores: Record<string, number> = {};

        scoresData?.forEach(score => {
          if (score.score_type === 'baseline') {
            baselineScores[score.index_type] = score.score;
          } else if (score.score_type === 'discharge') {
            dischargeScores[score.index_type] = score.score;
          } else if (score.score_type === 'followup') {
            followupScores[score.index_type] = score.score;
          }
        });

        const processedEpisode: ProcessedEpisode = {
          episodeId: episodeData.id,
          patientName: episodeData.patient_name,
          region: episodeData.region,
          dateOfService: episodeData.date_of_service,
          dob: episodeData.date_of_birth || undefined,
          clinician: episodeData.clinician || undefined,
          npi: episodeData.npi || undefined,
          diagnosis: episodeData.diagnosis || undefined,
          injuryDate: episodeData.injury_date || undefined,
          injuryMechanism: episodeData.injury_mechanism || undefined,
          painLevel: episodeData.pain_level || undefined,
          functional_limitations: episodeData.functional_limitations || undefined,
          prior_treatments: episodeData.prior_treatments as any || undefined,
          goals: episodeData.treatment_goals as any || undefined,
          dischargeDate: episodeData.discharge_date || undefined,
          baselineScores,
          dischargeScores,
          visits: episodeData.visits || undefined,
          compliance_rating: episodeData.compliance_rating || undefined,
          compliance_notes: episodeData.compliance_notes || undefined,
          referred_out: episodeData.referred_out || undefined,
          referral_reason: episodeData.referral_reason || undefined,
          episode_type: episodeData.episode_type || undefined
        };

        setEpisode(processedEpisode);
        
        // Fetch neuro exams if this is a Neurology episode
        if (episodeData.episode_type === 'Neurology') {
          const { data: neuroExams } = await supabase
            .from('neurologic_exams')
            .select('*')
            .eq('episode_id', episodeId)
            .order('exam_date', { ascending: true });
          
          if (neuroExams && neuroExams.length > 0) {
            const baseline = neuroExams.find(e => e.exam_type === 'baseline');
            const final = neuroExams.find(e => e.exam_type === 'final');
            
            setBaselineExam(baseline || null);
            setFinalExam(final || null);
          }
        }

        // Calculate patient journey
        const patientJourney = calculatePatientJourney(
          episodeData,
          intakeForm || undefined,
          allFollowups || [],
          scoresData || []
        );
        setJourney(patientJourney);

        if (followupData) {
          setFollowup({
            scheduledDate: followupData.scheduled_date,
            completedDate: followupData.completed_date || undefined,
            status: followupData.status || undefined,
            scores: Object.keys(followupScores).length > 0 ? followupScores : undefined
          });
        }
      } catch (error) {
        console.error("Error loading episode data:", error);
        setEpisode(null);
      } finally {
        setLoading(false);
      }
    };

    loadEpisodeData();
  }, [episodeId]);

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  // Enable keyboard shortcuts with print handler
  const { showHelp, setShowHelp } = useNavigationShortcuts({
    onPrint: handlePrint,
  });

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading episode...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Episode not found</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = !!episode.dischargeDate;
  const hasFollowup = !!followup;

  // Calculate improvement percentages
  const calculateImprovement = (baseline?: number, discharge?: number) => {
    if (baseline == null || discharge == null || baseline === 0) return null;
    return ((baseline - discharge) / baseline) * 100;
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      improving: { label: "Improving", className: "badge-improving" },
      stable: { label: "Stable", className: "badge-stable" },
      declining: { label: "Declining", className: "badge-declining" },
    };
    const variant = status ? variants[status] : null;
    return variant ? (
      <Badge className={variant.className}>{variant.label}</Badge>
    ) : null;
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-8">
      <KeyboardShortcutsDialog 
        open={showHelp} 
        onOpenChange={setShowHelp}
        additionalShortcuts={[
          { keys: ["P"], description: "Print summary", category: "Actions" },
        ]}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Episode Summary</h1>
          <p className="text-muted-foreground print:hidden">Complete patient journey and outcomes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 print:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2 print:hidden">
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/neuro-exam?episode=${episodeId}`)} 
            className="gap-2 print:hidden"
          >
            <Activity className="h-4 w-4" />
            Neuro Exam
          </Button>
          {isCompleted && episode.baselineScores && episode.dischargeScores && (
            <MCIDReportDialog
              patientName={episode.patientName}
              dateOfBirth={episode.dob}
              region={episode.region}
              diagnosis={episode.diagnosis}
              startDate={episode.dateOfService}
              dischargeDate={episode.dischargeDate!}
              clinicianName={episode.clinician}
              clinicianNPI={episode.npi}
              referringPhysician={episode.diagnosis}
              summary={calculateMCIDSummary(episode.baselineScores, episode.dischargeScores)}
              daysInCare={Math.floor(
                (new Date(episode.dischargeDate!).getTime() - new Date(episode.dateOfService).getTime()) / 
                (1000 * 60 * 60 * 24)
              )}
            />
          )}
          <Button onClick={handlePrint} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {isCompleted ? (
            <Badge className="bg-success/15 text-success border-success/30 h-8 px-4">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="h-8 px-4">
              <Clock className="mr-1 h-4 w-4" />
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* Patient Journey Timeline */}
      {journey && (
        <PatientJourneyTimeline 
          journey={journey}
          onActionClick={(milestoneType) => {
            console.log('Action clicked:', milestoneType);
            // Could navigate to relevant page based on milestone type
          }}
        />
      )}

      {/* Patient Demographics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Patient Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
              <p className="text-lg font-semibold">{episode.patientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Episode ID</p>
              <p className="text-lg font-mono">{episode.episodeId}</p>
            </div>
            {episode.dob && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-lg">{format(new Date(episode.dob), "MMM dd, yyyy")}</p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p className="text-lg">{episode.region}</p>
              </div>
            </div>
            {episode.clinician && (
              <div className="flex items-start gap-2">
                <Stethoscope className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clinician</p>
                  <p className="text-lg">{episode.clinician}</p>
                </div>
              </div>
            )}
            {episode.npi && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPI</p>
                <p className="text-lg font-mono">{episode.npi}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Clinical Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {episode.diagnosis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
              <p className="text-lg">{episode.diagnosis}</p>
            </div>
          )}
          
          {episode.injuryDate && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Injury Date</p>
                <p>{format(new Date(episode.injuryDate), "MMM dd, yyyy")}</p>
              </div>
              {episode.injuryMechanism && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mechanism of Injury</p>
                  <p>{episode.injuryMechanism}</p>
                </div>
              )}
            </div>
          )}

          {episode.painLevel && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Initial Pain Level</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-full max-w-xs bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-warning transition-all" 
                    style={{ width: `${(parseInt(episode.painLevel) / 10) * 100}%` }}
                  />
                </div>
                <span className="font-semibold">{episode.painLevel}/10</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Functional Limitations */}
          {(episode.functional_limitations && episode.functional_limitations.length > 0) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Functional Limitations</p>
              <div className="flex flex-wrap gap-2">
                {episode.functional_limitations.map((limitation, idx) => (
                  <Badge key={idx} variant="outline">{limitation}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prior Treatments */}
          {(episode.prior_treatments && episode.prior_treatments.length > 0) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Prior Treatments</p>
              <div className="space-y-2">
                {episode.prior_treatments.map((treatment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span>{treatment.name}</span>
                    {treatment.result && (
                      <Badge 
                        variant={
                          treatment.result === "helped" ? "default" : 
                          treatment.result === "no_change" ? "secondary" : 
                          "destructive"
                        }
                      >
                        {treatment.result === "helped" ? "Helped" : 
                         treatment.result === "no_change" ? "No Change" : 
                         "Worse"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treatment Goals */}
      {(episode.goals && episode.goals.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Treatment Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {episode.goals.map((goal, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{goal.name}</p>
                      {goal.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.notes}</p>
                      )}
                    </div>
                    {goal.result && (
                      <Badge 
                        className={
                          goal.result === "achieved" ? "bg-success/15 text-success border-success/30" :
                          goal.result === "partial" ? "bg-warning/15 text-warning border-warning/30" :
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {goal.result === "achieved" ? "Achieved" :
                         goal.result === "partial" ? "Partial" :
                         "Not Yet"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {goal.priority && (
                      <span>Priority: {goal.priority}</span>
                    )}
                    {goal.timeframe_weeks && (
                      <span>Timeframe: {goal.timeframe_weeks} weeks</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline & Assessments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Assessment Timeline</CardTitle>
          </div>
          <CardDescription>Track progress through baseline, follow-up, and discharge assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Baseline */}
            <div className="relative pl-8 pb-6 border-l-2 border-primary">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Baseline Assessment</p>
                  <Badge variant="outline">Initial</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(episode.dateOfService), "MMMM dd, yyyy")}
                </p>
                {episode.baselineScores && Object.keys(episode.baselineScores).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Object.entries(episode.baselineScores).map(([index, score]) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <span className="text-sm font-medium">{index}</span>
                        <span className="text-lg font-bold">{score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up */}
            {hasFollowup && (
              <div className="relative pl-8 pb-6 border-l-2 border-blue-500">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Follow-up Assessment</p>
                    {followup.status && getStatusBadge(followup.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {followup.completedDate 
                      ? format(new Date(followup.completedDate), "MMMM dd, yyyy")
                      : `Scheduled: ${format(new Date(followup.scheduledDate), "MMMM dd, yyyy")}`
                    }
                  </p>
                  {followup.scores && Object.keys(followup.scores).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(followup.scores).map(([index, score]) => {
                        const baseline = episode.baselineScores?.[index];
                        const improvement = baseline != null ? calculateImprovement(baseline, score) : null;
                        const mcidThreshold = getMCIDThreshold(index);
                        const change = baseline != null ? baseline - score : null;
                        const metMCID = change != null && mcidThreshold != null && Math.abs(change) >= mcidThreshold;

                        return (
                          <div key={index} className="p-2 rounded-md bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{index}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{score}</span>
                                {improvement != null && (
                                  <Badge variant={improvement > 0 ? "default" : "secondary"}>
                                    {improvement > 0 ? "↓" : "↑"} {Math.abs(improvement).toFixed(1)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {metMCID && change && change > 0 && (
                              <p className="text-xs text-success">✓ Met MCID ({mcidThreshold} point improvement)</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discharge */}
            {isCompleted && (
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-success" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Discharge Assessment</p>
                    <Badge className="bg-success/15 text-success border-success/30">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Complete
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(episode.dischargeDate!), "MMMM dd, yyyy")}
                  </p>
                  {episode.dischargeScores && Object.keys(episode.dischargeScores).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(episode.dischargeScores).map(([index, score]) => {
                        const baseline = episode.baselineScores?.[index];
                        const improvement = baseline != null ? calculateImprovement(baseline, score) : null;
                        const mcidThreshold = getMCIDThreshold(index);
                        const change = baseline != null ? baseline - score : null;
                        const metMCID = change != null && mcidThreshold != null && Math.abs(change) >= mcidThreshold;

                        return (
                          <div key={index} className="p-2 rounded-md bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{index}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{score}</span>
                                {improvement != null && (
                                  <Badge 
                                    className={
                                      improvement > 0 
                                        ? "bg-success/15 text-success border-success/30" 
                                        : "bg-warning/15 text-warning border-warning/30"
                                    }
                                  >
                                    {improvement > 0 ? "↓" : "↑"} {Math.abs(improvement).toFixed(1)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {metMCID && change && change > 0 && (
                              <p className="text-xs text-success font-medium">
                                ✓ Met MCID ({mcidThreshold} point improvement)
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MCID Achievement Analysis */}
      {isCompleted && episode.baselineScores && episode.dischargeScores && (
        <>
          <MCIDSummaryCard 
            summary={calculateMCIDSummary(episode.baselineScores, episode.dischargeScores)}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {calculateMCIDSummary(episode.baselineScores, episode.dischargeScores).achievements.map((achievement, idx) => (
              <MCIDAchievementCard 
                key={idx}
                achievement={achievement}
                showDetails={true}
              />
            ))}
          </div>
        </>
      )}

      {/* Outcome Summary */}
      {isCompleted && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Outcome Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-muted-foreground mb-1">Treatment Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (new Date(episode.dischargeDate!).getTime() - new Date(episode.dateOfService).getTime()) 
                    / (1000 * 60 * 60 * 24)
                  )} days
                </p>
              </div>
              {episode.visits && (
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Visits</p>
                  <p className="text-2xl font-bold">{episode.visits}</p>
                </div>
              )}
              {episode.compliance_rating && (
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Compliance</p>
                  <p className="text-2xl font-bold capitalize">{episode.compliance_rating}</p>
                </div>
              )}
            </div>

            {episode.compliance_notes && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground mb-2">Compliance Notes</p>
                <p className="text-sm">{episode.compliance_notes}</p>
              </div>
            )}

            {episode.referred_out && (
              <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium">Referred Out</p>
                    {episode.referral_reason && (
                      <p className="text-sm text-muted-foreground mt-1">{episode.referral_reason}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Neurologic Examination - Only for Neurology Episodes */}
      {episode.episode_type === 'Neurology' && (
        <>
          {baselineExam && finalExam ? (
            <NeuroExamComparison baselineExam={baselineExam} finalExam={finalExam} />
          ) : baselineExam ? (
            <NeuroExamDisplay exam={baselineExam} />
          ) : finalExam ? (
            <NeuroExamDisplay exam={finalExam} />
          ) : null}
        </>
      )}

      {/* Patient Portal Access */}
      <div className="print:hidden">
        <PatientAccessManager
          episodeId={episode.episodeId}
          patientName={episode.patientName}
        />
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!hasFollowup && !isCompleted && (
              <Button onClick={() => navigate(`/follow-up?episodeId=${episode.episodeId}`)}>
                Schedule Follow-up
              </Button>
            )}
            {!isCompleted && (
              <Button variant="outline" onClick={() => navigate(`/discharge?episodeId=${episode.episodeId}`)}>
                Complete Discharge
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/pcp-summary?episode=${episode.episodeId}`)}>
              Generate PCP Summary
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
