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
import { CheckCircle } from "lucide-react";

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
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-16 lg:px-8">
            <div className="max-w-md mx-auto text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-4">
                Request Submitted
              </h1>
              <p className="text-slate-600 mb-8">
                Thank you for your interest. We will review your verification request and respond within 2 business days.
              </p>
              <Link
                to="/resources/professional-outcomes"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
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

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-slate-200">
          <div className="container mx-auto px-4 py-6 lg:px-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/site/home" className="text-slate-500 hover:text-slate-700">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/resources/professional-outcomes" className="text-slate-500 hover:text-slate-700">
                      Professional Outcomes
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900">Request Verification</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                Request Professional Verification
              </h1>
              <p className="mt-2 text-slate-500 text-sm">
                Access aggregate clinical outcomes as a verified healthcare professional
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
          <div className="max-w-lg mx-auto">
            <div className="border border-slate-200 rounded-lg p-6 lg:p-8">
              <p className="text-slate-700 text-sm mb-6">
                Professional verification provides access to condition specific aggregate outcomes from the PPC Outcome Registry. Complete this form to request access.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentials">Credentials *</Label>
                  <Input
                    id="credentials"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder="MD, DO, PT, DC, ATC, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Professional Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane.smith@hospital.org"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization / Practice</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Rochester General Hospital"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Optional: How do you plan to use this information?"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Verification Request
                </Button>
              </form>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Verification typically takes 1–2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalVerificationRequest;
