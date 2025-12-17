import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Activity, Heart, Sparkles } from "lucide-react";
import { LocalBusinessSchema, PhysicianSchema } from "@/components/site/StructuredData";
import { CredibilityTicker } from "@/components/site/CredibilityTicker";

const SiteHome = () => {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Pittsford Performance Care | Neurologic Rehabilitation for Concussion & MSK</title>
        <meta name="description" content="Specialized neurologic rehabilitation for concussion recovery and musculoskeletal performance in Rochester, NY. Evidence-based care with measured outcomes." />
        <link rel="canonical" href="https://muse-meadow-app.lovable.app/site/home" />
      </Helmet>
      <LocalBusinessSchema />
      <PhysicianSchema />
      {/* Hero Section */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Neurologic Driven Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Pittsford Performance Care
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Specialized care for musculoskeletal performance and concussion recovery, 
              grounded in neurologic evaluation and measured outcomes. We identify 
              the systems driving your symptoms and treat them directly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/patient/concierge">
                  Schedule Neurologic Evaluation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/site/hub">Explore Our Approach</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Stats Ticker */}
      <CredibilityTicker />

      {/* Care Pillars */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Our Specialties
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How We Can Help</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Whether you're recovering from a concussion or dealing with chronic 
                pain, our neurologic approach identifies what's actually driving 
                your symptoms.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Link to="/site/concussion" className="group">
                <Card className="h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    Concussion Care
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Persistent symptoms after brain injury require targeted neurologic 
                    evaluation. We identify which systems are affected and treat them directly.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
              
              <Link to="/site/msk" className="group">
                <Card className="h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    MSK Care
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Chronic pain and movement dysfunction often have neurologic drivers. 
                    We evaluate the systems controlling your movement to find answers.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
              
              <Link to="/site/about" className="group">
                <Card className="h-full p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    About PPC
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our neurologic approach combines systems-based evaluation with 
                    measured outcomes. Learn why we're different.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Get Started
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Answers?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Schedule your comprehensive neurologic evaluation and discover what's 
              actually driving your symptoms. Our team is ready to help you find 
              clarity and build a path toward recovery.
            </p>
            
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl">
              <Link to="/patient/concierge">
                Schedule Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteHome;
