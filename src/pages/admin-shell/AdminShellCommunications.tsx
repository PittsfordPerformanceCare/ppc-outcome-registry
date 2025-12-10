import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  ArrowRight,
  Mail,
  Phone,
  FileText,
  Bell,
  Send,
  Inbox
} from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load heavy components
const ClinicianInbox = lazy(() => import("@/pages/ClinicianInbox"));

function LoadingSkeleton() {
  return <Skeleton className="h-48 w-full" />;
}

const AdminShellCommunications = () => {
  // Fetch recent notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["recent-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications_history")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch PCP summary tasks
  const { data: pcpTasks = [] } = useQuery({
    queryKey: ["pcp-summary-tasks-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pcp_summary_tasks")
        .select("id, status")
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
  });

  // Fetch patient messages count
  const { data: messages = [] } = useQuery({
    queryKey: ["patient-messages-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_messages")
        .select("id, status")
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
  });

  const pendingMessages = messages.length;
  const pendingPCP = pcpTasks.length;
  const recentNotifications = notifications.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Communications
          </h1>
          <p className="text-muted-foreground">
            Manage patient messaging, notifications, and PCP summaries
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Pending Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PCP Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPCP}</div>
            <p className="text-xs text-muted-foreground">to send</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Send className="h-4 w-4" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentNotifications}</div>
            <p className="text-xs text-muted-foreground">last 10</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMessages + pendingPCP}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox ({pendingMessages})
          </TabsTrigger>
          <TabsTrigger value="pcp">
            PCP Summaries ({pendingPCP})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notification History
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Messages</CardTitle>
              <CardDescription>View and respond to patient communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {pendingMessages > 0 
                    ? `You have ${pendingMessages} pending message(s) to review.`
                    : "No pending messages. All caught up!"
                  }
                </p>
                <Button asChild>
                  <Link to="/clinician-inbox">
                    Open Full Inbox
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pcp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PCP Summary Generation</CardTitle>
              <CardDescription>Generate and send primary care provider summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {pendingPCP > 0 
                    ? `${pendingPCP} PCP summary(s) pending generation.`
                    : "No pending PCP summaries."
                  }
                </p>
                <Button asChild>
                  <Link to="/pcp-summary">
                    Manage PCP Summaries
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View sent notifications and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <LoadingSkeleton />
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No notifications sent yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {notification.notification_type === "email" ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {notification.recipient_email || notification.recipient_phone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.template_name}
                          </p>
                        </div>
                      </div>
                      <Badge variant={notification.status === "sent" ? "default" : "secondary"}>
                        {notification.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/notification-history">
                    View All Notifications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage notification and communication templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  View and customize email templates for patient communications.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/admin/settings">
                    Manage Templates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Tools</CardTitle>
          <CardDescription>Access communication functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/clinician-inbox">
                <Inbox className="mr-2 h-4 w-4" />
                Clinician Inbox
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/pcp-summary">
                <FileText className="mr-2 h-4 w-4" />
                PCP Summaries
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/notification-history">
                <Bell className="mr-2 h-4 w-4" />
                Notification History
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/notification-analytics">
                <Send className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellCommunications;
