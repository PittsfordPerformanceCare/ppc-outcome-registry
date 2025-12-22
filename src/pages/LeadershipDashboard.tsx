import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLeadershipAnalytics, LeadershipFilters } from '@/hooks/useLeadershipAnalytics';
import { useAnalyticsCareTargetOutcomes } from '@/hooks/useAnalyticsCareTargetOutcomes';
import { VolumeModule } from '@/components/leadership/VolumeModule';
import { ResolutionModule } from '@/components/leadership/ResolutionModule';
import { TimeModule } from '@/components/leadership/TimeModule';
import { OutcomesModule } from '@/components/leadership/OutcomesModule';
import { ComplexityModule } from '@/components/leadership/ComplexityModule';
import { IntegrityModule } from '@/components/leadership/IntegrityModule';
import { InterpretationPanel } from '@/components/leadership/InterpretationPanel';
import { LeadershipFiltersBar } from '@/components/leadership/LeadershipFiltersBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, BarChart3, AlertCircle } from 'lucide-react';
import { exportRegistryToCSV, useAnalyticsRegistryExport } from '@/hooks/useAnalyticsRegistryExport';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LeadershipDashboard() {
  const [filters, setFilters] = useState<LeadershipFilters>({
    timeWindow: '90d',
    domain: undefined,
    bodyRegion: undefined,
    clinicianId: undefined,
    includeOverrides: false,
  });

  const analytics = useLeadershipAnalytics(filters);
  const careTargetQuery = useAnalyticsCareTargetOutcomes({});
  const registryQuery = useAnalyticsRegistryExport({
    completeDataOnly: !filters.includeOverrides,
  });

  // Extract unique domains and body regions for filters
  const { domains, bodyRegions } = useMemo(() => {
    const data = careTargetQuery.data || [];
    const domainSet = new Set<string>();
    const regionSet = new Set<string>();
    
    data.forEach((ct) => {
      if (ct.domain) domainSet.add(ct.domain);
      if (ct.body_region) regionSet.add(ct.body_region);
    });

    return {
      domains: Array.from(domainSet).sort(),
      bodyRegions: Array.from(regionSet).sort(),
    };
  }, [careTargetQuery.data]);

  const handleFilterChange = (key: keyof LeadershipFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    if (!registryQuery.data || registryQuery.data.length === 0) return;
    
    const csv = exportRegistryToCSV(registryQuery.data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadership-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (analytics.error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>
            {analytics.error.message || 'Failed to load leadership analytics data.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Leadership Dashboard | By the Numbers</title>
        <meta name="description" content="Internal leadership analytics dashboard for PPC performance metrics" />
      </Helmet>

      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Leadership Dashboard
            </h1>
            <p className="text-muted-foreground">
              Care Target-centric analytics for internal decision-making
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!registryQuery.data || registryQuery.data.length === 0 || registryQuery.isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Interpretation Panel - Always Visible */}
        <InterpretationPanel />

        {/* Filters */}
        <LeadershipFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          domains={domains}
          bodyRegions={bodyRegions}
        />

        {/* Loading State */}
        {analytics.isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading analytics...</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Module A - Volume */}
            <VolumeModule metrics={analytics.volume} />

            {/* Modules B, C, D - Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResolutionModule metrics={analytics.resolution} />
              <TimeModule metrics={analytics.time} />
              <OutcomesModule metrics={analytics.outcomes} />
            </div>

            {/* Modules E, F - Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <ComplexityModule metrics={analytics.complexity} />
              <IntegrityModule metrics={analytics.integrity} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
