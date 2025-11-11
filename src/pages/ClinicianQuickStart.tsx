import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardList,
  TrendingUp,
  Calendar,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function ClinicianQuickStart() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Create and manage patient episodes",
      steps: [
        "Navigate to Dashboard to see all active patients",
        "Click 'New Episode' to start a new patient episode",
        "Complete intake forms including complaints, diagnoses, and functional limitations",
        "Assign appropriate outcome measures (NDI, ODI, QuickDASH, LEFS)",
      ],
      action: () => navigate("/dashboard"),
      actionLabel: "Go to Dashboard",
    },
    {
      icon: ClipboardList,
      title: "Outcome Tracking",
      description: "Monitor patient progress with validated measures",
      steps: [
        "Initial outcome measures are collected during intake",
        "Follow-up measures track MCID (Minimal Clinically Important Difference)",
        "Review progress charts in Episode Summary",
        "Discharge patients when treatment goals are met",
      ],
      action: () => navigate("/dashboards"),
      actionLabel: "View Analytics",
    },
    {
      icon: MessageSquare,
      title: "Patient Communication",
      description: "Stay connected with your patients",
      steps: [
        "Check Clinician Inbox for patient messages",
        "Respond to callback requests",
        "Configure notification preferences (email & browser)",
        "Patients can message you directly through their portal",
      ],
      action: () => navigate("/clinician-inbox"),
      actionLabel: "Open Inbox",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Track clinic performance and outcomes",
      steps: [
        "View aggregated outcome data across all patients",
        "Monitor MCID achievement rates",
        "Track regional performance (Cervical, Lumbar, Shoulder, etc.)",
        "Export data for compliance and reporting",
      ],
      action: () => navigate("/dashboards"),
      actionLabel: "View Reports",
    },
    {
      icon: Settings,
      title: "Clinic Settings",
      description: "Customize your clinic profile",
      steps: [
        "Upload your clinic logo",
        "Set clinic contact information",
        "Configure branding for patient-facing materials",
        "Manage admin access and permissions",
      ],
      action: () => navigate("/clinic-settings"),
      actionLabel: "Edit Settings",
    },
  ];

  const quickTips = [
    {
      icon: Calendar,
      title: "Intake Forms",
      tip: "Patients can complete intake forms before their first visit using the patient portal link.",
    },
    {
      icon: Mail,
      title: "Automated Reminders",
      tip: "System automatically sends outcome measure reminders at appropriate intervals.",
    },
    {
      icon: TrendingUp,
      title: "MCID Tracking",
      tip: "Charts automatically highlight when patients achieve clinically meaningful improvement.",
    },
    {
      icon: CheckCircle2,
      title: "Mobile Friendly",
      tip: "Access the platform from any device - desktop, tablet, or mobile.",
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Clinician Quick Start Guide</h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to know to get started with patient outcome tracking
        </p>
      </div>

      <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Welcome to Your Outcome Tracking Platform
          </CardTitle>
          <CardDescription className="text-base">
            This platform helps you track patient outcomes using validated measures (NDI, ODI,
            QuickDASH, LEFS) and monitor meaningful clinical improvement through MCID tracking.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold">Key Features & Workflows</h2>
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
        <h2 className="text-2xl font-semibold mb-4">Quick Tips</h2>
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
              If you have questions or need assistance, check out the{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/clinic-settings")}
              >
                Clinic Settings
              </Button>{" "}
              page or contact support.
            </p>
            <p className="text-sm">
              <strong>Pro Tip:</strong> Start by creating your first patient episode to familiarize
              yourself with the workflow.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
