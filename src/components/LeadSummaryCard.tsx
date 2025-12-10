import { Lead } from "@/pages/AdminLeads";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  CalendarPlus, 
  ExternalLink, 
  User, 
  Clock, 
  MapPin,
  AlertCircle,
  Brain,
  Activity,
  Baby,
  Stethoscope,
  RefreshCw,
  ArrowRight,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface LeadSummaryCardProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadSummaryCard({ lead, open, onClose }: LeadSummaryCardProps) {
  if (!lead) return null;

  // Determine category based on system_category or other fields
  const getCategory = () => {
    const category = lead.system_category?.toLowerCase() || "";
    if (category.includes("concussion") || category.includes("neuro")) return "concussion";
    if (category.includes("pediatric") || category.includes("child")) return "pediatric";
    if (category.includes("referral")) return "referral";
    return "msk";
  };

  const category = getCategory();

  const getCategoryConfig = () => {
    switch (category) {
      case "concussion":
        return { 
          label: "Concussion", 
          color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          icon: Brain,
          routing: "Schedule Neuro Evaluation",
          routingColor: "text-purple-600"
        };
      case "pediatric":
        return { 
          label: "Pediatric", 
          color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
          icon: Baby,
          routing: "Schedule Pediatric Neuro Exam",
          routingColor: "text-pink-600"
        };
      case "referral":
        return { 
          label: "Referral", 
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: Stethoscope,
          routing: "Priority: Contact within 24 hours",
          routingColor: "text-emerald-600"
        };
      default:
        return { 
          label: "MSK", 
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: Activity,
          routing: "Schedule MSK Evaluation",
          routingColor: "text-blue-600"
        };
    }
  };

  const categoryConfig = getCategoryConfig();
  const CategoryIcon = categoryConfig.icon;

  const getSeverityConfig = (score: number | null) => {
    if (score === null) return { label: "Unknown", color: "bg-muted text-muted-foreground" };
    if (score >= 7) return { label: "High", color: "bg-red-500/10 text-red-600 border-red-500/20" };
    if (score >= 4) return { label: "Moderate", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    return { label: "Low", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
  };

  const severityConfig = getSeverityConfig(lead.severity_score);

  const getChronicityBadge = () => {
    // Infer chronicity from available fields
    const status = lead.checkpoint_status?.toLowerCase() || "";
    if (status.includes("chronic")) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Chronic</Badge>;
    }
    if (status.includes("acute")) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Acute</Badge>;
    }
    return null;
  };

  const isReturningPatient = lead.checkpoint_status?.includes("returning") || false;
  const isReferral = category === "referral" || lead.utm_source?.toLowerCase().includes("referral");

  // Build intake details from available fields
  const intakeDetails = [
    { label: "Primary Concern", value: lead.primary_concern },
    { label: "Symptom Summary", value: lead.symptom_summary },
    { label: "Who Is This For", value: lead.who_is_this_for },
    { label: "Preferred Contact", value: lead.preferred_contact_method },
    { label: "Pillar Origin", value: lead.pillar_origin },
    { label: "Funnel Stage", value: lead.funnel_stage },
    { label: "Notes", value: lead.notes },
  ].filter(item => item.value);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          {/* Header with name and badges */}
          <div className="space-y-3">
            <SheetTitle className="text-2xl font-bold tracking-tight">
              {lead.name || "Unknown Lead"}
            </SheetTitle>
            
            {/* Badge Row */}
            <div className="flex flex-wrap gap-2">
              <Badge className={categoryConfig.color}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {categoryConfig.label}
              </Badge>
              <Badge className={severityConfig.color}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {severityConfig.label} Severity
                {lead.severity_score !== null && ` (${lead.severity_score})`}
              </Badge>
              {getChronicityBadge()}
              {isReturningPatient && (
                <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Returning
                </Badge>
              )}
              {isReferral && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Referral
                </Badge>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  asChild
                  disabled={!lead.phone}
                >
                  <a href={lead.phone ? `tel:${lead.phone}` : undefined}>
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs">Call</span>
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1"
                  asChild
                  disabled={!lead.email}
                >
                  <a href={lead.email ? `mailto:${lead.email}` : undefined}>
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">Email</span>
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col gap-1 col-span-2"
                >
                  <CalendarPlus className="h-4 w-4 text-primary" />
                  <span className="text-xs">Schedule NPE</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lead Overview - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Contact Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm break-all">{lead.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferred Contact</p>
                  <p className="font-medium">{lead.preferred_contact_method || "Not specified"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Lead Source</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.utm_source && (
                      <Badge variant="outline" className="text-xs">{lead.utm_source}</Badge>
                    )}
                    {lead.utm_medium && (
                      <Badge variant="outline" className="text-xs">{lead.utm_medium}</Badge>
                    )}
                    {lead.utm_campaign && (
                      <Badge variant="outline" className="text-xs">{lead.utm_campaign}</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-sm">
                    {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Clinical Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Clinical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Primary Complaint</p>
                  <p className="font-medium">{lead.primary_concern || lead.symptom_summary || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">System Category</p>
                  <p className="font-medium">{lead.system_category || "Not categorized"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Severity Score</p>
                  <p className="font-medium">
                    {lead.severity_score !== null ? `${lead.severity_score}/10` : "Not assessed"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">
                    {lead.checkpoint_status?.replace(/_/g, " ") || "New"}
                  </p>
                </div>
                {lead.origin_page && (
                  <div>
                    <p className="text-xs text-muted-foreground">Origin Page</p>
                    <p className="font-medium text-xs truncate">{lead.origin_page}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Intake Details Accordion */}
          {intakeDetails.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="intake" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-sm font-medium">Lead Intake Details</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {intakeDetails.map((item, index) => (
                      <div key={index}>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-medium text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Routing Suggestion Card */}
          <Card className={`border-2 ${
            category === "concussion" ? "border-purple-500/30 bg-purple-500/5" :
            category === "pediatric" ? "border-pink-500/30 bg-pink-500/5" :
            category === "referral" ? "border-emerald-500/30 bg-emerald-500/5" :
            "border-blue-500/30 bg-blue-500/5"
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  category === "concussion" ? "bg-purple-500/10" :
                  category === "pediatric" ? "bg-pink-500/10" :
                  category === "referral" ? "bg-emerald-500/10" :
                  "bg-blue-500/10"
                }`}>
                  <Zap className={`h-5 w-5 ${categoryConfig.routingColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Recommended Action</p>
                  <p className={`font-semibold ${categoryConfig.routingColor}`}>
                    {categoryConfig.routing}
                  </p>
                </div>
                <ArrowRight className={`h-5 w-5 ${categoryConfig.routingColor}`} />
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Created: {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            {lead.intake_completed_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Intake completed: {format(new Date(lead.intake_completed_at), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            )}
            {lead.episode_opened_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Episode opened: {format(new Date(lead.episode_opened_at), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
