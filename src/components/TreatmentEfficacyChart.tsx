import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { EpisodeMeta } from "@/lib/ppcStore";
import { getMCIDThreshold } from "@/lib/mcidUtils";

interface TreatmentEfficacyChartProps {
  episodes: EpisodeMeta[];
}

export function TreatmentEfficacyChart({ episodes }: TreatmentEfficacyChartProps) {
  // Calculate MCID achievement rates
  const completedEpisodes = episodes.filter(ep => 
    ep.dischargeScores && 
    ep.baselineScores && 
    ep.dischargeDate
  );

  if (completedEpisodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment Efficacy</CardTitle>
          <CardDescription>MCID achievement breakdown</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No completed episodes yet</p>
        </CardContent>
      </Card>
    );
  }

  let metMCID = 0;
  let partialMCID = 0;
  let notMetMCID = 0;

  completedEpisodes.forEach(ep => {
    const indices = Object.keys(ep.baselineScores || {});
    let totalMetCount = 0;

    indices.forEach(index => {
      const baseline = ep.baselineScores?.[index];
      const discharge = ep.dischargeScores?.[index];
      const mcidThreshold = getMCIDThreshold(index);

      if (baseline != null && discharge != null && mcidThreshold != null) {
        const change = baseline - discharge;
        if (Math.abs(change) >= mcidThreshold && change > 0) {
          totalMetCount++;
        }
      }
    });

    if (totalMetCount === indices.length) {
      metMCID++;
    } else if (totalMetCount > 0) {
      partialMCID++;
    } else {
      notMetMCID++;
    }
  });

  const data = [
    { name: 'Met MCID', value: metMCID, color: 'hsl(var(--success))' },
    { name: 'Partial MCID', value: partialMCID, color: 'hsl(var(--warning))' },
    { name: 'Below MCID', value: notMetMCID, color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0);

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / completedEpisodes.length) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Efficacy</CardTitle>
        <CardDescription>Minimal Clinically Important Difference (MCID) achievement rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value} episodes`, '']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Total Completed Episodes: {completedEpisodes.length}
        </div>
      </CardContent>
    </Card>
  );
}
