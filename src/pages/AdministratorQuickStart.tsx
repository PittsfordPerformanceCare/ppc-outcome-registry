import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Bell,
  Webhook,
  Database,
  FileText,
  Lock,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserCog,
  Mail,
  Activity,
} from "lucide-react";

export default function AdministratorQuickStart() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: UserCog,
      title: "User & Role Management",
      description: "Manage clinician access and permissions",
      steps: [
        "Navigate to Admin Management to view all users",
        "Assign roles (admin, clinician) to team members",
        "Configure user permissions and access levels",
        "Monitor user activity and session management",
      ],
      action: () => navigate("/admin-management"),
      actionLabel: "Manage Users",
    },
    {
      icon: Settings,
      title: "Clinic Configuration",
      description: "Set up clinic branding and settings",
      steps: [
        "Upload clinic logo and branding assets",
        "Configure clinic contact information",
        "Set default notification preferences",
        "Customize patient-facing portal appearance",
      ],
      action: () => navigate("/clinic-settings"),
      actionLabel: "Edit Clinic Settings",
    },
    {
      icon: Bell,
      title: "Notification Management",
      description: "Configure automated patient communications",
      steps: [
        "Set up appointment reminders and follow-up schedules",
        "Configure outcome measure reminder timing",
        "Customize email templates and branding",
        "Monitor notification delivery and engagement",
      ],
      action: () => navigate("/notification-analytics"),
      actionLabel: "View Notification Analytics",
    },
    {
      icon: Webhook,
      title: "Webhooks & Automation",
      description: "Integrate with external systems",
      steps: [
        "Configure webhook endpoints for system events",
        "Set up Zapier integrations for workflow automation",
        "Monitor webhook health and delivery status",
        "Review retry queues and failed deliveries",
      ],
      action: () => navigate("/automation-status"),
      actionLabel: "Check Automation Status",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track clinic performance and outcomes",
      steps: [
        "View aggregated outcome data across all clinicians",
        "Monitor MCID achievement rates by region",
        "Track patient engagement and referral metrics",
        "Schedule automated reports for stakeholders",
      ],
      action: () => navigate("/dashboards"),
      actionLabel: "View Analytics",
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Export and manage clinic data",
      steps: [
        "Configure scheduled data exports",
        "Review export history and download reports",
        "Manage data retention and archival policies",
        "Ensure HIPAA compliance and audit trails",
      ],
      action: () => navigate("/export-history"),
      actionLabel: "View Export History",
    },
    {
      icon: Activity,
      title: "System Monitoring",
      description: "Monitor platform health and performance",
      steps: [
        "Check webhook health and delivery rates",
        "Review notification failure alerts",
        "Monitor rate limits and API usage",
        "Track system errors and retry queues",
      ],
      action: () => navigate("/alert-history"),
      actionLabel: "View Alert History",
    },
    {
      icon: Lock,
      title: "Security & Compliance",
      description: "Maintain data security and regulatory compliance",
      steps: [
        "Review compliance audit logs",
        "Manage user access and authentication",
        "Configure session timeout policies",
        "Monitor data access patterns and anomalies",
      ],
      action: () => navigate("/compliance-audit"),
      actionLabel: "View Compliance Audit",
    },
  ];

  const quickTips = [
    {
      icon: Shield,
      title: "Role-Based Access",
      tip: "Use granular role assignments to ensure clinicians only access their patient data.",
    },
    {
      icon: Mail,
      title: "Email Templates",
      tip: "Customize email templates to match your clinic branding and communication style.",
    },
    {
      icon: TrendingUp,
      title: "Performance Metrics",
      tip: "Monitor MCID achievement rates to track treatment effectiveness across your clinic.",
    },
    {
      icon: Zap,
      title: "Automation",
      tip: "Set up automated workflows to reduce manual tasks and improve patient engagement.",
    },
    {
      icon: AlertTriangle,
      title: "Proactive Monitoring",
      tip: "Configure webhook alerts to catch and resolve delivery issues before they impact patients.",
    },
    {
      icon: FileText,
      title: "Scheduled Reports",
      tip: "Automate report generation and delivery to stakeholders on a regular schedule.",
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Administrator Quick Start Guide</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive guide to managing your clinic's outcome tracking platform
        </p>
      </div>

      <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Welcome to Platform Administration
          </CardTitle>
          <CardDescription className="text-base">
            As an administrator, you have full access to configure clinic settings, manage users,
            monitor system health, and ensure compliance. This guide covers all essential
            administrative workflows.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold">Administrative Features & Workflows</h2>
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
        <h2 className="text-2xl font-semibold mb-4">Administrative Best Practices</h2>
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
              For technical support or questions about platform administration, contact your
              system administrator or check the{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/clinic-settings")}
              >
                Clinic Settings
              </Button>{" "}
              documentation.
            </p>
            <p className="text-sm">
              <strong>Pro Tip:</strong> Start by configuring clinic settings and user roles to
              establish a solid foundation for your clinic's workflow.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
