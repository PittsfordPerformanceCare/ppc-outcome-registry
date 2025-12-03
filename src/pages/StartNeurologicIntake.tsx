import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUTMParams } from "@/hooks/useUTMParams";
import { supabase } from "@/integrations/supabase/client";
import { User, Baby, Stethoscope, ArrowRight, CheckCircle2, Calendar, FileText, MessageSquare, Brain, Eye, Activity, Zap, HelpCircle } from "lucide-react";

type Persona = "self" | "parent" | "professional" | null;

const StartNeurologicIntake = () => {
  const [searchParams] = useSearchParams();
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Capture UTM params for attribution tracking
  const utm = useUTMParams();
  
  // Capture source from URL for attribution (e.g., ?source=concussion-pillar)
  // Falls back to utm_source if present, otherwise "direct"
  const source = searchParams.get("source") || utm.utm_source || "direct";

  // Self form state
  const [selfForm, setSelfForm] = useState({
    name: "",
    email: "",
    phone: "",
    symptom_profile: "",
    duration: "",
    primary_concern: "",
  });

  // Parent form state
  const [parentForm, setParentForm] = useState({
    parent_name: "",
    email: "",
    phone: "",
    child_name: "",
    child_age: "",
    symptom_location: "",
    primary_concern: "",
  });

  // Professional form state
  const [professionalForm, setProfessionalForm] = useState({
    referrer_name: "",
    role: "",
    organization: "",
    email: "",
    phone: "",
    patient_name: "",
    patient_age: "",
    notes: "",
    urgency: "routine",
  });

  const handleSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfForm.email) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("neurologic_intake_leads")
        .insert({
          persona: "self",
          name: selfForm.name || null,
          email: selfForm.email,
          phone: selfForm.phone || null,
          symptom_profile: selfForm.symptom_profile || null,
          duration: selfForm.duration || null,
          primary_concern: selfForm.primary_concern || null,
          source,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
        })
        .select();
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({ title: "Form submitted successfully!" });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentForm.email) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("neurologic_intake_leads")
        .insert({
          persona: "parent",
          parent_name: parentForm.parent_name || null,
          email: parentForm.email,
          phone: parentForm.phone || null,
          child_name: parentForm.child_name || null,
          child_age: parentForm.child_age || null,
          symptom_location: parentForm.symptom_location || null,
          primary_concern: parentForm.primary_concern || null,
          source,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
        });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({ title: "Form submitted successfully!" });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalForm.email || !professionalForm.referrer_name) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("neurologic_intake_leads")
        .insert({
          persona: "professional",
          referrer_name: professionalForm.referrer_name,
          role: professionalForm.role || null,
          organization: professionalForm.organization || null,
          email: professionalForm.email,
          phone: professionalForm.phone || null,
          patient_name: professionalForm.patient_name || null,
          patient_age: professionalForm.patient_age || null,
          notes: professionalForm.notes || null,
          urgency: professionalForm.urgency || "routine",
          source,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
        });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({ title: "Referral submitted successfully!" });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({ title: "Submission failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedPersona(null);
    setIsSubmitted(false);
    setSelfForm({ name: "", email: "", phone: "", symptom_profile: "", duration: "", primary_concern: "" });
    setParentForm({ parent_name: "", email: "", phone: "", child_name: "", child_age: "", symptom_location: "", primary_concern: "" });
    setProfessionalForm({ referrer_name: "", role: "", organization: "", email: "", phone: "", patient_name: "", patient_age: "", notes: "", urgency: "routine" });
  };

  // Success/Next Steps View
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-[#0a1628]">
                {selectedPersona === "professional" ? "Thank You for Your Referral" : "Thank You!"}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {selectedPersona === "professional" 
                  ? "Our team will contact the patient (or parent/guardian) promptly."
                  : "We've received your information and will be in touch soon."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                <h3 className="text-lg font-semibold text-[#0a1628] mb-4">Recommended Next Steps</h3>
                <div className="grid gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 px-5 bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-300 transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-3 text-teal-600" />
                    <div className="text-left">
                      <div className="font-medium text-[#0a1628]">Schedule Neurologic Evaluation</div>
                      <div className="text-sm text-slate-500">Book your appointment online or call us</div>
                    </div>
                  </Button>
                  
                  {selectedPersona !== "professional" && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-4 px-5 bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-300 transition-all"
                    >
                      <FileText className="h-5 w-5 mr-3 text-teal-600" />
                      <div className="text-left">
                        <div className="font-medium text-[#0a1628]">Complete Full Intake</div>
                        <div className="text-sm text-slate-500">Recommended for faster service</div>
                      </div>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 px-5 bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-300 transition-all"
                  >
                    <MessageSquare className="h-5 w-5 mr-3 text-teal-600" />
                    <div className="text-left">
                      <div className="font-medium text-[#0a1628]">Get Triage Guidance</div>
                      <div className="text-sm text-slate-500">Learn about your symptoms</div>
                    </div>
                  </Button>

                  {selectedPersona === "parent" && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-4 px-5 bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-300 transition-all"
                    >
                      <FileText className="h-5 w-5 mr-3 text-teal-600" />
                      <div className="text-left">
                        <div className="font-medium text-[#0a1628]">Download School Accommodation Guide</div>
                        <div className="text-sm text-slate-500">PDF resource for educators</div>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={resetForm}
                  className="text-slate-600 hover:text-[#0a1628]"
                >
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Neurologic Recovery Program
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Start Your Neurologic Intake
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Begin your path to recovery with our specialized concussion and neurologic care team. Choose who you're here for to get personalized guidance.
          </p>
        </div>

        {/* Persona Selection */}
        {!selectedPersona && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl text-[#0a1628]">Choose Who You're Here For</CardTitle>
              <CardDescription className="text-slate-600">Select the option that best describes your situation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedPersona("self")}
                  className="group p-6 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a1628] mb-2">Myself</h3>
                  <p className="text-sm text-slate-600">I'm seeking evaluation or care for my own symptoms</p>
                  <ArrowRight className="h-5 w-5 text-teal-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => setSelectedPersona("parent")}
                  className="group p-6 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Baby className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a1628] mb-2">My Child</h3>
                  <p className="text-sm text-slate-600">I'm a parent seeking care for my child's symptoms</p>
                  <ArrowRight className="h-5 w-5 text-cyan-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => setSelectedPersona("professional")}
                  className="group p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a1628] mb-2">Medical Professional</h3>
                  <p className="text-sm text-slate-600">I'm referring a patient for neurologic care</p>
                  <ArrowRight className="h-5 w-5 text-blue-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Self Form */}
        {selectedPersona === "self" && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)} className="text-slate-500">
                  ← Back
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[#0a1628]">Quick Start Form</CardTitle>
                  <CardDescription>Tell us about your symptoms so we can guide you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSelfSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name"
                      value={selfForm.name}
                      onChange={(e) => setSelfForm({ ...selfForm, name: e.target.value })}
                      className="border-slate-200 focus:border-teal-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={selfForm.email}
                      onChange={(e) => setSelfForm({ ...selfForm, email: e.target.value })}
                      className="border-slate-200 focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={selfForm.phone}
                    onChange={(e) => setSelfForm({ ...selfForm, phone: e.target.value })}
                    className="border-slate-200 focus:border-teal-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Symptom Profile</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { value: "visual", label: "Visual", icon: Eye },
                      { value: "dizziness", label: "Dizziness/Balance", icon: Activity },
                      { value: "fatigue", label: "Fatigue/Autonomic", icon: Zap },
                      { value: "cognitive", label: "Brain Fog/Cognitive", icon: Brain },
                      { value: "mixed", label: "Mixed / Not Sure", icon: HelpCircle },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelfForm({ ...selfForm, symptom_profile: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-left flex items-center gap-2 ${
                          selfForm.symptom_profile === option.value
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 hover:border-teal-300"
                        }`}
                      >
                        <option.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["< 1 week", "1–4 weeks", "1–3 months", "3+ months"].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSelfForm({ ...selfForm, duration })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selfForm.duration === duration
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 hover:border-teal-300"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concern">Primary Concern</Label>
                  <Textarea 
                    id="concern"
                    placeholder="Briefly describe your main concern or symptoms..."
                    value={selfForm.primary_concern}
                    onChange={(e) => setSelfForm({ ...selfForm, primary_concern: e.target.value })}
                    className="border-slate-200 focus:border-teal-400 min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  onClick={() => console.log("=== SUBMIT BUTTON CLICKED ===")}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-6 text-lg font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit & Get Recommendations"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Parent Form */}
        {selectedPersona === "parent" && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)} className="text-slate-500">
                  ← Back
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Baby className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[#0a1628]">Pediatric Intake Form</CardTitle>
                  <CardDescription>Help us understand your child's needs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleParentSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_name">Parent Name</Label>
                    <Input 
                      id="parent_name" 
                      placeholder="Your name"
                      value={parentForm.parent_name}
                      onChange={(e) => setParentForm({ ...parentForm, parent_name: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="parent_email" 
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={parentForm.email}
                      onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_phone">Phone (optional)</Label>
                    <Input 
                      id="parent_phone" 
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={parentForm.phone}
                      onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child_name">Child's Name (optional)</Label>
                    <Input 
                      id="child_name" 
                      placeholder="Child's name"
                      value={parentForm.child_name}
                      onChange={(e) => setParentForm({ ...parentForm, child_name: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child_age">Child's Age or Grade</Label>
                  <Input 
                    id="child_age" 
                    placeholder="e.g., 12 years old or 7th grade"
                    value={parentForm.child_age}
                    onChange={(e) => setParentForm({ ...parentForm, child_age: e.target.value })}
                    className="border-slate-200 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Where are symptoms most noticeable?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "school", label: "At school" },
                      { value: "screens", label: "Screens/homework" },
                      { value: "sports", label: "Sports" },
                      { value: "general", label: "General/day-to-day" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setParentForm({ ...parentForm, symptom_location: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          parentForm.symptom_location === option.value
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                            : "border-slate-200 hover:border-cyan-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_concern">Primary Concern</Label>
                  <Textarea 
                    id="parent_concern"
                    placeholder="Describe your main concern about your child's symptoms..."
                    value={parentForm.primary_concern}
                    onChange={(e) => setParentForm({ ...parentForm, primary_concern: e.target.value })}
                    className="border-slate-200 focus:border-cyan-400 min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-6 text-lg font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit & Get Recommendations"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Professional Referral Form */}
        {selectedPersona === "professional" && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPersona(null)} className="text-slate-500">
                  ← Back
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[#0a1628]">Professional Referral Form</CardTitle>
                  <CardDescription>Refer a patient to our neurologic care team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfessionalSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referrer_name">Your Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="referrer_name" 
                      placeholder="Your name"
                      required
                      value={professionalForm.referrer_name}
                      onChange={(e) => setProfessionalForm({ ...professionalForm, referrer_name: e.target.value })}
                      className="border-slate-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={professionalForm.role} 
                      onValueChange={(value) => setProfessionalForm({ ...professionalForm, role: value })}
                    >
                      <SelectTrigger className="border-slate-200 focus:border-blue-400">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md">MD</SelectItem>
                        <SelectItem value="do">DO</SelectItem>
                        <SelectItem value="np">NP</SelectItem>
                        <SelectItem value="pa">PA</SelectItem>
                        <SelectItem value="pt">PT</SelectItem>
                        <SelectItem value="atc">ATC</SelectItem>
                        <SelectItem value="school_nurse">School Nurse</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input 
                      id="organization" 
                      placeholder="Hospital, clinic, or school name"
                      value={professionalForm.organization}
                      onChange={(e) => setProfessionalForm({ ...professionalForm, organization: e.target.value })}
                      className="border-slate-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro_email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="pro_email" 
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={professionalForm.email}
                      onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })}
                      className="border-slate-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pro_phone">Phone (optional)</Label>
                  <Input 
                    id="pro_phone" 
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={professionalForm.phone}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })}
                    className="border-slate-200 focus:border-blue-400"
                  />
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Patient Information (optional)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient_name">Patient Name</Label>
                      <Input 
                        id="patient_name" 
                        placeholder="Patient's name"
                        value={professionalForm.patient_name}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, patient_name: e.target.value })}
                        className="border-slate-200 focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient_age">Patient Age</Label>
                      <Input 
                        id="patient_age" 
                        placeholder="e.g., 25"
                        value={professionalForm.patient_age}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, patient_age: e.target.value })}
                        className="border-slate-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Primary Concern</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Clinical notes, reason for referral, relevant history..."
                    value={professionalForm.notes}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, notes: e.target.value })}
                    className="border-slate-200 focus:border-blue-400 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "routine", label: "Routine" },
                      { value: "soon", label: "Soon" },
                      { value: "priority", label: "Priority" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setProfessionalForm({ ...professionalForm, urgency: option.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          professionalForm.urgency === option.value
                            ? option.value === "priority" 
                              ? "border-red-500 bg-red-50 text-red-700"
                              : option.value === "soon"
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit Referral"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Questions? Contact us at (555) 123-4567</p>
          <p className="mt-1">© {new Date().getFullYear()} PPC Neurologic Recovery Program</p>
        </div>
      </div>
    </div>
  );
};

export default StartNeurologicIntake;
