import { useState } from "react";
import { useClinicianAppointments, ClinicianAppointment } from "@/hooks/useClinicianAppointments";
import { CasePreviewPanel } from "@/components/CasePreviewPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  Baby
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";

const ClinicianDashboard = () => {
  const { 
    todayAppointments, 
    upcomingAppointments, 
    loading, 
    refetch 
  } = useClinicianAppointments();
  
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicianAppointment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "14days">("7days");
  const [conditionFilter, setConditionFilter] = useState<"all" | "neuro" | "msk" | "pediatric">("all");
  const [referralFilter, setReferralFilter] = useState<"all" | "yes" | "no">("all");

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleOpenPreview = (appointment: ClinicianAppointment) => {
    setSelectedAppointment(appointment);
    setPreviewOpen(true);
  };

  // Filter appointments based on selected filters
  const filterAppointments = (appointments: ClinicianAppointment[]) => {
    return appointments.filter(apt => {
      // Condition filter
      if (conditionFilter !== "all" && apt.condition_type !== conditionFilter) {
        return false;
      }
      // Referral filter
      if (referralFilter === "yes" && !apt.is_referral) return false;
      if (referralFilter === "no" && apt.is_referral) return false;
      
      return true;
    });
  };

  // Apply date filter to upcoming
  const getFilteredUpcoming = () => {
    let filtered = upcomingAppointments;
    
    if (dateFilter === "today") {
      filtered = []; // Today is handled separately
    } else if (dateFilter === "7days") {
      const cutoff = format(addDays(new Date(), 7), "yyyy-MM-dd");
      filtered = filtered.filter(apt => apt.scheduled_date <= cutoff);
    } else if (dateFilter === "14days") {
      const cutoff = format(addDays(new Date(), 14), "yyyy-MM-dd");
      filtered = filtered.filter(apt => apt.scheduled_date <= cutoff);
    }
    
    return filterAppointments(filtered);
  };

  const filteredToday = filterAppointments(todayAppointments);
  const filteredUpcoming = getFilteredUpcoming();

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

  const AppointmentCard = ({ appointment }: { appointment: ClinicianAppointment }) => (
    <div 
      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
      onClick={() => handleOpenPreview(appointment)}
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

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Upcoming New Patient Exams</p>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Date:</span>
              <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today Only</SelectItem>
                  <SelectItem value="7days">Next 7 Days</SelectItem>
                  <SelectItem value="14days">Next 14 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Select value={conditionFilter} onValueChange={(v: any) => setConditionFilter(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="neuro">Neuro</SelectItem>
                  <SelectItem value="msk">MSK</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Referral:</span>
              <Select value={referralFilter} onValueChange={(v: any) => setReferralFilter(v)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's NPEs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's New Patient Exams
          </CardTitle>
          <CardDescription>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <>
              <AppointmentSkeleton />
              <AppointmentSkeleton />
            </>
          ) : filteredToday.length > 0 ? (
            filteredToday.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState message="No new patient exams scheduled for today" />
          )}
        </CardContent>
      </Card>

      {/* Upcoming NPEs */}
      {dateFilter !== "today" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming New Patient Exams
            </CardTitle>
            <CardDescription>
              Next {dateFilter === "7days" ? "7" : "14"} days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <AppointmentSkeleton />
                <AppointmentSkeleton />
                <AppointmentSkeleton />
              </>
            ) : filteredUpcoming.length > 0 ? (
              // Group by date
              Object.entries(
                filteredUpcoming.reduce((acc, apt) => {
                  if (!acc[apt.scheduled_date]) {
                    acc[apt.scheduled_date] = [];
                  }
                  acc[apt.scheduled_date].push(apt);
                  return acc;
                }, {} as Record<string, ClinicianAppointment[]>)
              ).map(([date, apts]) => (
                <div key={date} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground pt-2 first:pt-0">
                    {isTomorrow(parseISO(date)) 
                      ? "Tomorrow" 
                      : format(parseISO(date), "EEEE, MMMM d")}
                  </h4>
                  {apts.map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              ))
            ) : (
              <EmptyState message="No upcoming new patient exams in this period" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Case Preview Panel */}
      <CasePreviewPanel 
        appointment={selectedAppointment}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default ClinicianDashboard;
