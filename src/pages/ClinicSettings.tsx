import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, Send, Mail, MessageSquare, Bell, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ReminderStatusPanel } from "@/components/ReminderStatusPanel";
import { NotificationAlertSettings } from "@/components/NotificationAlertSettings";
import { RateLimitConfigPanel } from "@/components/RateLimitConfigPanel";
import { EmailTemplateGallery } from "@/components/EmailTemplateGallery";

export default function ClinicSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [smsTemplate, setSmsTemplate] = useState("");
  
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24);
  const [reminderEmailSubject, setReminderEmailSubject] = useState("");
  const [reminderEmailTemplate, setReminderEmailTemplate] = useState("");
  const [reminderSmsTemplate, setReminderSmsTemplate] = useState("");
  
  const [testingReminders, setTestingReminders] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadSettings = async () => {
      if (!user) return;
      
      setCheckingAdmin(true);
      try {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select()
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (!roleData) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
          return;
        }
        
        setIsAdmin(true);
        
        // Load clinic settings
        const { data: settings, error } = await supabase
          .from("clinic_settings")
          .select("email_subject, email_template, sms_template, reminder_enabled, reminder_hours_before, reminder_email_subject, reminder_email_template, reminder_sms_template")
          .single();
        
        if (error) throw error;
        
        if (settings) {
          setEmailSubject(settings.email_subject || "");
          setEmailTemplate(settings.email_template || "");
          setSmsTemplate(settings.sms_template || "");
          setReminderEnabled(settings.reminder_enabled ?? true);
          setReminderHoursBefore(settings.reminder_hours_before || 24);
          setReminderEmailSubject(settings.reminder_email_subject || "");
          setReminderEmailTemplate(settings.reminder_email_template || "");
          setReminderSmsTemplate(settings.reminder_sms_template || "");
        }
        
        // Load user email for test notifications
        if (user?.email) {
          setTestEmail(user.email);
        }
      } catch (error: any) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAndLoadSettings();
  }, [user, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("clinic_settings")
        .update({
          email_subject: emailSubject,
          email_template: emailTemplate,
          sms_template: smsTemplate,
          reminder_enabled: reminderEnabled,
          reminder_hours_before: reminderHoursBefore,
          reminder_email_subject: reminderEmailSubject,
          reminder_email_template: reminderEmailTemplate,
          reminder_sms_template: reminderSmsTemplate,
        })
        .eq("id", (await supabase.from("clinic_settings").select("id").single()).data?.id);

      if (error) throw error;

      toast.success("Notification templates saved successfully!");
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

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clinic Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure notification templates for patient communications
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Available placeholders:</strong> {`{{patient_name}}, {{clinician_name}}, {{episode_id}}, {{appointment_date}}, {{appointment_time}}, {{clinic_name}}, {{clinic_phone}}`}
        </AlertDescription>
      </Alert>

      {/* Email Template Gallery */}
      <EmailTemplateGallery 
        onSelectTemplate={(subject, html) => {
          setEmailSubject(subject);
          setEmailTemplate(html);
          toast.success("Template applied! You can now customize it further.");
          // Scroll to editor
          setTimeout(() => {
            document.getElementById("email-template")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }}
      />

      {/* Appointment Reminder Settings */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            Appointment Reminders
          </CardTitle>
          <CardDescription>
            Configure automated reminders sent before scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-enabled">Enable Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reminders before appointments
              </p>
            </div>
            <Switch
              id="reminder-enabled"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {/* Hours Before Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminder-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours Before Appointment
            </Label>
            <Input
              id="reminder-hours"
              type="number"
              min="1"
              max="168"
              value={reminderHoursBefore}
              onChange={(e) => setReminderHoursBefore(parseInt(e.target.value) || 24)}
              disabled={!reminderEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Send reminder {reminderHoursBefore} hours ({Math.round(reminderHoursBefore / 24 * 10) / 10} days) before the appointment
            </p>
          </div>

          <Separator />

          {/* Reminder Email Subject */}
          <div className="space-y-2">
            <Label htmlFor="reminder-email-subject">Reminder Email Subject</Label>
            <Input
              id="reminder-email-subject"
              value={reminderEmailSubject}
              onChange={(e) => setReminderEmailSubject(e.target.value)}
              placeholder="Appointment Reminder: {{patient_name}}"
              disabled={!reminderEnabled}
            />
          </div>

          {/* Reminder Email Template */}
          <div className="space-y-2">
            <Label htmlFor="reminder-email-template">Reminder Email Template (HTML)</Label>
            <Textarea
              id="reminder-email-template"
              value={reminderEmailTemplate}
              onChange={(e) => setReminderEmailTemplate(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder="Enter HTML email template..."
              disabled={!reminderEnabled}
            />
          </div>

          <Separator />

          {/* Reminder SMS Template */}
          <div className="space-y-2">
            <Label htmlFor="reminder-sms-template">Reminder SMS Template</Label>
            <Textarea
              id="reminder-sms-template"
              value={reminderSmsTemplate}
              onChange={(e) => setReminderSmsTemplate(e.target.value)}
              rows={4}
              placeholder="Enter SMS reminder template..."
              disabled={!reminderEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Current length: {reminderSmsTemplate.length} characters
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Reminders are checked hourly. A scheduled task will automatically send reminders to patients based on their appointment dates/times.
            </AlertDescription>
          </Alert>

          {/* Manual Test Button */}
          <div className="pt-4">
            <Button
              onClick={handleTestReminders}
              disabled={testingReminders || !reminderEnabled}
              variant="outline"
              className="w-full"
            >
              {testingReminders ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking for Appointments...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Manually Check & Send Reminders Now
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This will check for appointments in the next {reminderHoursBefore} hours and send reminders
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Send test notifications to yourself to preview templates with sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Email */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">Test Email</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-email">Your Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendTestEmail} 
                  disabled={sendingTest || !testEmail}
                  variant="outline"
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Test data: Patient "John Doe", Episode "TEST-12345", Clinician "Dr. Smith"
              </p>
            </div>
          </div>

          <Separator />

          {/* Test SMS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold">Test SMS</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-phone">Your Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="test-phone"
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendTestSMS} 
                  disabled={sendingTest || !testPhone}
                  variant="outline"
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US). Requires Twilio API configuration.
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Note:</strong> Test notifications use [TEST] prefix and won't be logged in notification history. 
              Make sure to save your templates before testing to see the latest changes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Episode Confirmation Email Template
          </CardTitle>
          <CardDescription>
            Customize the email sent to patients when their intake form is converted to an episode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Variable Helper */}
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-primary">Available Template Variables:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    '{{patient_name}}',
                    '{{clinician_name}}',
                    '{{episode_id}}',
                    '{{clinic_name}}',
                    '{{clinic_phone}}',
                    '{{clinic_email}}',
                    '{{appointment_date}}',
                    '{{appointment_time}}'
                  ].map((variable) => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs font-mono"
                      onClick={() => {
                        const textarea = document.getElementById('email-template') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const newValue = emailTemplate.substring(0, start) + variable + emailTemplate.substring(end);
                          setEmailTemplate(newValue);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + variable.length, start + variable.length);
                          }, 0);
                        }
                      }}
                    >
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Subject Line</Label>
            <Input
              id="email-subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="🎉 Welcome! Your Physical Therapy Episode Has Been Created"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Use emojis and variables to personalize the subject line
            </p>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Editor Side */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-template">HTML Email Template</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const defaultTemplate = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
  <div style="background-color: #a51c30; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to {{clinic_name}}!</h1>
  </div>
  
  <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear <strong>{{patient_name}}</strong>,</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Great news! Your intake form has been reviewed and approved. Your physical therapy episode has been successfully created.
    </p>
    
    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #a51c30;">
      <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">📋 Your Episode Details</h2>
      <p style="margin: 8px 0; color: #6b7280;"><strong>Assigned Clinician:</strong> {{clinician_name}}</p>
      <p style="margin: 8px 0; color: #6b7280;"><strong>Episode ID:</strong> {{episode_id}}</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      We'll contact you within 1-2 business days to schedule your first appointment.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280;">Questions? Call us at</p>
      <a href="tel:{{clinic_phone}}" style="color: #a51c30; font-size: 20px; font-weight: 600; text-decoration: none;">{{clinic_phone}}</a>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
      Best regards,<br/>
      <strong>The {{clinic_name}} Team</strong>
    </p>
  </div>
</div>`;
                    setEmailTemplate(defaultTemplate);
                    toast.success("Reset to default template");
                  }}
                >
                  Reset to Default
                </Button>
              </div>
              <Textarea
                id="email-template"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={20}
                className="font-mono text-sm resize-none"
                placeholder="Enter HTML email template..."
              />
              <p className="text-xs text-muted-foreground">
                Use HTML/CSS for styling. Template variables will be replaced with actual patient data.
              </p>
            </div>

            {/* Preview Side */}
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="border rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 text-sm font-semibold">
                  Preview with Sample Data
                </div>
                <div 
                  className="p-4 overflow-auto max-h-[500px]"
                  dangerouslySetInnerHTML={{ 
                    __html: emailTemplate
                      .replace(/\{\{patient_name\}\}/g, 'John Doe')
                      .replace(/\{\{clinician_name\}\}/g, 'Dr. Sarah Smith')
                      .replace(/\{\{episode_id\}\}/g, 'EP-2025-001')
                      .replace(/\{\{clinic_name\}\}/g, 'Acme Physical Therapy')
                      .replace(/\{\{clinic_phone\}\}/g, '(555) 123-4567')
                      .replace(/\{\{clinic_email\}\}/g, 'info@acmept.com')
                      .replace(/\{\{appointment_date\}\}/g, new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
                      .replace(/\{\{appointment_time\}\}/g, '10:00 AM')
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This preview shows how your email will look with sample patient data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Notification Template</CardTitle>
          <CardDescription>
            Customize the SMS text message sent to patients (160 character limit recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sms-template">SMS Message</Label>
            <Textarea
              id="sms-template"
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              rows={4}
              placeholder="Enter SMS template..."
            />
            <p className="text-xs text-muted-foreground">
              Current length: {smsTemplate.length} characters
              {smsTemplate.length > 160 && (
                <span className="text-amber-600 ml-2">
                  (Warning: Message may be split into multiple SMS)
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Failure Alerts */}
      <NotificationAlertSettings />

      {/* Rate Limit Configuration */}
      <RateLimitConfigPanel />

      {/* Save Button */}
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
              Save Templates
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
