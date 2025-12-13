import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInstrument, InstrumentCode } from "@/lib/outcomeInstruments";
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface OutcomeScoreCardProps {
  instrumentCode: InstrumentCode;
  scores: Array<{
    score: number;
    score_type: string;
    recorded_at: string;
  }>;
  showMCID?: boolean;
}

export function OutcomeScoreCard({
  instrumentCode,
  scores,
  showMCID = true,
}: OutcomeScoreCardProps) {
  const instrument = getInstrument(instrumentCode);
  if (!instrument) return null;

  const baseline = scores.find((s) => s.score_type === "baseline");
  const discharge = scores.find((s) => s.score_type === "discharge");
  const followups = scores.filter((s) => s.score_type === "followup");
  const latest = discharge || followups[followups.length - 1] || baseline;

  const calculateChange = () => {
    if (!baseline || !latest || baseline === latest) return null;
    
    // For disability indices (ODI, QuickDASH), lower is better
    // For LEFS, higher is better
    const change = latest.score - baseline.score;
    return change;
  };

  const change = calculateChange();
  const mcidAchieved = change !== null && Math.abs(change) >= instrument.mcid;

  // For ODI/QuickDASH: improvement = negative change (lower disability)
  // For LEFS: improvement = positive change (higher function)
  const isImprovement =
    instrumentCode === "LEFS"
      ? change !== null && change > 0
      : change !== null && change < 0;

  const getProgressValue = () => {
    if (!latest) return 0;
    if (instrumentCode === "LEFS") {
      return (latest.score / instrument.maxScore) * 100;
    }
    // For disability indices, lower is better, so invert
    return 100 - latest.score;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{instrument.name}</CardTitle>
          {showMCID && mcidAchieved && (
            <Badge variant={isImprovement ? "default" : "destructive"} className="gap-1">
              {isImprovement ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              MCID {isImprovement ? "Achieved" : "Decline"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{instrument.fullName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Score */}
        {latest && (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-bold">
                {latest.score.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {instrument.scoreUnit}
                </span>
              </span>
              {change !== null && (
                <div className={`flex items-center gap-1 text-sm ${isImprovement ? "text-green-600" : change === 0 ? "text-muted-foreground" : "text-red-600"}`}>
                  {isImprovement ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : change === 0 ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                  {Math.abs(change).toFixed(1)} pts
                </div>
              )}
            </div>
            <Progress value={getProgressValue()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {instrumentCode === "LEFS"
                ? `Higher is better (max ${instrument.maxScore})`
                : "Lower is better (0-100%)"}
            </p>
          </div>
        )}

        {/* Score Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Score History</h4>
          <div className="space-y-1">
            {baseline && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Baseline</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{baseline.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(baseline.recorded_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            )}
            {followups.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Follow-up {i + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(f.recorded_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
            {discharge && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discharge</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{discharge.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(discharge.recorded_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MCID Reference */}
        {showMCID && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              MCID: {instrument.mcid} {instrument.scoreUnit} improvement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
