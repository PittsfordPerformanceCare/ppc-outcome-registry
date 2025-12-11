import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Phone,
  Mail,
  FileText,
  Image,
  MessageSquare,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { 
  useClinicianQueuesOverview, 
  ClinicianQueueSummary, 
  UrgentTask, 
  RecentlyCompletedTask 
} from "@/hooks/useClinicianQueuesOverview";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'CALL_BACK': <Phone className="h-4 w-4" />,
  'EMAIL_REPLY': <Mail className="h-4 w-4" />,
  'LETTER': <FileText className="h-4 w-4" />,
  'IMAGING_REPORT': <Image className="h-4 w-4" />,
  'PATIENT_MESSAGE': <MessageSquare className="h-4 w-4" />,
  'OTHER_ACTION': <MoreHorizontal className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  'CALL_BACK': 'Call',
  'EMAIL_REPLY': 'Email',
  'LETTER': 'Letter',
  'IMAGING_REPORT': 'Imaging',
  'PATIENT_MESSAGE': 'Portal',
  'OTHER_ACTION': 'Other',
};

interface ClinicianCardProps {
  summary: ClinicianQueueSummary;
}

function ClinicianCard({ summary }: ClinicianCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm truncate">{summary.clinicianName}</h4>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <Link to={`/admin/clinician-queues?clinician=${summary.clinicianId}`}>
              View Queue
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-lg font-bold">{summary.openCount}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Open</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className={`h-3.5 w-3.5 ${summary.overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={`text-lg font-bold ${summary.overdueCount > 0 ? 'text-destructive' : ''}`}>
                {summary.overdueCount}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Overdue</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-lg font-bold text-green-600">{summary.completedLast7Days}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Done (7d)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UrgentTasksTableProps {
  tasks: UrgentTask[];
}

function UrgentTasksTable({ tasks }: UrgentTasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">No urgent items at this time</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Clinician</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead className="w-[80px]">Type</TableHead>
          <TableHead className="w-[100px]">Due</TableHead>
          <TableHead className="w-[90px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id} className={task.isOverdue ? 'bg-destructive/5' : ''}>
            <TableCell className="font-medium text-xs">{task.clinicianName}</TableCell>
            <TableCell className="text-xs">{task.patientName || '—'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {TYPE_ICONS[task.type] || <MoreHorizontal className="h-4 w-4" />}
                <span>{TYPE_LABELS[task.type] || task.type}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs">
              {task.isOverdue ? (
                <span className="text-destructive font-medium">
                  {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                </span>
              ) : (
                <span>{formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}</span>
              )}
            </TableCell>
            <TableCell>
              <Badge 
                variant={task.isOverdue ? "destructive" : task.priority === 'HIGH' ? "default" : "secondary"}
                className="text-[10px]"
              >
                {task.isOverdue ? 'Overdue' : task.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface RecentlyCompletedListProps {
  tasks: RecentlyCompletedTask[];
}

function RecentlyCompletedList({ tasks }: RecentlyCompletedListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-xs">No completions in last 24 hours</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{task.patientName || 'Unknown'}</p>
              <p className="text-[10px] text-muted-foreground">{task.clinicianName}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {TYPE_ICONS[task.type]}
              <span>{TYPE_LABELS[task.type] || task.type}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(task.completedAt), 'h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClinicianQueuesOverview() {
  const { clinicianSummaries, urgentTasks, recentlyCompleted, loading, error } = useClinicianQueuesOverview();

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">Failed to load clinician queues: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clinician Queues Overview
          </h2>
          <p className="text-sm text-muted-foreground">Monitor action queues across all clinicians</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/clinician-queues">
            View All Action Items
            <ExternalLink className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Per-Clinician Summary Cards */}
      {clinicianSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clinicianSummaries.map(summary => (
            <ClinicianCard key={summary.clinicianId} summary={summary} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p className="text-sm">No clinician queue data available</p>
          </CardContent>
        </Card>
      )}

      {/* Urgent Items and Recently Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Items Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Urgent Items
            </CardTitle>
            <CardDescription className="text-xs">
              Overdue or high priority tasks across all clinicians (max 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UrgentTasksTable tasks={urgentTasks} />
            {urgentTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t text-center">
                <Button variant="link" size="sm" asChild className="text-xs">
                  <Link to="/admin/clinician-queues?filter=urgent">
                    View all action items →
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recently Completed
            </CardTitle>
            <CardDescription className="text-xs">
              Last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentlyCompletedList tasks={recentlyCompleted} />
            {recentlyCompleted.length > 0 && (
              <div className="mt-3 pt-3 border-t text-center">
                <Button variant="link" size="sm" asChild className="text-xs">
                  <Link to="/admin/clinician-queues?status=COMPLETED">
                    View all completed →
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
