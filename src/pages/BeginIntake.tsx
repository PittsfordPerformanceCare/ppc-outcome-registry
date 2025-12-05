import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardList, Phone, Brain, Sparkles, CheckCircle2, Calendar, UserCheck, MessageSquare } from "lucide-react";

const BeginIntake = () => {
  const navigate = useNavigate();

  const expectItems = [
    { icon: CheckCircle2, text: "Clear, simple questions" },
    { icon: Sparkles, text: "Tailored evaluation pathway" },
    { icon: UserCheck, text: "A clinician will review your intake" },
    { icon: Calendar, text: "Your first visit will be prepared for you" },
    { icon: MessageSquare, text: "Our admin team will follow up promptly to schedule and answer questions" },
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
                Where Neurology, MSK Care, and Hospitality Meet
              </p>
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-8 pb-8 space-y-6">
              {/* Intro Paragraph */}
              <div className="space-y-5 text-center max-w-lg mx-auto">
                <p className="text-foreground leading-relaxed text-lg font-medium">
                  We're honored you're considering us for your care.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're navigating a concussion, chronic symptoms, or something you don't yet have words for — you're in the right place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Before scheduling your first visit, we ask each new patient to complete a short intake.
                  This helps our clinicians prepare in advance so your first appointment feels{" "}
                  <span className="text-primary font-medium">focused, personal, and productive</span>.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  You'll still have time at your first visit to review details, finalize paperwork, and go over insurance coverage options with our team.
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
              
              <p className="text-center text-sm text-muted-foreground">
                This will take you to a brief set of questions tailored to your needs.
              </p>
            </CardContent>
          </Card>

          {/* Human Touch Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: "250ms" }}>
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-6 py-4 rounded-2xl bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">Prefer to speak with someone first?</span>
              <a 
                href="tel:5855551234" 
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                <Phone className="h-4 w-4" />
                Call us at (585) 555-1234
              </a>
              <span className="text-muted-foreground hidden sm:inline">— we're here to help.</span>
            </div>
          </div>

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
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="text-center space-y-3 pt-8 border-t border-border/30 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <p className="font-bold text-lg text-foreground">Pittsford Performance Care</p>
            </div>
            <p className="text-sm text-muted-foreground font-medium tracking-wide">
              Neurology <span className="text-primary">•</span> MSK <span className="text-primary">•</span> Performance
            </p>
            <p className="text-primary italic font-medium">Experience care that feels human.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BeginIntake;
