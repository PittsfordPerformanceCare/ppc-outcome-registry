import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Target,
  Award,
  Info
} from "lucide-react";
import { MCIDAchievement, getAchievementColor } from "@/lib/mcidTracking";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MCIDAchievementCardProps {
  achievement: MCIDAchievement;
  showDetails?: boolean;
}

export function MCIDAchievementCard({ 
  achievement, 
  showDetails = true 
}: MCIDAchievementCardProps) {
  const colors = getAchievementColor(achievement.achievementLevel);
  
  const getIcon = () => {
    switch (achievement.achievementLevel) {
      case "excellent":
        return <Award className="h-5 w-5" />;
      case "significant":
        return <CheckCircle2 className="h-5 w-5" />;
      case "moderate":
        return <TrendingUp className="h-5 w-5" />;
      case "declined":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusLabel = () => {
    switch (achievement.achievementLevel) {
      case "excellent":
        return "Excellent Progress";
      case "significant":
        return "MCID Achieved";
      case "moderate":
        return "Good Progress";
      case "minimal":
        return "Minimal Change";
      case "declined":
        return "Declined";
      default:
        return "No Change";
    }
  };

  return (
    <Card className={cn("border-l-4", colors.border, colors.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {achievement.toolName}
              {achievement.achievedMCID && (
                <Badge className={cn("text-xs", colors.badge, "text-white")}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  MCID Met
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              MCID Threshold: {achievement.mcidThreshold} points
            </CardDescription>
          </div>
          <div className={cn("p-2 rounded-full", colors.bg, colors.text)}>
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Change Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={colors.text}>
              <strong>{Math.abs(achievement.scoreChange).toFixed(1)}</strong> point change
            </span>
            <Badge variant="outline" className={cn("text-xs", colors.text)}>
              {getStatusLabel()}
            </Badge>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.min(achievement.achievementPercentage, 200)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Baseline: {achievement.baselineScore}</span>
              <span>Discharge: {achievement.dischargeScore}</span>
            </div>
          </div>

          {/* MCID Achievement Percentage */}
          <div className="flex items-center justify-between pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                    <Target className="h-3 w-3" />
                    <span>MCID Progress</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Percentage of MCID threshold achieved. 100% or more indicates 
                    clinically meaningful improvement.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className={cn("text-sm font-semibold", colors.text)}>
              {Math.round(achievement.achievementPercentage)}%
            </span>
          </div>
        </div>

        {showDetails && (
          <>
            <div className="h-px bg-border" />
            
            {/* Interpretation */}
            <Alert className={cn("border-l-2", colors.border)}>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {achievement.interpretation}
              </AlertDescription>
            </Alert>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={cn("rounded p-2", colors.bg)}>
                <div className="text-muted-foreground">Improvement</div>
                <div className={cn("font-semibold", colors.text)}>
                  {achievement.percentImprovement >= 0 ? '+' : ''}
                  {achievement.percentImprovement.toFixed(1)}%
                </div>
              </div>
              <div className={cn("rounded p-2", colors.bg)}>
                <div className="text-muted-foreground">vs. MCID</div>
                <div className={cn("font-semibold", colors.text)}>
                  {achievement.scoreChange >= 0 ? '+' : ''}
                  {(achievement.scoreChange - achievement.mcidThreshold).toFixed(1)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
