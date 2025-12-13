import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OutcomeScoreCard } from "./OutcomeScoreCard";
import { OutcomeMeasureForm } from "@/components/forms/OutcomeMeasureForm";
import { useOutcomeScores, OutcomeScoreRecord } from "@/hooks/useOutcomeScores";
import { getInstrument, InstrumentCode, getAllInstruments } from "@/lib/outcomeInstruments";
import { PPC_CONFIG } from "@/lib/ppcConfig";
import { ClipboardList, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface EpisodeOutcomesDashboardProps {
  episodeId: string;
  region: string;
  episodeType?: string;
  onScoreSubmitted?: () => void;
}

export function EpisodeOutcomesDashboard({
  episodeId,
  region,
  episodeType,
  onScoreSubmitted,
}: EpisodeOutcomesDashboardProps) {
  const [scores, setScores] = useState<OutcomeScoreRecord[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentCode | null>(null);
  const [selectedScoreType, setSelectedScoreType] = useState<"baseline" | "followup" | "discharge">("baseline");
  const { getScoresForEpisode, submitScore, isLoading, isSubmitting } = useOutcomeScores();

  // Determine recommended instruments based on region/episode type
  const recommendedInstruments = PPC_CONFIG.regionToIndices(region, episodeType) as InstrumentCode[];

  useEffect(() => {
    loadScores();
  }, [episodeId]);

  const loadScores = async () => {
    const data = await getScoresForEpisode(episodeId);
    setScores(data);
  };

  const handleFormComplete = async (data: {
    score: number;
    responses: Map<number, number | null>;
    isValid: boolean;
  }) => {
    if (!selectedInstrument || !data.isValid) return;

    const scoreId = await submitScore({
      episodeId,
      instrumentCode: selectedInstrument,
      scoreType: selectedScoreType,
      score: data.score,
      responses: data.responses,
    });

    if (scoreId) {
      setSelectedInstrument(null);
      await loadScores();
      onScoreSubmitted?.();
    }
  };

  // Group scores by instrument
  const scoresByInstrument = scores.reduce((acc, score) => {
    const key = score.index_type as InstrumentCode;
    if (!acc[key]) acc[key] = [];
    acc[key].push(score);
    return acc;
  }, {} as Record<InstrumentCode, OutcomeScoreRecord[]>);

  // Get completion status for each instrument
  const getInstrumentStatus = (code: InstrumentCode) => {
    const instrumentScores = scoresByInstrument[code] || [];
    const hasBaseline = instrumentScores.some((s) => s.score_type === "baseline");
    const hasDischarge = instrumentScores.some((s) => s.score_type === "discharge");
    const followupCount = instrumentScores.filter((s) => s.score_type === "followup").length;

    return { hasBaseline, hasDischarge, followupCount };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If an instrument is selected, show the form
  if (selectedInstrument) {
    const instrument = getInstrument(selectedInstrument);
    if (!instrument) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{instrument.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              Recording {selectedScoreType} assessment
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedInstrument(null)}>
            Cancel
          </Button>
        </div>
        <OutcomeMeasureForm
          instrument={instrument}
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Outcome Measures
        </CardTitle>
        <CardDescription>
          Track patient progress with standardized outcome instruments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="record">Record New</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {recommendedInstruments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommended instruments for this region.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendedInstruments.map((code) => {
                  const status = getInstrumentStatus(code);
                  const instrumentScores = scoresByInstrument[code] || [];

                  if (instrumentScores.length === 0) {
                    const instrument = getInstrument(code);
                    return (
                      <Card key={code} className="border-dashed">
                        <CardContent className="py-6 text-center">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium">{instrument?.name}</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            No scores recorded yet
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInstrument(code);
                              setSelectedScoreType("baseline");
                            }}
                          >
                            Record Baseline
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <OutcomeScoreCard
                      key={code}
                      instrumentCode={code}
                      scores={instrumentScores}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="record" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getAllInstruments().map((instrument) => {
                const status = getInstrumentStatus(instrument.code);
                const isRecommended = recommendedInstruments.includes(instrument.code);

                return (
                  <Card
                    key={instrument.code}
                    className={isRecommended ? "ring-1 ring-primary/30" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{instrument.name}</CardTitle>
                        {isRecommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {instrument.fullName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {status.hasBaseline && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Baseline
                          </Badge>
                        )}
                        {status.followupCount > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> {status.followupCount} Follow-up
                          </Badge>
                        )}
                        {status.hasDischarge && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Discharge
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!status.hasBaseline && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedInstrument(instrument.code);
                              setSelectedScoreType("baseline");
                            }}
                          >
                            Baseline
                          </Button>
                        )}
                        {status.hasBaseline && !status.hasDischarge && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInstrument(instrument.code);
                                setSelectedScoreType("followup");
                              }}
                            >
                              Follow-up
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInstrument(instrument.code);
                                setSelectedScoreType("discharge");
                              }}
                            >
                              Discharge
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
