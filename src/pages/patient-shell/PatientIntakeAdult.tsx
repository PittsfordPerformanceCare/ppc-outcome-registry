import { useState, useRef } from "react";
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
import { Loader2, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PatientIntakeAdult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadTime = useRef(Date.now());

  // Honeypot fields (should remain empty)
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [honeypotFax, setHoneypotFax] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredContact: "email",
    primaryReason: "",
    otherReason: "",
    priorConcussionCare: "",
    symptomDuration: "",
    symptomDescription: "",
    previousTreatment: "",
    hasReferral: "",
    consentToContact: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.primaryReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.primaryReason === "other" && !formData.otherReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please specify your reason for visit.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consentToContact) {
      toast({
        title: "Consent Required",
        description: "Please consent to be contacted to proceed.",
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
      const originPage = searchParams.get("origin_page") || storedTracking.origin_page || "/patient/intake/adult";
      const originCta = searchParams.get("origin_cta") || storedTracking.origin_cta || null;
      const pillarOrigin = searchParams.get("pillar_origin") || storedTracking.pillar_origin || null;

      // Map primary reason to system category
      const reasonToCategory: Record<string, string> = {
        "acute": "msk",
        "concussion": "concussion",
        "dizziness": "balance",
        "headaches": "concussion",
        "neck": "msk",
        "chronic": "msk",
        "neurologic": "cognitive",
        "sports": "msk",
        "other": "other",
      };

      const primaryReasonDisplay = formData.primaryReason === "other" 
        ? `Other: ${formData.otherReason}` 
        : formData.primaryReason;

      // Submit via edge function with bot protection
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          preferred_contact_method: formData.preferredContact,
          system_category: reasonToCategory[formData.primaryReason] || "other",
          primary_concern: primaryReasonDisplay,
          symptom_summary: formData.symptomDescription || null,
          who_is_this_for: "self",
          funnel_stage: "lead_intake",
          checkpoint_status: "lead_intake_completed",
          notes: `Primary reason: ${primaryReasonDisplay}. ${formData.priorConcussionCare ? `Prior concussion care: ${formData.priorConcussionCare}. ` : ''}Duration: ${formData.symptomDuration}. Previous treatment: ${formData.previousTreatment}. Has referral: ${formData.hasReferral}`,
          origin_page: originPage,
          origin_cta: originCta,
          pillar_origin: pillarOrigin,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          // Honeypot fields for bot detection
          website: honeypotWebsite,
          fax: honeypotFax,
          _form_loaded_at: formLoadTime.current,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to submit intake");
      }

      // Verify we got a real lead_id back (not fake bot detection response)
      if (!data?.lead_id) {
        console.error("No lead_id returned:", data);
        throw new Error("Submission failed - please try again");
      }

      console.log("Lead created successfully:", data.lead_id);
      
      toast({
        title: "Intake Submitted",
        description: "Thank you! We'll be in touch soon.",
      });

      navigate(`/patient/thank-you?reason=${encodeURIComponent(formData.primaryReason)}`);
    } catch (error: any) {
      console.error("Error submitting intake:", error);
      toast({
        title: "Submission Error",
        description: error?.message || "There was an error submitting your intake. Please try again.",
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
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto mb-3">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Adult Lead Intake</CardTitle>
          <CardDescription>
            Tell us about yourself and your symptoms so we can prepare for your evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Your Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={formData.preferredContact}
                  onValueChange={(value) => handleChange("preferredContact", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact-email" />
                    <Label htmlFor="contact-email" className="font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="contact-phone" />
                    <Label htmlFor="contact-phone" className="font-normal">Phone</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Primary Reason for Visit */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Primary Reason for Visit</h3>

              <div className="space-y-2">
                <Label htmlFor="primaryReason">What best describes your main concern? *</Label>
                <p className="text-sm text-muted-foreground">(Select one)</p>
                <Select
                  value={formData.primaryReason}
                  onValueChange={(value) => {
                    handleChange("primaryReason", value);
                    // Clear prior care if not concussion
                    if (value !== "concussion") {
                      handleChange("priorConcussionCare", "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main concern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acute">Recent Injury / Acute Symptoms (Rapid Evaluation Needed)</SelectItem>
                    <SelectItem value="concussion">Concussion / Head Injury (recent or past)</SelectItem>
                    <SelectItem value="dizziness">Dizziness / Vertigo / Balance Issues</SelectItem>
                    <SelectItem value="headaches">Headaches / Migraines</SelectItem>
                    <SelectItem value="neck">Neck Pain / Whiplash</SelectItem>
                    <SelectItem value="chronic">Chronic Pain or Unresolved Injury</SelectItem>
                    <SelectItem value="neurologic">Neurologic Symptoms (brain fog, fatigue, coordination, vision issues)</SelectItem>
                    <SelectItem value="sports">Sports Performance / Return-to-Play Clearance</SelectItem>
                    <SelectItem value="other">Other (please specify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Other reason text field */}
              {formData.primaryReason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="otherReason">Please specify *</Label>
                  <Input
                    id="otherReason"
                    value={formData.otherReason}
                    onChange={(e) => handleChange("otherReason", e.target.value)}
                    placeholder="Describe your main concern..."
                  />
                </div>
              )}

              {/* Conditional Prior Care question for concussion patients */}
              {formData.primaryReason === "concussion" && (
                <div className="space-y-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="space-y-2">
                    <Label className="font-medium">Prior Care (for coordination purposes only)</Label>
                    <p className="text-sm text-muted-foreground">
                      Have you previously been evaluated by another provider for this concussion or head injury?
                    </p>
                    <p className="text-sm text-muted-foreground">(Select one)</p>
                  </div>
                  <Select
                    value={formData.priorConcussionCare}
                    onValueChange={(value) => handleChange("priorConcussionCare", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcp">Yes — Primary Care Provider (PCP)</SelectItem>
                      <SelectItem value="neurologist">Yes — Neurologist</SelectItem>
                      <SelectItem value="other-provider">Yes — Other provider</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="not-sure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic mt-2">
                    All concussion and head injury patients receive a comprehensive neurologic evaluation at Pittsford Performance Care. 
                    This question helps us understand prior care and coordinate appropriately.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="symptomDuration">How long have you had these symptoms?</Label>
                <Select
                  value={formData.symptomDuration}
                  onValueChange={(value) => handleChange("symptomDuration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-2-weeks">Less than 2 weeks</SelectItem>
                    <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-3-months">1-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="6-12-months">6-12 months</SelectItem>
                    <SelectItem value="over-1-year">Over 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptomDescription">Brief Description of Symptoms</Label>
                <Textarea
                  id="symptomDescription"
                  value={formData.symptomDescription}
                  onChange={(e) => handleChange("symptomDescription", e.target.value)}
                  placeholder="Describe your main symptoms and how they affect your daily life..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Have you been treated for this before?</Label>
                <RadioGroup
                  value={formData.previousTreatment}
                  onValueChange={(value) => handleChange("previousTreatment", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="treatment-yes" />
                    <Label htmlFor="treatment-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="treatment-no" />
                    <Label htmlFor="treatment-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Do you have a referral from another provider?</Label>
                <RadioGroup
                  value={formData.hasReferral}
                  onValueChange={(value) => handleChange("hasReferral", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="referral-yes" />
                    <Label htmlFor="referral-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="referral-no" />
                    <Label htmlFor="referral-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4 bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consentToContact}
                  onCheckedChange={(checked) => handleChange("consentToContact", checked as boolean)}
                />
                <Label htmlFor="consent" className="font-normal text-sm leading-relaxed">
                  I consent to being contacted by Pittsford Performance Care regarding my intake submission. 
                  I understand that my information will be kept confidential and used only for scheduling purposes.
                </Label>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Intake"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientIntakeAdult;
