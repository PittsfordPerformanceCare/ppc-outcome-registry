import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardList, User, Target, HeartPulse, FileText } from "lucide-react";

const BeginIntake = () => {
  const navigate = useNavigate();

  const expectItems = [
    { icon: User, text: "Who the evaluation is for" },
    { icon: HeartPulse, text: "Your main symptoms or concerns" },
    { icon: Target, text: "Your goals for care" },
    { icon: FileText, text: "A brief health and performance history" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome to Pittsford Performance Care
            </h1>
            <p className="text-lg md:text-xl text-primary font-medium">
              Your Personalized Neurologic & Musculoskeletal Intake Portal
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="border-border/50">
            <CardContent className="pt-8 pb-8 space-y-6">
              {/* Intro Paragraph */}
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Before we schedule your first appointment, we'd like to learn a little about you.
                  This helps our clinicians prepare in advance so your care can begin with clarity and momentum.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This short intake takes only a few minutes and ensures we match you with the right evaluation pathway.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="flex justify-center pt-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate("/patient-intake")}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Start Your New Patient Intake
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect Section */}
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl text-center">What to Expect Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {expectItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground text-center pt-4 border-t border-border/50">
                Once submitted, our clinical team will review your intake and contact you promptly with next steps.
              </p>
            </CardContent>
          </Card>

          {/* Secondary CTA */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/intake-start")}
            >
              Continue a Saved Intake
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-8 border-t border-border/30">
            <p className="font-semibold text-foreground">Pittsford Performance Care</p>
            <p className="text-sm text-muted-foreground">Neurology • MSK • Performance</p>
            <p className="text-sm text-primary italic">Where clarity meets recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeginIntake;
