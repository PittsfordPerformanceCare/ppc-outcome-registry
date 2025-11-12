import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Medal, Star, Heart, Calendar, Shield, 
  ClipboardCheck, TrendingUp, Award, Sparkles
} from "lucide-react";
import { format } from "date-fns";

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  points_required: number | null;
  achievement_type: string;
  earned_at?: string;
}

interface PatientAchievementsProps {
  achievements: Achievement[];
  totalPoints: number;
  nextMilestone: number | null;
  progressToNext: number;
}

const iconMap: Record<string, any> = {
  Trophy,
  Medal,
  Star,
  Heart,
  Calendar,
  Shield,
  ClipboardCheck,
  TrendingUp,
  Award,
  Sparkles
};

export const PatientAchievements = memo(({ 
  achievements, 
  totalPoints, 
  nextMilestone,
  progressToNext 
}: PatientAchievementsProps) => {
  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Trophy;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Keep up the great work on your recovery journey!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            {nextMilestone && (
              <div className="text-right">
                <p className="text-lg font-semibold">{nextMilestone}</p>
                <p className="text-sm text-muted-foreground">Next Milestone</p>
              </div>
            )}
          </div>
          
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressToNext}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {nextMilestone - totalPoints} points to go!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements Unlocked ({achievements.length})</CardTitle>
          <CardDescription>
            Badges you have earned on your recovery journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Complete activities to earn your first achievement!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement) => {
                const Icon = getIcon(achievement.badge_icon);
                return (
                  <Card key={achievement.id} className="border-border/50 hover:border-primary/50 transition-colors animate-fade-in hover-scale">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${achievement.badge_color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm">{achievement.name}</h3>
                            {achievement.points_required && (
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.points_required}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {achievement.earned_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Earned {format(new Date(achievement.earned_at), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
