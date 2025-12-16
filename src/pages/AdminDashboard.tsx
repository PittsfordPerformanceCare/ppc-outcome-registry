import { useLeadCentricDashboard } from "@/hooks/useLeadCentricDashboard";
import {
  DashboardHeader,
  LeadHealthBanner,
  CareRequestsActionTable,
  ConversionFunnel,
  PreVisitMomentumPanel,
  IntelligencePanel,
  PCPSummaryTile,
} from "@/components/lead-dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const { data, loading, refetch } = useLeadCentricDashboard();

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <DashboardHeader />

      {/* Lead Health Banner */}
      <LeadHealthBanner
        newLast24Hours={data.newLast24Hours}
        newLast24HoursPrior={data.newLast24HoursPrior}
        inMotion={data.inMotion}
        loading={loading}
      />

      {/* PCP Summary Tile - Only shows when count > 0 */}
      <PCPSummaryTile 
        count={data.pcpSummaries.pendingCount} 
        oldestDays={data.pcpSummaries.oldestDays}
        resendCount={data.pcpSummaries.resendCount}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Action Zone - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <CareRequestsActionTable
            careRequests={data.careRequests}
            loading={loading}
            onRefresh={refetch}
          />

          {/* Pre-Visit Momentum */}
          <PreVisitMomentumPanel
            visits={data.upcomingVisits}
            loading={loading}
          />
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <ConversionFunnel funnel={data.funnel} loading={loading} />

          {/* Intelligence Panel */}
          <IntelligencePanel
            sources={data.sources}
            sla={data.sla}
            loading={loading}
          />
        </div>
      </div>

      {/* Refresh Button - Fixed bottom right */}
      <div className="fixed bottom-6 right-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="shadow-lg gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
