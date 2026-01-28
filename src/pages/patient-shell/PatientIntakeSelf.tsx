import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FormField, FormErrorSummary } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import {
  PRIMARY_CONCERN_OPTIONS,
  TIME_SENSITIVITY_OPTIONS,
  SELF_GOAL_OPTIONS,
  mapSystemCategory,
  computeRouteLabel,
} from "@/lib/conciergeRouting";

// Field labels for error messages
const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  primaryConcern: "Primary Concern",
  timeSensitivity: "Time Sensitivity",
  goalOfContact: "Goal of Contact",
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

const PatientIntakeSelf = () => {
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
    primaryConcern: "",
    timeSensitivity: "",
    goalOfContact: "",
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
      case "primaryConcern":
        return validateRequired(value as string, "Primary concern");
      case "timeSensitivity":
        return validateRequired(value as string, "Time sensitivity");
      case "goalOfContact":
        return validateRequired(value as string, "Goal of contact");
      case "consentToContact":
        if (!value) return "You must consent to be contacted";
        return undefined;
      default:
        return undefined;
    }
  }, []);

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
    errors.primaryConcern = validateField("primaryConcern", formData.primaryConcern);
    errors.timeSensitivity = validateField("timeSensitivity", formData.timeSensitivity);
    errors.goalOfContact = validateField("goalOfContact", formData.goalOfContact);
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
    setTouchedFields(new Set([
      "firstName", "lastName", "email", "primaryConcern", 
      "timeSensitivity", "goalOfContact", "consentToContact"
    ]));
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
      const originPage = searchParams.get("origin_page") || storedTracking.origin_page || "/patient/intake/self";
      const originCta = searchParams.get("origin_cta") || storedTracking.origin_cta || null;
      const pillarOrigin = searchParams.get("pillar_origin") || storedTracking.pillar_origin || null;

      // Compute routing
      const systemCategory = mapSystemCategory(formData.primaryConcern);
      const routeLabel = computeRouteLabel(formData.primaryConcern, formData.timeSensitivity);

      // Submit via edge function with bot protection
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          preferred_contact_method: formData.preferredContact,
          system_category: systemCategory,
          primary_concern: formData.primaryConcern,
          time_sensitivity: formData.timeSensitivity,
          goal_of_contact: formData.goalOfContact,
          route_label: routeLabel,
          who_is_this_for: "self",
          funnel_stage: "lead",
          checkpoint_status: "lead_created",
          notes: formData.preferredContact !== "email" ? `Preferred contact: ${formData.preferredContact}` : null,
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

      navigate(`/patient/thank-you?reason=${encodeURIComponent(formData.primaryConcern)}`);
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
          <CardTitle className="text-2xl">Adult Concierge Intake</CardTitle>
          <CardDescription>
            Tell us about yourself so we can connect you with the right care.
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

            {/* Honeypot fields - hidden from users */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={honeypotWebsite}
                onChange={(e) => setHoneypotWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
              <input
                type="text"
                name="fax"
                value={honeypotFax}
                onChange={(e) => setHoneypotFax(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Contact Information */}
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
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(value) => handleChange("phone", value)}
                  showCountryCode={false}
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="contact-text" />
                    <Label htmlFor="contact-text" className="font-normal">Text</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Routing Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">How Can We Help?</h3>

              <FormField
                label="Primary Concern"
                htmlFor="primaryConcern"
                required
                error={fieldErrors.primaryConcern}
                touched={touchedFields.has("primaryConcern")}
              >
                <Select
                  value={formData.primaryConcern}
                  onValueChange={(value) => {
                    handleChange("primaryConcern", value);
                    touchField("primaryConcern");
                  }}
                >
                  <SelectTrigger className={cn(
                    touchedFields.has("primaryConcern") && fieldErrors.primaryConcern && "border-destructive focus-visible:ring-destructive"
                  )}>
                    <SelectValue placeholder="Select your main concern" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_CONCERN_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Is this time-sensitive?"
                htmlFor="timeSensitivity"
                required
                error={fieldErrors.timeSensitivity}
                touched={touchedFields.has("timeSensitivity")}
              >
                <Select
                  value={formData.timeSensitivity}
                  onValueChange={(value) => {
                    handleChange("timeSensitivity", value);
                    touchField("timeSensitivity");
                  }}
                >
                  <SelectTrigger className={cn(
                    touchedFields.has("timeSensitivity") && fieldErrors.timeSensitivity && "border-destructive focus-visible:ring-destructive"
                  )}>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SENSITIVITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Goal of Contact"
                htmlFor="goalOfContact"
                required
                error={fieldErrors.goalOfContact}
                touched={touchedFields.has("goalOfContact")}
              >
                <Select
                  value={formData.goalOfContact}
                  onValueChange={(value) => {
                    handleChange("goalOfContact", value);
                    touchField("goalOfContact");
                  }}
                >
                  <SelectTrigger className={cn(
                    touchedFields.has("goalOfContact") && fieldErrors.goalOfContact && "border-destructive focus-visible:ring-destructive"
                  )}>
                    <SelectValue placeholder="What are you hoping to accomplish?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SELF_GOAL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
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

            {/* Microcopy */}
            <p className="text-sm text-muted-foreground text-center px-4">
              Clinical details and medical history will be collected securely after next steps are confirmed.
            </p>

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

export default PatientIntakeSelf;
