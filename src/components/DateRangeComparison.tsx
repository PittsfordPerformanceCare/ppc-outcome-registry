import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ComparisonMetrics {
  mcidRate: number;
  avgImprovement: number;
  avgDaysToDischarge: number;
  totalEpisodes: number;
  completedEpisodes: number;
}

interface DateRangeComparisonProps {
  episodes: any[];
  onComparisonComplete?: (periodA: ComparisonMetrics, periodB: ComparisonMetrics) => void;
}

export function DateRangeComparison({ episodes, onComparisonComplete }: DateRangeComparisonProps) {
  const [periodA, setPeriodA] = useState<DateRange>({ from: undefined, to: undefined });
  const [periodB, setPeriodB] = useState<DateRange>({ from: undefined, to: undefined });
  const [metricsA, setMetricsA] = useState<ComparisonMetrics | null>(null);
  const [metricsB, setMetricsB] = useState<ComparisonMetrics | null>(null);

  const calculateMetrics = (dateRange: DateRange): ComparisonMetrics | null => {
    if (!dateRange.from || !dateRange.to) return null;

    const filteredEpisodes = episodes.filter(ep => {
      const episodeDate = new Date(ep.date_of_service);
      return episodeDate >= dateRange.from! && episodeDate <= dateRange.to!;
    });

    const completedEpisodes = filteredEpisodes.filter(ep => ep.discharge_date);
    
    // Calculate MCID rate
    const mcidAchievers = completedEpisodes.filter(ep => {
      // Simplified MCID check - in reality this would check actual scores
      return ep.discharge_date && (ep.cis_delta > 10 || ep.pain_delta > 2);
    });
    const mcidRate = completedEpisodes.length > 0 
      ? (mcidAchievers.length / completedEpisodes.length) * 100 
      : 0;

    // Calculate average improvement
    const improvementScores = completedEpisodes
      .filter(ep => ep.cis_delta !== null)
      .map(ep => ep.cis_delta || 0);
    const avgImprovement = improvementScores.length > 0
      ? improvementScores.reduce((a, b) => a + b, 0) / improvementScores.length
      : 0;

    // Calculate average days to discharge
    const daysToDischarge = completedEpisodes
      .filter(ep => ep.start_date && ep.discharge_date)
      .map(ep => differenceInDays(new Date(ep.discharge_date), new Date(ep.start_date)));
    const avgDaysToDischarge = daysToDischarge.length > 0
      ? daysToDischarge.reduce((a, b) => a + b, 0) / daysToDischarge.length
      : 0;

    return {
      mcidRate,
      avgImprovement,
      avgDaysToDischarge,
      totalEpisodes: filteredEpisodes.length,
      completedEpisodes: completedEpisodes.length,
    };
  };

  const handleCompare = () => {
    const metricsA = calculateMetrics(periodA);
    const metricsB = calculateMetrics(periodB);
    
    setMetricsA(metricsA);
    setMetricsB(metricsB);
    
    if (metricsA && metricsB && onComparisonComplete) {
      onComparisonComplete(metricsA, metricsB);
    }
  };

  const getChangeIndicator = (valueA: number, valueB: number, higherIsBetter: boolean = true) => {
    const diff = valueA - valueB;
    const percentChange = valueB !== 0 ? (diff / valueB) * 100 : 0;
    
    if (Math.abs(percentChange) < 1) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-sm">No change</span>
        </div>
      );
    }

    const isPositive = higherIsBetter ? diff > 0 : diff < 0;
    const color = isPositive ? "text-green-600" : "text-red-600";
    const Icon = diff > 0 ? ArrowUp : ArrowDown;

    return (
      <div className={cn("flex items-center gap-1", color)}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
      </div>
    );
  };

  const DateRangePicker = ({ 
    dateRange, 
    onChange, 
    label 
  }: { 
    dateRange: DateRange; 
    onChange: (range: DateRange) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => onChange({ from: range?.from, to: range?.to })}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const MetricComparison = ({ 
    label, 
    valueA, 
    valueB, 
    format: formatFn = (v) => v.toFixed(1),
    higherIsBetter = true,
  }: {
    label: string;
    valueA: number;
    valueB: number;
    format?: (value: number) => string;
    higherIsBetter?: boolean;
  }) => (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{formatFn(valueA)}</div>
          <div className="text-xs text-muted-foreground">Period A</div>
        </div>
        <div className="flex justify-center">
          {getChangeIndicator(valueA, valueB, higherIsBetter)}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{formatFn(valueB)}</div>
          <div className="text-xs text-muted-foreground">Period B</div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>Date Range Comparison</CardTitle>
        </div>
        <CardDescription>
          Compare performance metrics across different time periods
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <DateRangePicker
            dateRange={periodA}
            onChange={setPeriodA}
            label="Period A"
          />
          <DateRangePicker
            dateRange={periodB}
            onChange={setPeriodB}
            label="Period B"
          />
        </div>

        <Button 
          onClick={handleCompare}
          disabled={!periodA.from || !periodA.to || !periodB.from || !periodB.to}
          className="w-full"
        >
          Compare Periods
        </Button>

        {metricsA && metricsB && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <Badge variant="secondary">
                {metricsA.totalEpisodes} vs {metricsB.totalEpisodes} episodes
              </Badge>
            </div>

            <div className="space-y-3">
              <MetricComparison
                label="MCID Achievement Rate"
                valueA={metricsA.mcidRate}
                valueB={metricsB.mcidRate}
                format={(v) => `${v.toFixed(1)}%`}
              />

              <MetricComparison
                label="Average Improvement"
                valueA={metricsA.avgImprovement}
                valueB={metricsB.avgImprovement}
                format={(v) => `${v.toFixed(1)}%`}
              />

              <MetricComparison
                label="Avg Days to Discharge"
                valueA={metricsA.avgDaysToDischarge}
                valueB={metricsB.avgDaysToDischarge}
                format={(v) => `${v.toFixed(0)} days`}
                higherIsBetter={false}
              />

              <MetricComparison
                label="Completed Episodes"
                valueA={metricsA.completedEpisodes}
                valueB={metricsB.completedEpisodes}
                format={(v) => v.toString()}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
