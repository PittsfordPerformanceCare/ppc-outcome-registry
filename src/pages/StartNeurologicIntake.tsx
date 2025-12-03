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
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-2xl md:text-3xl text-[#0a1628] font-bold">Choose Who You're Here For</CardTitle>
              <CardDescription className="text-slate-600 text-base mt-2">Select the option that best describes your situation</CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Myself Card */}
                <button
                  onClick={() => setSelectedPersona("self")}
                  className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 bg-white hover:bg-gradient-to-b hover:from-teal-50/80 hover:to-white transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-teal-500/30">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a1628] mb-3">Myself</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">I'm seeking evaluation or care for my own symptoms</p>
                  <div className="mt-5 flex items-center gap-2 text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* My Child Card */}
                <button
                  onClick={() => setSelectedPersona("parent")}
                  className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 bg-white hover:bg-gradient-to-b hover:from-cyan-50/80 hover:to-white transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/30">
                    <Baby className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a1628] mb-3">My Child</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">I'm a parent seeking care for my child's symptoms</p>
                  <div className="mt-5 flex items-center gap-2 text-cyan-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Medical Professional Card */}
                <button
                  onClick={() => setSelectedPersona("professional")}
                  className="group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 bg-white hover:bg-gradient-to-b hover:from-blue-50/80 hover:to-white transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a1628] mb-3">Medical Professional</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">I'm referring a patient for neurologic care</p>
                  <div className="mt-5 flex items-center gap-2 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Make a Referral</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Self Form */}
        {selectedPersona === "self" && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-6 md:px-10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPersona(null)} 
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 -ml-2 mb-4 w-fit"
              >
                ← Back to selection
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#0a1628]">Quick Start Form</CardTitle>
                  <CardDescription className="text-base mt-1">Tell us about your symptoms so we can guide you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-10">
              <form onSubmit={handleSelfSubmit} className="space-y-6">
                {/* Contact Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-medium">Name (optional)</Label>
                      <Input 
                        id="name" 
                        placeholder="Your name"
                        value={selfForm.name}
                        onChange={(e) => setSelfForm({ ...selfForm, name: e.target.value })}
                        className="border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={selfForm.email}
                        onChange={(e) => setSelfForm({ ...selfForm, email: e.target.value })}
                        className="border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 h-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Phone (optional)</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={selfForm.phone}
                      onChange={(e) => setSelfForm({ ...selfForm, phone: e.target.value })}
                      className="border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 h-12 text-base md:max-w-xs"
                    />
                  </div>
                </div>

                {/* Symptoms Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">About Your Symptoms</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Symptom Profile</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                            selfForm.symptom_profile === option.value
                              ? "border-teal-500 bg-teal-50 text-teal-700 shadow-md shadow-teal-500/10"
                              : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                          }`}
                        >
                          <option.icon className={`h-6 w-6 ${selfForm.symptom_profile === option.value ? 'text-teal-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">How long have you had symptoms?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["< 1 week", "1–4 weeks", "1–3 months", "3+ months"].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setSelfForm({ ...selfForm, duration })}
                          className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                            selfForm.duration === duration
                              ? "border-teal-500 bg-teal-50 text-teal-700 shadow-md shadow-teal-500/10"
                              : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                          }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concern" className="text-slate-700 font-medium">Primary Concern</Label>
                    <Textarea 
                      id="concern"
                      placeholder="Briefly describe your main concern or symptoms..."
                      value={selfForm.primary_concern}
                      onChange={(e) => setSelfForm({ ...selfForm, primary_concern: e.target.value })}
                      className="border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 min-h-[120px] text-base resize-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white h-14 text-lg font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all"
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
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-6 md:px-10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPersona(null)} 
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 -ml-2 mb-4 w-fit"
              >
                ← Back to selection
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Baby className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#0a1628]">Pediatric Intake Form</CardTitle>
                  <CardDescription className="text-base mt-1">Help us understand your child's needs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-10">
              <form onSubmit={handleParentSubmit} className="space-y-6">
                {/* Parent Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Parent Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_name" className="text-slate-700 font-medium">Parent Name</Label>
                      <Input 
                        id="parent_name" 
                        placeholder="Your name"
                        value={parentForm.parent_name}
                        onChange={(e) => setParentForm({ ...parentForm, parent_name: e.target.value })}
                        className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_email" className="text-slate-700 font-medium">Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="parent_email" 
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={parentForm.email}
                        onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                        className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_phone" className="text-slate-700 font-medium">Phone (optional)</Label>
                    <Input 
                      id="parent_phone" 
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={parentForm.phone}
                      onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 text-base md:max-w-xs"
                    />
                  </div>
                </div>

                {/* Child Info Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Child Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="child_name" className="text-slate-700 font-medium">Child's Name (optional)</Label>
                      <Input 
                        id="child_name" 
                        placeholder="Child's name"
                        value={parentForm.child_name}
                        onChange={(e) => setParentForm({ ...parentForm, child_name: e.target.value })}
                        className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="child_age" className="text-slate-700 font-medium">Child's Age or Grade</Label>
                      <Input 
                        id="child_age" 
                        placeholder="e.g., 12 years old or 7th grade"
                        value={parentForm.child_age}
                        onChange={(e) => setParentForm({ ...parentForm, child_age: e.target.value })}
                        className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Symptoms Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">About Their Symptoms</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Where are symptoms most noticeable?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "school", label: "At school", icon: "📚" },
                        { value: "screens", label: "Screens/homework", icon: "💻" },
                        { value: "sports", label: "Sports", icon: "⚽" },
                        { value: "general", label: "General/day-to-day", icon: "🏠" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setParentForm({ ...parentForm, symptom_location: option.value })}
                          className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            parentForm.symptom_location === option.value
                              ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md shadow-cyan-500/10"
                              : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xl">{option.icon}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_concern" className="text-slate-700 font-medium">Primary Concern</Label>
                    <Textarea 
                      id="parent_concern"
                      placeholder="Describe your main concern about your child's symptoms..."
                      value={parentForm.primary_concern}
                      onChange={(e) => setParentForm({ ...parentForm, primary_concern: e.target.value })}
                      className="border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 min-h-[120px] text-base resize-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white h-14 text-lg font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
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
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <CardHeader className="pb-6 pt-8 px-6 md:px-10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPersona(null)} 
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 -ml-2 mb-4 w-fit"
              >
                ← Back to selection
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#0a1628]">Professional Referral Form</CardTitle>
                  <CardDescription className="text-base mt-1">Refer a patient to our neurologic care team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-10">
              <form onSubmit={handleProfessionalSubmit} className="space-y-6">
                {/* Referrer Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referrer_name" className="text-slate-700 font-medium">Your Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="referrer_name" 
                        placeholder="Your name"
                        required
                        value={professionalForm.referrer_name}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, referrer_name: e.target.value })}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-700 font-medium">Role</Label>
                      <Select 
                        value={professionalForm.role} 
                        onValueChange={(value) => setProfessionalForm({ ...professionalForm, role: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-blue-400 h-12 text-base">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
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
                      <Label htmlFor="organization" className="text-slate-700 font-medium">Organization</Label>
                      <Input 
                        id="organization" 
                        placeholder="Hospital, clinic, or school name"
                        value={professionalForm.organization}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, organization: e.target.value })}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro_email" className="text-slate-700 font-medium">Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="pro_email" 
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={professionalForm.email}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro_phone" className="text-slate-700 font-medium">Phone (optional)</Label>
                    <Input 
                      id="pro_phone" 
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={professionalForm.phone}
                      onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })}
                      className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base md:max-w-xs"
                    />
                  </div>
                </div>

                {/* Patient Info Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Patient Information (optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient_name" className="text-slate-700 font-medium">Patient Name</Label>
                      <Input 
                        id="patient_name" 
                        placeholder="Patient's name"
                        value={professionalForm.patient_name}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, patient_name: e.target.value })}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient_age" className="text-slate-700 font-medium">Patient Age</Label>
                      <Input 
                        id="patient_age" 
                        placeholder="e.g., 25"
                        value={professionalForm.patient_age}
                        onChange={(e) => setProfessionalForm({ ...professionalForm, patient_age: e.target.value })}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Referral Details Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Referral Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 font-medium">Notes / Primary Concern</Label>
                    <Textarea 
                      id="notes"
                      placeholder="Clinical notes, reason for referral, relevant history..."
                      value={professionalForm.notes}
                      onChange={(e) => setProfessionalForm({ ...professionalForm, notes: e.target.value })}
                      className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 min-h-[120px] text-base resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Urgency Level</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "routine", label: "Routine", description: "2-4 weeks", color: "blue" },
                        { value: "soon", label: "Soon", description: "1-2 weeks", color: "amber" },
                        { value: "priority", label: "Priority", description: "ASAP", color: "red" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProfessionalForm({ ...professionalForm, urgency: option.value })}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            professionalForm.urgency === option.value
                              ? option.color === "red" 
                                ? "border-red-500 bg-red-50 text-red-700 shadow-md shadow-red-500/10"
                                : option.color === "amber"
                                ? "border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-500/10"
                                : "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10"
                              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="font-semibold">{option.label}</div>
                          <div className={`text-xs mt-1 ${professionalForm.urgency === option.value ? '' : 'text-slate-500'}`}>{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
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
