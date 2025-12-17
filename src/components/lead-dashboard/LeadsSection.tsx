import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Inbox,
  Calendar,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookNPVisitDialog } from "./BookNPVisitDialog";
import { SendIntakeFormsDialog } from "./SendIntakeFormsDialog";

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  lead_status: string | null;
  primary_concern: string | null;
  origin_cta: string | null;
  origin_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  contact_attempt_count: number | null;
  last_contacted_at: string | null;
  preferred_contact_method: string | null;
}

interface LeadsSectionProps {
  leads: Lead[];
  loading: boolean;
  onRefresh: () => void;
  hasLeadsButNoCareRequests?: boolean;
}

function getLeadStatusBadge(status: string | null) {
  const normalizedStatus = (status || "new").toUpperCase();
  
  switch (normalizedStatus) {
    case "NEW":
      return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">New</Badge>;
    case "CONTACTED":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Contacted</Badge>;
    case "QUALIFIED":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Qualified</Badge>;
    case "NURTURE":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Nurture</Badge>;
    case "CLOSED":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status || "New"}</Badge>;
  }
}

function getSourceLabel(lead: Lead) {
  if (lead.origin_cta) return lead.origin_cta;
  if (lead.utm_campaign) return lead.utm_campaign;
  if (lead.utm_source) return lead.utm_source;
  if (lead.origin_page) {
    // Extract page name from URL
    const pageName = lead.origin_page.split("/").pop() || lead.origin_page;
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }
  return "Direct";
}

function getSLAIndicator(createdAt: string) {
  const now = new Date();
  const created = new Date(createdAt);
  const minutesAgo = (now.getTime() - created.getTime()) / (1000 * 60);

  if (minutesAgo < 30) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Clock className="h-3 w-3" />
        {Math.round(minutesAgo)}m
      </span>
    );
  }
  if (minutesAgo < 60) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <Clock className="h-3 w-3" />
        {Math.round(minutesAgo)}m
      </span>
    );
  }
  const hoursAgo = minutesAgo / 60;
  if (hoursAgo < 24) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <Clock className="h-3 w-3" />
        {Math.round(hoursAgo)}h
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-rose-600">
      <AlertTriangle className="h-3 w-3" />
      &gt;24h
    </span>
  );
}

export function LeadsSection({ leads, loading, onRefresh, hasLeadsButNoCareRequests }: LeadsSectionProps) {
  const { toast } = useToast();
  const [qualifyingLeadId, setQualifyingLeadId] = useState<string | null>(null);
  const [confirmQualifyOpen, setConfirmQualifyOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [bookNPVisitOpen, setBookNPVisitOpen] = useState(false);
  const [sendFormsOpen, setSendFormsOpen] = useState(false);
  const [formsLead, setFormsLead] = useState<Lead | null>(null);

  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ 
          lead_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Lead marked as ${newStatus.toLowerCase()}.`,
      });
      onRefresh();
    } catch (err) {
      console.error("Error updating lead status:", err);
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQualifyLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setConfirmQualifyOpen(true);
  };

  const confirmQualifyLead = async () => {
    if (!selectedLead) return;
    
    setQualifyingLeadId(selectedLead.id);
    try {
      // Determine valid source from lead data
      let source = 'WEBSITE'; // default
      const leadSource = (selectedLead.origin_cta || selectedLead.utm_source || '').toUpperCase();
      if (leadSource.includes('PHYSICIAN') || leadSource.includes('REFERRAL') || leadSource.includes('DOCTOR')) {
        source = 'PHYSICIAN_REFERRAL';
      } else if (leadSource.includes('SCHOOL') || leadSource.includes('COMMUNITY')) {
        source = 'SCHOOL';
      } else if (leadSource.includes('ATHLETE') || leadSource.includes('SPORT')) {
        source = 'ATHLETE_PROGRAM';
      } else if (leadSource.includes('INTERNAL') || leadSource.includes('STAFF') || leadSource.includes('PHONE')) {
        source = 'INTERNAL';
      }

      // Create care request from lead
      const { error: crError } = await supabase
        .from("care_requests")
        .insert({
          source,
          primary_complaint: selectedLead.primary_concern,
          status: "SUBMITTED",
          intake_payload: {
            patient_name: selectedLead.name,
            name: selectedLead.name,
            email: selectedLead.email,
            phone: selectedLead.phone,
            lead_id: selectedLead.id,
            primary_concern: selectedLead.primary_concern,
            source: "qualified_lead"
          }
        });

      if (crError) throw crError;

      // Update lead status to QUALIFIED
      const { error: leadError } = await supabase
        .from("leads")
        .update({ 
          lead_status: "QUALIFIED",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedLead.id);

      if (leadError) throw leadError;

      toast({
        title: "Lead qualified",
        description: `Care request created for ${selectedLead.name || selectedLead.email}.`,
      });
      
      setConfirmQualifyOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Error qualifying lead:", err);
      toast({
        title: "Error",
        description: "Failed to qualify lead and create care request.",
        variant: "destructive",
      });
    } finally {
      setQualifyingLeadId(null);
      setSelectedLead(null);
    }
  };

  const handleContact = (lead: Lead, method: "phone" | "email" | "sms") => {
    if (method === "phone" && lead.phone) {
      window.open(`tel:${lead.phone}`, "_blank");
    } else if (method === "email" && lead.email) {
      window.open(`mailto:${lead.email}`, "_blank");
    } else if (method === "sms" && lead.phone) {
      window.open(`sms:${lead.phone}`, "_blank");
    }
    
    // Update contact attempt count
    handleUpdateStatus(lead.id, "CONTACTED");
  };

  const handleBookNPVisit = (lead: Lead) => {
    setSelectedLead(lead);
    setBookNPVisitOpen(true);
  };

  const handleSendFormsOnly = (lead: Lead) => {
    setFormsLead(lead);
    setSendFormsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading leads...
      </div>
    );
  }

  if (sortedLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 text-muted-foreground/50" />
        <p className="font-medium">No new leads</p>
        <p className="text-sm">New leads from CTAs will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[180px]">Contact</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Source / CTA</TableHead>
            <TableHead>Concern</TableHead>
            <TableHead>Waiting</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[200px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead, index) => {
            const isNewest = index === 0;
            const isQualifying = qualifyingLeadId === lead.id;

            return (
              <TableRow 
                key={lead.id}
                className={isNewest ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isNewest && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                    <div>
                      <div>{lead.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.email || lead.phone || "No contact info"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {lead.phone && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleContact(lead, "phone")}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {lead.phone && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleContact(lead, "sms")}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {lead.email && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleContact(lead, "email")}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {getSourceLabel(lead)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                  {lead.primary_concern || "—"}
                </TableCell>
                <TableCell>{getSLAIndicator(lead.created_at)}</TableCell>
                <TableCell>{getLeadStatusBadge(lead.lead_status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    {/* Primary Action Button - Always Visible */}
                    <Button
                      size="sm"
                      onClick={() => handleBookNPVisit(lead)}
                      className="gap-1 whitespace-nowrap"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Book NP Visit
                    </Button>
                    
                    {/* Secondary Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUpdating || isQualifying}>
                          {isQualifying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
                        {/* Secondary Actions */}
                        <DropdownMenuItem onClick={() => handleSendFormsOnly(lead)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Send Intake Forms Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQualifyLead(lead)}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                          Qualify Lead (No Scheduling)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        {/* Contact Actions */}
                        {lead.phone && (
                          <DropdownMenuItem onClick={() => handleContact(lead, "phone")}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                        )}
                        {lead.phone && (
                          <DropdownMenuItem onClick={() => handleContact(lead, "sms")}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Text
                          </DropdownMenuItem>
                        )}
                        {lead.email && (
                          <DropdownMenuItem onClick={() => handleContact(lead, "email")}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        
                        {/* Status Actions */}
                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, "NURTURE")}>
                          <Clock className="h-4 w-4 mr-2 text-amber-600" />
                          Nurture
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(lead.id, "CLOSED")}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Close Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Qualify Lead Confirmation Dialog */}
      <Dialog open={confirmQualifyOpen} onOpenChange={setConfirmQualifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualify Lead (No Scheduling)</DialogTitle>
            <DialogDescription>
              This will create a new Care Request for {selectedLead?.name || selectedLead?.email} without scheduling an appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{selectedLead?.name || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedLead?.email || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{selectedLead?.phone || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Primary Concern:</span>
                <span className="font-medium">{selectedLead?.primary_concern || "—"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmQualifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmQualifyLead} disabled={qualifyingLeadId !== null}>
              {qualifyingLeadId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Care Request
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book NP Visit Dialog */}
      <BookNPVisitDialog
        open={bookNPVisitOpen}
        onOpenChange={setBookNPVisitOpen}
        onSuccess={onRefresh}
        lead={selectedLead}
      />

      {/* Send Forms Only Dialog */}
      <SendIntakeFormsDialog
        open={sendFormsOpen}
        onOpenChange={setSendFormsOpen}
        onSuccess={onRefresh}
        patientName={formsLead?.name || ""}
        patientEmail={formsLead?.email || null}
        leadId={formsLead?.id}
      />
    </>
  );
}
