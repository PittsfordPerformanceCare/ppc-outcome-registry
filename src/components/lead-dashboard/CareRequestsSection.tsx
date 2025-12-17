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
  MoreHorizontal, 
  ExternalLink, 
  UserPlus, 
  CheckCircle, 
  HelpCircle, 
  Archive,
  Clock,
  AlertTriangle,
  Calendar,
  Loader2,
  Users,
  Inbox
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface CareRequest {
  id: string;
  created_at: string;
  status: string;
  source: string;
  primary_complaint: string | null;
  assigned_clinician_id: string | null;
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

interface CareRequestsSectionProps {
  careRequests: CareRequest[];
  loading: boolean;
  onRefresh: () => void;
  hasLeadsAwaitingIntake?: boolean;
}

function getSourceBadge(source: string) {
  const src = (source || "").toLowerCase();
  
  if (src.includes("website") || src.includes("web")) {
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Website</Badge>;
  }
  if (src.includes("physician") || src.includes("referral") || src.includes("doctor")) {
    return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Physician Referral</Badge>;
  }
  if (src.includes("athlete") || src.includes("sport")) {
    return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Athlete Program</Badge>;
  }
  if (src.includes("school") || src.includes("community")) {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">School/Community</Badge>;
  }
  if (src.includes("internal") || src.includes("staff")) {
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Internal</Badge>;
  }
  if (src.includes("qualified") || src.includes("lead")) {
    return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Qualified Lead</Badge>;
  }
  return <Badge variant="outline">{source || "Unknown"}</Badge>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SUBMITTED":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Needs Review</Badge>;
    case "IN_REVIEW":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    case "AWAITING_CLARIFICATION":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Clarification</Badge>;
    case "APPROVED":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Ready for Conversion</Badge>;
    case "ASSIGNED":
      return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Assigned</Badge>;
    case "SCHEDULED":
      return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Scheduled</Badge>;
    case "CONVERTED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Converted</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getSLAIndicator(createdAt: string) {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 12) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Clock className="h-3 w-3" />
        &lt;12h
      </span>
    );
  }
  if (hoursAgo < 24) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600">
        <Clock className="h-3 w-3" />
        12-24h
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

export function CareRequestsSection({ 
  careRequests, 
  loading,
  onRefresh,
  hasLeadsAwaitingIntake
}: CareRequestsSectionProps) {
  const navigate = useNavigate();
  
  const sortedRequests = [...careRequests].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const oldestId = sortedRequests[0]?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading care requests...
      </div>
    );
  }

  if (sortedRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 text-muted-foreground/50" />
        {hasLeadsAwaitingIntake ? (
          <>
            <p className="font-medium">No Care Requests yet</p>
            <p className="text-sm text-center mt-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              You have new Leads awaiting intake.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">No care requests require action</p>
            <p className="text-sm">All care requests are processed.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[200px]">Patient</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>SLA</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRequests.map((request) => {
          const patientName = request.intake_payload?.patient_name || 
                              request.intake_payload?.name || 
                              "Unknown";
          const isOldest = request.id === oldestId;

          return (
            <TableRow 
              key={request.id}
              className={`cursor-pointer ${isOldest ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
              onClick={() => navigate(`/intake-review?selected=${request.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {isOldest && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {patientName}
                </div>
              </TableCell>
              <TableCell>{getSourceBadge(request.source)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-sm">
                {request.clinician?.full_name || (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{getSLAIndicator(request.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/intake-review?selected=${request.id}`);
                    }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Clinician
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigate("/admin-shell/registry");
                    }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Request Clarification
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => e.stopPropagation()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
