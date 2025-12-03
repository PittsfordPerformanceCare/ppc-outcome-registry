import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, BarChart3 } from "lucide-react";
import { useLeadAnalytics } from "@/hooks/useLeadAnalytics";
import { LeadKPICards } from "@/components/analytics/LeadKPICards";
import { LeadAcquisitionCharts } from "@/components/analytics/LeadAcquisitionCharts";
import { LeadConversionFunnel } from "@/components/analytics/LeadConversionFunnel";
import { LeadAttributionTables } from "@/components/analytics/LeadAttributionTables";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const LeadAnalytics = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { loading, error, analytics } = useLeadAnalytics({ dateRange: 30 });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error loading analytics: {error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Lead Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Conversion funnel from Source → CTA → Lead → Intake → Episode
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ChartSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <LeadKPICards
              totalLeads30d={analytics.totalLeads30d}
              totalLeadsPrev30d={analytics.totalLeadsPrev30d}
              intakeCompletionRate30d={analytics.intakeCompletionRate30d}
              episodeConversionRate30d={analytics.episodeConversionRate30d}
              leads7d={analytics.leads7d}
              episodes7d={analytics.episodes7d}
            />
            <LeadConversionFunnel
              funnelData={analytics.funnelData}
              medianLeadToIntake={analytics.medianLeadToIntake}
              medianIntakeToEpisode={analytics.medianIntakeToEpisode}
            />
          </TabsContent>

          {/* Acquisition Tab */}
          <TabsContent value="acquisition" className="space-y-6">
            <LeadKPICards
              totalLeads30d={analytics.totalLeads30d}
              totalLeadsPrev30d={analytics.totalLeadsPrev30d}
              intakeCompletionRate30d={analytics.intakeCompletionRate30d}
              episodeConversionRate30d={analytics.episodeConversionRate30d}
              leads7d={analytics.leads7d}
              episodes7d={analytics.episodes7d}
            />
            <LeadAcquisitionCharts
              leadsBySource={analytics.leadsBySource}
              leadsByCTA={analytics.leadsByCTA}
              leadsByPage={analytics.leadsByPage}
              leadTrend={analytics.leadTrend}
            />
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <LeadConversionFunnel
              funnelData={analytics.funnelData}
              medianLeadToIntake={analytics.medianLeadToIntake}
              medianIntakeToEpisode={analytics.medianIntakeToEpisode}
            />
            <LeadAttributionTables
              topConvertingSources={analytics.topConvertingSources}
              ctaEffectiveness={analytics.ctaEffectiveness}
              allLeads={[]}
            />
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-6">
            <LeadAttributionTables
              topConvertingSources={analytics.topConvertingSources}
              ctaEffectiveness={analytics.ctaEffectiveness}
              allLeads={analytics.allLeads}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default LeadAnalytics;
