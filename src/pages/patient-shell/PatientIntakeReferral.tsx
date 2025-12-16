import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Mail } from "lucide-react";

const PatientIntakeReferral = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadTime = useRef(Date.now());

  // Honeypot fields (should remain empty)
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [honeypotFax, setHoneypotFax] = useState("");

  const [formData, setFormData] = useState({
    providerName: "",
    practiceName: "",
    providerEmail: "",
    providerPhone: "",
    patientName: "",
    referralReason: "",
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
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consentConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm patient consent for this referral.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let storedTracking: Record<string, string | null> = {};
      try {
        const stored = sessionStorage.getItem('ppc_lead_tracking');
        if (stored) storedTracking = JSON.parse(stored);
      } catch {}

      // Submit via edge function with bot protection
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          name: formData.patientName,
          email: formData.providerEmail,
          phone: formData.providerPhone || null,
          preferred_contact_method: "email",
          primary_concern: formData.referralReason,
          who_is_this_for: "referral",
          funnel_stage: "provider_referral",
          checkpoint_status: "referral_lead_submitted",
          notes: `Referring Provider: ${formData.providerName}. Practice: ${formData.practiceName}. Provider phone: ${formData.providerPhone}`,
          origin_page: searchParams.get("origin_page") || storedTracking.origin_page || "/patient/intake/referral",
          origin_cta: searchParams.get("origin_cta") || storedTracking.origin_cta || null,
          utm_source: searchParams.get("utm_source") || storedTracking.utm_source || null,
          utm_medium: searchParams.get("utm_medium") || storedTracking.utm_medium || null,
          utm_campaign: searchParams.get("utm_campaign") || storedTracking.utm_campaign || null,
          utm_content: searchParams.get("utm_content") || storedTracking.utm_content || null,
          // Honeypot fields for bot detection
          website: honeypotWebsite,
          fax: honeypotFax,
          _form_loaded_at: formLoadTime.current,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to submit referral");
      }

      // Verify we got a real lead_id back
      if (!data?.lead_id) {
        console.error("No lead_id returned:", data);
        throw new Error("Submission failed - please try again");
      }

      console.log("Lead created successfully:", data.lead_id);

      toast({
        title: "Referral Received",
        description: "Thank you. We will be in touch shortly.",
      });

      navigate("/patient/thank-you");
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      toast({
        title: "Submission Error",
        description: error?.message || "There was an error submitting your referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Physician Referral | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Refer patients to Pittsford Performance Care for collaborative, neurologically informed evaluation and treatment. We work alongside primary care, neurology, orthopedics, and rehabilitation providers." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 lg:py-20 border-b border-border/40">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-sm font-medium text-primary/70 mb-3 tracking-wide uppercase">
              For Healthcare Providers
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Physician Referral
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Collaborative, Neurologically Informed Care for Your Patients
            </p>
          </div>
        </section>

        {/* Opening Context */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-base text-muted-foreground leading-relaxed">
              Pittsford Performance Care welcomes referrals from physicians and healthcare providers. 
              We work collaboratively within multidisciplinary care models to support patients with 
              neurologically informed evaluation and treatment. Our commitment is to continuity, 
              clear communication, and clinical respect for the relationships you maintain with your patients.
            </p>
          </div>
        </section>

        {/* Collaborative Approach */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              A Collaborative Approach to Patient Care
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              We frequently work alongside primary care physicians, orthopedic surgeons, neurologists, 
              pediatricians, sports medicine specialists, and rehabilitation providers. Our care is 
              designed to complement—not replace—existing medical relationships.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              We prioritize clarity in our documentation, appropriate clinical handoff, and transparent 
              communication throughout the patient's course of care.
            </p>
          </div>
        </section>

        {/* When a Referral May Be Helpful */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              When a Referral May Be Helpful
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              Referrals are often appropriate for patients presenting with:
            </p>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 flex-shrink-0" />
                <span>Persistent symptoms following concussion or mild traumatic brain injury</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 flex-shrink-0" />
                <span>Dizziness, balance concerns, or vestibular complaints</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 flex-shrink-0" />
                <span>Complex musculoskeletal presentations with neurologic features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 flex-shrink-0" />
                <span>Return-to-play or return-to-learn decision support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 flex-shrink-0" />
                <span>Patients who have plateaued despite standard care</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Clinical Framework */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              Our Clinical Framework
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              We use a neurologically informed, outcome-driven clinical model. Patient progress is 
              documented systematically and tracked over time using structured documentation and 
              an outcome registry.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Care decisions are guided by clinical clarity and patient response. This framework 
              supports meaningful communication with referring providers and ensures transparency 
              throughout the care process.
            </p>
          </div>
        </section>

        {/* How Care Is Structured & Communicated */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              How Care Is Structured & Communicated
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              To support clarity and continuity, Pittsford Performance Care organizes treatment into 
              defined care episodes. An episode represents a focused period of care aimed at identifying 
              the primary drivers of a patient's symptoms, delivering targeted intervention, and 
              determining readiness for next steps.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Episodes are not visit-limited and do not replace traditional documentation. All visit-level 
              SOAP notes and clinical narratives are maintained in our primary medical record. The episode 
              framework operates in parallel to support outcome tracking and clear communication with 
              referring providers.
            </p>
          </div>
        </section>

        {/* Communication & Continuity */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              Communication & Continuity
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              We respect the referring provider's role in the patient's ongoing care. When appropriate, 
              clinical updates and summaries can be shared to support coordinated, patient-centered care.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              All referrals are handled thoughtfully and professionally, with careful attention to 
              the clinical context you provide.
            </p>
          </div>
        </section>

        {/* How to Refer */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              How to Refer a Patient
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              You may submit a referral using the secure form below, or contact our office directly. 
              Our staff will assist with coordinating next steps.
            </p>

            {/* Contact Options */}
            <div className="flex flex-wrap gap-6 mb-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground/70">Phone</p>
                  <p className="text-foreground font-medium">(585) 203-1050</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground/70">Email</p>
                  <p className="text-foreground font-medium">info@pittsfordperformance.com</p>
                </div>
              </div>
            </div>

            {/* Referral Form */}
            <div className="border border-border/60 rounded-xl p-6 md:p-8 bg-card/50">
              <h3 className="text-lg font-medium text-foreground mb-6">Referral Form</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerName">Your Name *</Label>
                    <Input
                      id="providerName"
                      value={formData.providerName}
                      onChange={(e) => handleChange("providerName", e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="practiceName">Practice Name</Label>
                    <Input
                      id="practiceName"
                      value={formData.practiceName}
                      onChange={(e) => handleChange("practiceName", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerEmail">Your Email *</Label>
                    <Input
                      id="providerEmail"
                      type="email"
                      value={formData.providerEmail}
                      onChange={(e) => handleChange("providerEmail", e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="providerPhone">Your Phone</Label>
                    <Input
                      id="providerPhone"
                      type="tel"
                      value={formData.providerPhone}
                      onChange={(e) => handleChange("providerPhone", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name or Initials *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleChange("patientName", e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralReason">Reason for Referral *</Label>
                  <Textarea
                    id="referralReason"
                    value={formData.referralReason}
                    onChange={(e) => handleChange("referralReason", e.target.value)}
                    placeholder="Brief clinical context..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consentConfirmed}
                    onCheckedChange={(checked) => handleChange("consentConfirmed", checked as boolean)}
                  />
                  <Label htmlFor="consent" className="font-normal text-sm text-muted-foreground leading-relaxed">
                    I confirm that patient consent has been obtained for this referral.
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Referral"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* For Referring Physicians CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-5">
              For Referring Physicians
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Want to see how we communicate outcomes and care status?
            </p>
            <div className="space-y-2 mb-4">
              <a 
                href="/professional/sample-summary" 
                className="block text-primary hover:text-primary/80 transition-colors"
              >
                → View a sample physician care summary
              </a>
              <a 
                href="mailto:info@pittsfordperformance.com" 
                className="block text-primary hover:text-primary/80 transition-colors"
              >
                → Contact our clinical team
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              We're happy to align communication with your preferences and level of detail.
            </p>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-base text-muted-foreground leading-relaxed">
              We appreciate the trust you place in us when referring your patients. Our commitment 
              is to provide thoughtful, outcome-focused care that honors the relationships you have 
              built with those you serve. We look forward to partnering with you.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default PatientIntakeReferral;
