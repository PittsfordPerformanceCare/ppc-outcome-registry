import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, AlertCircle } from "lucide-react";
import { LeadsSection } from "./LeadsSection";
import { CareRequestsSection } from "./CareRequestsSection";

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

interface CareRequest {
  id: string;
  created_at: string;
  status: string;
  source: string;
  primary_complaint: string | null;
  assigned_clinician_id: string | null;
  lead_id?: string | null;
  intake_payload: {
    patient_name?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  clinician?: {
    full_name: string;
  } | null;
}

interface IntakeQueueProps {
  leads: Lead[];
  careRequests: CareRequest[];
  loading: boolean;
  onRefresh: () => void;
}

export function IntakeQueue({ leads, careRequests, loading, onRefresh }: IntakeQueueProps) {
  const [activeTab, setActiveTab] = useState("leads");
  
  // Filter leads that are actionable (not QUALIFIED or CLOSED)
  const actionableLeads = leads.filter(
    lead => !["QUALIFIED", "CLOSED"].includes(lead.lead_status || "")
  );
  
  // Count new leads specifically
  const newLeadsCount = leads.filter(lead => lead.lead_status === "new" || lead.lead_status === "NEW" || !lead.lead_status).length;
  
  // Filter actionable care requests
  const actionableCareRequests = careRequests.filter(
    cr => ["SUBMITTED", "IN_REVIEW", "AWAITING_CLARIFICATION", "APPROVED", "ASSIGNED"].includes(cr.status)
  );

  const hasNoActivity = actionableLeads.length === 0 && actionableCareRequests.length === 0;
  const hasLeadsButNoCareRequests = actionableLeads.length > 0 && actionableCareRequests.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Intake Queue
            </CardTitle>
            <CardDescription className="mt-1">
              Manage new leads and care requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {newLeadsCount > 0 && (
              <Badge variant="destructive" className="font-semibold">
                {newLeadsCount} New Lead{newLeadsCount !== 1 ? "s" : ""}
              </Badge>
            )}
            {actionableCareRequests.length > 0 && (
              <Badge variant="secondary" className="font-normal">
                {actionableCareRequests.length} Care Request{actionableCareRequests.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {hasNoActivity ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p className="font-medium">No intake activity at this time.</p>
            <p className="text-sm text-center mt-1">New leads and care requests will appear here.</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 border-b">
              <TabsList className="h-10 bg-transparent p-0 w-full justify-start gap-4">
                <TabsTrigger 
                  value="leads" 
                  className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <Users className="h-4 w-4 mr-2" />
                  New Leads
                  {actionableLeads.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                      {actionableLeads.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="care-requests"
                  className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Care Requests
                  {actionableCareRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {actionableCareRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="leads" className="m-0">
              <LeadsSection 
                leads={actionableLeads} 
                loading={loading} 
                onRefresh={onRefresh}
                hasLeadsButNoCareRequests={hasLeadsButNoCareRequests}
              />
            </TabsContent>
            
            <TabsContent value="care-requests" className="m-0">
              <CareRequestsSection 
                careRequests={actionableCareRequests} 
                loading={loading}
                onRefresh={onRefresh}
                hasLeadsAwaitingIntake={actionableLeads.length > 0}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
