import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Clock, User, FileText, CheckCircle, XCircle, 
  MessageSquare, ArrowRight, Loader2, AlertCircle 
} from "lucide-react";
import { CareRequestDetail } from "./CareRequestDetail";

interface CareRequest {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  admin_owner_id: string | null;
  assigned_clinician_id: string | null;
  source: string;
  intake_payload: Record<string, unknown>;
  primary_complaint: string | null;
  triage_notes: string | null;
  approval_reason: string | null;
  archive_reason: string | null;
  patient_id: string | null;
  episode_id: string | null;
  approved_at: string | null;
}

interface Clinician {
  id: string;
  full_name: string;
  clinician_name: string | null;
}

export function CareRequestsQueue() {
  const [careRequests, setCareRequests] = useState<CareRequest[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CareRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadCareRequests();
    loadClinicians();
  }, []);

  const loadCareRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("care_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Cast the data to handle Json type from Supabase
      const typedData = (data || []).map(item => ({
        ...item,
        intake_payload: item.intake_payload as Record<string, unknown>
      }));
      setCareRequests(typedData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load care requests: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadClinicians = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, clinician_name")
        .order("full_name");

      if (error) throw error;
      setClinicians(data || []);
    } catch (error) {
      console.error("Failed to load clinicians:", error);
    }
  };

  const handleAssignClinician = async (requestId: string, clinicianId: string) => {
    try {
      const { error } = await supabase
        .from("care_requests")
        .update({ 
          assigned_clinician_id: clinicianId,
          status: "IN_REVIEW",
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      // Log lifecycle event
      await supabase.from("lifecycle_events").insert({
        entity_type: "CARE_REQUEST",
        entity_id: requestId,
        event_type: "CLINICIAN_ASSIGNED",
        actor_type: "admin",
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: { clinician_id: clinicianId }
      });

      toast.success("Clinician assigned successfully");
      loadCareRequests();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to assign clinician: ${message}`);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string, reason?: string) => {
    try {
      const updateData: Record<string, unknown> = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === "ARCHIVED" && reason) {
        updateData.archive_reason = reason;
      }

      const { error } = await supabase
        .from("care_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Log lifecycle event
      await supabase.from("lifecycle_events").insert({
        entity_type: "CARE_REQUEST",
        entity_id: requestId,
        event_type: `STATUS_CHANGED_TO_${newStatus}`,
        actor_type: "admin",
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: { new_status: newStatus, reason }
      });

      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      loadCareRequests();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update status: ${message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }> = {
      SUBMITTED: { variant: "default", icon: Clock },
      IN_REVIEW: { variant: "secondary", icon: FileText },
      CLARIFICATION_REQUESTED: { variant: "outline", icon: MessageSquare },
      APPROVED_FOR_CARE: { variant: "secondary", icon: CheckCircle },
      ARCHIVED: { variant: "destructive", icon: XCircle }
    };

    const config = statusConfig[status] || { variant: "default" as const, icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      WEBSITE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      PHYSICIAN_REFERRAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      SCHOOL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      ATHLETE_PROGRAM: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      INTERNAL: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[source] || colors.INTERNAL}`}>
        {source.replace(/_/g, " ")}
      </span>
    );
  };

  const filteredRequests = careRequests.filter(req => 
    statusFilter === "all" || req.status === statusFilter
  );

  const pendingCount = careRequests.filter(r => r.status === "SUBMITTED").length;

  if (selectedRequest) {
    return (
      <CareRequestDetail
        request={selectedRequest}
        clinicians={clinicians}
        onBack={() => {
          setSelectedRequest(null);
          loadCareRequests();
        }}
        onAssignClinician={handleAssignClinician}
        onUpdateStatus={handleUpdateStatus}
        onRefresh={loadCareRequests}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Care Requests</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} awaiting review` : "All requests in progress"}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="CLARIFICATION_REQUESTED">Clarification Requested</SelectItem>
            <SelectItem value="APPROVED_FOR_CARE">Approved for Care</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No care requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const payload = request.intake_payload as Record<string, string>;
            const patientName = payload?.patient_name || payload?.legalName || "Unknown";
            const primaryComplaint = request.primary_complaint || payload?.chief_complaint || "Not specified";
            const assignedClinician = clinicians.find(c => c.id === request.assigned_clinician_id);

            return (
              <Card 
                key={request.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold truncate">{patientName}</span>
                        {getStatusBadge(request.status)}
                        {getSourceBadge(request.source)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {primaryComplaint}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Submitted {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {assignedClinician && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assignedClinician.clinician_name || assignedClinician.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-4">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
