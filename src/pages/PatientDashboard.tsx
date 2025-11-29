import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Activity, LogOut, TrendingUp, Calendar, MapPin, User, Loader2, Gift, Trophy, Settings, HeartPulse, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { PatientPWAInstallPrompt } from "@/components/PatientPWAInstallPrompt";
import { PatientAchievements } from "@/components/PatientAchievements";
import PatientReferralCard from "@/components/PatientReferralCard";
import PatientReferralDashboard from "@/components/PatientReferralDashboard";
import { useAuth } from "@/hooks/useAuth";
import { usePatientRewards } from "@/hooks/usePatientRewards";
import RecoverySnapshot from "@/components/RecoverySnapshot";
import CareTeamAccess from "@/components/CareTeamAccess";
import { addDays } from "date-fns";
import { PatientDashboardSkeleton } from "@/components/skeletons/PatientDashboardSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface PatientEpisode {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  start_date: string | null;
  discharge_date: string | null;
  followup_date: string | null;
  followup_time: string | null;
  clinician: string | null;
  diagnosis: string | null;
}

interface EpisodeCardProps {
  episode: PatientEpisode;
  isActive: boolean;
  onNavigate: () => void;
}

const EpisodeCard = memo(({ episode, isActive, onNavigate }: EpisodeCardProps) => {
  const { light } = useHaptics();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    light();
    setDismissed(true);
    setTimeout(() => setDismissed(false), 2000);
  }, [light]);

  const { elementRef, dragOffset } = useSwipeGesture({
    onSwipeLeft: handleDismiss,
    threshold: 100,
    enabled: true,
  });

  if (dismissed) {
    return (
      <Card className="border-dashed opacity-50 animate-fade-in">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Swipe to undo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={elementRef}
      className="cursor-pointer hover:border-primary/50 transition-all animate-fade-in hover-scale"
      style={{
        transform: `translateX(${dragOffset.x}px)`,
        opacity: Math.max(0.5, 1 - Math.abs(dragOffset.x) / 200),
      }}
      onClick={onNavigate}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{episode.patient_name}</h3>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Completed"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{episode.region}</span>
              </div>
              
              {episode.diagnosis && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>{episode.diagnosis}</span>
                </div>
              )}
              
              {episode.clinician && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{episode.clinician}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started {format(new Date(episode.date_of_service), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { success } = useHaptics();
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<PatientEpisode[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [claimingCode, setClaimingCode] = useState(false);
  const [hasAwardedWelcome, setHasAwardedWelcome] = useState(false);
  const [patientAccount, setPatientAccount] = useState<any>(null);
  const [latestScore, setLatestScore] = useState<any>(null);
  const [clinicSettings, setClinicSettings] = useState<any>(null);

  const {
    totalPoints,
    achievements,
    recentPoints,
    loading: rewardsLoading,
    nextMilestone,
    progressToNext,
    awardWelcomePoints,
    refreshRewards
  } = usePatientRewards(user?.id);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Award welcome points on first visit
    if (user && !hasAwardedWelcome && !rewardsLoading && totalPoints === 0) {
      awardWelcomePoints();
      setHasAwardedWelcome(true);
    }
  }, [user, hasAwardedWelcome, rewardsLoading, totalPoints]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/patient-auth");
      return;
    }

    // Check if this is first time user
    const hasSeenWelcome = localStorage.getItem("ppc_patient_welcome_seen");
    if (!hasSeenWelcome) {
      navigate("/patient-welcome");
      return;
    }

    await loadPatientData(session.user.id);
  };

  const loadPatientData = async (userId: string) => {
    try {
      // Load patient account info
      const { data: accountData } = await supabase
        .from("patient_accounts")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (accountData) {
        setPatientAccount(accountData);
      }

      // Load clinic settings
      const { data: settingsData } = await supabase
        .from("clinic_settings")
        .select("*")
        .single();

      if (settingsData) {
        setClinicSettings(settingsData);
      }

      // Load episodes the patient has access to
      const { data: accessData, error: accessError } = await supabase
        .from("patient_episode_access")
        .select(`
          episode_id,
          is_active
        `)
        .eq("patient_id", userId)
        .eq("is_active", true);

      if (accessError) throw accessError;

      if (accessData && accessData.length > 0) {
        const episodeIds = accessData.map(a => a.episode_id);
        
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .in("id", episodeIds)
          .order("date_of_service", { ascending: false });

        if (episodesError) throw episodesError;
        setEpisodes(episodesData || []);

        // Load latest outcome score for active episode
        if (episodeIds.length > 0) {
          const { data: scoresData } = await supabase
            .from("outcome_scores")
            .select("*")
            .in("episode_id", episodeIds)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .single();

          if (scoresData) {
            setLatestScore(scoresData);
          }
        }
      }

      // Load rewards
      const { data: rewardsData } = await supabase
        .from("patient_rewards")
        .select("*")
        .eq("patient_id", userId)
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString());

      setRewards(rewardsData || []);
    } catch (error: any) {
      console.error("Error loading patient data:", error);
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/patient-auth");
  };

  const handleRefresh = useCallback(async () => {
    if (user) {
      await loadPatientData(user.id);
      await refreshRewards();
      success();
    }
  }, [user, success]);

  const handleClaimCode = useCallback(async () => {
    if (!accessCode || accessCode.length !== 8) {
      toast({
        title: "Invalid Code",
        description: "Access code must be 8 characters",
        variant: "destructive",
      });
      return;
    }

    setClaimingCode(true);
    try {
      console.log("Claiming code:", accessCode, "for user:", user?.email);
      
      const { data: accessRecord, error: findError } = await supabase
        .from("patient_episode_access")
        .select("*, patient_accounts!inner(email, full_name, phone)")
        .eq("invitation_code", accessCode.toUpperCase())
        .maybeSingle();

      console.log("Access record found:", accessRecord, "Error:", findError);

      if (findError) throw findError;

      if (!accessRecord) {
        throw new Error("Invalid access code");
      }

      if (accessRecord.code_used_at) {
        throw new Error("This code has already been used");
      }

      const patientEmail = accessRecord.patient_accounts.email;
      if (patientEmail !== user?.email) {
        throw new Error(`This code was issued for ${patientEmail}`);
      }

      // Get the original patient account details
      const originalPatientData = accessRecord.patient_accounts;
      const originalPatientId = accessRecord.patient_id;

      console.log("Updating patient_episode_access to point to:", user!.id);
      
      const { error: updateError } = await supabase
        .from("patient_episode_access")
        .update({ 
          patient_id: user!.id,
          code_used_at: new Date().toISOString() 
        })
        .eq("id", accessRecord.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Upserting patient_accounts with:", originalPatientData);

      // Upsert the current user's patient_accounts with the original invitation data
      const { error: upsertError } = await supabase
        .from("patient_accounts")
        .upsert({
          id: user!.id,
          email: originalPatientData.email,
          full_name: originalPatientData.full_name,
          phone: originalPatientData.phone,
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        throw upsertError;
      }

      // Delete the old patient_accounts record if it's different
      if (originalPatientId !== user!.id) {
        console.log("Deleting old patient_accounts:", originalPatientId);
        const { error: deleteError } = await supabase
          .from("patient_accounts")
          .delete()
          .eq("id", originalPatientId);
          
        if (deleteError) {
          console.error("Delete error:", deleteError);
          // Don't throw - this is not critical
        }
      }

      toast({
        title: "Success!",
        description: "Episode access granted",
      });

      setAccessCode("");
      await loadPatientData(user!.id);
    } catch (error: any) {
      console.error("Claim code error:", error);
      toast({
        title: "Failed to Claim Code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaimingCode(false);
    }
  }, [accessCode, user, toast, loadPatientData]);

  // Memoize computed values
  const activeEpisodes = useMemo(() => 
    episodes.filter(e => !e.discharge_date), 
    [episodes]
  );
  
  const completedEpisodes = useMemo(() => 
    episodes.filter(e => e.discharge_date), 
    [episodes]
  );
  
  const firstActiveEpisode = useMemo(() => 
    activeEpisodes[0], 
    [activeEpisodes]
  );

  if (loading) {
    return <PatientDashboardSkeleton />;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        {/* Header with Personalized Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-primary">PPC Patient Hub</h1>
                <span className="text-muted-foreground">•</span>
                <span className="text-lg font-semibold">
                  Welcome back, {patientAccount?.full_name?.split(' ')[0] || 'there'}! 👋
                </span>
              </div>
              <p className="text-muted-foreground">
                {activeEpisodes.length > 0 
                  ? "Keep up the great work on your recovery journey"
                  : "View your completed treatment history"}
              </p>
              {achievements.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {achievements.slice(0, 3).map((achievement) => (
                    <Badge 
                      key={achievement.id} 
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {achievement.badge_icon} {achievement.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/patient-quick-start")}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Start</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/patient-preferences")}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PatientPWAInstallPrompt />

        {/* Recovery Snapshot Widget */}
        {activeEpisodes.length > 0 && (
          <RecoverySnapshot
            patientName={patientAccount?.full_name}
            treatmentArea={firstActiveEpisode?.region}
            clinicName={clinicSettings?.clinic_name}
            clinicAddress={clinicSettings?.address}
            clinicPhone={clinicSettings?.phone}
            nextVisit={
              episodes.find(e => e.followup_date && !e.discharge_date) 
                ? {
                    date: episodes.find(e => e.followup_date && !e.discharge_date)!.followup_date!,
                    time: episodes.find(e => e.followup_time && !e.discharge_date)?.followup_time,
                    clinician: episodes.find(e => e.clinician && !e.discharge_date)?.clinician,
                  }
                : undefined
            }
            lastScore={
              latestScore
                ? {
                    index: latestScore.index_type,
                    score: latestScore.score,
                    date: latestScore.recorded_at,
                  }
                : undefined
            }
            nextAction={
              episodes.find(e => e.followup_date && !e.discharge_date)
                ? {
                    title: "Complete outcome assessment",
                    dueDate: episodes.find(e => e.followup_date && !e.discharge_date)!.followup_date!,
                    priority: "medium" as const,
                  }
                : undefined
            }
          />
        )}

        {/* Care Team Access */}
        {activeEpisodes.length > 0 && (
          <CareTeamAccess 
            patientId={user?.id || ''} 
            episodeId={firstActiveEpisode?.id}
          />
        )}

        {/* Claim Access Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Episode Access</CardTitle>
            <CardDescription>
              Enter an access code from your clinician to view more episodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 8-character code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono tracking-wider"
              />
              <Button 
                onClick={handleClaimCode} 
                disabled={claimingCode || accessCode.length !== 8}
              >
                {claimingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Claim Access"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Episodes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeEpisodes.length}
              </div>
              <p className="text-xs text-muted-foreground">Currently in treatment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedEpisodes.length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                {nextMilestone ? `${nextMilestone - totalPoints} to next level` : 'Max level reached!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Episodes, Achievements, and Referrals */}
        <Tabs defaultValue="episodes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="episodes">My Episodes</TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="referrals">Refer Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes">
            <Card>
              <CardHeader>
                <CardTitle>Your Treatment Episodes</CardTitle>
                <CardDescription>
                  View and track your rehabilitative care episodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {episodes.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      No episodes yet. Ask your clinician for an access code to view your episodes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {episodes.map((episode) => {
                      const isActive = !episode.discharge_date;
                      return (
                        <EpisodeCard
                          key={episode.id}
                          episode={episode}
                          isActive={isActive}
                          onNavigate={() => navigate(`/patient-episode/${episode.id}`)}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <PatientAchievements
              achievements={achievements}
              totalPoints={totalPoints}
              nextMilestone={nextMilestone}
              progressToNext={progressToNext}
            />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <PatientReferralCard patientId={user?.id || ''} />
            <PatientReferralDashboard patientId={user?.id || ''} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </PullToRefresh>
  );
}
