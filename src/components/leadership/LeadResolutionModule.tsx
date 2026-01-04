import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  useLeadFunnelBySource,
  formatLeadSource,
  getLeadSourceColor,
  aggregateFunnelData,
  calculateConversionRates,
  LeadResolutionFilters,
} from '@/hooks/useLeadResolutionAnalytics';

interface LeadResolutionModuleProps {
  filters: LeadResolutionFilters;
}

export function LeadResolutionModule({ filters }: LeadResolutionModuleProps) {
  const { data, isLoading, error } = useLeadFunnelBySource(filters);

  const aggregatedData = useMemo(() => {
    if (!data) return [];
    return filters.siteId ? data : aggregateFunnelData(data);
  }, [data, filters.siteId]);

  const conversionRates = useMemo(() => {
    return calculateConversionRates(aggregatedData);
  }, [aggregatedData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading lead analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <span className="ml-2 text-destructive">Failed to load lead analytics</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Lead → Resolution Analytics
        </CardTitle>
        <CardDescription>
          Observed resolution outcomes by lead source (Care Target level)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{conversionRates.totals.leads}</p>
            <p className="text-xs text-muted-foreground">Total Intakes</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{conversionRates.leadToEpisodeRate}%</p>
            <p className="text-xs text-muted-foreground">Intake → Episode</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{conversionRates.careTargetResolutionRate}%</p>
            <p className="text-xs text-muted-foreground">Care Target Resolution</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{conversionRates.totals.dischargedCareTargets}</p>
            <p className="text-xs text-muted-foreground">Resolved Care Targets</p>
          </div>
        </div>

        {/* Funnel by Source Table */}
        {aggregatedData.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Source</TableHead>
                  <TableHead className="text-right">Intakes</TableHead>
                  <TableHead className="text-right">Episodes</TableHead>
                  <TableHead className="text-right">Care Targets</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead className="text-right">Time to Resolution</TableHead>
                  <TableHead className="text-right">MCID Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.map((row, idx) => (
                  <TableRow key={`${row.lead_source}-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLeadSourceColor(row.lead_source) }}
                        />
                        <span className="font-medium">{formatLeadSource(row.lead_source)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{row.leads_count}</TableCell>
                    <TableCell className="text-right">{row.episodes_created_count}</TableCell>
                    <TableCell className="text-right">{row.care_targets_count}</TableCell>
                    <TableCell className="text-right">{row.care_targets_discharged_count}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {row.median_time_to_resolution_bucket}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={row.mcid_met_rate >= 50 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {row.mcid_met_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No lead attribution data available</p>
            <p className="text-xs mt-1">Data will appear as intakes are processed with lead source attribution</p>
          </div>
        )}

        {/* Governance Notice */}
        <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
          <strong>Note:</strong> This table displays observed resolution outcomes by lead source. 
          MCID achievement rate is calculated at the Care Target level. 
          Results are observational and do not imply causation between lead source and clinical outcomes.
        </div>
      </CardContent>
    </Card>
  );
}
