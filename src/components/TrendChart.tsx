import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EpisodeMeta } from "@/lib/ppcStore";
import { format, parseISO } from "date-fns";

interface TrendChartProps {
  episodes: EpisodeMeta[];
}

export function TrendChart({ episodes }: TrendChartProps) {
  // Calculate monthly average improvement
  const chartData = episodes
    .filter(ep => ep.dischargeScores && ep.baselineScores && ep.dischargeDate)
    .map(ep => {
      const baseline = Object.values(ep.baselineScores || {}).reduce((sum, val) => sum + val, 0) / Object.keys(ep.baselineScores || {}).length;
      const discharge = Object.values(ep.dischargeScores || {}).reduce((sum, val) => sum + val, 0) / Object.keys(ep.dischargeScores || {}).length;
      const improvement = baseline > 0 ? ((baseline - discharge) / baseline) * 100 : 0;
      
      return {
        date: ep.dischargeDate!,
        improvement: Math.max(0, Math.min(100, improvement)),
        baseline,
        discharge,
        patientName: ep.patientName,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, curr) => {
      const monthKey = format(parseISO(curr.date), 'MMM yyyy');
      const existing = acc.find(item => item.month === monthKey);
      
      if (existing) {
        existing.totalImprovement += curr.improvement;
        existing.count += 1;
        existing.avgImprovement = existing.totalImprovement / existing.count;
      } else {
        acc.push({
          month: monthKey,
          avgImprovement: curr.improvement,
          totalImprovement: curr.improvement,
          count: 1,
        });
      }
      
      return acc;
    }, [] as Array<{ month: string; avgImprovement: number; totalImprovement: number; count: number }>)
    .slice(-12); // Last 12 months

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Improvement Trend</CardTitle>
          <CardDescription>Average patient improvement over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No completed episodes yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Trend</CardTitle>
        <CardDescription>Average patient improvement percentage by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
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
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg Improvement']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgImprovement" 
              stroke="hsl(var(--success))" 
              strokeWidth={3}
              name="Average Improvement"
              dot={{ fill: 'hsl(var(--success))', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
