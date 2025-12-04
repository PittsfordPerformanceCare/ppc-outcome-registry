import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { Activity, Clock } from "lucide-react";

interface PerformanceDialsProps {
  avgOutcomeImprovement: number;
  avgDaysToDischarge: number;
  completedEpisodesCount: number;
}

export function PerformanceDials({ 
  avgOutcomeImprovement, 
  avgDaysToDischarge, 
  completedEpisodesCount 
}: PerformanceDialsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Outcome Improvement</CardTitle>
          </div>
          <CardDescription>Average patient improvement across all indices</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <CircularProgress
            value={avgOutcomeImprovement}
            max={100}
            size={180}
            strokeWidth={14}
            color="success"
            label="Improvement"
            subtitle={`Based on ${completedEpisodesCount} completed episodes`}
          />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <CardTitle>Time to Discharge</CardTitle>
          </div>
          <CardDescription>Average days from intake to discharge</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <CircularProgress
            value={avgDaysToDischarge}
            max={90}
            size={180}
            strokeWidth={14}
            color="info"
            label="Days"
            subtitle={`Target: ≤ 45 days | Actual: ${avgDaysToDischarge} days avg`}
          />
        </CardContent>
      </Card>
    </div>
  );
}