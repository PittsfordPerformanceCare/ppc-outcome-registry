import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const BeginIntake = () => {
  const navigate = useNavigate();

  const expectItems = [
    "You'll answer a few simple questions",
    "Our clinicians will review your intake",
    "We'll contact you promptly to schedule",
    "You'll have time at your visit to finalize any details",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-accent" />
      
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">

          {/* Header Section */}
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Welcome to Pittsford Performance Care
            </h1>
            <p className="text-lg md:text-xl text-primary font-medium">
              Where Neurology, MSK Care, and Hospitality Meet
            </p>
          </header>

          {/* Intro Paragraphs */}
          <div className="space-y-5 text-muted-foreground leading-relaxed mb-10 text-center">
            <p>
              We're honored you're considering us for your care. Your journey matters, 
              and we're here to help you find clarity, confidence, and the right path forward.
            </p>
            
            <p>
              Before scheduling your first appointment, we ask each new patient to complete 
              a brief intake. This helps our clinicians prepare so your first visit feels 
              <span className="text-foreground font-medium"> focused, personal, and productive</span>.
            </p>
            
            <p className="text-sm">
              You'll still have time at your appointment to ask questions, review your 
              coverage, and finalize any details with our team.
            </p>
          </div>

          {/* Concierge Block */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground mb-1">Prefer to speak with someone first?</p>
            <p className="text-foreground">
              Call us at{" "}
              <a 
                href="tel:+15852031050" 
                className="text-primary font-semibold hover:underline"
              >
                (585) 203-1050
              </a>
              {" "}— we're here to help.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="text-center mb-12">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => navigate("/patient-intake")}
            >
              Start Your New Patient Intake
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Takes just a few minutes. Helps us prepare for your visit.
            </p>
          </div>

          {/* What Happens Next */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              What Happens Next
            </h2>
            <ul className="space-y-4">
              {expectItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Professional Referral Link */}
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground">
              Are you a medical professional?{" "}
              <a 
                href="/start-neurologic-intake" 
                onClick={(e) => { e.preventDefault(); navigate("/start-neurologic-intake"); }}
                className="text-primary hover:underline font-medium"
              >
                Submit a referral for your patient here
              </a>.
            </p>
          </div>

          {/* Footer */}
          <footer className="text-center pt-8 border-t border-border">
            <p className="font-bold text-lg text-foreground mb-1">
              Pittsford Performance Care
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Neurology • MSK • Performance
            </p>
            <p className="text-primary font-medium italic mb-6">
              Experience care that feels human.
            </p>
            <p className="text-xs text-muted-foreground">
              <a 
                href="/staff-login" 
                onClick={(e) => { e.preventDefault(); navigate("/staff-login"); }}
                className="hover:text-primary transition-colors"
              >
                Staff Login
              </a>
            </p>
          </footer>
          
        </div>
      </div>
    </div>
  );
};

export default BeginIntake;
