import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCIDStatistics {
  totalCompletedEpisodes: number;
  episodesAchievingMCID: number;
  achievementRate: number;
  averageImprovement: number;
}

interface MCIDStatisticsCardProps {
  statistics: MCIDStatistics;
  className?: string;
}

export function MCIDStatisticsCard({ statistics, className }: MCIDStatisticsCardProps) {
  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-blue-600";
    if (rate >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessLevel = (rate: number) => {
    if (rate >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (rate >= 60) return { label: "Good", color: "bg-blue-500" };
    if (rate >= 40) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

  const successLevel = getSuccessLevel(statistics.achievementRate);

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              MCID Success Rate
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Clinically significant improvement tracking
            </CardDescription>
          </div>
          <Badge className={cn(successLevel.color, "text-white")}>
            {successLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Achievement Rate */}
        <div className="text-center py-4">
          <div className={cn("text-5xl font-bold", getSuccessColor(statistics.achievementRate))}>
            {Math.round(statistics.achievementRate)}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            of completed episodes achieved MCID
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {statistics.episodesAchievingMCID}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Achieved MCID
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {statistics.totalCompletedEpisodes}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Episodes
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.averageImprovement >= 0 ? '+' : ''}
              {statistics.averageImprovement.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg Improvement
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
