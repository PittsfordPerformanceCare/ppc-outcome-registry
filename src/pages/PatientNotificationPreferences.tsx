import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Mail, MessageSquare, Trophy, Gift, Loader2, Save } from "lucide-react";

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  points_notifications: boolean;
  achievement_notifications: boolean;
}

export default function PatientNotificationPreferences() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    sms_enabled: true,
    points_notifications: true,
    achievement_notifications: true,
  });

  useEffect(() => {
    checkAuthAndLoadPreferences();
  }, []);

  const checkAuthAndLoadPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/patient-auth");
      return;
    }

    setUser(session.user);
    await loadPreferences(session.user.id);
  };

  const loadPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("patient_notification_preferences")
        .select("*")
        .eq("patient_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          email_enabled: (data as any).email_enabled,
          sms_enabled: (data as any).sms_enabled,
          points_notifications: (data as any).points_notifications,
          achievement_notifications: (data as any).achievement_notifications,
        });
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast({
        title: "Error Loading Preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("patient_notification_preferences")
        .upsert({
          patient_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error Saving Preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/patient-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notification Preferences</h1>
              <p className="text-muted-foreground">Manage how you receive reward notifications</p>
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Delivery Methods
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-enabled" className="text-base">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via text message
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => updatePreference("sms_enabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Select which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="points-notifications" className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Points Earned Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you earn points for completing assessments or activities
                </p>
              </div>
              <Switch
                id="points-notifications"
                checked={preferences.points_notifications}
                onCheckedChange={(checked) => updatePreference("points_notifications", checked)}
                disabled={!preferences.email_enabled && !preferences.sms_enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="achievement-notifications" className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Achievement Unlocked Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you unlock new achievements and milestones
                </p>
              </div>
              <Switch
                id="achievement-notifications"
                checked={preferences.achievement_notifications}
                onCheckedChange={(checked) => updatePreference("achievement_notifications", checked)}
                disabled={!preferences.email_enabled && !preferences.sms_enabled}
              />
            </div>

            {!preferences.email_enabled && !preferences.sms_enabled && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Enable at least one delivery method to receive notifications
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Stay Motivated!</p>
                <p className="text-sm text-muted-foreground">
                  Reward notifications help you stay engaged with your recovery journey. 
                  You'll be notified when you earn points or unlock new achievements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSavePreferences} 
            disabled={saving}
            size="lg"
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
