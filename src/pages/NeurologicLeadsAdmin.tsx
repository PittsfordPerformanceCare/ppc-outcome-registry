import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { User, Baby, Stethoscope, Mail, Phone, Clock, AlertCircle, CheckCircle2, Calendar, Archive, RefreshCw } from "lucide-react";

type LeadStatus = "new" | "contacted" | "scheduled" | "converted" | "archived";

const NeurologicLeadsAdmin = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["neurologic-leads", statusFilter, personaFilter],
    queryFn: async () => {
      let query = supabase
        .from("neurologic_intake_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (personaFilter !== "all") {
        query = query.eq("persona", personaFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from("neurologic_intake_leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neurologic-leads"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case "self": return <User className="h-4 w-4" />;
      case "parent": return <Baby className="h-4 w-4" />;
      case "professional": return <Stethoscope className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPersonaLabel = (persona: string) => {
    switch (persona) {
      case "self": return "Self";
      case "parent": return "Parent/Child";
      case "professional": return "Professional Referral";
      default: return persona;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      new: { variant: "destructive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      contacted: { variant: "secondary", icon: <Phone className="h-3 w-3 mr-1" /> },
      scheduled: { variant: "default", icon: <Calendar className="h-3 w-3 mr-1" /> },
      converted: { variant: "outline", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      archived: { variant: "outline", icon: <Archive className="h-3 w-3 mr-1" /> },
    };
    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string | null) => {
    if (!urgency) return null;
    const colors: Record<string, string> = {
      routine: "bg-slate-100 text-slate-700",
      soon: "bg-amber-100 text-amber-700",
      priority: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[urgency] || colors.routine}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </span>
    );
  };

  const newLeadsCount = leads?.filter(l => l.status === "new").length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Neurologic Intake Leads</h1>
          <p className="text-muted-foreground">
            Review and manage leads from the Concussion Pillar page
          </p>
        </div>
        <div className="flex items-center gap-2">
          {newLeadsCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {newLeadsCount} new
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Type:</span>
              <Select value={personaFilter} onValueChange={setPersonaFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="parent">Parent/Child</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
      ) : !leads?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className={lead.status === "new" ? "border-l-4 border-l-destructive" : ""}>
              <CardContent className="pt-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-sm font-medium bg-muted px-2 py-1 rounded">
                        {getPersonaIcon(lead.persona)}
                        {getPersonaLabel(lead.persona)}
                      </div>
                      {getStatusBadge(lead.status)}
                      {lead.urgency && lead.persona === "professional" && getUrgencyBadge(lead.urgency)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {(lead.name || lead.parent_name || lead.referrer_name) && (
                        <span className="font-medium">
                          {lead.name || lead.parent_name || lead.referrer_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                    </div>

                    {/* Details based on persona */}
                    <div className="text-sm space-y-1">
                      {lead.persona === "self" && (
                        <>
                          {lead.symptom_profile && (
                            <p><span className="text-muted-foreground">Symptoms:</span> {lead.symptom_profile}</p>
                          )}
                          {lead.duration && (
                            <p><span className="text-muted-foreground">Duration:</span> {lead.duration}</p>
                          )}
                        </>
                      )}
                      {lead.persona === "parent" && (
                        <>
                          {lead.child_name && (
                            <p><span className="text-muted-foreground">Child:</span> {lead.child_name} {lead.child_age && `(${lead.child_age})`}</p>
                          )}
                          {lead.symptom_location && (
                            <p><span className="text-muted-foreground">Symptoms at:</span> {lead.symptom_location}</p>
                          )}
                        </>
                      )}
                      {lead.persona === "professional" && (
                        <>
                          {lead.role && (
                            <p><span className="text-muted-foreground">Role:</span> {lead.role.toUpperCase()} {lead.organization && `at ${lead.organization}`}</p>
                          )}
                          {lead.patient_name && (
                            <p><span className="text-muted-foreground">Patient:</span> {lead.patient_name} {lead.patient_age && `(age ${lead.patient_age})`}</p>
                          )}
                          {lead.notes && (
                            <p><span className="text-muted-foreground">Notes:</span> {lead.notes}</p>
                          )}
                        </>
                      )}
                      {lead.primary_concern && (
                        <p className="mt-2 bg-muted/50 p-2 rounded text-sm">
                          <span className="text-muted-foreground">Concern:</span> {lead.primary_concern}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ id: lead.id, status: value as LeadStatus })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${lead.email}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NeurologicLeadsAdmin;
