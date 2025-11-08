import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { EpisodeMeta } from "@/lib/ppcStore";
import { PPC_CONFIG } from "@/lib/ppcConfig";

interface RegionalPerformanceChartProps {
  episodes: EpisodeMeta[];
}

export function RegionalPerformanceChart({ episodes }: RegionalPerformanceChartProps) {
  // Calculate regional performance
  const regionalData = PPC_CONFIG.regionEnum.map(region => {
    const regionEpisodes = episodes.filter(ep => 
      ep.region === region && 
      ep.dischargeScores && 
      ep.baselineScores &&
      ep.dischargeDate
    );

    if (regionEpisodes.length === 0) {
      return null;
    }

    const totalImprovement = regionEpisodes.reduce((sum, ep) => {
      const baselineValues = Object.values(ep.baselineScores || {});
      const dischargeValues = Object.values(ep.dischargeScores || {});
      
      if (baselineValues.length === 0 || dischargeValues.length === 0) return sum;
      
      const baseline = baselineValues.reduce((s, v) => s + v, 0) / baselineValues.length;
      const discharge = dischargeValues.reduce((s, v) => s + v, 0) / dischargeValues.length;
      const improvement = baseline > 0 ? ((baseline - discharge) / baseline) * 100 : 0;
      
      // Skip if NaN
      if (isNaN(improvement) || !isFinite(improvement)) return sum;
      
      return sum + Math.max(0, Math.min(100, improvement));
    }, 0);

    const totalDays = regionEpisodes.reduce((sum, ep) => {
      const start = new Date(ep.dateOfService).getTime();
      const end = new Date(ep.dischargeDate!).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return sum + (isNaN(days) ? 0 : days);
    }, 0);

    const avgImprovement = totalImprovement / regionEpisodes.length;
    const avgDays = Math.round(totalDays / regionEpisodes.length);

    // Skip if calculations resulted in NaN
    if (isNaN(avgImprovement) || !isFinite(avgImprovement) || isNaN(avgDays) || !isFinite(avgDays)) {
      return null;
    }

    return {
      region,
      avgImprovement,
      count: regionEpisodes.length,
      avgDays,
    };
  }).filter((data): data is NonNullable<typeof data> => data !== null && data.count > 0);

  if (regionalData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Compare outcomes across body regions</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No completed episodes yet</p>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--accent))',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#6366f1',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Performance</CardTitle>
        <CardDescription>Average improvement by body region</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={regionalData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="region" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Improvement %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'avgImprovement') return [`${value.toFixed(1)}%`, 'Avg Improvement'];
                if (name === 'avgDays') return [`${value} days`, 'Avg Duration'];
                if (name === 'count') return [`${value} episodes`, 'Count'];
                return value;
              }}
            />
            <Legend />
            <Bar 
              dataKey="avgImprovement" 
              name="Average Improvement"
              radius={[8, 8, 0, 0]}
            >
              {regionalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
