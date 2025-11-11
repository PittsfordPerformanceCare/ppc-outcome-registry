import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HeartPulse, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Users,
  Bell,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function PatientWelcome() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleGetStarted = () => {
    // Mark welcome as seen
    localStorage.setItem("ppc_patient_welcome_seen", "true");
    navigate("/patient-dashboard");
  };

  const handleSkip = () => {
    // Mark welcome as seen and skip
    localStorage.setItem("ppc_patient_welcome_seen", "true");
    navigate("/patient-dashboard");
  };

  const features = [
    {
      icon: Activity,
      title: "Track Your Progress",
      description: "Monitor your recovery journey with visual charts and outcome scores",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: TrendingUp,
      title: "See Your Improvement",
      description: "Visualize your functional improvements over time with clear metrics",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Calendar,
      title: "Stay on Schedule",
      description: "View upcoming appointments and receive timely reminders",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Trophy,
      title: "Earn Achievements",
      description: "Celebrate milestones and unlock rewards for your dedication",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Users,
      title: "Refer Friends",
      description: "Share your positive experience and help others start their recovery",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Share2,
      title: "Share Your Success",
      description: "Export and share your progress reports with family and providers",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  const steps = [
    {
      icon: CheckCircle2,
      title: "Enter Your Access Code",
      description: "Your clinician will provide you with an 8-character code to access your episodes",
    },
    {
      icon: Activity,
      title: "View Your Treatment Plan",
      description: "See your diagnosis, treatment goals, and clinician information",
    },
    {
      icon: TrendingUp,
      title: "Track Your Scores",
      description: "Complete outcome assessments and watch your progress over time",
    },
    {
      icon: Bell,
      title: "Stay Engaged",
      description: "Earn points, unlock achievements, and stay motivated throughout your recovery",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip Tour
        </Button>
      </div>

      <div className="container mx-auto max-w-6xl py-12 px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 animate-scale-in">
                <HeartPulse className="h-12 w-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 text-sm">
              Welcome to Your Recovery Journey
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              PPC Patient Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personal companion for tracking rehabilitative care progress, celebrating milestones, 
              and achieving your recovery goals
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to succeed in your recovery journey</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Getting Started</h2>
            <p className="text-muted-foreground">Follow these simple steps to begin tracking your recovery</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card 
                  key={index}
                  className="relative overflow-hidden hover:border-primary/50 transition-all"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full border">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Trusted by Thousands of Patients</span>
            </div>
            <h3 className="text-2xl font-bold">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of patients who are successfully tracking their recovery and achieving 
              their rehabilitative care goals with PPC Patient Hub
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="gap-2 shadow-lg hover:shadow-xl transition-all mt-6"
            >
              Enter PPC Patient Hub
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
