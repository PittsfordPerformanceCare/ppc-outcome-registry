import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";

const SitePrivacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Pittsford Performance Care</title>
        <meta
          name="description"
          content="Privacy policy for Pittsford Performance Care. Learn how we collect, use, and protect your personal and health information."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                Privacy Policy
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
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Pittsford Performance Care ("we," "our," or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                    when you visit our website or use our clinical services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                  <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may collect personal information that you voluntarily provide, including:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Name, email address, and phone number</li>
                    <li>Date of birth and address</li>
                    <li>Insurance information</li>
                    <li>Emergency contact information</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mb-2 mt-6">Protected Health Information (PHI)</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    As a healthcare provider, we collect health information necessary for your care, including:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Medical history and current symptoms</li>
                    <li>Treatment records and clinical notes</li>
                    <li>Outcome measurements and progress data</li>
                    <li>Diagnostic information</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide and improve clinical care and treatment</li>
                    <li>Communicate with you about appointments and care</li>
                    <li>Process insurance claims and billing</li>
                    <li>Send appointment reminders and follow-up communications</li>
                    <li>Conduct quality improvement and outcomes research</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">HIPAA Compliance</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We are committed to complying with the Health Insurance Portability and Accountability Act (HIPAA). 
                    Your Protected Health Information (PHI) is handled in accordance with HIPAA regulations. 
                    We maintain administrative, technical, and physical safeguards to protect your health information.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Other healthcare providers involved in your care</li>
                    <li>Insurance companies for claims processing</li>
                    <li>Service providers who assist our operations (under strict confidentiality agreements)</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We do not sell your personal information to third parties.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your 
                    information against unauthorized access, alteration, disclosure, or destruction. 
                    This includes encryption, secure servers, and access controls.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Access your health records</li>
                    <li>Request corrections to your health information</li>
                    <li>Request restrictions on certain uses of your information</li>
                    <li>Receive an accounting of disclosures</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Analytics</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our website may use cookies and similar technologies to improve user experience 
                    and analyze website traffic. You can control cookie settings through your browser preferences.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                  </p>
                  <div className="mt-4 text-muted-foreground">
                    <p>Pittsford Performance Care</p>
                    <p>3800 Monroe Ave., Suite 22</p>
                    <p>Pittsford, NY 14534</p>
                    <p>Phone: (585) 203-1050</p>
                    <p>Email: info@pittsfordperformancecare.com</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the "Last updated" date.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default SitePrivacy;
