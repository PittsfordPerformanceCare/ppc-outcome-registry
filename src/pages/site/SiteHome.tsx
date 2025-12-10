import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SiteHome = () => {
  // Redirect to hub - home serves as alias
  return (
    <div className="flex flex-col">
      {/* Hero Section - Simplified entry point */}
      <section className="relative py-24 lg:py-40 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Pittsford Performance Care
            </h1>
            <p className="text-xl text-muted-foreground">
              Neurologic-driven care for concussion recovery and musculoskeletal performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/patient/concierge">
                  Schedule Neurologic Evaluation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/site/hub">Explore Our Approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link 
              to="/site/concussion"
              className="p-8 rounded-lg border-2 hover:border-primary/50 transition-colors text-center group"
            >
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                Concussion Care
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Persistent symptoms after brain injury
              </p>
            </Link>
            <Link 
              to="/site/msk"
              className="p-8 rounded-lg border-2 hover:border-primary/50 transition-colors text-center group"
            >
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                MSK Care
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Chronic pain and movement dysfunction
              </p>
            </Link>
            <Link 
              to="/site/about"
              className="p-8 rounded-lg border-2 hover:border-primary/50 transition-colors text-center group"
            >
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                About PPC
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Our neurologic approach
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteHome;
