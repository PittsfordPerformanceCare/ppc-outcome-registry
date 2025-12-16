import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { 
  TodayAtAGlance, 
  LeadManagementSection, 
  SchedulingSection,
  EpisodePivotSection,
  CommunicationsSection,
  FinanceSnapshot,
  QuickLinksSection,
  ClinicianQueuesOverview
} from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Stethoscope, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data, loading, refetch } = useAdminDashboard();

  return (
    <div className="space-y-12 pb-12">
      {/* Header with navigation and refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="gap-2"
          >
            <Link to="/clinician/dashboard">
              <Stethoscope className="h-4 w-4" />
              My Clinician Dashboard
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="gap-2"
          >
            <Link to="/administrator-quick-start">
              <BookOpen className="h-4 w-4" />
              Training Guide
            </Link>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refetch}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Section 0: Today at a Glance */}
      <TodayAtAGlance stats={data.today} loading={loading} />

      {/* Section: Clinician Queues Overview */}
      <ClinicianQueuesOverview />

      {/* Section 1: Lead Management */}
      <LeadManagementSection stats={data.leads} loading={loading} />

      {/* Section 2: Scheduling & New Patient Prep */}
      <SchedulingSection stats={data.scheduling} loading={loading} />

      {/* Section 3: Episode & Pivot Alerts */}
      <EpisodePivotSection stats={data.episodes} loading={loading} />

      {/* Section 4: Communications & PCP Summaries */}
      <CommunicationsSection stats={data.communications} loading={loading} />

      {/* Section 5: Finance / Discharge Snapshot */}
      <FinanceSnapshot stats={data.finance} loading={loading} />

      {/* Section 6: Quick Links */}
      <QuickLinksSection />
    </div>
  );
};

export default AdminDashboard;
