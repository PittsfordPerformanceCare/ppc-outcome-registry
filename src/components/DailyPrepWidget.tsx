import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  RefreshCw,
  FileText,
  Clock,
  Flag,
  UserPlus,
  Activity,
  Phone
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, addDays, subDays } from "date-fns";

interface DailyPrepSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: any[];
  loading: boolean;
  expanded: boolean;
}

interface NewIntake {
  id: string;
  patient_name: string;
  chief_complaint: string;
  created_at: string;
  status: string;
  appointment_date?: string;
  appointment_time?: string;
}

interface MissingIntakePatient {
  id: string;
  patient_name: string;
  scheduled_date: string;
  scheduled_time: string;
  has_intake: boolean;
}

interface EpisodeToClose {
  id: string;
  patient_name: string;
  region: string;
  episode_type: string;
  date_of_service: string;
  last_visit_date?: string;
  has_baseline: boolean;
  has_recent_score: boolean;
}

interface SpecialFlag {
  id: string;
  type: string;
  patient_name: string;
  description: string;
  created_at: string;
  episode_id?: string;
}

interface InboxTask {
  id: string;
  title: string;
  type: string;
  patient_name?: string;
  episode_id?: string;
  due_date?: string;
  status: string;
}

export function DailyPrepWidget() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "week">("today");
  
  const [sections, setSections] = useState<Record<string, DailyPrepSection>>({
    newIntakes: {
      id: "newIntakes",
      title: "New Intakes",
      icon: <ClipboardList className="h-4 w-4" />,
      items: [],
      loading: true,
      expanded: true
    },
    missingIntakes: {
      id: "missingIntakes",
      title: "Patients Missing Intake",
      icon: <AlertTriangle className="h-4 w-4" />,
      items: [],
      loading: true,
      expanded: true
    },
    readyToClose: {
      id: "readyToClose",
      title: "Episodes Ready to Close",
      icon: <CheckCircle2 className="h-4 w-4" />,
      items: [],
      loading: true,
      expanded: true
    },
    specialFlags: {
      id: "specialFlags",
      title: "Special Situation Flags",
      icon: <Flag className="h-4 w-4" />,
      items: [],
      loading: true,
      expanded: true
    },
    inboxTasks: {
      id: "inboxTasks",
      title: "Inbox Items",
      icon: <MessageSquare className="h-4 w-4" />,
      items: [],
      loading: true,
      expanded: true
    }
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
  }, [userId, timeFilter]);

  const loadAllData = useCallback(async () => {
    if (!userId) return;
    
    await Promise.all([
      loadNewIntakes(),
      loadMissingIntakes(),
      loadEpisodesToClose(),
      loadSpecialFlags(),
      loadInboxTasks()
    ]);
  }, [userId, timeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const updateSection = (sectionId: string, updates: Partial<DailyPrepSection>) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...updates }
    }));
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], expanded: !prev[sectionId].expanded }
    }));
  };

  // Load new intakes assigned to clinician
  const loadNewIntakes = async () => {
    updateSection("newIntakes", { loading: true });
    try {
      const dateLimit = timeFilter === "today" 
        ? subDays(new Date(), 3).toISOString()
        : subDays(new Date(), 7).toISOString();

      // Get intake forms that are pending review or recently created
      const { data: intakes, error } = await supabase
        .from("intake_forms")
        .select(`
          id,
          patient_name,
          chief_complaint,
          created_at,
          status,
          converted_to_episode_id
        `)
        .in("status", ["pending", "submitted"])
        .is("converted_to_episode_id", null)
        .gte("created_at", dateLimit)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get any associated appointments
      const intakeIds = intakes?.map(i => i.id) || [];
      let appointmentsMap: Record<string, any> = {};
      
      if (intakeIds.length > 0) {
        const { data: appointments } = await supabase
          .from("intake_appointments")
          .select("intake_form_id, scheduled_date, scheduled_time")
          .in("intake_form_id", intakeIds);
        
        appointments?.forEach(apt => {
          if (apt.intake_form_id) {
            appointmentsMap[apt.intake_form_id] = apt;
          }
        });
      }

      const items: NewIntake[] = (intakes || []).map(intake => ({
        id: intake.id,
        patient_name: intake.patient_name,
        chief_complaint: intake.chief_complaint,
        created_at: intake.created_at || "",
        status: intake.status,
        appointment_date: appointmentsMap[intake.id]?.scheduled_date,
        appointment_time: appointmentsMap[intake.id]?.scheduled_time
      }));

      updateSection("newIntakes", { items, loading: false });
    } catch (error) {
      console.error("Error loading new intakes:", error);
      updateSection("newIntakes", { items: [], loading: false });
    }
  };

  // Load patients with upcoming appointments but missing intake
  const loadMissingIntakes = async () => {
    updateSection("missingIntakes", { loading: true });
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = timeFilter === "today"
        ? addDays(new Date(), 1).toISOString().split("T")[0]
        : addDays(new Date(), 7).toISOString().split("T")[0];

      const { data: appointments, error } = await supabase
        .from("intake_appointments")
        .select(`
          id,
          patient_name,
          scheduled_date,
          scheduled_time,
          intake_form_id,
          status
        `)
        .gte("scheduled_date", today)
        .lte("scheduled_date", endDate)
        .in("status", ["scheduled", "pending"]);

      if (error) throw error;

      // Filter to those without completed intake
      const items: MissingIntakePatient[] = (appointments || [])
        .filter(apt => !apt.intake_form_id)
        .map(apt => ({
          id: apt.id,
          patient_name: apt.patient_name,
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          has_intake: false
        }));

      updateSection("missingIntakes", { items, loading: false });
    } catch (error) {
      console.error("Error loading missing intakes:", error);
      updateSection("missingIntakes", { items: [], loading: false });
    }
  };

  // Load episodes ready to close
  const loadEpisodesToClose = async () => {
    updateSection("readyToClose", { loading: true });
    try {
      // Get active episodes (no discharge_date) for this clinician
      const threeDaysAgo = subDays(new Date(), 3).toISOString().split("T")[0];

      const { data: episodes, error } = await supabase
        .from("episodes")
        .select(`
          id,
          patient_name,
          region,
          episode_type,
          date_of_service,
          user_id,
          discharge_date
        `)
        .eq("user_id", userId)
        .is("discharge_date", null)
        .lte("date_of_service", threeDaysAgo)
        .order("date_of_service", { ascending: true })
        .limit(10);

      if (error) throw error;

      // Check for outcome scores
      const episodeIds = episodes?.map(e => e.id) || [];
      let scoresMap: Record<string, { hasBaseline: boolean; hasRecent: boolean }> = {};
      
      if (episodeIds.length > 0) {
        const { data: scores } = await supabase
          .from("outcome_scores")
          .select("episode_id, score_type, recorded_at")
          .in("episode_id", episodeIds);

        episodeIds.forEach(epId => {
          const epScores = scores?.filter(s => s.episode_id === epId) || [];
          scoresMap[epId] = {
            hasBaseline: epScores.some(s => s.score_type === "baseline"),
            hasRecent: epScores.some(s => s.score_type !== "baseline")
          };
        });
      }

      const items: EpisodeToClose[] = (episodes || [])
        .filter(ep => scoresMap[ep.id]?.hasBaseline) // Only show if they have baseline
        .map(ep => ({
          id: ep.id,
          patient_name: ep.patient_name,
          region: ep.region,
          episode_type: ep.episode_type || "MSK",
          date_of_service: ep.date_of_service,
          has_baseline: scoresMap[ep.id]?.hasBaseline || false,
          has_recent_score: scoresMap[ep.id]?.hasRecent || false
        }));

      updateSection("readyToClose", { items, loading: false });
    } catch (error) {
      console.error("Error loading episodes to close:", error);
      updateSection("readyToClose", { items: [], loading: false });
    }
  };

  // Load special situation flags
  const loadSpecialFlags = async () => {
    updateSection("specialFlags", { loading: true });
    try {
      const flags: SpecialFlag[] = [];

      // Get special situations from the new table for this clinician
      const { data: specialSituations } = await supabase
        .from("special_situations")
        .select("id, situation_type, patient_name, summary, detected_at, episode_id")
        .eq("clinician_id", userId)
        .eq("status", "open")
        .order("detected_at", { ascending: false })
        .limit(10);

      specialSituations?.forEach(situation => {
        const typeLabels: Record<string, string> = {
          referral_initiated: "Referral",
          new_neurologic_symptoms: "Neuro Symptoms",
          red_flag: "Red Flag",
          emergency_or_911: "Emergency",
          provider_transition: "Provider Transition",
          change_in_plan_unexpected: "Plan Change"
        };
        flags.push({
          id: situation.id,
          type: typeLabels[situation.situation_type] || situation.situation_type,
          patient_name: situation.patient_name,
          description: situation.summary,
          created_at: situation.detected_at,
          episode_id: situation.episode_id
        });
      });

      // Get pending ortho referrals with episode info
      const { data: referrals } = await supabase
        .from("ortho_referrals")
        .select(`
          id,
          referral_reason_primary,
          created_at,
          episode_id,
          episodes!inner(patient_name)
        `)
        .eq("return_to_registry_required", true)
        .order("created_at", { ascending: false })
        .limit(5);

      referrals?.forEach((ref: any) => {
        flags.push({
          id: ref.id,
          type: "Ortho Referral",
          patient_name: ref.episodes?.patient_name || "Unknown",
          description: ref.referral_reason_primary || "Pending ortho referral",
          created_at: ref.created_at,
          episode_id: ref.episode_id
        });
      });

      // Get pending neurologic leads
      const { data: neuroLeads } = await supabase
        .from("neurologic_intake_leads")
        .select("id, name, primary_concern, created_at, status")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(5);

      neuroLeads?.forEach(lead => {
        flags.push({
          id: lead.id,
          type: "Neuro Lead",
          patient_name: lead.name || "Unknown",
          description: lead.primary_concern || "New neurologic inquiry",
          created_at: lead.created_at
        });
      });

      // Get pending referral inquiries
      const { data: inquiries } = await supabase
        .from("referral_inquiries")
        .select("id, name, chief_complaint, created_at, status")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      inquiries?.forEach(inq => {
        flags.push({
          id: inq.id,
          type: "Referral Inquiry",
          patient_name: inq.name || "Unknown",
          description: inq.chief_complaint || "Pending inquiry",
          created_at: inq.created_at
        });
      });

      // Sort by date
      flags.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      updateSection("specialFlags", { items: flags.slice(0, 10), loading: false });
    } catch (error) {
      console.error("Error loading special flags:", error);
      updateSection("specialFlags", { items: [], loading: false });
    }
  };

  // Load inbox tasks
  const loadInboxTasks = async () => {
    updateSection("inboxTasks", { loading: true });
    try {
      const tasks: InboxTask[] = [];

      // Get pending PCP summary tasks
      const { data: pcpTasks } = await supabase
        .from("pcp_summary_tasks")
        .select("id, patient_name, episode_id, created_at, status")
        .eq("status", "pending")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      pcpTasks?.forEach(task => {
        tasks.push({
          id: task.id,
          title: "Send PCP Summary",
          type: "pcp_summary",
          patient_name: task.patient_name,
          episode_id: task.episode_id,
          status: task.status
        });
      });

      // Get pending patient messages
      const { data: messages } = await supabase
        .from("patient_messages")
        .select("id, subject, message_type, status, created_at, episode_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      messages?.forEach(msg => {
        tasks.push({
          id: msg.id,
          title: msg.message_type === "callback_request" ? "Callback Request" : (msg.subject || "Patient Message"),
          type: msg.message_type || "message",
          episode_id: msg.episode_id,
          status: msg.status
        });
      });

      // Get missing episode alerts
      const { data: alerts } = await supabase
        .from("missing_episode_alerts")
        .select("id, patient_name, scheduled_date, status")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      alerts?.forEach(alert => {
        tasks.push({
          id: alert.id,
          title: "Missing Episode Alert",
          type: "missing_episode",
          patient_name: alert.patient_name,
          due_date: alert.scheduled_date,
          status: alert.status
        });
      });

      updateSection("inboxTasks", { items: tasks, loading: false });
    } catch (error) {
      console.error("Error loading inbox tasks:", error);
      updateSection("inboxTasks", { items: [], loading: false });
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const totalPendingCount = Object.values(sections).reduce((sum, section) => sum + section.items.length, 0);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Daily Prep
              {totalPendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalPendingCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your high-priority actions for {timeFilter === "today" ? "today" : "this week"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={timeFilter === "today" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("today")}
                className="rounded-none"
              >
                Today
              </Button>
              <Button
                variant={timeFilter === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("week")}
                className="rounded-none"
              >
                7 Days
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* New Intakes Section */}
        <SectionCollapsible
          section={sections.newIntakes}
          onToggle={() => toggleSection("newIntakes")}
          renderItem={(item: NewIntake) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/intake-review?id=${item.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">{item.patient_name}</span>
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.chief_complaint}
                </p>
              </div>
              {item.appointment_date && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getDateLabel(item.appointment_date)}
                </div>
              )}
            </div>
          )}
        />

        {/* Missing Intakes Section */}
        <SectionCollapsible
          section={sections.missingIntakes}
          onToggle={() => toggleSection("missingIntakes")}
          emptyIcon={<CheckCircle2 className="h-8 w-8 text-green-500" />}
          emptyMessage="All scheduled patients have completed intake"
          renderItem={(item: MissingIntakePatient) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="font-medium text-sm">{item.patient_name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getDateLabel(item.scheduled_date)} at {item.scheduled_time}
                </p>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Missing Intake
              </Badge>
            </div>
          )}
        />

        {/* Episodes Ready to Close */}
        <SectionCollapsible
          section={sections.readyToClose}
          onToggle={() => toggleSection("readyToClose")}
          emptyMessage="No episodes pending closure"
          renderItem={(item: EpisodeToClose) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/discharge?episode=${item.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.patient_name}</span>
                  <Badge variant="outline" className="text-xs">{item.episode_type}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.region}</span>
                  {item.has_recent_score && (
                    <Badge variant="secondary" className="text-xs">Has Scores</Badge>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Close
              </Button>
            </div>
          )}
        />

        {/* Special Flags */}
        <SectionCollapsible
          section={sections.specialFlags}
          onToggle={() => toggleSection("specialFlags")}
          emptyIcon={<CheckCircle2 className="h-8 w-8 text-green-500" />}
          emptyMessage="No special situations requiring attention"
          renderItem={(item: SpecialFlag) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-purple-500" />
                  <span className="font-medium text-sm">{item.patient_name}</span>
                  <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {item.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(item.created_at), "MMM d")}
              </span>
            </div>
          )}
        />

        {/* Inbox Tasks */}
        <SectionCollapsible
          section={sections.inboxTasks}
          onToggle={() => toggleSection("inboxTasks")}
          emptyMessage="All inbox items are up to date"
          renderItem={(item: InboxTask) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => {
                if (item.type === "pcp_summary") navigate(`/pcp-summary?episode=${item.episode_id}`);
                else if (item.type === "callback_request" || item.type === "message") navigate("/clinician-inbox");
                else if (item.type === "missing_episode") navigate("/admin");
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.type === "pcp_summary" && <FileText className="h-3 w-3 text-blue-500" />}
                  {item.type === "callback_request" && <Phone className="h-3 w-3 text-orange-500" />}
                  {item.type === "message" && <MessageSquare className="h-3 w-3 text-green-500" />}
                  {item.type === "missing_episode" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                {item.patient_name && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.patient_name}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {item.status}
              </Badge>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}

// Collapsible section component
function SectionCollapsible({ 
  section, 
  onToggle, 
  renderItem,
  emptyIcon,
  emptyMessage = "No items"
}: { 
  section: DailyPrepSection;
  onToggle: () => void;
  renderItem: (item: any) => React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <Collapsible open={section.expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {section.expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {section.icon}
          <span className="font-medium text-sm">{section.title}</span>
          {section.items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {section.items.length}
            </Badge>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pl-6">
        {section.loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : section.items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {emptyIcon || <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />}
            <p className="text-xs">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {section.items.map(renderItem)}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}