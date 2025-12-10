import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Phone, Mail, Clock } from "lucide-react";

const PatientThankYou = () => {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Thank You!</CardTitle>
          <CardDescription className="text-lg">
            Your intake has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* What happens next */}
          <div className="bg-muted/50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              What Happens Next
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span>Our team will review your information within 1-2 business days.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span>We'll contact you via your preferred method to discuss your needs and schedule your evaluation.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span>Most patients are seen within 1-2 weeks of initial contact.</span>
              </li>
            </ol>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Questions before your appointment? Reach out to us:
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="tel:585-203-1050" 
                className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                (585) 203-1050
              </a>
              <a 
                href="mailto:info@pittsfordperformancecare.com" 
                className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                info@pittsfordperformancecare.com
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              While you wait, learn more about our approach to neurologic care:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/site/hub">
                  Learn More About PPC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/site/articles">
                  Read Our Resources
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientThankYou;
