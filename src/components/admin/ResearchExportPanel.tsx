import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, subMonths } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResearchExport {
  id: string;
  created_by: string;
  export_purpose: string;
  dataset_type: string;
  date_range_start: string;
  date_range_end: string;
  row_count: number;
  hash_version: string;
  schema_version: string;
  created_at: string;
}

export function ResearchExportPanel() {
  const [datasetType, setDatasetType] = useState<string>('care_targets');
  const [exportPurpose, setExportPurpose] = useState<string>('registry');
  const [dateRangeStart, setDateRangeStart] = useState<string>(
    format(subMonths(new Date(), 12), 'yyyy-MM-dd')
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [isExporting, setIsExporting] = useState(false);

  // Fetch export history
  const { data: exportHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['research-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_exports' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as unknown as ResearchExport[];
    }
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Authentication required');
        return;
      }

      const response = await supabase.functions.invoke('create-research-export', {
        body: {
          export_purpose: exportPurpose,
          dataset_type: datasetType,
          date_range_start: dateRangeStart,
          date_range_end: dateRangeEnd,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Export failed');
      }

      // The response contains CSV data
      const csvData = response.data;
      
      if (typeof csvData === 'string' && csvData.length > 0) {
        // Create download
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ppc_research_${datasetType}_${exportPurpose}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Export downloaded successfully');
        refetchHistory();
      } else if (csvData?.error) {
        throw new Error(csvData.error);
      } else {
        throw new Error('No data returned from export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* De-Identification Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>De-Identified Exports Only:</strong> All exports are automatically pseudonymized. 
          No names, DOBs, emails, phone numbers, or free-text fields are included. 
          IDs are replaced with stable, non-reversible pseudonyms.
        </AlertDescription>
      </Alert>

      {/* Export Creation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Research Export
          </CardTitle>
          <CardDescription>
            Generate a de-identified dataset for registry, publication, or research purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dataset Type */}
            <div className="space-y-2">
              <Label htmlFor="dataset-type">Dataset Type</Label>
              <Select value={datasetType} onValueChange={setDatasetType}>
                <SelectTrigger id="dataset-type">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="care_targets">Care Targets</SelectItem>
                  <SelectItem value="outcomes">Outcomes</SelectItem>
                  <SelectItem value="episodes">Episodes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {datasetType === 'care_targets' && 'Care target outcomes with MCID status and age bands'}
                {datasetType === 'outcomes' && 'Minimal outcome scores for statistical analysis'}
                {datasetType === 'episodes' && 'Episode-level aggregates and care target counts'}
              </p>
            </div>

            {/* Export Purpose */}
            <div className="space-y-2">
              <Label htmlFor="export-purpose">Export Purpose</Label>
              <Select value={exportPurpose} onValueChange={setExportPurpose}>
                <SelectTrigger id="export-purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registry">Registry Submission</SelectItem>
                  <SelectItem value="publication">Publication</SelectItem>
                  <SelectItem value="research">Internal Research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Start */}
            <div className="space-y-2">
              <Label htmlFor="date-start">Date Range Start</Label>
              <Input
                id="date-start"
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
              />
            </div>

            {/* Date Range End */}
            <div className="space-y-2">
              <Label htmlFor="date-end">Date Range End</Label>
              <Input
                id="date-end"
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full md:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Create Research Export
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            Read-only log of all research exports generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : exportHistory && exportHistory.length > 0 ? (
            <div className="space-y-2">
              {exportHistory.map((exp) => (
                <div 
                  key={exp.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {exp.dataset_type.replace('_', ' ')} — {exp.export_purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(exp.created_at), 'MMM d, yyyy h:mm a')} • 
                        {exp.row_count} rows • 
                        v{exp.schema_version}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exp.date_range_start} → {exp.date_range_end}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No exports generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
