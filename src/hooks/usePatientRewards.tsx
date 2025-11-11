import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface PointEntry {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

export function usePatientRewards(patientId: string | undefined) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentPoints, setRecentPoints] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!patientId) return;
    
    loadRewardsData();
  }, [patientId]);

  const loadRewardsData = async () => {
    if (!patientId) return;
    
    try {
      // Get total points
      const { data: pointsData, error: pointsError } = await supabase
        .rpc('get_patient_total_points', { p_patient_id: patientId });

      if (pointsError) throw pointsError;
      setTotalPoints(pointsData || 0);

      // Get earned achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('patient_achievements')
        .select(`
          id,
          earned_at,
          achievement:achievement_definitions (
            id,
            name,
            description,
            badge_icon,
            badge_color,
            points_required,
            achievement_type
          )
        `)
        .eq('patient_id', patientId)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      const earned = achievementsData?.map((item: any) => ({
        ...item.achievement,
        earned_at: item.earned_at
      })) || [];
      setAchievements(earned);

      // Get recent points
      const { data: recentPointsData, error: recentError } = await supabase
        .from('patient_points')
        .select('id, points, reason, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentPoints(recentPointsData || []);

      // Check for new achievements
      await checkAchievements();
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!patientId) return;

    try {
      await supabase.rpc('check_and_award_achievements', { 
        p_patient_id: patientId 
      });
      
      // Reload after checking for new achievements
      await loadRewardsData();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const awardWelcomePoints = async () => {
    if (!patientId) return;

    try {
      await supabase.rpc('award_patient_points', {
        p_patient_id: patientId,
        p_points: 10,
        p_reason: 'Welcome to PPC Patient Companion!'
      });

      toast({
        title: "Welcome bonus!",
        description: "You earned 10 points for joining!",
      });

      await loadRewardsData();
    } catch (error) {
      console.error('Error awarding welcome points:', error);
    }
  };

  const getNextMilestone = () => {
    const milestones = [100, 250, 500, 1000];
    const next = milestones.find(m => m > totalPoints);
    return next || null;
  };

  const getProgressToNextMilestone = () => {
    const next = getNextMilestone();
    if (!next) return 100;
    
    const previous = [0, 100, 250, 500].reverse().find(m => m <= totalPoints) || 0;
    const range = next - previous;
    const progress = totalPoints - previous;
    return Math.round((progress / range) * 100);
  };

  return {
    totalPoints,
    achievements,
    recentPoints,
    loading,
    nextMilestone: getNextMilestone(),
    progressToNext: getProgressToNextMilestone(),
    awardWelcomePoints,
    refreshRewards: loadRewardsData
  };
}
