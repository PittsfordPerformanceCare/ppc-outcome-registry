import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Clock, Heart } from "lucide-react";

const BeginIntake = () => {
  const navigate = useNavigate();

  const expectItems = [
    "Clear, simple questions",
    "Tailored evaluation pathway",
    "A clinician will review your intake",
    "Your first visit will be prepared for you",
    "Our admin team will follow up promptly to schedule and answer questions",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-accent" />
      
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          
          {/* Trust indicators - subtle */}
          <div className="flex justify-center gap-6 mb-10 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Shield className="h-3.5 w-3.5 text-primary" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              5 Minutes
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Private & Secure
            </div>
          </div>

          {/* Header Section */}
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Welcome to Pittsford Performance Care
            </h1>
            <p className="text-lg md:text-xl text-primary font-medium">
              Where Neurology, MSK Care, and Hospitality Meet
            </p>
          </header>

          {/* Main Content */}
          <div className="space-y-8 mb-12">
            <p className="text-lg text-foreground text-center font-medium">
              We're honored you're considering us for your care.
            </p>
            
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Whether you're navigating a concussion, chronic symptoms, or something you 
                don't yet have words for — you're in the right place.
              </p>
              
              <p>
                Before scheduling your first visit, we ask each new patient to complete a 
                short intake. This helps our clinicians prepare in advance so your first 
                appointment feels <span className="text-foreground font-medium">focused, personal, and productive</span>.
              </p>
              
              <p className="text-sm">
                You'll still have time at your first visit to review details, finalize 
                paperwork, and go over insurance coverage options with our team.
              </p>
            </div>
          </div>

          {/* Human Touch - Phone */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground mb-2">Prefer to speak with someone first?</p>
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
          <div className="text-center mb-10">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-8 md:px-12 py-6 md:py-7 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => navigate("/patient-intake")}
            >
              Start Your New Patient Intake
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              A brief set of questions tailored to your needs
            </p>
          </div>

          {/* What to Expect */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              What to Expect Next
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

          {/* Footer */}
          <footer className="text-center pt-8 border-t border-border">
            <p className="font-bold text-lg text-foreground mb-1">
              Pittsford Performance Care
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Neurology • MSK • Performance
            </p>
            <p className="text-primary font-medium italic">
              Experience care that feels human.
            </p>
          </footer>
          
        </div>
      </div>
    </div>
  );
};

export default BeginIntake;
