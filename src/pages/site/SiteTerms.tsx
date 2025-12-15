import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";

const SiteTerms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Pittsford Performance Care</title>
        <meta
          name="description"
          content="Terms of service for Pittsford Performance Care website and clinical outcome registry platform."
        />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/terms" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-muted-foreground">
                Last updated: December 15, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using the Pittsford Performance Care website and clinical outcome registry 
                    platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree 
                    to these terms, please do not use our Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Description of Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Pittsford Performance Care provides clinical care services specializing in neurologic 
                    rehabilitation and musculoskeletal treatment. Our website and platform provide:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                    <li>Information about our clinical services</li>
                    <li>Patient intake and registration forms</li>
                    <li>Clinical outcome tracking tools</li>
                    <li>Appointment scheduling functionality</li>
                    <li>Patient portal access</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Medical Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The information provided on this website is for general informational purposes only and 
                    is not intended as a substitute for professional medical advice, diagnosis, or treatment. 
                    Always seek the advice of your physician or other qualified health provider with any 
                    questions you may have regarding a medical condition.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Never disregard professional medical advice or delay in seeking it because of something 
                    you have read on this website. If you think you may have a medical emergency, call your 
                    doctor or 911 immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Certain features of our Service require you to create an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Promptly update your information if it changes</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptable Use</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree not to use the Service to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Impersonate any person or entity</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Attempt to gain unauthorized access to any systems</li>
                    <li>Transmit any viruses or malicious code</li>
                    <li>Collect information about other users without consent</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on this website, including text, graphics, logos, images, and software, 
                    is the property of Pittsford Performance Care or its content suppliers and is protected 
                    by copyright and other intellectual property laws. You may not reproduce, distribute, 
                    modify, or create derivative works without our express written permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your use of the Service is also governed by our Privacy Policy. Please review our 
                    Privacy Policy to understand our practices regarding your personal information.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, Pittsford Performance Care shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages arising out of 
                    or related to your use of the Service. Our total liability shall not exceed the amount 
                    you paid for the services giving rise to the claim.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to indemnify and hold harmless Pittsford Performance Care and its officers, 
                    directors, employees, and agents from any claims, damages, losses, or expenses arising 
                    from your use of the Service or violation of these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications to Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify, suspend, or discontinue the Service at any time without 
                    notice. We shall not be liable to you or any third party for any modification, suspension, 
                    or discontinuation of the Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the State 
                    of New York, without regard to its conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="mt-4 text-muted-foreground">
                    <p>Pittsford Performance Care</p>
                    <p>3800 Monroe Ave., Suite 22</p>
                    <p>Pittsford, NY 14534</p>
                    <p>Phone: (585) 203-1050</p>
                    <p>Email: info@pittsfordperformancecare.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default SiteTerms;
