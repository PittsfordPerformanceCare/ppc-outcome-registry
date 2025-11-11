import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Award, Target, Calendar, Trophy, Settings } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ReferralReportScheduler } from "@/components/ReferralReportScheduler";

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  conversionRate: number;
  totalNewPatients: number;
}

interface TopReferrer {
  id: string;
  full_name: string;
  email: string;
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  hasMilestone3: boolean;
  hasMilestone5: boolean;
  hasMilestone10: boolean;
}

interface ReferralTrend {
  date: string;
  count: number;
  converted: number;
}

export default function ReferralAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    convertedReferrals: 0,
    pendingReferrals: 0,
    conversionRate: 0,
    totalNewPatients: 0,
  });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<ReferralTrend[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate: Date | null = null;
      
      if (timeRange === "week") {
        startDate = subDays(now, 7);
      } else if (timeRange === "month") {
        startDate = startOfMonth(now);
      }

      // Build query with optional date filter
      let query = supabase.from("patient_referrals").select("*");
      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data: referrals, error } = await query;

      if (error) throw error;

      // Calculate overall stats
      const totalReferrals = referrals?.length || 0;
      const convertedReferrals = referrals?.filter(r => r.status === "converted").length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;
      const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

      setStats({
        totalReferrals,
        convertedReferrals,
        pendingReferrals,
        conversionRate,
        totalNewPatients: convertedReferrals,
      });

      // Get top referrers
      const referrerMap = new Map<string, TopReferrer>();
      
      for (const referral of referrals || []) {
        if (!referral.referrer_patient_id) continue;

        const key = referral.referrer_patient_id;
        if (!referrerMap.has(key)) {
          // Fetch patient details
          const { data: patient } = await supabase
            .from("patient_accounts")
            .select("full_name, email")
            .eq("id", referral.referrer_patient_id)
            .maybeSingle();

          if (patient) {
            referrerMap.set(key, {
              id: referral.referrer_patient_id,
              full_name: patient.full_name,
              email: patient.email,
              totalReferrals: 0,
              convertedReferrals: 0,
              conversionRate: 0,
              hasMilestone3: !!referral.milestone_3_awarded_at,
              hasMilestone5: !!referral.milestone_5_awarded_at,
              hasMilestone10: !!referral.milestone_10_awarded_at,
            });
          }
        }

        const referrer = referrerMap.get(key);
        if (referrer) {
          referrer.totalReferrals++;
          if (referral.status === "converted") {
            referrer.convertedReferrals++;
          }
          referrer.conversionRate = referrer.totalReferrals > 0 
            ? (referrer.convertedReferrals / referrer.totalReferrals) * 100 
            : 0;
        }
      }

      const sortedReferrers = Array.from(referrerMap.values())
        .sort((a, b) => b.convertedReferrals - a.convertedReferrals)
        .slice(0, 10);

      setTopReferrers(sortedReferrers);

      // Get recent referrals
      const recent = (referrals || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setRecentReferrals(recent);

      // Calculate monthly trends for the current month
      if (timeRange === "month" || timeRange === "all") {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const trends: ReferralTrend[] = [];

        for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = format(d, "yyyy-MM-dd");
          const dayReferrals = referrals?.filter(r => 
            format(new Date(r.created_at), "yyyy-MM-dd") === dateStr
          ) || [];
          
          trends.push({
            date: dateStr,
            count: dayReferrals.length,
            converted: dayReferrals.filter(r => r.status === "converted").length,
          });
        }

        setMonthlyTrends(trends);
      }

    } catch (error) {
      console.error("Error loading referral analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneBadge = (referrer: TopReferrer) => {
    if (referrer.hasMilestone10) {
      return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">💎 VIP</Badge>;
    }
    if (referrer.hasMilestone5) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">⭐ Ambassador</Badge>;
    }
    if (referrer.hasMilestone3) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">🌟 Builder</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Main Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Referral Analytics</h1>
            <p className="text-muted-foreground">Track and analyze patient referral performance</p>
          </div>
          <TabsList>
            <TabsTrigger value="analytics">
              <Trophy className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Settings className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Time Range Filter */}
          <div className="flex justify-end">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="week">Last 7 Days</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingReferrals} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.convertedReferrals}
            </div>
            <p className="text-xs text-muted-foreground">New patients acquired</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Referral to episode</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Referrers</CardTitle>
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {topReferrers.length}
            </div>
            <p className="text-xs text-muted-foreground">Active advocates</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Top Referrers
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Calendar className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Top Referrers Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers Leaderboard</CardTitle>
              <CardDescription>
                Patients who have successfully referred the most new patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No referrals yet. Encourage patients to share!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topReferrers.map((referrer, index) => (
                    <div
                      key={referrer.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{referrer.full_name}</p>
                            {getMilestoneBadge(referrer)}
                          </div>
                          <p className="text-sm text-muted-foreground">{referrer.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 items-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {referrer.convertedReferrals}
                          </p>
                          <p className="text-xs text-muted-foreground">Converted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{referrer.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {referrer.conversionRate.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Referral Activity</CardTitle>
              <CardDescription>Latest referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReferrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent referral activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {referral.referred_patient_name || referral.referred_patient_email || "Pending submission"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Referred on {format(new Date(referral.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div>
                        {referral.status === "converted" && (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                            Converted
                          </Badge>
                        )}
                        {referral.status === "completed" && (
                          <Badge variant="secondary">Form Submitted</Badge>
                        )}
                        {referral.status === "pending" && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReferralReportScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}
