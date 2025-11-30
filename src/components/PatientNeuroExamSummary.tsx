import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Printer, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ClinicHeader } from "@/components/ClinicHeader";

interface NeuroExam {
  id: string;
  exam_date: string;
  exam_time?: string;
  exam_type: string;
  clinical_history?: string;
  overall_notes?: string;
  
  // Key findings
  vestibular_rombergs?: string;
  vestibular_vor?: string;
  neuro_finger_to_nose_left?: string;
  neuro_finger_to_nose_right?: string;
  visual_pursuits?: string;
  visual_convergence?: string;
  reflex_bicep_left?: string;
  reflex_patellar_left?: string;
}

interface PatientNeuroExamSummaryProps {
  exam: NeuroExam;
  patientName: string;
  patientEmail?: string;
  clinicianName?: string;
}

export function PatientNeuroExamSummary({ 
  exam, 
  patientName, 
  patientEmail,
  clinicianName 
}: PatientNeuroExamSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadClinicSettings = async () => {
      const { data } = await supabase
        .from("clinic_settings")
        .select("*")
        .single();
      setClinicSettings(data);
    };
    loadClinicSettings();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!patientEmail) {
      toast({
        title: "Email not available",
        description: "No email address on file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-neuro-exam-summary", {
        body: {
          examId: exam.id,
          patientEmail,
          patientName,
          clinicianName,
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Your neuro exam summary has been sent to your email",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to send email",
        description: "Please try again or contact your clinic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (value?: string) => {
    if (!value) return null;
    
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes("normal") || lowerValue.includes("within") || lowerValue.includes("intact")) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Normal</Badge>;
    }
    if (lowerValue.includes("impaired") || lowerValue.includes("abnormal") || lowerValue.includes("limited")) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Needs Attention</Badge>;
    }
    return <Badge variant="secondary">See Details</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Clinic Header - Visible only when printing */}
      <div className="hidden print:block">
        <ClinicHeader clinicSettings={clinicSettings} />
      </div>
      
      <Card className="print:shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Your Neurologic Examination Summary</CardTitle>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {patientEmail && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEmail}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Email Me"}
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Patient: {patientName}</p>
            <p>Exam Date: {format(new Date(exam.exam_date), "PPP")} {exam.exam_time && `at ${exam.exam_time}`}</p>
            {clinicianName && <p>Clinician: {clinicianName}</p>}
            <Badge variant="outline" className="mt-2">
              {exam.exam_type === "baseline" ? "Initial Assessment" : "Follow-up Assessment"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {exam.clinical_history && (
            <div>
              <h3 className="font-semibold mb-2">Clinical History</h3>
              <p className="text-sm text-muted-foreground">{exam.clinical_history}</p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Key Findings</h3>
            <div className="space-y-4">
              {(exam.vestibular_rombergs || exam.vestibular_vor) && (
                <div className="bg-accent/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Balance & Vestibular System</h4>
                    {getStatusBadge(exam.vestibular_rombergs || exam.vestibular_vor)}
                  </div>
                  <div className="space-y-1 text-sm">
                    {exam.vestibular_rombergs && (
                      <p><span className="font-medium">Balance Test:</span> {exam.vestibular_rombergs}</p>
                    )}
                    {exam.vestibular_vor && (
                      <p><span className="font-medium">Eye-Head Coordination:</span> {exam.vestibular_vor}</p>
                    )}
                  </div>
                </div>
              )}

              {(exam.visual_pursuits || exam.visual_convergence) && (
                <div className="bg-accent/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Visual System</h4>
                    {getStatusBadge(exam.visual_pursuits || exam.visual_convergence)}
                  </div>
                  <div className="space-y-1 text-sm">
                    {exam.visual_pursuits && (
                      <p><span className="font-medium">Eye Tracking:</span> {exam.visual_pursuits}</p>
                    )}
                    {exam.visual_convergence && (
                      <p><span className="font-medium">Near Focus:</span> {exam.visual_convergence}</p>
                    )}
                  </div>
                </div>
              )}

              {(exam.neuro_finger_to_nose_left || exam.neuro_finger_to_nose_right) && (
                <div className="bg-accent/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Coordination</h4>
                    {getStatusBadge(exam.neuro_finger_to_nose_left || exam.neuro_finger_to_nose_right)}
                  </div>
                  <div className="space-y-1 text-sm">
                    {exam.neuro_finger_to_nose_left && (
                      <p><span className="font-medium">Left Side:</span> {exam.neuro_finger_to_nose_left}</p>
                    )}
                    {exam.neuro_finger_to_nose_right && (
                      <p><span className="font-medium">Right Side:</span> {exam.neuro_finger_to_nose_right}</p>
                    )}
                  </div>
                </div>
              )}

              {(exam.reflex_bicep_left || exam.reflex_patellar_left) && (
                <div className="bg-accent/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Reflexes</h4>
                    {getStatusBadge(exam.reflex_bicep_left || exam.reflex_patellar_left)}
                  </div>
                  <div className="space-y-1 text-sm">
                    {exam.reflex_bicep_left && (
                      <p><span className="font-medium">Upper Body:</span> {exam.reflex_bicep_left}</p>
                    )}
                    {exam.reflex_patellar_left && (
                      <p><span className="font-medium">Lower Body:</span> {exam.reflex_patellar_left}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {exam.overall_notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Summary & Recommendations</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{exam.overall_notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="bg-primary/5 p-4 rounded-lg print:bg-transparent print:border print:border-primary">
            <h4 className="font-semibold mb-2">What This Means For You</h4>
            <p className="text-sm text-muted-foreground">
              This examination helps us understand how your nervous system is functioning. 
              The results guide your treatment plan and help us track your progress. 
              Your clinician will discuss any findings that need attention and create a 
              personalized care plan for you.
            </p>
          </div>

          <div className="text-xs text-muted-foreground text-center print:block">
            <p>This is a summary of your neurologic examination.</p>
            <p>For questions about your results, please contact your clinician.</p>
            <p className="mt-2">Exam ID: {exam.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
