import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RefreshCw,
  Phone,
  Mail,
  FileText,
  Image,
  MessageSquare,
  MoreHorizontal,
  Filter,
  Users
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Clinician {
  id: string;
  name: string;
}

interface Task {
  id: string;
  assigned_clinician_id: string;
  patient_name: string | null;
  episode_id: string | null;
  type: string;
  source: string;
  priority: string;
  status: string;
  due_at: string;
  completed_at: string | null;
  description: string;
}

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

const SOURCE_LABELS: Record<string, string> = {
  'ADMIN': 'Admin',
  'CLINICIAN': 'Clinician',
  'PATIENT_PORTAL': 'Patient Portal',
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const TIME_WINDOW_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const AdminClinicianQueues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedClinician, setSelectedClinician] = useState<string>(
    searchParams.get('clinician') || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('status') || 'ALL'
  );
  const [timeWindow, setTimeWindow] = useState<string>(
    searchParams.get('timeWindow') || '7d'
  );

  const fetchData = async () => {
    try {
      // Fetch clinicians
      const { data: cliniciansData } = await supabase
        .from('profiles')
        .select('id, full_name, clinician_name')
        .not('clinician_name', 'is', null);

      const formattedClinicians: Clinician[] = (cliniciansData || []).map(c => ({
        id: c.id,
        name: c.clinician_name || c.full_name || 'Unknown',
      }));

      setClinicians(formattedClinicians);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('communication_tasks')
        .select('*')
        .order('due_at', { ascending: true });

      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedClinician !== 'ALL') params.set('clinician', selectedClinician);
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (timeWindow !== '7d') params.set('timeWindow', timeWindow);
    setSearchParams(params);
  }, [selectedClinician, selectedStatus, timeWindow, setSearchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Calculate time window cutoff
  const getTimeWindowCutoff = () => {
    const now = new Date();
    switch (timeWindow) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const cutoff = getTimeWindowCutoff();

    return tasks.filter(task => {
      // Clinician filter
      if (selectedClinician !== 'ALL' && task.assigned_clinician_id !== selectedClinician) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && task.status !== selectedStatus) {
        return false;
      }

      // Time window filter for completed tasks
      if (task.status === 'COMPLETED') {
        if (!task.completed_at || new Date(task.completed_at) < cutoff) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort: overdue first, then by due_at
      const aOverdue = (a.status === 'OPEN' || a.status === 'IN_PROGRESS') && new Date(a.due_at) < now;
      const bOverdue = (b.status === 'OPEN' || b.status === 'IN_PROGRESS') && new Date(b.due_at) < now;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Completed tasks sort by completed_at desc
      if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
        return new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime();
      }
      
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
  }, [tasks, selectedClinician, selectedStatus, timeWindow]);

  const getClinicianName = (clinicianId: string) => {
    return clinicians.find(c => c.id === clinicianId)?.name || 'Unknown';
  };

  const getEpisodeBadge = (episodeId: string | null) => {
    if (!episodeId) return null;
    const type = episodeId.toLowerCase().includes('neuro') ? 'Neuro' :
                 episodeId.toLowerCase().includes('ped') ? 'Pediatric' : 'MSK';
    return (
      <Badge variant="outline" className="text-[10px]">
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Clinician Queues
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage action items across all clinicians
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">Clinician</label>
              <Select value={selectedClinician} onValueChange={setSelectedClinician}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clinicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Clinicians</SelectItem>
                  {clinicians.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">
                Completed Time Window
              </label>
              <Select value={timeWindow} onValueChange={setTimeWindow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_WINDOW_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Action Items</CardTitle>
              <CardDescription className="text-xs">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No tasks match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Clinician</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="w-[80px]">Episode</TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead className="w-[100px]">Source</TableHead>
                    <TableHead className="w-[100px]">Due</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[120px]">Completed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(task => {
                    const isOverdue = (task.status === 'OPEN' || task.status === 'IN_PROGRESS') && 
                                      new Date(task.due_at) < new Date();
                    return (
                      <TableRow key={task.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium text-xs">
                          {getClinicianName(task.assigned_clinician_id)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>
                            <p>{task.patient_name || '—'}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {task.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getEpisodeBadge(task.episode_id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {TYPE_ICONS[task.type] || <MoreHorizontal className="h-4 w-4" />}
                            <span>{TYPE_LABELS[task.type] || task.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {SOURCE_LABELS[task.source] || task.source}
                        </TableCell>
                        <TableCell className="text-xs">
                          {isOverdue ? (
                            <span className="text-destructive font-medium">
                              {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                            </span>
                          ) : (
                            <span>
                              {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              task.status === 'COMPLETED' ? 'default' :
                              isOverdue ? 'destructive' :
                              task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                            }
                            className={`text-[10px] ${task.status === 'COMPLETED' ? 'bg-green-500' : ''}`}
                          >
                            {isOverdue && task.status !== 'COMPLETED' ? 'Overdue' : task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {task.completed_at ? format(new Date(task.completed_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClinicianQueues;
