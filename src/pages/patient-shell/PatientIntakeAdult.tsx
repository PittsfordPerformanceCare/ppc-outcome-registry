import { useState, useRef, useCallback } from "react";
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
import { FormField, FormErrorSummary } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

// Field labels for error messages
const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  primaryReason: "Primary Concern",
  otherReason: "Reason Details",
  consentToContact: "Consent",
};

// Validation rules
const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
  return undefined;
};

const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return undefined;
};

interface FieldErrors {
  [key: string]: string | undefined;
}

const PatientIntakeAdult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadTime = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showErrorSummary, setShowErrorSummary] = useState(false);

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

  // Touch a field (mark as interacted with)
  const touchField = useCallback((field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  // Validate a single field
  const validateField = useCallback((field: string, value: string | boolean): string | undefined => {
    switch (field) {
      case "firstName":
        return validateRequired(value as string, "First name");
      case "lastName":
        return validateRequired(value as string, "Last name");
      case "email":
        return validateEmail(value as string);
      case "primaryReason":
        return validateRequired(value as string, "Primary concern");
      case "otherReason":
        if (formData.primaryReason === "other") {
          return validateRequired(value as string, "Reason details");
        }
        return undefined;
      case "consentToContact":
        if (!value) return "You must consent to be contacted";
        return undefined;
      default:
        return undefined;
    }
  }, [formData.primaryReason]);

  // Handle field blur - validate on blur
  const handleBlur = useCallback((field: string, value: string | boolean) => {
    touchField(field);
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, [touchField, validateField]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If field was already touched, revalidate immediately
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Validate all fields and return errors
  const validateAllFields = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    
    errors.firstName = validateField("firstName", formData.firstName);
    errors.lastName = validateField("lastName", formData.lastName);
    errors.email = validateField("email", formData.email);
    errors.primaryReason = validateField("primaryReason", formData.primaryReason);
    
    if (formData.primaryReason === "other") {
      errors.otherReason = validateField("otherReason", formData.otherReason);
    }
    
    errors.consentToContact = validateField("consentToContact", formData.consentToContact);
    
    // Filter out undefined values
    return Object.fromEntries(
      Object.entries(errors).filter(([, v]) => v !== undefined)
    );
  }, [formData, validateField]);

  // Get error summary for display
  const getErrorSummary = useCallback(() => {
    return Object.entries(fieldErrors)
      .filter(([, error]) => error !== undefined)
      .map(([field, message]) => ({
        field,
        message: message as string,
      }));
  }, [fieldErrors]);

  // Scroll to first error field
  const scrollToFirstError = useCallback((errors: FieldErrors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && formRef.current) {
      const element = formRef.current.querySelector(`[id="${firstErrorField}"]`) ||
                      formRef.current.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as HTMLElement).focus?.();
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validateAllFields();
    
    // Mark all required fields as touched
    setTouchedFields(new Set(["firstName", "lastName", "email", "primaryReason", "otherReason", "consentToContact"]));
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setShowErrorSummary(true);
      scrollToFirstError(errors);
      toast({
        title: "Please fix the errors",
        description: `There ${Object.keys(errors).length === 1 ? "is 1 error" : `are ${Object.keys(errors).length} errors`} that need your attention.`,
        variant: "destructive",
      });
      return;
    }
    
    setShowErrorSummary(false);

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
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Error Summary */}
            {showErrorSummary && (
              <FormErrorSummary 
                errors={getErrorSummary()} 
                fieldLabels={fieldLabels}
                onFieldClick={(field) => {
                  const element = formRef.current?.querySelector(`[id="${field}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    (element as HTMLElement).focus?.();
                  }
                }}
              />
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Your Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  htmlFor="firstName"
                  required
                  error={fieldErrors.firstName}
                  touched={touchedFields.has("firstName")}
                >
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                    className={cn(
                      touchedFields.has("firstName") && fieldErrors.firstName && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </FormField>
                <FormField
                  label="Last Name"
                  htmlFor="lastName"
                  required
                  error={fieldErrors.lastName}
                  touched={touchedFields.has("lastName")}
                >
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                    className={cn(
                      touchedFields.has("lastName") && fieldErrors.lastName && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </FormField>
              </div>

              <FormField
                label="Email Address"
                htmlFor="email"
                required
                error={fieldErrors.email}
                touched={touchedFields.has("email")}
              >
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  className={cn(
                    touchedFields.has("email") && fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </FormField>

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

              <FormField
                label="What best describes your main concern?"
                htmlFor="primaryReason"
                required
                error={fieldErrors.primaryReason}
                touched={touchedFields.has("primaryReason")}
                hint="(Select one)"
              >
                <Select
                  value={formData.primaryReason}
                  onValueChange={(value) => {
                    handleChange("primaryReason", value);
                    touchField("primaryReason");
                    // Clear prior care if not concussion
                    if (value !== "concussion") {
                      handleChange("priorConcussionCare", "");
                    }
                  }}
                >
                  <SelectTrigger className={cn(
                    touchedFields.has("primaryReason") && fieldErrors.primaryReason && "border-destructive focus-visible:ring-destructive"
                  )}>
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
              </FormField>

              {/* Other reason text field */}
              {formData.primaryReason === "other" && (
                <FormField
                  label="Please specify"
                  htmlFor="otherReason"
                  required
                  error={fieldErrors.otherReason}
                  touched={touchedFields.has("otherReason")}
                >
                  <Input
                    id="otherReason"
                    value={formData.otherReason}
                    onChange={(e) => handleChange("otherReason", e.target.value)}
                    onBlur={(e) => handleBlur("otherReason", e.target.value)}
                    placeholder="Describe your main concern..."
                    className={cn(
                      touchedFields.has("otherReason") && fieldErrors.otherReason && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </FormField>
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
            <div className={cn(
              "space-y-4 rounded-lg p-4",
              touchedFields.has("consentToContact") && fieldErrors.consentToContact 
                ? "bg-destructive/10 border border-destructive/20" 
                : "bg-muted/50"
            )}>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentToContact"
                  checked={formData.consentToContact}
                  onCheckedChange={(checked) => {
                    handleChange("consentToContact", checked as boolean);
                    touchField("consentToContact");
                  }}
                />
                <div className="space-y-1">
                  <Label htmlFor="consentToContact" className="font-normal text-sm leading-relaxed">
                    I consent to being contacted by Pittsford Performance Care regarding my intake submission. 
                    I understand that my information will be kept confidential and used only for scheduling purposes. *
                  </Label>
                  {touchedFields.has("consentToContact") && fieldErrors.consentToContact && (
                    <p className="text-sm text-destructive">{fieldErrors.consentToContact}</p>
                  )}
                </div>
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
