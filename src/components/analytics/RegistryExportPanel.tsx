import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useAnalyticsRegistryExport, exportRegistryToCSV, RegistryExportRecord } from '@/hooks/useAnalyticsRegistryExport';
import { toast } from 'sonner';

interface RegistryExportPanelProps {
  clinicId?: string;
}

export function RegistryExportPanel({ clinicId }: RegistryExportPanelProps) {
  const [year, setYear] = useState<number | undefined>();
  const [quarter, setQuarter] = useState<number | undefined>();
  const [outcomeInstrument, setOutcomeInstrument] = useState<string | undefined>();
  const [mcidOnly, setMcidOnly] = useState(false);
  const [completeOnly, setCompleteOnly] = useState(false);

  const { data: records, isLoading, error, refetch } = useAnalyticsRegistryExport({
    clinicId,
    year,
    quarter,
    outcomeInstrument,
    mcidAchievedOnly: mcidOnly,
    completeDataOnly: completeOnly
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleExport = () => {
    if (!records || records.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csv = exportRegistryToCSV(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registry-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${records.length} records`);
  };

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!records || records.length === 0) return null;

    const improved = records.filter(r => r.outcome_classification === 'improved').length;
    const mcidCount = records.filter(r => r.mcid_achieved === true).length;
    const complete = records.filter(r => r.data_quality_status === 'complete').length;
    const avgDuration = records.reduce((sum, r) => sum + (r.duration_days || 0), 0) / records.length;

    return {
      total: records.length,
      improved,
      improvedPct: ((improved / records.length) * 100).toFixed(1),
      mcidCount,
      mcidPct: complete > 0 ? ((mcidCount / complete) * 100).toFixed(1) : '0',
      complete,
      completePct: ((complete / records.length) * 100).toFixed(1),
      avgDuration: avgDuration.toFixed(0)
    };
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Registry Export
        </CardTitle>
        <CardDescription>
          Research-ready data export. One row per discharged Care Target with stable column naming.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={year?.toString() || ''} onValueChange={(v) => setYear(v ? parseInt(v) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All years</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quarter</Label>
            <Select value={quarter?.toString() || ''} onValueChange={(v) => setQuarter(v ? parseInt(v) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All quarters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All quarters</SelectItem>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Outcome Instrument</Label>
            <Select value={outcomeInstrument || ''} onValueChange={(v) => setOutcomeInstrument(v || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All instruments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All instruments</SelectItem>
                <SelectItem value="NDI">NDI</SelectItem>
                <SelectItem value="ODI">ODI</SelectItem>
                <SelectItem value="QuickDASH">QuickDASH</SelectItem>
                <SelectItem value="LEFS">LEFS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch id="mcid-only" checked={mcidOnly} onCheckedChange={setMcidOnly} />
              <Label htmlFor="mcid-only">MCID achieved only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="complete-only" checked={completeOnly} onCheckedChange={setCompleteOnly} />
              <Label htmlFor="complete-only">Complete data only</Label>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.improvedPct}%</div>
              <div className="text-sm text-muted-foreground">Improved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.mcidPct}%</div>
              <div className="text-sm text-muted-foreground">MCID Achieved</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.completePct}%</div>
              <div className="text-sm text-muted-foreground">Data Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.avgDuration}d</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading registry data...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            Error loading registry data
          </div>
        )}

        {/* Export Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {records && records.length > 0 ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {records.length} records ready for export
              </span>
            ) : (
              'No records match current filters'
            )}
          </div>
          <Button 
            onClick={handleExport} 
            disabled={!records || records.length === 0 || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
