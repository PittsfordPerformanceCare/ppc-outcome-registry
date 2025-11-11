import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Referral {
  id: string;
  referred_patient_name: string | null;
  referred_patient_email: string | null;
  status: string;
  created_at: string;
  intake_submitted_at: string | null;
  converted_at: string | null;
}

interface PatientReferralDashboardProps {
  patientId: string;
}

const PatientReferralDashboard = ({ patientId }: PatientReferralDashboardProps) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    converted: 0,
  });
  const [milestones, setMilestones] = useState({
    milestone3: false,
    milestone5: false,
    milestone10: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, [patientId]);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_referrals")
        .select("*")
        .eq("referrer_patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReferrals(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(r => r.status === "pending").length || 0;
      const completed = data?.filter(r => r.status === "completed").length || 0;
      const converted = data?.filter(r => r.status === "converted").length || 0;

      setStats({ total, pending, completed, converted });

      // Check milestone status from first record
      if (data && data.length > 0) {
        const firstRecord = data[0] as any;
        setMilestones({
          milestone3: !!firstRecord.milestone_3_awarded_at,
          milestone5: !!firstRecord.milestone_5_awarded_at,
          milestone10: !!firstRecord.milestone_10_awarded_at,
        });
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline", label: string, icon: JSX.Element }> = {
      pending: { variant: "outline", label: "Pending", icon: <Clock className="w-3 h-3" /> },
      completed: { variant: "secondary", label: "Form Submitted", icon: <CheckCircle className="w-3 h-3" /> },
      converted: { variant: "default", label: "Approved!", icon: <Gift className="w-3 h-3" /> },
    };

    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Milestone Badges */}
      {(milestones.milestone3 || milestones.milestone5 || milestones.milestone10) && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
          <h3 className="font-semibold text-lg mb-4">🏆 Your Milestones</h3>
          <div className="flex gap-4 flex-wrap">
            {milestones.milestone3 && (
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-lg px-4 py-2 border border-primary/20">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="text-sm font-medium">Community Builder</p>
                  <p className="text-xs text-muted-foreground">3 Referrals</p>
                </div>
              </div>
            )}
            {milestones.milestone5 && (
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-lg px-4 py-2 border border-purple-500/20">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-sm font-medium">Trusted Ambassador</p>
                  <p className="text-xs text-muted-foreground">5 Referrals</p>
                </div>
              </div>
            )}
            {milestones.milestone10 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur rounded-lg px-4 py-2 border-2 border-amber-500/30">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">VIP Care Advocate</p>
                  <p className="text-xs text-muted-foreground">10 Referrals - Elite Status!</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Submitted</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.converted}</p>
              <p className="text-xs text-muted-foreground">Converted</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Referrals List */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Your Referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No referrals yet. Share your code to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {referral.referred_patient_name || referral.referred_patient_email || "Pending submission"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Referred on {format(new Date(referral.created_at), "MMM d, yyyy")}
                  </p>
                  {referral.converted_at && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✨ +100 points earned!
                    </p>
                  )}
                </div>
                <div>
                  {getStatusBadge(referral.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientReferralDashboard;
