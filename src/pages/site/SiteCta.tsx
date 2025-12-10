import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SiteCta = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Take the Next Step
          </h1>
          <p className="text-xl text-muted-foreground">
            You've tried waiting. You've tried generic treatments. 
            It's time for a neurologic approach that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to="/patient/concierge">
                Schedule Your Evaluation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/site/about">Learn More About PPC</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Not sure where to start? Try our{" "}
            <Link to="/patient/self-tests" className="text-primary hover:underline">
              self-assessment tools
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiteCta;
