import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw,
  Phone,
  Mail,
  FileText,
  Image,
  MessageSquare,
  MoreHorizontal,
  Filter,
  Users,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageCircle,
  UserPlus,
  Send,
  Calendar,
  Receipt,
  FileSearch,
  UserCog,
  ClipboardList,
  Shield,
  Stethoscope,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { AddTaskDialog } from "@/components/clinician/AddTaskDialog";
import { useTaskNotes, TaskStatus } from "@/hooks/useCommunicationTasks";
import { toast } from "sonner";

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
  category: string;
  owner_type: string;
  due_at: string;
  completed_at: string | null;
  description: string;
  cancelled_reason: string | null;
  status_changed_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'CALL_BACK': <Phone className="h-4 w-4" />,
  'EMAIL_REPLY': <Mail className="h-4 w-4" />,
  'LETTER': <FileText className="h-4 w-4" />,
  'IMAGING_REPORT': <Image className="h-4 w-4" />,
  'PATIENT_MESSAGE': <MessageSquare className="h-4 w-4" />,
  'OTHER_ACTION': <MoreHorizontal className="h-4 w-4" />,
  // Admin task types
  'PATIENT_CALLBACK': <Phone className="h-4 w-4" />,
  'PATIENT_EMAIL_RESPONSE': <Mail className="h-4 w-4" />,
  'PORTAL_MESSAGE_RESPONSE': <MessageSquare className="h-4 w-4" />,
  'RESEND_INTAKE_FORMS': <Send className="h-4 w-4" />,
  'FOLLOWUP_INCOMPLETE_FORMS': <FileSearch className="h-4 w-4" />,
  'SEND_RECEIPT': <Receipt className="h-4 w-4" />,
  'ORDER_IMAGING': <Image className="h-4 w-4" />,
  'SCHEDULE_APPOINTMENT': <Calendar className="h-4 w-4" />,
  'CONFIRM_APPOINTMENT': <Calendar className="h-4 w-4" />,
  'REQUEST_OUTSIDE_RECORDS': <FileSearch className="h-4 w-4" />,
  'SEND_RECORDS_TO_PATIENT': <FileText className="h-4 w-4" />,
  'UPDATE_PATIENT_CONTACT': <UserCog className="h-4 w-4" />,
  'DOCUMENT_PATIENT_REQUEST': <ClipboardList className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  'CALL_BACK': 'Call',
  'EMAIL_REPLY': 'Email',
  'LETTER': 'Letter',
  'IMAGING_REPORT': 'Imaging',
  'PATIENT_MESSAGE': 'Portal',
  'OTHER_ACTION': 'Other',
  // Admin task types
  'PATIENT_CALLBACK': 'Callback',
  'PATIENT_EMAIL_RESPONSE': 'Email',
  'PORTAL_MESSAGE_RESPONSE': 'Portal',
  'RESEND_INTAKE_FORMS': 'Resend Forms',
  'FOLLOWUP_INCOMPLETE_FORMS': 'Form F/U',
  'SEND_RECEIPT': 'Receipt',
  'ORDER_IMAGING': 'Order Imaging',
  'SCHEDULE_APPOINTMENT': 'Schedule',
  'CONFIRM_APPOINTMENT': 'Confirm',
  'REQUEST_OUTSIDE_RECORDS': 'Req Records',
  'SEND_RECORDS_TO_PATIENT': 'Send Records',
  'UPDATE_PATIENT_CONTACT': 'Update Contact',
  'DOCUMENT_PATIENT_REQUEST': 'Doc Request',
};

const OWNER_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Tasks' },
  { value: 'ADMIN', label: 'Admin Tasks' },
  { value: 'CLINICIAN', label: 'Clinician Tasks' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_ON_CLINICIAN', label: 'Waiting on Clinician' },
  { value: 'WAITING_ON_PATIENT', label: 'Waiting on Patient' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_LABELS: Record<string, string> = {
  'OPEN': 'Open',
  'IN_PROGRESS': 'In Progress',
  'WAITING_ON_CLINICIAN': 'Waiting (Clinician)',
  'WAITING_ON_PATIENT': 'Waiting (Patient)',
  'BLOCKED': 'Blocked',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled',
};

const TIME_WINDOW_OPTIONS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

// Task Notes Dialog Component
function TaskNotesDialog({ 
  open, 
  onOpenChange, 
  taskId,
  taskDescription,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  taskId: string | null;
  taskDescription: string;
}) {
  const { notes, isLoading, addNote } = useTaskNotes(taskId);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !taskId) return;
    setSubmitting(true);
    try {
      await addNote.mutateAsync({ taskId, note: newNote.trim() });
      setNewNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Task Notes</DialogTitle>
          <DialogDescription className="text-xs truncate">
            {taskDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <ScrollArea className="h-[200px] border rounded-md p-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notes yet
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span className="font-medium">{note.author?.full_name || "Unknown"}</span>
                      <span>{format(new Date(note.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || submitting}
              size="sm"
              className="w-full"
            >
              {submitting ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Cancel Task Dialog Component
function CancelTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(reason.trim());
    setReason("");
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Task</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this task.
          </DialogDescription>
        </DialogHeader>
        
        <Textarea
          placeholder="Reason for cancellation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!reason.trim() || submitting}
          >
            {submitting ? "Cancelling..." : "Cancel Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reassign Task Dialog Component
function ReassignTaskDialog({
  open,
  onOpenChange,
  clinicians,
  currentClinicianId,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicians: Clinician[];
  currentClinicianId: string;
  onConfirm: (newClinicianId: string) => void;
}) {
  const [selectedClinician, setSelectedClinician] = useState(currentClinicianId);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (selectedClinician === currentClinicianId) return;
    setSubmitting(true);
    await onConfirm(selectedClinician);
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Task</DialogTitle>
          <DialogDescription>
            Select a new clinician to assign this task to.
          </DialogDescription>
        </DialogHeader>
        
        <Select value={selectedClinician} onValueChange={setSelectedClinician}>
          <SelectTrigger>
            <SelectValue placeholder="Select clinician" />
          </SelectTrigger>
          <SelectContent>
            {clinicians.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedClinician === currentClinicianId || submitting}
          >
            {submitting ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const AdminClinicianQueues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Dialog states
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter states
  const [selectedClinician, setSelectedClinician] = useState<string>(
    searchParams.get('clinician') || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('status') || 'ALL'
  );
  const [selectedOwnerType, setSelectedOwnerType] = useState<string>(
    searchParams.get('ownerType') || 'ALL'
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
    if (selectedOwnerType !== 'ALL') params.set('ownerType', selectedOwnerType);
    if (timeWindow !== '7d') params.set('timeWindow', timeWindow);
    setSearchParams(params);
  }, [selectedClinician, selectedStatus, selectedOwnerType, timeWindow, setSearchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, cancelledReason?: string) => {
    try {
      const updates: Record<string, unknown> = {
        status: newStatus,
        status_changed_at: new Date().toISOString(),
      };
      if (newStatus === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
      }
      if (newStatus === 'CANCELLED' && cancelledReason) {
        updates.cancelled_reason = cancelledReason;
      }

      const { error } = await supabase
        .from('communication_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      toast.success("Task status updated");
      await fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error("Failed to update task");
    }
  };

  const handleReassign = async (newClinicianId: string) => {
    if (!selectedTask) return;
    try {
      const { error } = await supabase
        .from('communication_tasks')
        .update({
          assigned_clinician_id: newClinicianId,
          status_changed_at: new Date().toISOString(),
        })
        .eq('id', selectedTask.id);

      if (error) throw error;
      toast.success("Task reassigned");
      await fetchData();
    } catch (err) {
      console.error('Error reassigning task:', err);
      toast.error("Failed to reassign task");
    }
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

      // Owner type filter
      if (selectedOwnerType !== 'ALL' && task.owner_type !== selectedOwnerType) {
        return false;
      }

      // Time window filter for completed/cancelled tasks
      if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
        const endDate = task.completed_at || task.status_changed_at;
        if (!endDate || new Date(endDate) < cutoff) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort: blocked first, then overdue, then by due_at
      const aBlocked = a.status === 'BLOCKED';
      const bBlocked = b.status === 'BLOCKED';
      if (aBlocked && !bBlocked) return -1;
      if (!aBlocked && bBlocked) return 1;

      const activeStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLINICIAN', 'WAITING_ON_PATIENT'];
      const aOverdue = activeStatuses.includes(a.status) && new Date(a.due_at) < now;
      const bOverdue = activeStatuses.includes(b.status) && new Date(b.due_at) < now;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Completed/cancelled tasks sort by completed_at desc
      if ((a.status === 'COMPLETED' || a.status === 'CANCELLED') && 
          (b.status === 'COMPLETED' || b.status === 'CANCELLED')) {
        const aDate = a.completed_at || a.status_changed_at;
        const bDate = b.completed_at || b.status_changed_at;
        return new Date(bDate!).getTime() - new Date(aDate!).getTime();
      }
      
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
  }, [tasks, selectedClinician, selectedStatus, selectedOwnerType, timeWindow]);

  const getClinicianName = (clinicianId: string) => {
    return clinicians.find(c => c.id === clinicianId)?.name || 'Unknown';
  };

  const getStatusBadge = (task: Task) => {
    const isOverdue = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLINICIAN', 'WAITING_ON_PATIENT'].includes(task.status) && 
                      new Date(task.due_at) < new Date();
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'OPEN': 'outline',
      'IN_PROGRESS': 'secondary',
      'WAITING_ON_CLINICIAN': 'secondary',
      'WAITING_ON_PATIENT': 'secondary',
      'BLOCKED': 'destructive',
      'COMPLETED': 'default',
      'CANCELLED': 'outline',
    };

    const colors: Record<string, string> = {
      'COMPLETED': 'bg-emerald-500',
      'BLOCKED': '',
      'CANCELLED': 'text-muted-foreground',
    };

    return (
      <Badge 
        variant={isOverdue && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' ? 'destructive' : variants[task.status] || 'outline'}
        className={`text-[10px] ${colors[task.status] || ''}`}
      >
        {isOverdue && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' 
          ? 'Overdue' 
          : STATUS_LABELS[task.status] || task.status}
      </Badge>
    );
  };

  const getTimeInStatus = (task: Task) => {
    const statusDate = task.status_changed_at || task.created_at;
    return formatDistanceToNow(new Date(statusDate), { addSuffix: false });
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
            Communication Tasks
          </h1>
          <p className="text-muted-foreground text-sm">
            Central hub for admin and clinician tasks — filter by owner type to focus your work
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
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

            <div className="w-[180px]">
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
                Time Window
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

            <div className="w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">Owner Type</label>
              <Select value={selectedOwnerType} onValueChange={setSelectedOwnerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNER_TYPE_OPTIONS.map(opt => (
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
                    <TableHead className="w-[70px]">Owner</TableHead>
                    <TableHead className="w-[130px]">Assigned To</TableHead>
                    <TableHead>Patient / Description</TableHead>
                    <TableHead className="w-[90px]">Type</TableHead>
                    <TableHead className="w-[100px]">Due</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[90px]">In Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(task => (
                    <TableRow 
                      key={task.id} 
                      className={task.status === 'BLOCKED' ? 'bg-amber-500/5' : ''}
                    >
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            task.owner_type === 'ADMIN' 
                              ? 'bg-purple-500/10 text-purple-700 border-purple-200' 
                              : 'bg-blue-500/10 text-blue-700 border-blue-200'
                          }`}
                        >
                          {task.owner_type === 'ADMIN' ? (
                            <><Shield className="h-3 w-3 mr-1" /> Admin</>
                          ) : (
                            <><Stethoscope className="h-3 w-3 mr-1" /> Clinician</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {getClinicianName(task.assigned_clinician_id)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <p className="font-medium">{task.patient_name || '—'}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">
                            {task.description}
                          </p>
                          {task.cancelled_reason && (
                            <p className="text-[10px] text-destructive mt-1">
                              Cancelled: {task.cancelled_reason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {TYPE_ICONS[task.type] || <MoreHorizontal className="h-4 w-4" />}
                          <span>{TYPE_LABELS[task.type] || task.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{getStatusBadge(task)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeInStatus(task)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* View Notes */}
                            <DropdownMenuItem onClick={() => {
                              setSelectedTask(task);
                              setNotesDialogOpen(true);
                            }}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View Notes
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Status Changes */}
                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                              <>
                                {task.status !== 'IN_PROGRESS' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'WAITING_ON_CLINICIAN' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'WAITING_ON_CLINICIAN')}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Waiting on Clinician
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'WAITING_ON_PATIENT' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'WAITING_ON_PATIENT')}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Waiting on Patient
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'BLOCKED' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'BLOCKED')}>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Mark Blocked
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'COMPLETED')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                              </>
                            )}

                            {/* Reassign */}
                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                setReassignDialogOpen(true);
                              }}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Reassign
                              </DropdownMenuItem>
                            )}

                            {/* Cancel */}
                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setCancelDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Task
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTaskDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        source="ADMIN"
      />

      <TaskNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        taskId={selectedTask?.id || null}
        taskDescription={selectedTask?.description || ""}
      />

      <CancelTaskDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={(reason) => {
          if (selectedTask) {
            handleStatusChange(selectedTask.id, 'CANCELLED', reason);
          }
        }}
      />

      <ReassignTaskDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        clinicians={clinicians}
        currentClinicianId={selectedTask?.assigned_clinician_id || ""}
        onConfirm={handleReassign}
      />
    </div>
  );
};

export default AdminClinicianQueues;
