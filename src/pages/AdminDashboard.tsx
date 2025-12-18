import { useLeadCentricDashboard } from "@/hooks/useLeadCentricDashboard";
import {
  DashboardHeader,
  LeadHealthBanner,
  IntakeQueue,
  ConversionFunnel,
  PreVisitMomentumPanel,
  IntelligencePanel,
  PCPSummaryTile,
  OutstandingTasksTile,
  ProspectJourneyTracker,
} from "@/components/lead-dashboard";
import { PendingEpisodeContinuationsPanel } from "@/components/PendingEpisodeContinuationsPanel";
import { PausedEpisodesSignal } from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const AdminDashboard = () => {
  const { data, loading, refetch } = useLeadCentricDashboard();
  const [supportingViewsOpen, setSupportingViewsOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <DashboardHeader onRefresh={refetch} />

      {/* ======================================
          PRIMARY INTERFACE: Prospect Journey
          ====================================== 
          This is the main interface Jennifer uses.
          All other views exist to support this tracker.
      */}
      <ProspectJourneyTracker className="border-2 border-primary/30 shadow-sm" />

      {/* Quick Pulse Metrics - Lightweight, non-intrusive */}
      <LeadHealthBanner
        newLast24Hours={data.newLast24Hours}
        newLast24HoursPrior={data.newLast24HoursPrior}
        inMotion={data.inMotion}
        loading={loading}
      />

      {/* Action-required tiles - Only show when count > 0 */}
      <div className="space-y-4">
        <PCPSummaryTile 
          count={data.pcpSummaries.pendingCount} 
          oldestDays={data.pcpSummaries.oldestDays}
          resendCount={data.pcpSummaries.resendCount}
        />
        
        <PendingEpisodeContinuationsPanel />
        
        <PausedEpisodesSignal />
        
        <OutstandingTasksTile />
      </div>

      {/* ======================================
          SUPPORTING VIEWS (Collapsible)
          ======================================
          These exist to support the tracker, not compete.
          Analytics, task lists, intelligence panels.
      */}
      <Collapsible open={supportingViewsOpen} onOpenChange={setSupportingViewsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between py-3 text-muted-foreground hover:text-foreground"
          >
            <span className="text-sm font-medium">
              {supportingViewsOpen ? "Hide" : "Show"} Analytics & Supporting Views
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${supportingViewsOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          {/* Main Supporting Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task-oriented views */}
            <div className="lg:col-span-2 space-y-6">
              <IntakeQueue
                leads={data.leads}
                careRequests={data.careRequests}
                loading={loading}
                onRefresh={refetch}
              />

              <PreVisitMomentumPanel
                visits={data.upcomingVisits}
                loading={loading}
              />
            </div>

            {/* Right Column - Analytics (Read-only) */}
            <div className="space-y-6">
              {/* Conversion Funnel - Analytical, not operational */}
              <ConversionFunnel funnel={data.funnel} loading={loading} />

              {/* Intelligence Panel - Pattern detection */}
              <IntelligencePanel
                sources={data.sources}
                sla={data.sla}
                loading={loading}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

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
