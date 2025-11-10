import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { MCIDSummary, getSuccessRateColor } from "@/lib/mcidTracking";
import { cn } from "@/lib/utils";

interface MCIDSummaryCardProps {
  summary: MCIDSummary;
}

export function MCIDSummaryCard({ summary }: MCIDSummaryCardProps) {
  const getSuccessLevelConfig = () => {
    switch (summary.successLevel) {
      case "excellent":
        return {
          label: "Excellent Outcomes",
          icon: Award,
          color: "text-green-600",
          bg: "bg-green-50",
          badge: "bg-green-500"
        };
      case "good":
        return {
          label: "Good Outcomes",
          icon: CheckCircle2,
          color: "text-blue-600",
          bg: "bg-blue-50",
          badge: "bg-blue-500"
        };
      case "fair":
        return {
          label: "Fair Outcomes",
          icon: TrendingUp,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          badge: "bg-yellow-500"
        };
      default:
        return {
          label: "Needs Improvement",
          icon: Target,
          color: "text-red-600",
          bg: "bg-red-50",
          badge: "bg-red-500"
        };
    }
  };

  const config = getSuccessLevelConfig();
  const Icon = config.icon;

  return (
    <Card className="border-primary/30 shadow-lg">
      <CardHeader className={cn("border-b", config.bg)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", config.color)} />
              Treatment Outcomes
            </CardTitle>
            <CardDescription>
              MCID Achievement Analysis
            </CardDescription>
          </div>
          <Badge className={cn(config.badge, "text-white px-4 py-1")}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Achievement Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                MCID Achievement Rate
              </div>
              <div className={cn("text-3xl font-bold", getSuccessRateColor(summary.achievementRate))}>
                {Math.round(summary.achievementRate)}%
              </div>
            </div>
            <div className={cn("p-4 rounded-full", config.bg)}>
              <Target className={cn("h-8 w-8", config.color)} />
            </div>
          </div>
          
          <Progress 
            value={summary.achievementRate} 
            className="h-3"
          />
          
          <div className="text-xs text-muted-foreground">
            {summary.achievedMCID} of {summary.totalAssessments} outcome measure(s) achieved MCID threshold
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={cn("rounded-lg p-4 border-l-4", config.bg, "border-l-primary")}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className={cn("h-4 w-4", config.color)} />
              <span className="text-xs font-medium text-muted-foreground">
                Measures Assessed
              </span>
            </div>
            <div className="text-2xl font-bold">{summary.totalAssessments}</div>
          </div>

          <div className={cn("rounded-lg p-4 border-l-4", config.bg, "border-l-primary")}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={cn("h-4 w-4", config.color)} />
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Improvement
              </span>
            </div>
            <div className="text-2xl font-bold">
              {summary.averageImprovement >= 0 ? '+' : ''}
              {summary.averageImprovement.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Success Interpretation */}
        <div className={cn("rounded-lg p-4", config.bg)}>
          <div className="text-sm space-y-1">
            <div className="font-semibold">Clinical Significance</div>
            <div className="text-muted-foreground">
              {summary.overallSuccess ? (
                <>
                  Patient achieved clinically meaningful improvement in {summary.achievedMCID} outcome measure(s), 
                  indicating successful treatment outcomes.
                </>
              ) : (
                <>
                  Patient showed improvement but did not consistently achieve MCID thresholds 
                  across all outcome measures.
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
