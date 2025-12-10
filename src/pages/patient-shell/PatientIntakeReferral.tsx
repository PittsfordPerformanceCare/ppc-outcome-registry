import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Stethoscope, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PatientIntakeReferral = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Provider info
    providerName: "",
    providerTitle: "",
    providerOrganization: "",
    providerEmail: "",
    providerPhone: "",
    providerType: "",
    // Patient info
    patientName: "",
    patientDOB: "",
    patientPhone: "",
    // Referral details
    referralReason: "",
    urgency: "",
    hasImaging: "",
    hasPriorEvaluation: "",
    additionalNotes: "",
    consentConfirmed: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.providerName || !formData.providerEmail || !formData.patientName || !formData.referralReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consentConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you have patient consent for this referral.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get UTM parameters from URL or sessionStorage (from Concierge)
      let storedTracking: Record<string, string | null> = {};
      try {
        const stored = sessionStorage.getItem('ppc_lead_tracking');
        if (stored) storedTracking = JSON.parse(stored);
      } catch {}

      const utmSource = searchParams.get("utm_source") || storedTracking.utm_source || null;
      const utmMedium = searchParams.get("utm_medium") || storedTracking.utm_medium || null;
      const utmCampaign = searchParams.get("utm_campaign") || storedTracking.utm_campaign || null;
      const utmContent = searchParams.get("utm_content") || storedTracking.utm_content || null;
      const originPage = searchParams.get("origin_page") || storedTracking.origin_page || "/patient/intake/referral";
      const originCta = searchParams.get("origin_cta") || storedTracking.origin_cta || null;
      const pillarOrigin = searchParams.get("pillar_origin") || storedTracking.pillar_origin || null;

      const { error } = await supabase.from("leads").insert({
        name: formData.patientName,
        email: formData.providerEmail, // Using provider email for communication
        phone: formData.patientPhone || null,
        preferred_contact_method: "email",
        system_category: formData.referralReason,
        primary_concern: formData.referralReason,
        symptom_summary: formData.additionalNotes || null,
        who_is_this_for: "referral",
        funnel_stage: "provider_referral",
        checkpoint_status: "referral_lead_submitted",
        notes: `Referring Provider: ${formData.providerName} (${formData.providerTitle}) at ${formData.providerOrganization}. Provider type: ${formData.providerType}. Provider phone: ${formData.providerPhone}. Patient DOB: ${formData.patientDOB}. Urgency: ${formData.urgency}. Has imaging: ${formData.hasImaging}. Prior evaluation: ${formData.hasPriorEvaluation}`,
        origin_page: originPage,
        origin_cta: originCta,
        pillar_origin: pillarOrigin,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
      });

      if (error) throw error;

      toast({
        title: "Referral Submitted",
        description: "Thank you! We'll review this referral and be in touch soon.",
      });

      navigate("/patient/thank-you");
    } catch (error) {
      console.error("Error submitting referral:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link 
        to="/patient/concierge" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Concierge
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Provider Referral</CardTitle>
          <CardDescription>
            Refer a patient to Pittsford Performance Care for neurologic evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Referring Provider Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerName">Your Name *</Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => handleChange("providerName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerTitle">Title/Credentials</Label>
                  <Input
                    id="providerTitle"
                    value={formData.providerTitle}
                    onChange={(e) => handleChange("providerTitle", e.target.value)}
                    placeholder="e.g., MD, DPT, ATC"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerOrganization">Organization/Practice</Label>
                <Input
                  id="providerOrganization"
                  value={formData.providerOrganization}
                  onChange={(e) => handleChange("providerOrganization", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerType">Provider Type</Label>
                <Select
                  value={formData.providerType}
                  onValueChange={(value) => handleChange("providerType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physician">Physician (MD/DO)</SelectItem>
                    <SelectItem value="np-pa">Nurse Practitioner / PA</SelectItem>
                    <SelectItem value="physical-therapist">Physical Therapist</SelectItem>
                    <SelectItem value="athletic-trainer">Athletic Trainer</SelectItem>
                    <SelectItem value="chiropractor">Chiropractor</SelectItem>
                    <SelectItem value="school-nurse">School Nurse</SelectItem>
                    <SelectItem value="other">Other Healthcare Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerEmail">Email *</Label>
                  <Input
                    id="providerEmail"
                    type="email"
                    value={formData.providerEmail}
                    onChange={(e) => handleChange("providerEmail", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerPhone">Phone</Label>
                  <Input
                    id="providerPhone"
                    type="tel"
                    value={formData.providerPhone}
                    onChange={(e) => handleChange("providerPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Patient Information</h3>

              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleChange("patientName", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientDOB">Date of Birth</Label>
                  <Input
                    id="patientDOB"
                    type="date"
                    value={formData.patientDOB}
                    onChange={(e) => handleChange("patientDOB", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientPhone">Patient Phone</Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => handleChange("patientPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Referral Details</h3>

              <div className="space-y-2">
                <Label htmlFor="referralReason">Reason for Referral *</Label>
                <Select
                  value={formData.referralReason}
                  onValueChange={(value) => handleChange("referralReason", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concussion">Concussion / Post-Concussion Syndrome</SelectItem>
                    <SelectItem value="persistent-symptoms">Persistent Post-Concussion Symptoms</SelectItem>
                    <SelectItem value="return-to-play">Return to Play Clearance</SelectItem>
                    <SelectItem value="return-to-learn">Return to Learn Support</SelectItem>
                    <SelectItem value="vestibular">Vestibular/Balance Issues</SelectItem>
                    <SelectItem value="cognitive">Cognitive Concerns</SelectItem>
                    <SelectItem value="msk-neuro">MSK with Neurologic Component</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <RadioGroup
                  value={formData.urgency}
                  onValueChange={(value) => handleChange("urgency", value)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="routine" id="urgency-routine" />
                    <Label htmlFor="urgency-routine" className="font-normal">Routine</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="soon" id="urgency-soon" />
                    <Label htmlFor="urgency-soon" className="font-normal">Within 1-2 weeks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgency-urgent" />
                    <Label htmlFor="urgency-urgent" className="font-normal">Urgent</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Has imaging been performed?</Label>
                <RadioGroup
                  value={formData.hasImaging}
                  onValueChange={(value) => handleChange("hasImaging", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="imaging-yes" />
                    <Label htmlFor="imaging-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="imaging-no" />
                    <Label htmlFor="imaging-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Has patient had prior neurologic evaluation?</Label>
                <RadioGroup
                  value={formData.hasPriorEvaluation}
                  onValueChange={(value) => handleChange("hasPriorEvaluation", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="prior-yes" />
                    <Label htmlFor="prior-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="prior-no" />
                    <Label htmlFor="prior-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unknown" id="prior-unknown" />
                    <Label htmlFor="prior-unknown" className="font-normal">Unknown</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Clinical Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange("additionalNotes", e.target.value)}
                  placeholder="Relevant clinical history, exam findings, concerns..."
                  rows={4}
                />
              </div>
            </div>

            {/* Consent Confirmation */}
            <div className="space-y-4 bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consentConfirmed}
                  onCheckedChange={(checked) => handleChange("consentConfirmed", checked as boolean)}
                />
                <Label htmlFor="consent" className="font-normal text-sm leading-relaxed">
                  I confirm that I have obtained patient consent (or parent/guardian consent for minors) 
                  to share this information with Pittsford Performance Care for the purpose of this referral.
                </Label>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Referral...
                </>
              ) : (
                "Submit Referral"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientIntakeReferral;
