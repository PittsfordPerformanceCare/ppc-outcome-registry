import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Activity, ClipboardCheck } from "lucide-react";

const SiteCta = () => {
  const [searchParams] = useSearchParams();
  
  // Build route with preserved UTM parameters
  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <Helmet>
        <title>Schedule Evaluation | Pittsford Performance Care</title>
        <meta name="description" content="Take the next step in your recovery. Schedule a neurologic evaluation at Pittsford Performance Care." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/cta" />
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
            <Brain className="h-5 w-5" />
            Neurologic Care That Works
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Take the Next Step
          </h1>
          <p className="text-xl text-muted-foreground">
            You've tried waiting. You've tried generic treatments. 
            It's time for a neurologic approach that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to={getRouteWithParams("/patient/concierge")}>
                Start Your Neurologic Intake
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/site/about">Learn More About PPC</Link>
            </Button>
          </div>
          <div className="border-t border-border/50 pt-6 mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Not sure where to start? Try our self-assessment tools:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="ghost" size="sm" asChild>
                <Link to={getRouteWithParams("/patient/self-tests/concussion")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Concussion Self-Test
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={getRouteWithParams("/patient/self-tests/msk")}>
                  <Activity className="mr-2 h-4 w-4" />
                  MSK Self-Test
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCta;
