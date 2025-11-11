import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Bell,
  Award,
  Calendar,
  BarChart3,
  Heart,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Mail,
  Shield,
  HelpCircle,
} from "lucide-react";

export default function PatientQuickStart() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: UserCheck,
      title: "Getting Started",
      description: "Set up your patient portal account",
      steps: [
        "Check your email for the invitation link from your clinic",
        "Create your account with a secure password",
        "Verify your email address to activate your account",
        "Complete your profile with contact information",
      ],
      action: () => navigate("/patient-dashboard"),
      actionLabel: "Go to Dashboard",
    },
    {
      icon: ClipboardList,
      title: "Completing Intake Forms",
      description: "Fill out your initial health information",
      steps: [
        "Access intake forms before your first appointment",
        "Provide accurate information about your complaints and symptoms",
        "Describe functional limitations you're experiencing",
        "Review and submit your completed forms",
      ],
      action: () => navigate("/patient-intake"),
      actionLabel: "Start Intake Form",
    },
    {
      icon: TrendingUp,
      title: "Tracking Your Progress",
      description: "Monitor your recovery over time",
      steps: [
        "Complete outcome measure forms when prompted",
        "View your progress charts on the dashboard",
        "Celebrate milestones and improvements",
        "Share your progress with your clinician",
      ],
      action: () => navigate("/patient-dashboard"),
      actionLabel: "View Progress",
    },
    {
      icon: BarChart3,
      title: "Understanding Outcome Measures",
      description: "Learn about your assessment tools",
      steps: [
        "Complete questionnaires about your symptoms (NDI, ODI, QuickDASH, LEFS)",
        "Answer honestly about your current functional abilities",
        "Track how your scores improve over time",
        "Discuss results with your clinician during visits",
      ],
      action: () => navigate("/patient-dashboard"),
      actionLabel: "View Assessments",
    },
    {
      icon: MessageSquare,
      title: "Communicating with Your Clinician",
      description: "Stay connected with your care team",
      steps: [
        "Send messages through the secure portal",
        "Request callbacks when you need to speak directly",
        "Receive responses from your clinician",
        "Ask questions about your treatment plan",
      ],
      action: () => navigate("/patient-dashboard"),
      actionLabel: "Send Message",
    },
    {
      icon: Bell,
      title: "Managing Notifications",
      description: "Stay informed about your care",
      steps: [
        "Enable browser or email notifications for reminders",
        "Receive alerts for upcoming outcome assessments",
        "Get notified about appointment reminders",
        "Customize your notification preferences",
      ],
      action: () => navigate("/patient-preferences"),
      actionLabel: "Notification Settings",
    },
    {
      icon: Award,
      title: "Earning Achievements",
      description: "Celebrate your progress milestones",
      steps: [
        "Complete assessments on time to earn badges",
        "Track your achievement progress",
        "Reach recovery milestones",
        "Build positive health habits",
      ],
      action: () => navigate("/patient-dashboard"),
      actionLabel: "View Achievements",
    },
  ];

  const quickTips = [
    {
      icon: Calendar,
      title: "Complete Forms on Time",
      tip: "Respond to outcome measure reminders promptly to help track your progress accurately.",
    },
    {
      icon: Smartphone,
      title: "Access Anywhere",
      tip: "Use your phone, tablet, or computer - the portal works on any device.",
    },
    {
      icon: Mail,
      title: "Check Your Email",
      tip: "Important notifications and reminders are sent to your email address.",
    },
    {
      icon: Shield,
      title: "Your Data is Secure",
      tip: "All your health information is encrypted and HIPAA-compliant.",
    },
    {
      icon: Heart,
      title: "Be Honest",
      tip: "Accurate responses help your clinician provide the best possible care.",
    },
    {
      icon: HelpCircle,
      title: "Ask Questions",
      tip: "Use the messaging feature anytime you have questions about your treatment.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Patient Quick Start Guide</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about using your patient portal
          </p>
        </div>

        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Welcome to Your Health Journey
            </CardTitle>
            <CardDescription className="text-base">
              This portal helps you stay connected with your care team, track your recovery progress,
              and take an active role in your treatment. Follow this guide to get the most out of
              your patient portal.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-semibold">How to Use Your Patient Portal</h2>
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={section.action} variant="outline" size="sm">
                  {section.actionLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Helpful Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTips.map((tip, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <tip.icon className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{tip.tip}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription className="space-y-2">
              <p>
                If you have questions about using the portal or need technical assistance, contact
                your clinic directly or use the messaging feature to reach your clinician.
              </p>
              <p className="text-sm">
                <strong>Privacy Notice:</strong> Your health information is protected and secure.
                Only your care team has access to your data.
              </p>
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
