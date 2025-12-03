import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { format } from "date-fns";

interface LeadAcquisitionChartsProps {
  leadsBySource: { source: string; count: number }[];
  leadsByCTA: { cta: string; count: number }[];
  leadsByPage: { page: string; count: number }[];
  leadTrend: { day: string; count: number }[];
}

const chartConfig = {
  count: {
    label: "Leads",
    color: "hsl(var(--primary))",
  },
};

function truncateLabel(label: string, maxLength: number = 15): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength) + "...";
}

export function LeadAcquisitionCharts({
  leadsBySource,
  leadsByCTA,
  leadsByPage,
  leadTrend,
}: LeadAcquisitionChartsProps) {
  const formattedTrend = leadTrend.map(item => ({
    ...item,
    displayDay: format(new Date(item.day), "MMM d"),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Leads by Source */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Leads by Source (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={leadsBySource} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="source" 
                fontSize={11} 
                width={80}
                tickFormatter={(v) => truncateLabel(v, 12)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Leads by CTA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Leads by CTA (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={leadsByCTA} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="cta" 
                fontSize={11} 
                width={100}
                tickFormatter={(v) => truncateLabel(v.replace(/_/g, " "), 14)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Leads by Landing Page */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Leads by Landing Page (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={leadsByPage} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="page" 
                fontSize={11} 
                width={120}
                tickFormatter={(v) => truncateLabel(v, 18)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 30-Day Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">30-Day Lead Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={formattedTrend} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayDay" 
                fontSize={10} 
                tickLine={false}
                interval={6}
              />
              <YAxis fontSize={12} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
