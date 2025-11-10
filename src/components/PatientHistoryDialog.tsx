import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  Minus
} from "lucide-react";
import { format } from "date-fns";

interface Episode {
  id: string;
  region: string;
  diagnosis: string;
  start_date: string;
  discharge_date: string | null;
  pain_pre: number | null;
  pain_post: number | null;
  pain_delta: number | null;
  cis_pre: number | null;
  cis_post: number | null;
  cis_delta: number | null;
  clinician: string;
  visits: string | null;
  functional_limitations: string[] | null;
  prior_treatments: any;
  referred_out: boolean;
}

interface OutcomeScore {
  id: string;
  episode_id: string;
  index_type: string;
  score_type: string;
  score: number;
  recorded_at: string;
}

interface PatientHistory {
  episodes: Episode[];
  outcomeScores: OutcomeScore[];
  totalEpisodes: number;
  activeEpisodes: number;
  hasRecurringIssues: boolean;
}

interface PatientHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  dateOfBirth: string;
}

export function PatientHistoryDialog({ 
  open, 
  onClose, 
  patientName, 
  dateOfBirth 
}: PatientHistoryDialogProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PatientHistory | null>(null);

  useEffect(() => {
    if (open) {
      loadPatientHistory();
    }
  }, [open, patientName, dateOfBirth]);

  const loadPatientHistory = async () => {
    setLoading(true);
    try {
      // Find all episodes for this patient (same name and DOB)
      const { data: episodes, error: episodesError } = await supabase
        .from("episodes")
        .select("*")
        .ilike("patient_name", patientName)
        .eq("date_of_birth", dateOfBirth)
        .order("start_date", { ascending: false });

      if (episodesError) throw episodesError;

      const episodeIds = episodes?.map(e => e.id) || [];
      
      // Get all outcome scores for these episodes
      let outcomeScores: OutcomeScore[] = [];
      if (episodeIds.length > 0) {
        const { data: scores, error: scoresError } = await supabase
          .from("outcome_scores")
          .select("*")
          .in("episode_id", episodeIds)
          .order("recorded_at", { ascending: true });

        if (scoresError) throw scoresError;
        outcomeScores = scores || [];
      }

      const activeEpisodes = episodes?.filter(e => !e.discharge_date).length || 0;
      
      // Check for recurring issues (same region in multiple episodes)
      const regions = episodes?.map(e => e.region) || [];
      const hasRecurringIssues = new Set(regions).size < regions.length;

      setHistory({
        episodes: episodes || [],
        outcomeScores,
        totalEpisodes: episodes?.length || 0,
        activeEpisodes,
        hasRecurringIssues
      });
    } catch (error) {
      console.error("Error loading patient history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMCIDStatus = (episode: Episode) => {
    const delta = episode.cis_delta;
    if (delta === null || delta === undefined) return null;
    
    // MCID thresholds vary by index type, using general threshold of 10 points
    const threshold = 10;
    
    if (Math.abs(delta) >= threshold) {
      return delta > 0 ? "improved" : "declined";
    }
    return "stable";
  };

  const getPainChangeIcon = (delta: number | null) => {
    if (delta === null) return null;
    if (delta < -1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (delta > 1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoresForEpisode = (episodeId: string) => {
    return history?.outcomeScores.filter(s => s.episode_id === episodeId) || [];
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading patient history...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!history || history.totalEpisodes === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Patient History</DialogTitle>
            <DialogDescription>
              {patientName} • DOB: {format(new Date(dateOfBirth), "MMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No previous episodes found for this patient. This will be their first episode.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Duplicate Patient Detected
          </DialogTitle>
          <DialogDescription>
            {patientName} • DOB: {format(new Date(dateOfBirth), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="space-y-4 pr-4">
            {/* Summary Alerts */}
            <div className="space-y-2">
              {history.activeEpisodes > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-semibold">
                    This patient has {history.activeEpisodes} active episode{history.activeEpisodes > 1 ? 's' : ''} in the system
                  </AlertDescription>
                </Alert>
              )}
              
              {history.hasRecurringIssues && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Patient has recurring issues in the same body region
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{history.totalEpisodes}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Active Episodes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{history.activeEpisodes}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Completed Episodes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {history.totalEpisodes - history.activeEpisodes}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Episode History */}
            <div className="space-y-4">
              <h3 className="font-semibold">Episode History</h3>
              {history.episodes.map((episode, idx) => {
                const scores = getScoresForEpisode(episode.id);
                const mcidStatus = getMCIDStatus(episode);
                
                return (
                  <Card key={episode.id} className={!episode.discharge_date ? "border-amber-500" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{episode.region}</CardTitle>
                            {!episode.discharge_date && (
                              <Badge variant="destructive">Active</Badge>
                            )}
                            {episode.referred_out && (
                              <Badge variant="outline">Referred Out</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{episode.diagnosis}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Episode #{history.totalEpisodes - idx}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Started:</span>
                          <span>{episode.start_date ? format(new Date(episode.start_date), "MMM d, yyyy") : "N/A"}</span>
                        </div>
                        {episode.discharge_date && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Discharged:</span>
                              <span>{format(new Date(episode.discharge_date), "MMM d, yyyy")}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Clinician and Visits */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {episode.clinician && (
                          <div>
                            <span className="text-muted-foreground">Clinician:</span>
                            <p className="font-medium">{episode.clinician}</p>
                          </div>
                        )}
                        {episode.visits && (
                          <div>
                            <span className="text-muted-foreground">Total Visits:</span>
                            <p className="font-medium">{episode.visits}</p>
                          </div>
                        )}
                      </div>

                      {/* Pain Scores */}
                      {(episode.pain_pre !== null || episode.pain_post !== null) && (
                        <div className="rounded-lg bg-muted p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Pain Levels
                            </span>
                            {episode.pain_delta !== null && getPainChangeIcon(episode.pain_delta)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Initial:</span>
                              <p className="font-semibold text-lg">{episode.pain_pre ?? 'N/A'}/10</p>
                            </div>
                            {episode.pain_post !== null && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Final:</span>
                                  <p className="font-semibold text-lg">{episode.pain_post}/10</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Change:</span>
                                  <p className={`font-semibold text-lg ${
                                    episode.pain_delta && episode.pain_delta < 0 ? 'text-green-600' : 
                                    episode.pain_delta && episode.pain_delta > 0 ? 'text-red-600' : ''
                                  }`}>
                                    {episode.pain_delta !== null ? `${episode.pain_delta > 0 ? '+' : ''}${episode.pain_delta}` : 'N/A'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Outcome Scores (MCID) */}
                      {(episode.cis_pre !== null || episode.cis_post !== null) && (
                        <div className="rounded-lg bg-muted p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Outcome Scores
                            </span>
                            {mcidStatus && (
                              <Badge variant={
                                mcidStatus === "improved" ? "default" : 
                                mcidStatus === "declined" ? "destructive" : "outline"
                              }>
                                {mcidStatus === "improved" && <TrendingUp className="h-3 w-3 mr-1" />}
                                {mcidStatus === "declined" && <TrendingDown className="h-3 w-3 mr-1" />}
                                {mcidStatus.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Initial:</span>
                              <p className="font-semibold text-lg">{episode.cis_pre ?? 'N/A'}</p>
                            </div>
                            {episode.cis_post !== null && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Final:</span>
                                  <p className="font-semibold text-lg">{episode.cis_post}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Change:</span>
                                  <p className={`font-semibold text-lg ${
                                    episode.cis_delta && episode.cis_delta > 0 ? 'text-green-600' : 
                                    episode.cis_delta && episode.cis_delta < 0 ? 'text-red-600' : ''
                                  }`}>
                                    {episode.cis_delta !== null ? `${episode.cis_delta > 0 ? '+' : ''}${episode.cis_delta}` : 'N/A'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Detailed Outcome Scores */}
                          {scores.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-2">Recorded Scores:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {scores.map(score => (
                                  <div key={score.id} className="flex justify-between">
                                    <span>{score.index_type} ({score.score_type}):</span>
                                    <span className="font-medium">{score.score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Functional Limitations */}
                      {episode.functional_limitations && Array.isArray(episode.functional_limitations) && episode.functional_limitations.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Functional Limitations:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {episode.functional_limitations.map((limitation, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{limitation}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prior Treatments */}
                      {episode.prior_treatments && Array.isArray(episode.prior_treatments) && episode.prior_treatments.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Prior Treatments:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {episode.prior_treatments.map((treatment, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {treatment.type}
                                {treatment.effective !== null && (
                                  <span className="ml-1">
                                    {treatment.effective ? '✓' : '✗'}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
