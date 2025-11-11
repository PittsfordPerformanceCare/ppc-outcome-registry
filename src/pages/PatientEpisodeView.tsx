import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Activity, 
  Calendar, 
  MapPin, 
  User, 
  TrendingUp,
  Loader2,
  Target,
  AlertCircle,
  HeartPulse
} from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ShareProgress from "@/components/ShareProgress";
import PostDischargeFeedback from "@/components/PostDischargeFeedback";
import { PatientEpisodeViewSkeleton } from "@/components/skeletons/PatientEpisodeViewSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EpisodeData {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  start_date: string | null;
  discharge_date: string | null;
  clinician: string | null;
  diagnosis: string | null;
  injury_date: string | null;
  injury_mechanism: string | null;
  pain_level: string | null;
  treatment_goals: any;
  functional_limitations: string[] | null;
}

interface OutcomeScore {
  id: string;
  episode_id: string;
  index_type: string;
  score_type: string;
  score: number;
  recorded_at: string;
}

export default function PatientEpisodeView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("id");
  const { toast } = useToast();
  const { success, light } = useHaptics();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [scores, setScores] = useState<OutcomeScore[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [patientId, setPatientId] = useState<string>("");
  const [allEpisodes, setAllEpisodes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    checkAccessAndLoadData();
  }, [episodeId]);

  const checkAccessAndLoadData = async () => {
    if (!episodeId) {
      navigate("/patient-dashboard");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/patient-auth");
        return;
      }

      setPatientId(session.user.id);

      // Load all episodes for navigation
      const { data: accessData, error: accessError } = await supabase
        .from("patient_episode_access")
        .select("episode_id")
        .eq("patient_id", session.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (accessError) throw accessError;

      if (accessData) {
        const episodeIds = accessData.map(a => a.episode_id);
        setAllEpisodes(episodeIds);
        setCurrentIndex(episodeIds.indexOf(episodeId));
      }

      // Check if patient has access to this episode
      const accessRecord = accessData?.find(a => a.episode_id === episodeId);
      if (!accessRecord) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(true);

      // Load episode data using the helper function
      const { data: episodeData, error: episodeError } = await supabase
        .rpc("get_patient_episode_view", {
          _patient_id: session.user.id,
          _episode_id: episodeId
        })
        .single();

      if (episodeError) throw episodeError;
      setEpisode(episodeData);

      // Load outcome scores
      const { data: scoresData, error: scoresError } = await supabase
        .from("outcome_scores")
        .select("*")
        .eq("episode_id", episodeId)
        .order("recorded_at", { ascending: true });

      if (scoresError) throw scoresError;
      setScores(scoresData || []);

      // Check if feedback has been given
      if (episodeData.discharge_date) {
        const { data: feedbackData } = await supabase
          .from("patient_feedback")
          .select("id")
          .eq("patient_id", session.user.id)
          .eq("episode_id", episodeId)
          .single();

        setFeedbackGiven(!!feedbackData);
      }
    } catch (error: any) {
      console.error("Error loading episode:", error);
      toast({
        title: "Error Loading Episode",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await checkAccessAndLoadData();
    success();
  };

  const navigateToEpisode = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= allEpisodes.length) return;
    
    light();
    navigate(`/patient-episode/${allEpisodes[newIndex]}`);
  };

  const { elementRef, dragOffset } = useSwipeGesture({
    onSwipeLeft: () => navigateToEpisode("next"),
    onSwipeRight: () => navigateToEpisode("prev"),
    threshold: 100,
    enabled: allEpisodes.length > 1,
  });

  const prepareChartData = () => {
    if (scores.length === 0) return [];

    const groupedByDate: Record<string, any> = {};

    scores.forEach(score => {
      const date = format(new Date(score.recorded_at), "MMM dd");
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date };
      }
      groupedByDate[date][score.index_type] = score.score;
    });

    return Object.values(groupedByDate);
  };

  const getScoreIndices = () => {
    return Array.from(new Set(scores.map(s => s.index_type)));
  };

  const getBaselineAndDischarge = (indexType: string) => {
    const baseline = scores.find(s => s.index_type === indexType && s.score_type === "baseline");
    const discharge = scores.find(s => s.index_type === indexType && s.score_type === "discharge");
    return { baseline: baseline?.score, discharge: discharge?.score };
  };

  if (loading) {
    return <PatientEpisodeViewSkeleton />;
  }

  if (!hasAccess || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You don't have access to this episode
            </p>
            <Button onClick={() => navigate("/patient-dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = prepareChartData();
  const indices = getScoreIndices();
  const isCompleted = !!episode.discharge_date;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allEpisodes.length - 1;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div 
        ref={elementRef}
        className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        style={{
          transform: `translateX(${dragOffset.x * 0.3}px)`,
          transition: dragOffset.x === 0 ? "transform 0.3s ease-out" : "none",
        }}
      >
        <div className="container mx-auto max-w-5xl py-8 space-y-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/patient-dashboard")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md shadow-primary/20">
                  <HeartPulse className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-primary">PPC Patient Hub</span>
              </div>
              {hasPrevious && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateToEpisode("prev")}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {allEpisodes.length > 1 && (
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {allEpisodes.length}
                </span>
              )}
              {hasNext && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateToEpisode("next")}
                  className="gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          <div className="flex items-center gap-2">
            {scores.length > 0 && (
              <ShareProgress 
                episodeId={episodeId} 
                patientName={episode.patient_name}
              />
            )}
            {isCompleted && (
              <Badge className="bg-success/15 text-success border-success/30">
                Treatment Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Episode Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Episode Details</CardTitle>
                <CardDescription>{episode.region}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(episode.date_of_service), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {episode.discharge_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Discharge Date</p>
                    <p className="font-medium">
                      {format(new Date(episode.discharge_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {episode.clinician && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clinician</p>
                    <p className="font-medium">{episode.clinician}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Area</p>
                  <p className="font-medium">{episode.region}</p>
                </div>
              </div>
            </div>

            {episode.diagnosis && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                  <p>{episode.diagnosis}</p>
                </div>
              </>
            )}

            {episode.functional_limitations && episode.functional_limitations.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Functional Limitations</p>
                  <div className="flex flex-wrap gap-2">
                    {episode.functional_limitations.map((limitation, idx) => (
                      <Badge key={idx} variant="outline">{limitation}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Treatment Goals */}
        {episode.treatment_goals && Array.isArray(episode.treatment_goals) && episode.treatment_goals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Treatment Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {episode.treatment_goals.map((goal: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border bg-card">
                    <p className="font-medium">{goal.name}</p>
                    {goal.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Chart */}
        {scores.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription className="ml-auto">Lower scores indicate improvement</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {indices.map((index, i) => {
                      const colors = ["#0EA5E9", "#8B5CF6", "#EC4899", "#F59E0B"];
                      return (
                        <Line
                          key={index}
                          type="monotone"
                          dataKey={index}
                          stroke={colors[i % colors.length]}
                          strokeWidth={2}
                          name={index}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Score Summary */}
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {indices.map(index => {
                  const { baseline, discharge } = getBaselineAndDischarge(index);
                  if (!baseline) return null;

                  const improvement = discharge 
                    ? Math.round(((baseline - discharge) / baseline) * 100)
                    : null;

                  return (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <p className="font-medium mb-2">{index}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Baseline:</span>
                          <span className="font-medium">{baseline}</span>
                        </div>
                        {discharge && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Current:</span>
                              <span className="font-medium">{discharge}</span>
                            </div>
                            {improvement !== null && (
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-muted-foreground">Improvement:</span>
                                <Badge 
                                  variant={improvement > 0 ? "default" : "secondary"}
                                  className={improvement > 0 ? "bg-success/15 text-success border-success/30" : ""}
                                >
                                  {improvement > 0 ? "+" : ""}{improvement}%
                                </Badge>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post-Discharge Feedback */}
        {isCompleted && !feedbackGiven && patientId && (
          <PostDischargeFeedback
            patientId={patientId}
            episodeId={episodeId}
            onComplete={() => setFeedbackGiven(true)}
          />
        )}
        </div>
      </div>
    </PullToRefresh>
  );
}
