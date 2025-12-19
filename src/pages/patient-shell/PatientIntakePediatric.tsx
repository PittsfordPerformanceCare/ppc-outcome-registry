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
import { Loader2, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PatientIntakePediatric = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadTime = useRef(Date.now());

  // Honeypot fields (should remain empty)
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [honeypotFax, setHoneypotFax] = useState("");

  const [formData, setFormData] = useState({
    // Parent info
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    preferredContact: "email",
    // Child info
    childFirstName: "",
    childLastName: "",
    childAge: "",
    childGrade: "",
    // Symptoms
    primaryConcern: "",
    symptomDuration: "",
    schoolSymptoms: "",
    symptomDescription: "",
    previousEvaluation: "",
    consentToContact: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parentFirstName || !formData.parentLastName || !formData.parentEmail || 
        !formData.childFirstName || !formData.primaryConcern) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      const originPage = searchParams.get("origin_page") || storedTracking.origin_page || "/patient/intake/pediatric";
      const originCta = searchParams.get("origin_cta") || storedTracking.origin_cta || null;
      const pillarOrigin = searchParams.get("pillar_origin") || storedTracking.pillar_origin || null;

      // Submit via edge function with bot protection
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          name: `${formData.childFirstName} ${formData.childLastName} (Parent: ${formData.parentFirstName} ${formData.parentLastName})`,
          email: formData.parentEmail,
          phone: formData.parentPhone || null,
          preferred_contact_method: formData.preferredContact,
          system_category: formData.primaryConcern,
          primary_concern: formData.primaryConcern,
          symptom_summary: formData.symptomDescription || null,
          who_is_this_for: "child",
          funnel_stage: "lead_intake",
          checkpoint_status: "lead_intake_completed",
          notes: `Child age: ${formData.childAge}. Grade: ${formData.childGrade}. Duration: ${formData.symptomDuration}. School symptoms: ${formData.schoolSymptoms}. Previous evaluation: ${formData.previousEvaluation}`,
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

      // Verify we got a real lead_id back
      if (!data?.lead_id) {
        console.error("No lead_id returned:", data);
        throw new Error("Submission failed - please try again");
      }

      console.log("Lead created successfully:", data.lead_id);

      toast({
        title: "Intake Submitted",
        description: "Thank you! We'll be in touch soon.",
      });

      navigate("/patient/thank-you");
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
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Pediatric Lead Intake</CardTitle>
          <CardDescription>
            Tell us about your child so we can prepare for their evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Parent/Guardian Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentFirstName">Your First Name *</Label>
                  <Input
                    id="parentFirstName"
                    value={formData.parentFirstName}
                    onChange={(e) => handleChange("parentFirstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentLastName">Your Last Name *</Label>
                  <Input
                    id="parentLastName"
                    value={formData.parentLastName}
                    onChange={(e) => handleChange("parentLastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email Address *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange("parentEmail", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Phone Number</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange("parentPhone", e.target.value)}
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

            {/* Child Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Child Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childFirstName">Child's First Name *</Label>
                  <Input
                    id="childFirstName"
                    value={formData.childFirstName}
                    onChange={(e) => handleChange("childFirstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLastName">Child's Last Name</Label>
                  <Input
                    id="childLastName"
                    value={formData.childLastName}
                    onChange={(e) => handleChange("childLastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childAge">Age</Label>
                  <Input
                    id="childAge"
                    value={formData.childAge}
                    onChange={(e) => handleChange("childAge", e.target.value)}
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childGrade">Grade</Label>
                  <Input
                    id="childGrade"
                    value={formData.childGrade}
                    onChange={(e) => handleChange("childGrade", e.target.value)}
                    placeholder="e.g., 7th"
                  />
                </div>
              </div>
            </div>

            {/* Symptom Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Symptoms & Concerns</h3>

              <div className="space-y-2">
                <Label htmlFor="primaryConcern">Primary Concern *</Label>
                <Select
                  value={formData.primaryConcern}
                  onValueChange={(value) => handleChange("primaryConcern", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary concern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acute-injury">Acute Injury (Recent)</SelectItem>
                    <SelectItem value="concussion">Concussion / Head Injury</SelectItem>
                    <SelectItem value="school-symptoms">School Performance Issues</SelectItem>
                    <SelectItem value="motor-issues">Motor / Coordination Issues</SelectItem>
                    <SelectItem value="headaches">Headaches</SelectItem>
                    <SelectItem value="balance">Balance / Dizziness</SelectItem>
                    <SelectItem value="fatigue">Fatigue / Energy Issues</SelectItem>
                    <SelectItem value="sports-injury">Sports-Related Symptoms</SelectItem>
                    <SelectItem value="chronic-injury">Unresolved Chronic Injury</SelectItem>
                    <SelectItem value="growth-pain">Growth Related Pain Syndrome</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptomDuration">How long have symptoms been present?</Label>
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
                    <SelectItem value="over-6-months">Over 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Are symptoms affecting school performance?</Label>
                <RadioGroup
                  value={formData.schoolSymptoms}
                  onValueChange={(value) => handleChange("schoolSymptoms", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="school-yes" />
                    <Label htmlFor="school-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="school-no" />
                    <Label htmlFor="school-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="school-unsure" />
                    <Label htmlFor="school-unsure" className="font-normal">Unsure</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptomDescription">Description of Symptoms</Label>
                <Textarea
                  id="symptomDescription"
                  value={formData.symptomDescription}
                  onChange={(e) => handleChange("symptomDescription", e.target.value)}
                  placeholder="Describe your child's symptoms and how they affect daily activities..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Has your child been previously evaluated for this?</Label>
                <RadioGroup
                  value={formData.previousEvaluation}
                  onValueChange={(value) => handleChange("previousEvaluation", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="eval-yes" />
                    <Label htmlFor="eval-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="eval-no" />
                    <Label htmlFor="eval-no" className="font-normal">No</Label>
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
                  I consent to being contacted by Pittsford Performance Care regarding my child's intake submission. 
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

export default PatientIntakePediatric;
