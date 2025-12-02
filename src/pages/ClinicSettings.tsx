import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, Send, Mail, MessageSquare, Bell, Clock, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ReminderStatusPanel } from "@/components/ReminderStatusPanel";
import { NotificationAlertSettings } from "@/components/NotificationAlertSettings";
import { RateLimitConfigPanel } from "@/components/RateLimitConfigPanel";
import { EmailTemplateGallery } from "@/components/EmailTemplateGallery";
import { SaveTemplateDialog } from "@/components/SaveTemplateDialog";
import { EmailTemplateAnalytics } from "@/components/EmailTemplateAnalytics";
import { ClinicBrandingSettings } from "@/components/ClinicBrandingSettings";
import { WebhookAlertSettings } from "@/components/WebhookAlertSettings";
import { GoogleCalendarConnect } from "@/components/GoogleCalendarConnect";

interface ClinicSettings {
  clinic_name: string;
  phone: string;
  email: string;
  email_subject: string;
  email_template: string;
  sms_template: string;
  discharge_email_subject: string;
  discharge_email_template: string;
  discharge_sms_template: string;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  reminder_email_subject: string;
  reminder_email_template: string;
  reminder_sms_template: string;
  outcome_reminder_enabled: boolean;
  outcome_reminder_interval_days: number;
  outcome_reminder_email_subject: string;
  outcome_reminder_email_template: string;
  outcome_reminder_sms_template: string;
}

export default function ClinicSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [settings, setSettings] = useState<Partial<ClinicSettings>>({});
  
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testingReminders, setTestingReminders] = useState(false);

useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setInitialLoading(true);
      try {
        const { data: settingsData, error } = await supabase
          .from("clinic_settings")
          .select("*")
          .single();
        
        if (error) throw error;
        
        if (settingsData) {
          setSettings(settingsData as Partial<ClinicSettings>);
        }
        
        if (user?.email) {
          setTestEmail(user.email);
        }
      } catch (error: any) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: currentSettings } = await supabase
        .from("clinic_settings")
        .select("id")
        .single();

      const { error } = await supabase
        .from("clinic_settings")
        .update(settings)
        .eq("id", currentSettings?.id);

      if (error) throw error;

      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-intake-notification', {
        body: {
          episodeId: 'TEST-12345',
          patientName: 'John Doe (Test Patient)',
          patientEmail: testEmail,
          clinicianName: 'Dr. Smith (Test Clinician)',
          appointmentDate: new Date().toLocaleDateString(),
          appointmentTime: '10:00 AM',
          userId: user?.id,
          isTest: true
        }
      });

      if (error) throw error;

      toast.success(`Test email sent to ${testEmail}! Check your inbox.`);
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error(`Failed to send test email: ${error.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-intake-notification', {
        body: {
          episodeId: 'TEST-12345',
          patientName: 'John Doe (Test Patient)',
          patientPhone: testPhone,
          clinicianName: 'Dr. Smith (Test Clinician)',
          appointmentDate: new Date().toLocaleDateString(),
          appointmentTime: '10:00 AM',
          userId: user?.id,
          isTest: true
        }
      });

      if (error) throw error;

      toast.success(`Test SMS sent to ${testPhone}!`);
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      toast.error(`Failed to send test SMS: ${error.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  const handleTestReminders = async () => {
    setTestingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders');

      if (error) throw error;

      const result = data as { processed: number; message: string };
      
      if (result.processed > 0) {
        toast.success(`${result.message || `Sent ${result.processed} reminder(s)`}`);
      } else {
        toast.info("No upcoming appointments found in the reminder window");
      }
    } catch (error: any) {
      console.error("Error testing reminders:", error);
      toast.error(`Failed to test reminders: ${error.message}`);
    } finally {
      setTestingReminders(false);
    }
  };

if (authLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clinic Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure notification templates and clinic preferences
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="discharge">Discharge</TabsTrigger>
              <TabsTrigger value="outcome-reminders">Outcome Reminders</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input
                    id="clinic-name"
                    value={settings.clinic_name || ''}
                    onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                    placeholder="Your Clinic Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Phone Number</Label>
                  <Input
                    id="clinic-phone"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinic-email">Email Address</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="info@clinic.com"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <EmailTemplateAnalytics />

              <Card>
                <CardHeader>
                  <CardTitle>Save Current Template</CardTitle>
                  <CardDescription>
                    Save your current email template design for future use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SaveTemplateDialog 
                    currentSubject={settings.email_subject || ''}
                    currentHtml={settings.email_template || ''}
                    onSave={() => toast.success("Template saved!")}
                  />
                </CardContent>
              </Card>

              <EmailTemplateGallery 
                onSelectTemplate={(subject, html) => {
                  setSettings({ ...settings, email_subject: subject, email_template: html });
                  toast.success("Template applied!");
                }}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Available placeholders: {'{'}
                  {'{'}patient_name{'}'}
                  {'}'}, {'{'}
                  {'{'}clinician_name{'}'}
                  {'}'}, {'{'}
                  {'{'}episode_id{'}'}
                  {'}'}, {'{'}
                  {'{'}clinic_name{'}'}
                  {'}'}, {'{'}
                  {'{'}clinic_phone{'}'}
                  {'}'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  value={settings.email_subject || ''}
                  onChange={(e) => setSettings({ ...settings, email_subject: e.target.value })}
                  placeholder="Your Episode Has Been Created"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-template">Email Template (HTML)</Label>
                <Textarea
                  id="email-template"
                  value={settings.email_template || ''}
                  onChange={(e) => setSettings({ ...settings, email_template: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="Enter HTML template..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-template">SMS Template</Label>
                <Textarea
                  id="sms-template"
                  value={settings.sms_template || ''}
                  onChange={(e) => setSettings({ ...settings, sms_template: e.target.value })}
                  rows={4}
                  placeholder="SMS template..."
                />
              </div>

              {/* Test Notifications */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-500" />
                    Test Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@email.com"
                    />
                    <Button onClick={handleSendTestEmail} disabled={sendingTest}>
                      {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+1234567890"
                    />
                    <Button onClick={handleSendTestSMS} disabled={sendingTest}>
                      {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-4">
              <ReminderStatusPanel />
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="reminder-enabled"
                  checked={settings.reminder_enabled ?? true}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminder_enabled: checked })}
                />
                <Label htmlFor="reminder-enabled">Enable Appointment Reminders</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-hours">Hours Before Appointment</Label>
                <Input
                  id="reminder-hours"
                  type="number"
                  value={settings.reminder_hours_before ?? 24}
                  onChange={(e) => setSettings({ ...settings, reminder_hours_before: parseInt(e.target.value) || 24 })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="reminder-email-subject">Email Subject</Label>
                <Input
                  id="reminder-email-subject"
                  value={settings.reminder_email_subject || ''}
                  onChange={(e) => setSettings({ ...settings, reminder_email_subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-email-template">Email Template</Label>
                <Textarea
                  id="reminder-email-template"
                  value={settings.reminder_email_template || ''}
                  onChange={(e) => setSettings({ ...settings, reminder_email_template: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-sms-template">SMS Template</Label>
                <Textarea
                  id="reminder-sms-template"
                  value={settings.reminder_sms_template || ''}
                  onChange={(e) => setSettings({ ...settings, reminder_sms_template: e.target.value })}
                  rows={3}
                />
              </div>

              <Button onClick={handleTestReminders} disabled={testingReminders} className="w-full">
                {testingReminders ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                Test Reminders Now
              </Button>
            </TabsContent>

            <TabsContent value="discharge" className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Discharge notifications are sent automatically when an episode is marked as complete. Additional placeholders: {'{'}
                  {'{'}discharge_date{'}'}
                  {'}'}, {'{'}
                  {'{'}improvement_summary{'}'}
                  {'}'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="discharge-email-subject">Email Subject</Label>
                <Input
                  id="discharge-email-subject"
                  value={settings.discharge_email_subject || ''}
                  onChange={(e) => setSettings({ ...settings, discharge_email_subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discharge-email-template">Email Template</Label>
                <Textarea
                  id="discharge-email-template"
                  value={settings.discharge_email_template || ''}
                  onChange={(e) => setSettings({ ...settings, discharge_email_template: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discharge-sms-template">SMS Template</Label>
                <Textarea
                  id="discharge-sms-template"
                  value={settings.discharge_sms_template || ''}
                  onChange={(e) => setSettings({ ...settings, discharge_sms_template: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="outcome-reminders" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Outcome measure reminders automatically prompt patients to complete assessments (NDI, ODI, LEFS, QuickDASH) at regular intervals during their treatment.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2">
                <Switch
                  id="outcome-reminders-enabled"
                  checked={settings.outcome_reminder_enabled ?? true}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, outcome_reminder_enabled: checked })
                  }
                />
                <Label htmlFor="outcome-reminders-enabled">
                  Enable Outcome Measure Reminders
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome-interval">Reminder Interval (Days)</Label>
                <Input
                  id="outcome-interval"
                  type="number"
                  min="1"
                  value={settings.outcome_reminder_interval_days ?? 14}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      outcome_reminder_interval_days: parseInt(e.target.value) || 14,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How often to remind patients to complete outcome measures (default: 14 days)
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="outcome-email-subject">Email Subject</Label>
                <Input
                  id="outcome-email-subject"
                  value={settings.outcome_reminder_email_subject || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      outcome_reminder_email_subject: e.target.value,
                    })
                  }
                  placeholder="Time to Complete Your Outcome Measure"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome-email-template">Email Template</Label>
                <Textarea
                  id="outcome-email-template"
                  value={settings.outcome_reminder_email_template || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      outcome_reminder_email_template: e.target.value,
                    })
                  }
                  rows={10}
                  placeholder="Email template HTML..."
                />
                <p className="text-sm text-muted-foreground">
                  Available placeholders: {'{'}
                  {'{'}patient_name{'}'}
                  {'}'}, {'{'}
                  {'{'}clinic_name{'}'}
                  {'}'}, {'{'}
                  {'{'}clinic_phone{'}'}
                  {'}'}, {'{'}
                  {'{'}episode_id{'}'}
                  {'}'}, {'{'}
                  {'{'}clinician_name{'}'}
                  {'}'}, {'{'}
                  {'{'}region{'}'}
                  {'}'}, {'{'}
                  {'{'}outcome_tool{'}'}
                  {'}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome-sms-template">SMS Template</Label>
                <Textarea
                  id="outcome-sms-template"
                  value={settings.outcome_reminder_sms_template || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      outcome_reminder_sms_template: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="SMS template..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <NotificationAlertSettings />
      <RateLimitConfigPanel />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
