import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GitBranch, CheckCircle2 } from 'lucide-react';
import { useAnalyticsEpisodeSummary, EpisodeSummary } from '@/hooks/useAnalyticsEpisodeSummary';
import { format } from 'date-fns';

interface EpisodeSummaryTableProps {
  clinicId?: string;
  clinicianId?: string;
  episodeStatus?: string;
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case 'CLOSED':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
    case 'ACTIVE':
      return <Badge variant="default">Active</Badge>;
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  }
}

export function EpisodeSummaryTable({ clinicId, clinicianId, episodeStatus }: EpisodeSummaryTableProps) {
  const { data: episodes, isLoading, error } = useAnalyticsEpisodeSummary({
    clinicId,
    clinicianId,
    episodeStatus
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading episode summary...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          Error loading episode data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Episode Summary</CardTitle>
        <CardDescription>
          Episode-level view with care target aggregates. Episode outcome is descriptive, not scored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {episodes && episodes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Care Targets</TableHead>
                  <TableHead className="text-right">Discharged</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead>Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.episode_id}>
                    <TableCell className="font-medium">{episode.patient_name}</TableCell>
                    <TableCell>{episode.episode_type || '-'}</TableCell>
                    <TableCell>{getStatusBadge(episode.episode_status)}</TableCell>
                    <TableCell>
                      {episode.episode_start_date 
                        ? format(new Date(episode.episode_start_date), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {episode.episode_close_date 
                        ? format(new Date(episode.episode_close_date), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {episode.episode_duration_days != null ? `${episode.episode_duration_days}d` : '-'}
                    </TableCell>
                    <TableCell className="text-right">{episode.number_of_care_targets}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{episode.number_discharged}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {episode.number_active > 0 ? (
                        <span className="text-amber-600">{episode.number_active}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {episode.staggered_resolution ? (
                        <Badge variant="outline" className="border-purple-500 text-purple-700">
                          <GitBranch className="h-3 w-3 mr-1" />
                          Staggered ({episode.resolution_span_days}d)
                        </Badge>
                      ) : episode.number_discharged > 0 ? (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No episodes found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
