import { useState } from "react";
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
  User, 
  Clock, 
  AlertCircle,
  Brain,
  Activity,
  Baby,
  Stethoscope,
  RefreshCw,
  ArrowRight,
  Zap,
  Send,
  FileText,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ContactAttemptTracker } from "./ContactAttemptTracker";
import { useLeadContactAttempts } from "@/hooks/useLeadContactAttempts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadSummaryCardProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function LeadSummaryCard({ lead, open, onClose, onUpdate }: LeadSummaryCardProps) {
  const { attempts, refetch: refetchAttempts } = useLeadContactAttempts(lead?.id || null);
  const [sendingOnboarding, setSendingOnboarding] = useState(false);

  if (!lead) return null;

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
        return { label: "Concussion", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Brain, routing: "Schedule Neuro Evaluation", routingColor: "text-purple-600" };
      case "pediatric":
        return { label: "Pediatric", color: "bg-pink-500/10 text-pink-600 border-pink-500/20", icon: Baby, routing: "Schedule Pediatric Neuro Exam", routingColor: "text-pink-600" };
      case "referral":
        return { label: "Referral", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Stethoscope, routing: "Priority: Contact within 24 hours", routingColor: "text-emerald-600" };
      default:
        return { label: "MSK", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Activity, routing: "Schedule MSK Evaluation", routingColor: "text-blue-600" };
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
  const isReturningPatient = lead.checkpoint_status?.includes("returning") || false;
  const isReferral = category === "referral" || lead.utm_source?.toLowerCase().includes("referral");

  const intakeDetails = [
    { label: "Primary Concern", value: lead.primary_concern },
    { label: "Symptom Summary", value: lead.symptom_summary },
    { label: "Who Is This For", value: lead.who_is_this_for },
    { label: "Preferred Contact", value: lead.preferred_contact_method },
    { label: "Notes", value: lead.notes },
  ].filter(item => item.value);

  const handleUpdate = () => {
    refetchAttempts();
    onUpdate?.();
  };

  const handleSendOnboardingEmail = async () => {
    if (!lead.email) {
      toast.error("No email address available for this lead");
      return;
    }

    setSendingOnboarding(true);
    try {
      // Send the onboarding email
      const { data, error } = await supabase.functions.invoke("send-onboarding-email", {
        body: {
          email: lead.email,
          patientName: lead.name || "Patient",
          leadId: lead.id
        }
      });

      if (error) throw error;

      // Log a contact attempt for the email
      const newAttemptCount = (lead.contact_attempt_count || 0) + 1;
      
      await supabase.from("lead_contact_attempts").insert({
        lead_id: lead.id,
        attempt_number: newAttemptCount,
        method: "email",
        notes: "New Patient Forms + What to Expect sent",
        contacted_at: new Date().toISOString()
      });

      // Update lead contact count
      await supabase
        .from("leads")
        .update({
          contact_attempt_count: newAttemptCount,
          last_contacted_at: new Date().toISOString()
        })
        .eq("id", lead.id);

      toast.success("Onboarding email sent successfully!");
      handleUpdate();
    } catch (error) {
      console.error("Error sending onboarding email:", error);
      toast.error("Failed to send onboarding email");
    } finally {
      setSendingOnboarding(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="space-y-3">
            <SheetTitle className="text-2xl font-bold tracking-tight">
              {lead.name || "Unknown Lead"}
            </SheetTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={categoryConfig.color}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {categoryConfig.label}
              </Badge>
              <Badge className={severityConfig.color}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {severityConfig.label}
              </Badge>
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
          {/* Prominent Contact Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold tracking-tight">{lead.phone || "No phone"}</p>
                <p className="text-sm text-muted-foreground">{lead.email || "No email"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="default" className="gap-2" asChild disabled={!lead.phone}>
                  <a href={lead.phone ? `tel:${lead.phone}` : undefined}>
                    <Phone className="h-4 w-4" /> Call
                  </a>
                </Button>
                <Button variant="outline" className="gap-2" asChild disabled={!lead.email}>
                  <a href={lead.email ? `mailto:${lead.email}` : undefined}>
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <CalendarPlus className="h-4 w-4" /> Schedule NPE
              </Button>
            </CardContent>
          </Card>

          {/* Send Onboarding Email Section */}
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Send New Patient Forms + What to Expect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{lead.email || "No email available"}</span>
              </div>
              <Button 
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSendOnboardingEmail}
                disabled={!lead.email || sendingOnboarding}
              >
                {sendingOnboarding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Onboarding Email
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Sends digital intake forms and "What to Expect at Your First Visit" guide
              </p>
            </CardContent>
          </Card>

          {/* Contact Attempt Tracker */}
          <ContactAttemptTracker
            leadId={lead.id}
            leadStatus={lead.lead_status || "new"}
            contactAttemptCount={lead.contact_attempt_count || 0}
            nextFollowUpDate={lead.next_follow_up_date}
            lastContactedAt={lead.last_contacted_at}
            attempts={attempts}
            onUpdate={handleUpdate}
          />

          {/* Lead Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="h-4 w-4" /> Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Preferred:</span> {lead.preferred_contact_method || "Not specified"}</div>
                <div><span className="text-muted-foreground">Source:</span> {lead.utm_source || "Direct"}</div>
                <div><span className="text-muted-foreground">Created:</span> {format(new Date(lead.created_at), "MMM d, yyyy")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Clinical
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Complaint:</span> {lead.primary_concern || "Not specified"}</div>
                <div><span className="text-muted-foreground">Category:</span> {lead.system_category || "Not categorized"}</div>
                <div><span className="text-muted-foreground">Severity:</span> {lead.severity_score !== null ? `${lead.severity_score}/10` : "N/A"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Intake Details */}
          {intakeDetails.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem value="intake" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline text-sm font-medium">Lead Intake Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {intakeDetails.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-muted-foreground">{item.label}:</span> {item.value}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Routing Suggestion */}
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${categoryConfig.routingColor}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase">Recommended Action</p>
                  <p className={`font-semibold ${categoryConfig.routingColor}`}>{categoryConfig.routing}</p>
                </div>
                <ArrowRight className={`h-5 w-5 ${categoryConfig.routingColor}`} />
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Created: {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
            {lead.intake_completed_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Intake: {format(new Date(lead.intake_completed_at), "MMM d, yyyy")}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
