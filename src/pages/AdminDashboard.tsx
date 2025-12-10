import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { 
  TodayAtAGlance, 
  LeadManagementSection, 
  SchedulingSection,
  EpisodePivotSection,
  CommunicationsSection,
  FinanceSnapshot,
  QuickLinksSection
} from "@/components/admin-dashboard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const { data, loading, refetch } = useAdminDashboard();

  return (
    <div className="space-y-8 pb-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="sr-only">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Section 0: Today at a Glance */}
      <TodayAtAGlance stats={data.today} loading={loading} />

      <Separator />

      {/* Section 1: Lead Management */}
      <LeadManagementSection stats={data.leads} loading={loading} />

      <Separator />

      {/* Section 2: Scheduling & New Patient Prep */}
      <SchedulingSection stats={data.scheduling} loading={loading} />

      <Separator />

      {/* Section 3: Episode & Pivot Alerts */}
      <EpisodePivotSection stats={data.episodes} loading={loading} />

      <Separator />

      {/* Section 4: Communications & PCP Summaries */}
      <CommunicationsSection stats={data.communications} loading={loading} />

      <Separator />

      {/* Section 5: Finance / Discharge Snapshot */}
      <FinanceSnapshot stats={data.finance} loading={loading} />

      <Separator />

      {/* Section 6: Quick Links */}
      <QuickLinksSection />
    </div>
  );
};

export default AdminDashboard;
