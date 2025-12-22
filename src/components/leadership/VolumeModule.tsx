import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VolumeMetrics } from '@/hooks/useLeadershipAnalytics';
import { Activity, CheckCircle2, Target, FileCheck } from 'lucide-react';

interface VolumeModuleProps {
  metrics: VolumeMetrics;
}

export function VolumeModule({ metrics }: VolumeModuleProps) {
  const stats = [
    {
      label: 'Episodes Opened',
      value: metrics.episodesOpened,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-info-soft',
    },
    {
      label: 'Episodes Closed',
      value: metrics.episodesClosed,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success-soft',
    },
    {
      label: 'Care Targets Created',
      value: metrics.careTargetsCreated,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Care Targets Discharged',
      value: metrics.careTargetsDischarged,
      icon: FileCheck,
      color: 'text-accent',
      bgColor: 'bg-accent-soft',
      isPrimary: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Volume & Throughput
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          System flow and workload metrics. Care Targets Discharged is the primary throughput metric.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`p-4 rounded-lg border ${stat.isPrimary ? 'border-accent/50 bg-accent-soft' : 'bg-secondary/30'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.isPrimary ? 'text-accent' : 'text-foreground'}`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
