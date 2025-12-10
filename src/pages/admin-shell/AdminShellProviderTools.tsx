import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Brain,
  Activity,
  ArrowRight,
  FileText,
  Calculator,
  Gauge,
  Eye,
  Heart,
  Zap
} from "lucide-react";

// Provider tools organized by category
const neuroTools = [
  {
    title: "Neurologic Exam",
    description: "Comprehensive neurologic examination forms",
    icon: Brain,
    href: "/neuro-exam",
    badge: "Core",
  },
  {
    title: "Neuro Exam Scheduler",
    description: "Schedule and track neurologic examinations",
    icon: Activity,
    href: "/neuro-exam",
    badge: null,
  },
  {
    title: "Neuro Letter Generator",
    description: "Generate clinical letters and reports",
    icon: FileText,
    href: "/neuro-exam",
    badge: null,
  },
];

const assessmentTools = [
  {
    title: "Outcome Measures",
    description: "NDI, ODI, LEFS, QuickDASH, RPQ forms",
    icon: Calculator,
    href: "/dashboards",
    badge: "MCID Tracking",
  },
  {
    title: "MCID Reports",
    description: "Minimal clinically important difference analysis",
    icon: Gauge,
    href: "/dashboards",
    badge: null,
  },
  {
    title: "Functional Limitations",
    description: "Track and resolve functional limitations",
    icon: Activity,
    href: "/dashboards",
    badge: null,
  },
];

const specialtyTools = [
  {
    title: "Visual-Vestibular Assessment",
    description: "VOR, VVS, and visual tracking tools",
    icon: Eye,
    href: "/neuro-exam",
    badge: "Coming Soon",
    disabled: true,
  },
  {
    title: "Autonomic Testing",
    description: "HRV, orthostatic, and ANS assessment",
    icon: Heart,
    href: "/neuro-exam",
    badge: "Coming Soon",
    disabled: true,
  },
  {
    title: "Cerebellar Timing",
    description: "Motor timing and coordination assessment",
    icon: Zap,
    href: "/neuro-exam",
    badge: "Coming Soon",
    disabled: true,
  },
];

const AdminShellProviderTools = () => {
  const renderToolCard = (tool: typeof neuroTools[0] & { disabled?: boolean }) => (
    <Card 
      key={tool.title} 
      className={`${tool.disabled ? "opacity-60" : "hover:border-primary/50 transition-colors cursor-pointer"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <tool.icon className="h-5 w-5 text-primary" />
          </div>
          {tool.badge && (
            <Badge variant={tool.disabled ? "secondary" : "default"} className="text-xs">
              {tool.badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-2">{tool.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
        {!tool.disabled && (
          <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
            <Link to={tool.href}>
              Open Tool
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Provider Tools
          </h1>
          <p className="text-muted-foreground">
            Neurologic assessment and clinical tools
          </p>
        </div>
        <Button asChild>
          <Link to="/neuro-exam">
            <Brain className="mr-2 h-4 w-4" />
            New Neuro Exam
          </Link>
        </Button>
      </div>

      {/* Neurologic Tools */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Neurologic Examination
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {neuroTools.map(renderToolCard)}
        </div>
      </div>

      {/* Assessment Tools */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Outcome Assessment
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {assessmentTools.map(renderToolCard)}
        </div>
      </div>

      {/* Specialty Tools */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Specialty Assessment (Future)
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {specialtyTools.map(renderToolCard)}
        </div>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Frequently used clinical functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/new-episode">
                <FileText className="mr-2 h-4 w-4" />
                New Episode
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/dashboards">
                <Gauge className="mr-2 h-4 w-4" />
                Outcome Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/discharge">
                <Activity className="mr-2 h-4 w-4" />
                Discharge Workflow
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/pcp-summary">
                <FileText className="mr-2 h-4 w-4" />
                PCP Summary
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShellProviderTools;
