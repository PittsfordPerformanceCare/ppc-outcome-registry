import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Activity, LogOut, TrendingUp, Calendar, MapPin, User, Loader2, Gift, Trophy, Settings } from "lucide-react";
import { format } from "date-fns";
import { PatientPWAInstallPrompt } from "@/components/PatientPWAInstallPrompt";
import { PatientAchievements } from "@/components/PatientAchievements";
import { usePatientRewards } from "@/hooks/usePatientRewards";

interface PatientEpisode {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  start_date: string | null;
  discharge_date: string | null;
  clinician: string | null;
  diagnosis: string | null;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [episodes, setEpisodes] = useState<PatientEpisode[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [claimingCode, setClaimingCode] = useState(false);
  const [hasAwardedWelcome, setHasAwardedWelcome] = useState(false);

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

    setUser(session.user);
    await loadPatientData(session.user.id);
  };

  const loadPatientData = async (userId: string) => {
    try {
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

  const handleClaimCode = async () => {
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
      const { data: accessRecord, error: findError } = await supabase
        .from("patient_episode_access")
        .select("*, patient_accounts!inner(email)")
        .eq("invitation_code", accessCode.toUpperCase())
        .maybeSingle();

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

      const { error: updateError } = await supabase
        .from("patient_episode_access")
        .update({ code_used_at: new Date().toISOString() })
        .eq("id", accessRecord.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: "Episode access granted",
      });

      setAccessCode("");
      if (user) await loadPatientData(user.id);
    } catch (error: any) {
      toast({
        title: "Failed to Claim Code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaimingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Health Journey</h1>
              <p className="text-muted-foreground">Welcome back!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/patient-preferences")}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PatientPWAInstallPrompt />

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
                {episodes.filter(e => !e.discharge_date).length}
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
                {episodes.filter(e => e.discharge_date).length}
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

        {/* Tabs for Episodes and Achievements */}
        <Tabs defaultValue="episodes" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="episodes">My Episodes</TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="episodes">
            <Card>
              <CardHeader>
                <CardTitle>Your Treatment Episodes</CardTitle>
                <CardDescription>
                  View and track your physical therapy episodes
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
                        <Card
                          key={episode.id}
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => navigate(`/patient-episode/${episode.id}`)}
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
                                    <span>
                                      Started {format(new Date(episode.date_of_service), "MMM d, yyyy")}
                                    </span>
                                  </div>
                                </div>
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
          </TabsContent>

          <TabsContent value="achievements">
            <PatientAchievements
              achievements={achievements}
              totalPoints={totalPoints}
              nextMilestone={nextMilestone}
              progressToNext={progressToNext}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
