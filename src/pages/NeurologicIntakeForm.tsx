import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ArrowRight, ArrowLeft, CheckCircle2, User, Heart, FileText, Shield } from "lucide-react";

const TOTAL_STEPS = 4;

const NeurologicIntakeForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const intakeId = searchParams.get("intake");
  const leadId = searchParams.get("lead");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    
    // Step 2 - Medical History
    primaryConcern: "",
    symptomOnset: "",
    symptomDuration: "",
    priorTreatments: "",
    currentMedications: "",
    allergies: "",
    
    // Step 3 - Symptom Details
    headaches: false,
    dizziness: false,
    visionChanges: false,
    balanceIssues: false,
    memoryProblems: false,
    sleepDisturbance: false,
    fatigue: false,
    moodChanges: false,
    additionalSymptoms: "",
    
    // Step 4 - Consent
    consentTreatment: false,
    consentHipaa: false,
    signature: "",
  });

  // Update progress when step changes
  useEffect(() => {
    if (intakeId) {
      const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
      updateIntakeProgress(progress);
    }
  }, [currentStep, intakeId]);

  const updateIntakeProgress = async (progress: number) => {
    if (!intakeId) return;
    
    try {
      await supabase
        .from("intakes")
        .update({ 
          progress,
          form_data: formData,
        })
        .eq("id", intakeId);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.consentTreatment || !formData.consentHipaa || !formData.signature) {
      toast({ title: "Please complete all consent fields", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update intake as completed
      if (intakeId) {
        await supabase
          .from("intakes")
          .update({
            progress: 100,
            status: "completed",
            timestamp_completed: new Date().toISOString(),
            patient_name: formData.name,
            patient_email: formData.email,
            patient_phone: formData.phone,
            form_data: formData,
          })
          .eq("id", intakeId);
      }

      // Update lead checkpoint status and intake_completed_at timestamp
      if (leadId) {
        await supabase
          .from("leads")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            checkpoint_status: "intake_completed",
            intake_completed_at: new Date().toISOString(),
          })
          .eq("id", leadId);
      }

      // Send completion notification
      try {
        await supabase.functions.invoke("send-intake-completion", {
          body: {
            intakeId,
            leadId,
            patientName: formData.name,
            patientEmail: formData.email,
          },
        });
      } catch (e) {
        console.error("Notification error:", e);
      }

      setIsComplete(true);
      toast({ title: "Intake submitted successfully!" });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-[#0a1628]">
                Thank You!
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Your neurologic intake has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                <h3 className="font-semibold text-[#0a1628] mb-3">What happens next?</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                    <span>Our clinical team will review your intake within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                    <span>You'll receive an email confirmation with next steps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                    <span>We'll contact you to schedule your first appointment</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate("/")}
                className="w-full"
                variant="outline"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Neurologic Intake Form
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Complete Your Intake
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Tell us about yourself</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Medical History */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>Help us understand your health background</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryConcern">Primary Concern *</Label>
                  <Textarea
                    id="primaryConcern"
                    value={formData.primaryConcern}
                    onChange={(e) => handleInputChange("primaryConcern", e.target.value)}
                    placeholder="Describe your main symptoms or concerns..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="symptomOnset">When did symptoms start?</Label>
                    <Input
                      id="symptomOnset"
                      type="date"
                      value={formData.symptomOnset}
                      onChange={(e) => handleInputChange("symptomOnset", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symptomDuration">Duration</Label>
                    <Input
                      id="symptomDuration"
                      value={formData.symptomDuration}
                      onChange={(e) => handleInputChange("symptomDuration", e.target.value)}
                      placeholder="e.g., 2 weeks, 3 months"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priorTreatments">Prior Treatments</Label>
                  <Textarea
                    id="priorTreatments"
                    value={formData.priorTreatments}
                    onChange={(e) => handleInputChange("priorTreatments", e.target.value)}
                    placeholder="List any previous treatments for this condition..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                    placeholder="List all current medications and supplements..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="List any known allergies"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Symptom Checklist */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Symptom Checklist</CardTitle>
                    <CardDescription>Select all symptoms you are currently experiencing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "headaches", label: "Headaches" },
                    { key: "dizziness", label: "Dizziness" },
                    { key: "visionChanges", label: "Vision Changes" },
                    { key: "balanceIssues", label: "Balance Issues" },
                    { key: "memoryProblems", label: "Memory Problems" },
                    { key: "sleepDisturbance", label: "Sleep Disturbance" },
                    { key: "fatigue", label: "Fatigue" },
                    { key: "moodChanges", label: "Mood Changes" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                      <Checkbox
                        id={key}
                        checked={formData[key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => handleInputChange(key, checked as boolean)}
                      />
                      <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="additionalSymptoms">Additional Symptoms</Label>
                  <Textarea
                    id="additionalSymptoms"
                    value={formData.additionalSymptoms}
                    onChange={(e) => handleInputChange("additionalSymptoms", e.target.value)}
                    placeholder="Describe any other symptoms not listed above..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Consent */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Consent & Agreement</CardTitle>
                    <CardDescription>Please review and sign</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentTreatment"
                      checked={formData.consentTreatment}
                      onCheckedChange={(checked) => handleInputChange("consentTreatment", checked as boolean)}
                    />
                    <Label htmlFor="consentTreatment" className="text-sm leading-relaxed cursor-pointer">
                      I consent to evaluation and treatment. I understand that I am seeking neurologic care and authorize the clinical team to provide evaluation, testing, and treatment as deemed appropriate.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentHipaa"
                      checked={formData.consentHipaa}
                      onCheckedChange={(checked) => handleInputChange("consentHipaa", checked as boolean)}
                    />
                    <Label htmlFor="consentHipaa" className="text-sm leading-relaxed cursor-pointer">
                      I acknowledge that I have reviewed the HIPAA Privacy Notice and understand how my health information may be used and disclosed.
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signature">Electronic Signature *</Label>
                  <Input
                    id="signature"
                    value={formData.signature}
                    onChange={(e) => handleInputChange("signature", e.target.value)}
                    placeholder="Type your full legal name"
                  />
                  <p className="text-xs text-slate-500">By typing your name, you agree this constitutes your electronic signature.</p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 flex justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Intake"}
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NeurologicIntakeForm;