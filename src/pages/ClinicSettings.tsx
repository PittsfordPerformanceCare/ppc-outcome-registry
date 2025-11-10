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
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ClinicSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [smsTemplate, setSmsTemplate] = useState("");

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
          .select("email_subject, email_template, sms_template")
          .single();
        
        if (error) throw error;
        
        if (settings) {
          setEmailSubject(settings.email_subject || "");
          setEmailTemplate(settings.email_template || "");
          setSmsTemplate(settings.sms_template || "");
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
          <strong>Available placeholders:</strong> {`{{patient_name}}, {{clinician_name}}, {{episode_id}}, {{clinic_name}}, {{clinic_phone}}, {{clinic_email}}`}
        </AlertDescription>
      </Alert>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notification Template</CardTitle>
          <CardDescription>
            Customize the email sent to patients when their episode is created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Subject</Label>
            <Input
              id="email-subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Your Physical Therapy Episode Has Been Created"
            />
            <p className="text-xs text-muted-foreground">
              You can use {`{{patient_name}}`} and {`{{clinic_name}}`} in the subject
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-template">Email Body (HTML)</Label>
            <Textarea
              id="email-template"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter HTML email template..."
            />
            <p className="text-xs text-muted-foreground">
              Use HTML formatting for rich emails. Placeholders will be automatically replaced.
            </p>
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
