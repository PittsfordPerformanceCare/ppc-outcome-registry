import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Users, 
  Phone, 
  Calendar, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Lightbulb,
  UserPlus,
  Search,
  Bell,
  FolderOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FrontDeskQuickStart() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: ClipboardList,
      title: "Patient Intake Management",
      description: "Review, approve, and process incoming patient intake forms",
      steps: [
        "Navigate to Admin Dashboard → Intake Review",
        "Review pending intake forms for completeness",
        "Verify patient information and insurance details",
        "Approve or request additional information",
        "Convert approved intakes to episodes"
      ],
      action: () => navigate("/intake-review")
    },
    {
      icon: Users,
      title: "Lead Management",
      description: "Track and follow up with prospective patients",
      steps: [
        "Access Admin → Leads to view all leads",
        "Filter by status: New, Contacted, Scheduled, etc.",
        "Log contact attempts with notes",
        "Update lead status as you progress",
        "Convert qualified leads to patient intakes"
      ],
      action: () => navigate("/admin/leads")
    },
    {
      icon: Calendar,
      title: "Scheduling Coordination",
      description: "Monitor appointments and scheduling status",
      steps: [
        "Check daily schedule overview on Admin Dashboard",
        "Review patients needing scheduling follow-up",
        "Track intake forms awaiting appointment booking",
        "Send scheduling reminders to patients",
        "Coordinate with clinicians for availability"
      ],
      action: () => navigate("/admin/dashboard")
    },
    {
      icon: Phone,
      title: "Patient Communications",
      description: "Handle patient inquiries and send notifications",
      steps: [
        "Monitor incoming messages and callback requests",
        "Send intake form links to new patients",
        "Follow up on incomplete intake forms",
        "Send appointment reminders",
        "Document all communication attempts"
      ],
      action: () => navigate("/notification-history")
    },
    {
      icon: FolderOpen,
      title: "Episode & Patient Lookup",
      description: "Find and review patient records and active episodes",
      steps: [
        "Use the search bar to find patients by name",
        "View patient episode history",
        "Check current episode status",
        "Review intake form details",
        "Access patient contact information"
      ],
      action: () => navigate("/dashboards")
    },
    {
      icon: FileText,
      title: "Referral Processing",
      description: "Manage incoming referrals from partner clinics",
      steps: [
        "Check Referral Inbox for new referrals",
        "Review referral documentation",
        "Contact referred patients promptly",
        "Track referral status through conversion",
        "Send thank-you communications to referral sources"
      ],
      action: () => navigate("/referral-inbox")
    }
  ];

  const quickTips = [
    {
      icon: Clock,
      title: "Same-Day Response",
      tip: "Aim to contact new leads and intake submissions within 2 hours for best conversion rates"
    },
    {
      icon: CheckCircle2,
      title: "Complete Information",
      tip: "Verify all required fields are complete before approving intakes to avoid delays"
    },
    {
      icon: Bell,
      title: "Check Notifications",
      tip: "Review the notification bell regularly for urgent items requiring attention"
    },
    {
      icon: Search,
      title: "Patient Lookup",
      tip: "Use the global search to quickly find any patient by name, phone, or email"
    }
  ];

  const dailyChecklist = [
    "Review overnight lead submissions",
    "Check pending intake forms for approval",
    "Follow up on patients needing scheduling",
    "Send reminders for upcoming appointments",
    "Log all contact attempts",
    "Update lead statuses",
    "Check for incomplete intake forms (send reminders)",
    "Review referral inbox"
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, Jennifer! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Your guide to front desk operations and patient intake coordination
        </p>
      </div>

      {/* Daily Checklist */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Daily Checklist
          </CardTitle>
          <CardDescription>
            Start each day by reviewing these key tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dailyChecklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">
                  {index + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Workflow Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Workflows</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 mb-4">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-medium min-w-[20px]">
                        {stepIndex + 1}.
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={section.action}
                >
                  Go to {section.title}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Pro Tips
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickTips.map((tip, index) => (
            <Card key={index} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <tip.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{tip.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tip.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Jump to your most-used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/admin/dashboard")} variant="default">
              <ClipboardList className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button onClick={() => navigate("/intake-review")} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Intake Review
            </Button>
            <Button onClick={() => navigate("/admin/leads")} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Leads
            </Button>
            <Button onClick={() => navigate("/referral-inbox")} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Referral Inbox
            </Button>
            <Button onClick={() => navigate("/notification-history")} variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Need Help Section */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact your administrator or refer to the{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary"
            onClick={() => navigate("/admin-quick-start")}
          >
            Administrator Guide
          </Button>
          {" "}for additional resources.
        </p>
      </div>
    </div>
  );
}
