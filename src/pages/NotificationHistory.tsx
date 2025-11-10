import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Mail, MessageSquare, CheckCircle, XCircle, Eye, Clock, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificationRetryPanel } from "@/components/NotificationRetryPanel";

interface NotificationHistoryRecord {
  id: string;
  episode_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  clinician_name: string;
  notification_type: 'email' | 'sms';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  opened_at: string | null;
  open_count: number | null;
  click_count: number | null;
  first_clicked_at: string | null;
  error_message: string | null;
  delivery_details: any;
}

export default function NotificationHistory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications_history")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      setNotifications((data || []) as NotificationHistoryRecord[]);
    } catch (error: any) {
      console.error("Error loading notification history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.episode_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.clinician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.patient_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notification.patient_phone?.includes(searchTerm));

    const matchesType = typeFilter === "all" || notification.notification_type === typeFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "email" ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Mail className="h-3 w-3 mr-1" />Email
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <MessageSquare className="h-3 w-3 mr-1" />SMS
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification History</h1>
          <p className="text-muted-foreground mt-2">
            Detailed delivery logs and email engagement tracking for all notifications
          </p>
        </div>
        <Button onClick={() => navigate("/retry-analytics")} variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          View Retry Analytics
        </Button>
      </div>

      {/* Retry Management Panel */}
      <NotificationRetryPanel />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Notifications</CardTitle>
          <CardDescription>Search and filter notification delivery history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, episode, or clinician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredNotifications.length}</div>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredNotifications.filter(n => n.status === 'sent').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredNotifications.filter(n => n.notification_type === 'email' && n.opened_at).length}
            </div>
            <p className="text-xs text-muted-foreground">Emails Opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {filteredNotifications.filter(n => n.notification_type === 'email' && n.click_count && n.click_count > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Emails with Clicks</p>
          </CardContent>
        </Card>
      </div>

      {/* Email Engagement Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle>Email Engagement Summary</CardTitle>
          <CardDescription>Click-through and open rate metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              const emailsSent = filteredNotifications.filter(n => n.notification_type === 'email' && n.status === 'sent').length;
              const emailsOpened = filteredNotifications.filter(n => n.notification_type === 'email' && n.opened_at).length;
              const emailsClicked = filteredNotifications.filter(n => n.notification_type === 'email' && n.click_count && n.click_count > 0).length;
              const totalClicks = filteredNotifications
                .filter(n => n.notification_type === 'email')
                .reduce((sum, n) => sum + (n.click_count || 0), 0);
              
              const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : '0.0';
              const clickRate = emailsSent > 0 ? ((emailsClicked / emailsSent) * 100).toFixed(1) : '0.0';
              const clickToOpenRate = emailsOpened > 0 ? ((emailsClicked / emailsOpened) * 100).toFixed(1) : '0.0';
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{openRate}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Open Rate</p>
                    <p className="text-xs text-muted-foreground">{emailsOpened} of {emailsSent} opened</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{clickRate}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Click-Through Rate</p>
                    <p className="text-xs text-muted-foreground">{emailsClicked} of {emailsSent} clicked</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{clickToOpenRate}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Click-to-Open Rate</p>
                    <p className="text-xs text-muted-foreground">{totalClicks} total clicks</p>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Notification Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Logs</CardTitle>
          <CardDescription>
            Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No notifications found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="font-medium">{notification.patient_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Episode: {notification.episode_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Clinician: {notification.clinician_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.notification_type === 'email' && notification.patient_email && (
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-blue-500" />
                            {notification.patient_email}
                          </div>
                        )}
                        {notification.notification_type === 'sms' && notification.patient_phone && (
                          <div className="text-sm flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-purple-500" />
                            {notification.patient_phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(notification.notification_type)}</TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(notification.sent_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(notification.sent_at), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.notification_type === 'email' ? (
                          <div className="space-y-2">
                            {notification.opened_at ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Opened
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(notification.opened_at), "MMM dd, h:mm a")}
                                </div>
                                {notification.open_count && notification.open_count > 1 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Opened {notification.open_count}x
                                  </div>
                                )}
                              </div>
                            ) : notification.status === 'sent' ? (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Not Opened
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                            
                            {notification.click_count && notification.click_count > 0 && (
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {notification.click_count} Click{notification.click_count > 1 ? 's' : ''}
                                </Badge>
                                {notification.first_clicked_at && (
                                  <div className="text-xs text-muted-foreground">
                                    First: {format(new Date(notification.first_clicked_at), "MMM dd, h:mm a")}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">SMS</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {notification.error_message ? (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {notification.error_message.substring(0, 100)}
                              {notification.error_message.length > 100 && '...'}
                            </AlertDescription>
                          </Alert>
                        ) : notification.delivery_details ? (
                          <div className="text-xs text-muted-foreground">
                            {notification.delivery_details.message_id && (
                              <div>ID: {notification.delivery_details.message_id.substring(0, 20)}...</div>
                            )}
                            {notification.delivery_details.sid && (
                              <div>SID: {notification.delivery_details.sid.substring(0, 20)}...</div>
                            )}
                            {notification.delivery_details.type && (
                              <Badge variant="outline" className="mt-1">
                                {notification.delivery_details.type.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No details</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
