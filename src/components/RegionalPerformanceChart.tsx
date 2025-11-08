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
      return {
        region,
        avgImprovement: 0,
        count: 0,
        avgDays: 0,
      };
    }

    const totalImprovement = regionEpisodes.reduce((sum, ep) => {
      const baseline = Object.values(ep.baselineScores || {}).reduce((s, v) => s + v, 0) / Object.keys(ep.baselineScores || {}).length;
      const discharge = Object.values(ep.dischargeScores || {}).reduce((s, v) => s + v, 0) / Object.keys(ep.dischargeScores || {}).length;
      const improvement = baseline > 0 ? ((baseline - discharge) / baseline) * 100 : 0;
      return sum + Math.max(0, Math.min(100, improvement));
    }, 0);

    const totalDays = regionEpisodes.reduce((sum, ep) => {
      const start = new Date(ep.dateOfService).getTime();
      const end = new Date(ep.dischargeDate!).getTime();
      return sum + Math.round((end - start) / (1000 * 60 * 60 * 24));
    }, 0);

    return {
      region,
      avgImprovement: totalImprovement / regionEpisodes.length,
      count: regionEpisodes.length,
      avgDays: Math.round(totalDays / regionEpisodes.length),
    };
  }).filter(data => data.count > 0);

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
          <BarChart data={regionalData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Improvement %', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category"
              dataKey="region"
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              width={100}
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
              radius={[0, 8, 8, 0]}
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
