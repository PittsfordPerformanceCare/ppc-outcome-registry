import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Link2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GoogleCalendarConnect() {
  const [connecting, setConnecting] = useState(false);
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnection();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state === 'google_calendar') {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("google_calendar_connections")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error: any) {
      console.error("Error fetching connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("google-calendar-oauth", {
        body: {
          code,
          userId: user.id,
          clinicId: profile?.clinic_id,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Google Calendar connected successfully",
      });

      await fetchConnection();
    } catch (error: any) {
      toast({
        title: "Connection error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const initiateOAuth = async () => {
    setConnecting(true);
    try {
      // Fetch the Google Client ID from the backend
      const { data, error } = await supabase.functions.invoke("get-google-client-id");
      
      if (error) throw error;
      
      const clientId = data?.clientId;
      if (!clientId) {
        throw new Error("Google Client ID not configured");
      }

      const redirectUri = `${window.location.origin}/clinic-settings`;
      const scope = 'https://www.googleapis.com/auth/calendar.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        access_type: 'offline',
        prompt: 'consent',
        state: 'google_calendar',
      })}`;

      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: "Configuration error",
        description: error.message || "Failed to initiate Google OAuth",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (!connection) return;

      const { error } = await supabase
        .from("google_calendar_connections")
        .update({ is_active: false })
        .eq("id", connection.id);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Google Calendar has been disconnected",
      });

      await fetchConnection();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to automatically detect scheduled appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <>
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Connected to: <strong>{connection.calendar_name}</strong>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={disconnect}>
                <XCircle className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>The system checks your calendar every 15-30 minutes</li>
                <li>Appointments matching patient names or emails are automatically detected</li>
                <li>Detected appointments prevent reminder emails from being sent</li>
                <li>You can manually trigger a sync anytime from the Automation Status page</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <Link2 className="h-4 w-4" />
              <AlertDescription>
                Connect your Google Calendar to enable automatic appointment detection
              </AlertDescription>
            </Alert>
            <Button onClick={initiateOAuth} disabled={connecting}>
              <Calendar className="mr-2 h-4 w-4" />
              {connecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">What you'll need:</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>A Google account with calendar access</li>
                <li>Permission to view calendar events</li>
                <li>The calendar where appointments are scheduled</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}