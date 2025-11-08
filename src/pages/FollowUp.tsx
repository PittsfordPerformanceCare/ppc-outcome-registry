import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PPC_STORE, EpisodeMeta } from "@/lib/ppcStore";
import { calculateMCID } from "@/lib/mcidUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function FollowUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const episodeIdParam = searchParams.get("episode");

  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodeIdParam || "");
  const [availableEpisodes, setAvailableEpisodes] = useState<EpisodeMeta[]>([]);
  const [episode, setEpisode] = useState<EpisodeMeta | null>(null);
  const [followupScores, setFollowupScores] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load all available episodes for dropdown
    const episodeIds = PPC_STORE.getAllEpisodes();
    const episodes = episodeIds
      .map((id) => PPC_STORE.getEpisodeMeta(id))
      .filter((ep): ep is EpisodeMeta => ep !== null)
      .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime());
    setAvailableEpisodes(episodes);
  }, []);

  useEffect(() => {
    if (selectedEpisodeId) {
      const ep = PPC_STORE.getEpisodeMeta(selectedEpisodeId);
      if (ep) {
        setEpisode(ep);
        // Initialize followup scores
        const scores: Record<string, string> = {};
        ep.indices.forEach((index) => {
          scores[index] = "";
        });
        setFollowupScores(scores);

        // Check if already completed
        const existingFollowup = PPC_STORE.getFollowupMeta(selectedEpisodeId);
        if (existingFollowup?.scores) {
          const existingScores: Record<string, string> = {};
          Object.entries(existingFollowup.scores).forEach(([key, value]) => {
            existingScores[key] = String(value);
          });
          setFollowupScores(existingScores);
          setShowResults(true);
        }
        
        // Update URL
        setSearchParams({ episode: selectedEpisodeId });
      } else {
        toast.error("Episode not found");
      }
    }
  }, [selectedEpisodeId, setSearchParams]);

  const handleScoreChange = (index: string, value: string) => {
    setFollowupScores({ ...followupScores, [index]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!episode) return;

    // Validate scores
    const scores: Record<string, number> = {};
    for (const index of episode.indices) {
      const score = parseFloat(followupScores[index]);
      if (isNaN(score) || score < 0 || score > 100) {
        toast.error(`Invalid score for ${index}. Must be between 0 and 100.`);
        return;
      }
      scores[index] = score;
    }

    // Calculate overall status
    let improvingCount = 0;
    let decliningCount = 0;

    episode.indices.forEach((index) => {
      const baseline = episode.baselineScores?.[index] || 0;
      const followup = scores[index];
      const result = calculateMCID(index as any, baseline, followup);
      if (result.status === "improving") improvingCount++;
      if (result.status === "declining") decliningCount++;
    });

    let overallStatus: "stable" | "improving" | "declining" = "stable";
    if (improvingCount > decliningCount) overallStatus = "improving";
    else if (decliningCount > improvingCount) overallStatus = "declining";

    // Save follow-up
    PPC_STORE.setFollowupMeta(episode.episodeId, {
      episodeId: episode.episodeId,
      scheduledDate: episode.followupDate || "",
      completedDate: new Date().toISOString().split("T")[0],
      scores,
      status: overallStatus,
    });
    PPC_STORE.setFollowupCompleted(episode.episodeId, true);

    setShowResults(true);
    toast.success("Follow-up completed successfully!");
  };


  const results = showResults && episode
    ? episode.indices.map((index) => {
        const baseline = episode.baselineScores?.[index] || 0;
        const followup = parseFloat(followupScores[index]) || 0;
        return {
          index,
          ...calculateMCID(index as any, baseline, followup),
          baseline,
          followup,
        };
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">90-Day Follow-up</h1>
        <p className="mt-2 text-muted-foreground">Complete outcome assessment and MCID analysis</p>
      </div>

      {/* Episode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Episode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="episodeSelect">Choose an episode for follow-up</Label>
            <Select value={selectedEpisodeId} onValueChange={setSelectedEpisodeId}>
              <SelectTrigger id="episodeSelect" className="bg-background">
                <SelectValue placeholder="Select an episode..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableEpisodes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No episodes found. Create one first.
                  </div>
                ) : (
                  availableEpisodes.map((ep) => (
                    <SelectItem key={ep.episodeId} value={ep.episodeId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{ep.patientName}</span>
                        <span className="text-xs text-muted-foreground">
                          {ep.episodeId} • {ep.region} • {ep.dateOfService}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Episode Summary */}
      {episode && (
        <Card>
          <CardHeader>
            <CardTitle>Episode Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Patient:</span>
              <span className="text-sm text-muted-foreground">{episode.patientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Episode ID:</span>
              <span className="text-sm text-muted-foreground">{episode.episodeId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Region:</span>
              <Badge variant="outline">{episode.region}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Date:</span>
              <span className="text-sm text-muted-foreground">{episode.dateOfService}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Form */}
      {episode && !showResults && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Scores</CardTitle>
              <CardDescription>Enter current outcome scores at 90 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {episode.indices.map((index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={index} className="text-base font-medium">
                      {index}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      Baseline: {episode.baselineScores?.[index] || 0}
                    </span>
                  </div>
                  <Input
                    id={index}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter follow-up score"
                    value={followupScores[index] || ""}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Complete Follow-up
            </Button>
          </div>
        </form>
      )}

      {/* Results */}
      {episode && showResults && (
        <Card>
          <CardHeader>
            <CardTitle>MCID Analysis Results</CardTitle>
            <CardDescription>Clinical significance assessment at 90 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.map((result) => {
              const StatusIcon =
                result.status === "improving"
                  ? TrendingUp
                  : result.status === "declining"
                  ? TrendingDown
                  : Minus;

              return (
                <div key={result.index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{result.index}</h3>
                    <Badge className={`clinical-badge ${result.status === "improving" ? "badge-improving" : result.status === "declining" ? "badge-declining" : "badge-stable"}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Baseline Score</p>
                      <p className="text-2xl font-bold">{result.baseline.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Follow-up Score</p>
                      <p className="text-2xl font-bold">{result.followup.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Change</p>
                      <p className="text-xl font-semibold">
                        {result.change > 0 ? "+" : ""}
                        {result.change.toFixed(1)} ({result.percentage > 0 ? "+" : ""}
                        {result.percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MCID Threshold</p>
                      <p className="text-xl font-semibold">{result.mcidThreshold}</p>
                    </div>
                  </div>

                  {result.isClinicallySignificant && (
                    <div className="mt-4 rounded-md bg-success/10 p-3">
                      <p className="text-sm font-medium text-success">
                        ✓ Clinically significant change detected
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Dashboard
              </Button>
              <Button onClick={() => navigate(`/pcp-summary?episode=${episode.episodeId}`)}>
                Generate PCP Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
