import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Shield, FileCheck, Users, Sparkles } from "lucide-react";

const ProfessionalVerificationRequest = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    credentials: "",
    email: "",
    organization: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.credentials) {
      toast.error("Please complete required fields");
      return;
    }

    // For now, just show confirmation - in production this would create a verification request
    setSubmitted(true);
    toast.success("Verification request submitted");
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Verification Request Submitted | Pittsford Performance Care</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 py-20 lg:py-28">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Request Submitted
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                Thank you for your interest. We will review your verification request and respond within 2 business days.
              </p>
              <Link
                to="/resources/professional-outcomes"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-foreground bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
              >
                Return to Professional Outcomes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Request Professional Verification | Pittsford Performance Care</title>
        <meta 
          name="description" 
          content="Request access to PPC aggregate clinical outcomes as a verified healthcare professional." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
          
          <div className="container mx-auto px-4 py-12 lg:py-16 relative">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/site/home" className="text-muted-foreground hover:text-foreground transition-colors">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/resources/professional-outcomes" className="text-muted-foreground hover:text-foreground transition-colors">
                      Professional Outcomes
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Request Verification</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Professional Access
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Request Professional Verification
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Access condition-specific aggregate outcomes from the PPC Outcome Registry 
                as a verified healthcare professional.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 lg:py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Verified Access</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Secure access reserved for credentialed healthcare professionals ensuring data integrity and appropriate use.
                  </p>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Aggregate Outcomes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Review condition-specific recovery trajectories, improvement rates, and clinical benchmarks from real patient data.
                  </p>
                </div>

                <div className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Care Coordination</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Monitor referred patient progress with case-level insights when your patient is receiving care at PPC.
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 lg:p-10 shadow-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-2">Submit Your Request</h2>
                    <p className="text-sm text-muted-foreground">
                      Complete this form and we'll review your credentials within 1–2 business days.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. Jane Smith"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credentials" className="text-sm font-medium text-foreground">Credentials *</Label>
                      <Input
                        id="credentials"
                        value={formData.credentials}
                        onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                        placeholder="MD, DO, PT, DC, ATC, etc."
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Professional Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane.smith@hospital.org"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-sm font-medium text-foreground">Organization / Practice</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Rochester General Hospital"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-sm font-medium text-foreground">Reason for Request</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Optional: How do you plan to use this information?"
                        rows={3}
                        className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Submit Verification Request
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground mt-6 text-center">
                    By submitting, you confirm that you are a licensed healthcare professional 
                    and agree to use this data for clinical or educational purposes only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProfessionalVerificationRequest;
