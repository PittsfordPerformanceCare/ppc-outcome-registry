import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskSummary } from "@/hooks/useCommunicationTasks";
import { ClipboardList, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function OutstandingTasksTile() {
  const navigate = useNavigate();
  const { summary, isLoading } = useTaskSummary();

  // Don't show if no outstanding tasks
  if (!isLoading && summary.total === 0) {
    return null;
  }

  const groups = [
    { label: "Waiting on Clinician", count: summary.waitingOnClinician },
    { label: "Waiting on Patient", count: summary.waitingOnPatient },
    { label: "In Progress", count: summary.inProgress },
    { label: "Blocked", count: summary.blocked, isBlocked: true },
    { label: "Open", count: summary.open },
  ].filter(g => g.count > 0);

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
      onClick={() => navigate("/admin/clinician-queues")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span>Outstanding Communication Tasks</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {groups.map((group) => (
              <li 
                key={group.label} 
                className={`flex items-center gap-2 ${group.isBlocked ? "text-amber-600" : "text-muted-foreground"}`}
              >
                <span className="text-foreground font-medium">{group.count}</span>
                <span>{group.label}</span>
              </li>
            ))}
          </ul>
        )}
        
        {summary.recentlyCompleted > 0 && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-emerald-600">
            <Clock className="h-3 w-3" />
            <span>{summary.recentlyCompleted} completed recently</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
