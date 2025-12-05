import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardList, User, Target, HeartPulse, FileText, Brain, Sparkles, Clock, Shield } from "lucide-react";

const BeginIntake = () => {
  const navigate = useNavigate();

  const expectItems = [
    { icon: User, text: "Who the evaluation is for", delay: "0ms" },
    { icon: HeartPulse, text: "Your main symptoms or concerns", delay: "100ms" },
    { icon: Target, text: "Your goals for care", delay: "200ms" },
    { icon: FileText, text: "A brief health and performance history", delay: "300ms" },
  ];

  const features = [
    { icon: Clock, label: "5 Minutes", sublabel: "Quick & Easy" },
    { icon: Shield, label: "HIPAA Secure", sublabel: "Private & Safe" },
    { icon: Sparkles, label: "Smart Matching", sublabel: "Right Care Path" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container relative mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section with Icon */}
          <div className="text-center space-y-6 animate-fade-in">
            {/* Animated Brain Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Brain className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
                Welcome to Pittsford Performance Care
              </h1>
              <p className="text-xl md:text-2xl text-primary font-semibold tracking-tight">
                Your Personalized Neurologic & Musculoskeletal Intake Portal
              </p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">• {feature.sublabel}</span>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <Card className="border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-8 pb-8 space-y-6">
              {/* Intro Paragraph */}
              <div className="space-y-4 text-center max-w-lg mx-auto">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Before we schedule your first appointment, we'd like to learn a little about you.
                  This helps our clinicians prepare in advance so your care can begin with{" "}
                  <span className="text-primary font-medium">clarity and momentum</span>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This short intake takes only a few minutes and ensures we match you with the right evaluation pathway.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="flex justify-center pt-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-7 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] group"
                  onClick={() => navigate("/patient-intake")}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Start Your New Patient Intake
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect Section */}
          <Card className="border-border/50 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What to Expect Next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {expectItems.map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors animate-fade-in"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  Once submitted, our clinical team will review your intake and contact you{" "}
                  <span className="text-primary font-medium">promptly</span> with next steps.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Secondary CTA */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-xl hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate("/intake-start")}
            >
              Continue a Saved Intake
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Footer */}
          <footer className="text-center space-y-3 pt-8 border-t border-border/30 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <p className="font-bold text-lg text-foreground">Pittsford Performance Care</p>
            </div>
            <p className="text-sm text-muted-foreground font-medium tracking-wide">
              Neurology <span className="text-primary">•</span> MSK <span className="text-primary">•</span> Performance
            </p>
            <p className="text-primary italic font-medium">Where clarity meets recovery.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BeginIntake;
