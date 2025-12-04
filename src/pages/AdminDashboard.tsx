import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarClock, TrendingUp, ArrowRight } from "lucide-react";
import MissingEpisodeAlerts from "@/components/MissingEpisodeAlerts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsThisWeek: 0,
    pendingIntakes: 0,
    upcomingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const todayStr = now.toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Total leads
        const { count: totalLeads } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true });

        // Leads this week
        const { count: leadsThisWeek } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo);

        // Pending intakes (leads without intake_completed_at)
        const { count: pendingIntakes } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .is("intake_completed_at", null);

        // Upcoming appointments (next 24 hours)
        const { count: upcomingAppointments } = await supabase
          .from("intake_appointments")
          .select("*", { count: "exact", head: true })
          .in("status", ["scheduled", "pending"])
          .gte("scheduled_date", todayStr)
          .lte("scheduled_date", tomorrowStr);

        setStats({
          totalLeads: totalLeads || 0,
          leadsThisWeek: leadsThisWeek || 0,
          pendingIntakes: pendingIntakes || 0,
          upcomingAppointments: upcomingAppointments || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of leads, appointments, and visit readiness
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{loading ? "—" : stats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{loading ? "—" : stats.leadsThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Intakes</p>
                <p className="text-2xl font-bold">{loading ? "—" : stats.pendingIntakes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarClock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming (24h)</p>
                <p className="text-2xl font-bold">{loading ? "—" : stats.upcomingAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Episode Alerts */}
      <MissingEpisodeAlerts />

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lead Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all leads, track reminder status, and monitor conversions.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin/leads">
                View All Leads <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lead Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View conversion funnels, attribution data, and performance metrics.
            </p>
            <Button asChild variant="outline">
              <Link to="/lead-analytics">
                View Analytics <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
