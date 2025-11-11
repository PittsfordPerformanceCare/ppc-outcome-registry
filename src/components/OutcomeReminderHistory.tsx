import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Mail, MessageSquare, CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OutcomeReminder {
  id: string;
  episode_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  clinician_name: string;
  notification_type: string;
  status: string;
  sent_at: string;
  opened_at: string | null;
  click_count: number;
  open_count: number;
  error_message: string | null;
  retry_count: number;
}

export function OutcomeReminderHistory() {
  const [reminders, setReminders] = useState<OutcomeReminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<OutcomeReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications_history')
        .select('*')
        .in('notification_type', ['outcome_reminder', 'outcome_reminder_sms'])
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setReminders(data as OutcomeReminder[]);
      setFilteredReminders(data as OutcomeReminder[]);
    } catch (error) {
      console.error('Error fetching outcome reminders:', error);
      toast.error('Failed to fetch reminder history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    let filtered = reminders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.episode_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.clinician_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.notification_type === typeFilter);
    }

    setFilteredReminders(filtered);
  }, [searchQuery, statusFilter, typeFilter, reminders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'outcome_reminder') {
      return <Mail className="h-4 w-4 text-blue-500" />;
    }
    return <MessageSquare className="h-4 w-4 text-green-500" />;
  };

  const exportToCSV = () => {
    if (filteredReminders.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date & Time',
      'Type',
      'Status',
      'Patient Name',
      'Episode ID',
      'Clinician',
      'Contact (Email)',
      'Contact (Phone)',
      'Email Opens',
      'Link Clicks',
      'Retry Count',
      'Error Message'
    ];

    const rows = filteredReminders.map((reminder) => [
      format(new Date(reminder.sent_at), 'yyyy-MM-dd HH:mm:ss'),
      reminder.notification_type === 'outcome_reminder' ? 'Email' : 'SMS',
      reminder.status,
      reminder.patient_name,
      reminder.episode_id,
      reminder.clinician_name,
      reminder.patient_email || '',
      reminder.patient_phone || '',
      reminder.open_count?.toString() || '0',
      reminder.click_count?.toString() || '0',
      reminder.retry_count?.toString() || '0',
      reminder.error_message || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `outcome-reminders-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredReminders.length} reminders to CSV`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Outcome Reminder History</CardTitle>
            <CardDescription>
              Detailed log of all outcome measure reminders sent to patients
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              disabled={filteredReminders.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchReminders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, episode, or clinician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="outcome_reminder">Email</SelectItem>
              <SelectItem value="outcome_reminder_sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-2">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Total Sent</div>
            <div className="text-2xl font-bold">{reminders.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
            <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {reminders.filter((r) => r.status === 'sent').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3">
            <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {reminders.filter((r) => r.status === 'failed').length}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            <div className="text-sm text-blue-600 dark:text-blue-400">Opened</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reminders.filter((r) => r.opened_at).length}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredReminders.length} of {reminders.length} reminders
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Episode ID</TableHead>
                <TableHead>Clinician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No outcome reminders found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredReminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(reminder.notification_type)}
                        <span className="text-xs">
                          {reminder.notification_type === 'outcome_reminder' ? 'Email' : 'SMS'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{reminder.patient_name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {reminder.episode_id}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{reminder.clinician_name}</TableCell>
                    <TableCell className="text-sm">
                      {reminder.patient_email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          {reminder.patient_email}
                        </div>
                      )}
                      {reminder.patient_phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="h-3 w-3" />
                          {reminder.patient_phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(reminder.sent_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                    <TableCell>
                      {reminder.notification_type === 'outcome_reminder' && (
                        <div className="flex flex-col gap-1 text-xs">
                          {reminder.open_count > 0 && (
                            <Badge variant="outline" className="w-fit">
                              📧 Opened {reminder.open_count}x
                            </Badge>
                          )}
                          {reminder.click_count > 0 && (
                            <Badge variant="outline" className="w-fit">
                              🔗 Clicked {reminder.click_count}x
                            </Badge>
                          )}
                          {reminder.open_count === 0 && reminder.click_count === 0 && (
                            <span className="text-muted-foreground">No activity</span>
                          )}
                        </div>
                      )}
                      {reminder.notification_type === 'outcome_reminder_sms' && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={`/episode-summary?id=${reminder.episode_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Error details for failed reminders */}
        {filteredReminders.some((r) => r.status === 'failed') && statusFilter === 'failed' && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Error Details</h4>
            <div className="space-y-2">
              {filteredReminders
                .filter((r) => r.status === 'failed')
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-900 dark:text-red-100">
                          {reminder.patient_name} - {reminder.episode_id}
                        </div>
                        <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {reminder.error_message || 'Unknown error'}
                        </div>
                        {reminder.retry_count > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Retried {reminder.retry_count} time(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
