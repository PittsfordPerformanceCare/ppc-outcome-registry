import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Phone, AlertCircle, BellRing } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationPreferences {
  id?: string;
  email_enabled: boolean;
  notify_on_new_message: boolean;
  notify_on_callback_request: boolean;
  notify_on_pending_feedback: boolean;
  notification_email: string | null;
}

export default function ClinicianNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    permission: browserPermission, 
    isSupported: browserNotificationsSupported,
    isEnabled: browserNotificationsEnabled,
    requestPermission 
  } = useBrowserNotifications();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    notify_on_new_message: true,
    notify_on_callback_request: true,
    notify_on_pending_feedback: true,
    notification_email: null,
  });

  // Fetch existing preferences
  const { data: existingPrefs, isLoading } = useQuery({
    queryKey: ["clinician-notification-preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinician_notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existingPrefs) {
      setPreferences({
        id: existingPrefs.id,
        email_enabled: existingPrefs.email_enabled,
        notify_on_new_message: existingPrefs.notify_on_new_message,
        notify_on_callback_request: existingPrefs.notify_on_callback_request,
        notify_on_pending_feedback: existingPrefs.notify_on_pending_feedback,
        notification_email: existingPrefs.notification_email,
      });
    }
  }, [existingPrefs]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      if (existingPrefs) {
        const { error } = await supabase
          .from("clinician_notification_preferences")
          .update({
            email_enabled: prefs.email_enabled,
            notify_on_new_message: prefs.notify_on_new_message,
            notify_on_callback_request: prefs.notify_on_callback_request,
            notify_on_pending_feedback: prefs.notify_on_pending_feedback,
            notification_email: prefs.notification_email,
          })
          .eq("user_id", user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("clinician_notification_preferences")
          .insert({
            user_id: user?.id,
            email_enabled: prefs.email_enabled,
            notify_on_new_message: prefs.notify_on_new_message,
            notify_on_callback_request: prefs.notify_on_callback_request,
            notify_on_pending_feedback: prefs.notify_on_pending_feedback,
            notification_email: prefs.notification_email,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinician-notification-preferences"] });
      toast.success("Notification preferences saved");
    },
    onError: (error: any) => {
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure when and how you want to receive notifications about patient messages and requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications Section */}
        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                <Label htmlFor="browser-notifications" className="font-semibold">
                  Browser Push Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified even when the tab is not active
              </p>
            </div>
            {browserNotificationsSupported ? (
              <div className="flex items-center gap-2">
                {browserPermission === "granted" && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Enabled
                  </Badge>
                )}
                {browserPermission === "denied" && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Blocked
                  </Badge>
                )}
                {browserPermission === "default" && (
                  <Button onClick={requestPermission} size="sm">
                    Enable
                  </Button>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not Supported
              </Badge>
            )}
          </div>
          
          {browserPermission === "denied" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Browser notifications are blocked. Please enable them in your browser settings to receive push notifications.
              </AlertDescription>
            </Alert>
          )}
          
          {browserPermission === "default" && browserNotificationsSupported && (
            <Alert>
              <BellRing className="h-4 w-4" />
              <AlertDescription>
                Enable browser notifications to get notified about new messages even when this tab is not active. You can disable them anytime in your browser settings.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Email Notifications Section */}
        <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label htmlFor="email-enabled" className="font-semibold">
                Email Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive email alerts for important patient communications
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={preferences.email_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, email_enabled: checked })
            }
          />
        </div>

        {preferences.email_enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="notification-email">
                Notification Email (Optional)
              </Label>
              <Input
                id="notification-email"
                type="email"
                placeholder="Use a different email for notifications"
                value={preferences.notification_email || ""}
                onChange={(e) =>
                  setPreferences({ ...preferences, notification_email: e.target.value || null })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use your account email
              </p>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-semibold text-sm">Notification Triggers</h4>
              
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <Label htmlFor="notify-messages" className="text-sm">
                      New Patient Messages
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when patients send you a message
                  </p>
                </div>
                <Switch
                  id="notify-messages"
                  checked={preferences.notify_on_new_message}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_new_message: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <Label htmlFor="notify-callbacks" className="text-sm">
                      Callback Requests
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when patients request a callback
                  </p>
                </div>
                <Switch
                  id="notify-callbacks"
                  checked={preferences.notify_on_callback_request}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_callback_request: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Label htmlFor="notify-feedback" className="text-sm">
                      Pending Feedback
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified about pending patient feedback (coming soon)
                  </p>
                </div>
                <Switch
                  id="notify-feedback"
                  checked={preferences.notify_on_pending_feedback}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_pending_feedback: checked })
                  }
                  disabled
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
