import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

      const { error } = await supabase.from("leads").insert({
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
      });

      if (error) throw error;

      toast({
        title: "Referral Received",
        description: "Thank you. We will be in touch shortly.",
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
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Collaborative, Neurologically Informed Care for Your Patients
          </p>
        </div>
      </section>

      {/* Opening Context */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-base text-muted-foreground leading-relaxed">
            Pittsford Performance Care welcomes referrals from physicians and healthcare providers. 
            We work collaboratively within multidisciplinary care models to support patients with 
            neurologically informed evaluation and treatment. Our goal is to complement your care, 
            maintain continuity, and provide clear communication throughout the patient's journey.
          </p>
        </div>
      </section>

      {/* Collaborative Approach */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            A Collaborative Approach to Patient Care
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            We frequently work alongside primary care, orthopedics, neurology, pediatrics, sports medicine, 
            and rehabilitation providers. Care is designed to complement—not replace—existing medical relationships.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            We prioritize clarity, documentation, and appropriate handoff to ensure seamless coordination 
            between all members of a patient's care team.
          </p>
        </div>
      </section>

      {/* When a Referral May Be Helpful */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            When a Referral May Be Helpful
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Referrals are often appropriate for patients experiencing:
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
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Our Clinical Framework
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            We use a neurologically informed, outcome-driven clinical model. Progress is documented 
            and tracked systematically over time, with care decisions guided by clarity and patient response.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            This structured approach supports meaningful communication with referring providers and 
            ensures transparency throughout the care process.
          </p>
        </div>
      </section>

      {/* Communication & Continuity */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Communication & Continuity
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            We respect the referring provider's role in the patient's ongoing care. When appropriate, 
            updates and clinical summaries can be shared to support coordinated, patient-centered care.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            All referrals are handled thoughtfully and professionally, with attention to the clinical 
            context you provide.
          </p>
        </div>
      </section>

      {/* How to Refer */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            How to Refer a Patient
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            You may submit a referral using the form below, or contact us directly. 
            Our team will assist with next steps.
          </p>

          {/* Contact Options */}
          <div className="flex flex-wrap gap-6 mb-10">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground/70">Phone</p>
                <p className="text-foreground font-medium">(585) 203-1323</p>
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

      {/* Closing Statement */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-base text-muted-foreground leading-relaxed">
            We appreciate the opportunity to collaborate in your patient's care. 
            Our commitment is to provide thoughtful, outcome-focused support that 
            respects the relationships you've built with your patients.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PatientIntakeReferral;
