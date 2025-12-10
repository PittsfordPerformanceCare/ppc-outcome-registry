import { useState } from "react";
import { useMyDayData, TodayAppointment, EpisodeNeedingAction } from "@/hooks/useMyDayData";
import { CasePreviewPanel } from "@/components/CasePreviewPanel";
import { ClinicianAppointment } from "@/hooks/useClinicianAppointments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  RefreshCw, 
  User, 
  FileCheck, 
  FileX,
  ChevronRight,
  Activity,
  Stethoscope,
  Baby,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const MyDay = () => {
  const { 
    todayNPEs, 
    todayFollowups, 
    episodesNeedingAction,
    loading, 
    refetch 
  } = useMyDayData();
  
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicianAppointment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Convert TodayAppointment to ClinicianAppointment for the preview panel
  const handleOpenNPEPreview = (apt: TodayAppointment) => {
    const converted: ClinicianAppointment = {
      id: apt.id,
      patient_name: apt.patient_name,
      patient_email: apt.patient_email,
      scheduled_date: apt.scheduled_date,
      scheduled_time: apt.scheduled_time,
      status: apt.status,
      intake_form_id: apt.intake_form_id,
      lead_id: null,
      lead_data: apt.lead_data ? {
        ...apt.lead_data,
        who_is_this_for: null,
        utm_source: null,
        created_at: null,
      } : null,
      intake_form_data: apt.intake_form_data ? {
        ...apt.intake_form_data,
        symptoms: null,
        primary_care_physician: null,
        complaints: null,
      } : null,
      condition_type: apt.condition_type,
      is_referral: apt.is_referral,
      form_status: apt.form_status,
    };
    setSelectedAppointment(converted);
    setPreviewOpen(true);
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return time;
    }
  };

  const getConditionIcon = (type: string) => {
    switch (type) {
      case "neuro":
        return <Activity className="h-4 w-4 text-purple-600" />;
      case "msk":
        return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case "pediatric":
        return <Baby className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConditionBadge = (type: string) => {
    switch (type) {
      case "neuro":
        return <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 text-xs">Neuro</Badge>;
      case "msk":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-xs">MSK</Badge>;
      case "pediatric":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">Pediatric</Badge>;
      default:
        return null;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "ready_for_discharge":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">Ready for Discharge</Badge>;
      case "overdue_followup":
        return <Badge className="bg-red-500/10 text-red-700 border-red-200 text-xs">Overdue</Badge>;
      case "needs_followup":
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-xs">Needs Follow-up</Badge>;
      case "pending_ortho_return":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-xs">Ortho Return</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Needs Attention</Badge>;
    }
  };

  // NPE Card Component
  const NPECard = ({ appointment }: { appointment: TodayAppointment }) => (
    <div 
      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
      onClick={() => handleOpenNPEPreview(appointment)}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 text-center">
          <span className="text-lg font-semibold">{formatTime(appointment.scheduled_time)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getConditionIcon(appointment.condition_type)}
          <div>
            <p className="font-medium">{appointment.patient_name}</p>
            <div className="flex items-center gap-2 mt-1">
              {getConditionBadge(appointment.condition_type)}
              {appointment.is_referral && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-xs">
                  Referral
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {appointment.form_status === "completed" ? (
          <div className="flex items-center gap-1.5 text-green-600">
            <FileCheck className="h-4 w-4" />
            <span className="text-xs">Forms Complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileX className="h-4 w-4" />
            <span className="text-xs">Pending</span>
          </div>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );

  // Follow-up Card Component
  const FollowupCard = ({ appointment }: { appointment: TodayAppointment }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 text-center">
          <span className="text-lg font-semibold">{formatTime(appointment.scheduled_time)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getConditionIcon(appointment.condition_type)}
          <div>
            <p className="font-medium">{appointment.patient_name}</p>
            <div className="flex items-center gap-2 mt-1">
              {getConditionBadge(appointment.condition_type)}
              {appointment.episode_data && (
                <span className="text-xs text-muted-foreground">
                  {appointment.episode_data.region}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {appointment.episode_data?.current_status && (
          <Badge variant="outline" className="text-xs capitalize">
            {appointment.episode_data.current_status.replace(/_/g, " ")}
          </Badge>
        )}
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin-shell/episodes`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Link>
        </Button>
      </div>
    </div>
  );

  // Episode Action Card Component
  const EpisodeActionCard = ({ episode }: { episode: EpisodeNeedingAction }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 text-center">
          {episode.days_since_start !== null && (
            <>
              <span className="text-lg font-semibold">{episode.days_since_start}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </>
          )}
        </div>
        
        <div>
          <p className="font-medium">{episode.patient_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{episode.region}</span>
            {getActionBadge(episode.action_type)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{episode.action_label}</span>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin-shell/episodes`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Link>
        </Button>
      </div>
    </div>
  );

  // Skeleton Components
  const AppointmentSkeleton = () => (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-10" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
  );

  const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  // Group episodes by action type
  const groupedEpisodes = episodesNeedingAction.reduce((acc, ep) => {
    if (!acc[ep.action_type]) {
      acc[ep.action_type] = [];
    }
    acc[ep.action_type].push(ep);
    return acc;
  }, {} as Record<string, EpisodeNeedingAction[]>);

  const actionTypeLabels: Record<string, { label: string; icon: React.ElementType }> = {
    ready_for_discharge: { label: "Ready for Discharge", icon: CheckCircle2 },
    overdue_followup: { label: "Overdue Follow-ups", icon: AlertTriangle },
    needs_followup: { label: "Needs Follow-up Scheduling", icon: Calendar },
    pending_ortho_return: { label: "Pending Ortho Returns", icon: UserCheck },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Day</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* SECTION 1: Today's New Patient Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's New Patient Exams
          </CardTitle>
          <CardDescription>
            {todayNPEs.length} NPE{todayNPEs.length !== 1 ? "s" : ""} scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <>
              <AppointmentSkeleton />
              <AppointmentSkeleton />
            </>
          ) : todayNPEs.length > 0 ? (
            todayNPEs.map(apt => (
              <NPECard key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState icon={Calendar} message="No new patient exams scheduled for today" />
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Today's Follow-Up Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Follow-Up Visits
          </CardTitle>
          <CardDescription>
            {todayFollowups.length} follow-up{todayFollowups.length !== 1 ? "s" : ""} scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <>
              <AppointmentSkeleton />
              <AppointmentSkeleton />
            </>
          ) : todayFollowups.length > 0 ? (
            todayFollowups.map(apt => (
              <FollowupCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState icon={Clock} message="No follow-up visits scheduled for today" />
          )}
        </CardContent>
      </Card>

      {/* SECTION 3: Episodes Needing Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Episodes Needing Action
          </CardTitle>
          <CardDescription>
            {episodesNeedingAction.length} episode{episodesNeedingAction.length !== 1 ? "s" : ""} require attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <>
              <AppointmentSkeleton />
              <AppointmentSkeleton />
              <AppointmentSkeleton />
            </>
          ) : episodesNeedingAction.length > 0 ? (
            Object.entries(groupedEpisodes).map(([actionType, episodes]) => {
              const config = actionTypeLabels[actionType] || { label: "Needs Attention", icon: AlertTriangle };
              const Icon = config.icon;
              
              return (
                <div key={actionType} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {config.label} ({episodes.length})
                  </div>
                  {episodes.map(ep => (
                    <EpisodeActionCard key={ep.id} episode={ep} />
                  ))}
                </div>
              );
            })
          ) : (
            <EmptyState icon={CheckCircle2} message="No episodes currently need action" />
          )}
        </CardContent>
      </Card>

      {/* Case Preview Panel */}
      <CasePreviewPanel 
        appointment={selectedAppointment}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default MyDay;
