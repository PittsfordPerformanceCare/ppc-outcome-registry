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
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useAnalyticsCareTargetOutcomes, CareTargetOutcome } from '@/hooks/useAnalyticsCareTargetOutcomes';

interface CareTargetOutcomesTableProps {
  clinicId?: string;
  clinicianId?: string;
  domain?: string;
}

function getOutcomeDirectionBadge(direction: string) {
  switch (direction) {
    case 'improved':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <TrendingUp className="h-3 w-3 mr-1" />
          Improved
        </Badge>
      );
    case 'worsened':
      return (
        <Badge variant="destructive">
          <TrendingDown className="h-3 w-3 mr-1" />
          Worsened
        </Badge>
      );
    case 'unchanged':
      return (
        <Badge variant="secondary">
          <Minus className="h-3 w-3 mr-1" />
          Unchanged
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      );
  }
}

function getIntegrityBadge(status: string) {
  switch (status) {
    case 'complete':
      return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Complete</Badge>;
    case 'override':
      return <Badge variant="outline" className="border-amber-500 text-amber-700">Override</Badge>;
    default:
      return <Badge variant="outline">Incomplete</Badge>;
  }
}

export function CareTargetOutcomesTable({ clinicId, clinicianId, domain }: CareTargetOutcomesTableProps) {
  const { data: outcomes, isLoading, error } = useAnalyticsCareTargetOutcomes({
    clinicId,
    clinicianId,
    domain
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading care target outcomes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          Error loading outcomes data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Target Outcomes</CardTitle>
        <CardDescription>
          Research-grade outcome analysis per complaint. Each row represents one discharged care target.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {outcomes && outcomes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Care Target</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Body Region</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-right">Baseline</TableHead>
                  <TableHead className="text-right">Discharge</TableHead>
                  <TableHead className="text-right">Delta</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Duration (days)</TableHead>
                  <TableHead>Integrity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outcomes.map((outcome) => (
                  <TableRow key={outcome.care_target_id}>
                    <TableCell className="font-medium">{outcome.care_target_name}</TableCell>
                    <TableCell>{outcome.domain || '-'}</TableCell>
                    <TableCell>{outcome.body_region || '-'}</TableCell>
                    <TableCell>{outcome.outcome_instrument || '-'}</TableCell>
                    <TableCell className="text-right">
                      {outcome.baseline_score?.toFixed(1) ?? '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {outcome.discharge_score?.toFixed(1) ?? '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {outcome.outcome_delta != null ? (
                        <span className={outcome.outcome_delta > 0 ? 'text-green-600' : outcome.outcome_delta < 0 ? 'text-red-600' : ''}>
                          {outcome.outcome_delta > 0 ? '+' : ''}{outcome.outcome_delta.toFixed(1)}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getOutcomeDirectionBadge(outcome.outcome_direction)}</TableCell>
                    <TableCell>{outcome.duration_to_resolution_days ?? '-'}</TableCell>
                    <TableCell>{getIntegrityBadge(outcome.outcome_integrity_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No discharged care targets found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
