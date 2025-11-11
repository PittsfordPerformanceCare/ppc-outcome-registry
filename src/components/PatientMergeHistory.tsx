import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, User, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface MergeAuditLog {
  id: string;
  created_at: string;
  user_id: string;
  old_data: {
    merged_patients: Array<{
      patient_name: string;
      date_of_birth: string;
      episode_ids: string[];
      episode_count: number;
    }>;
    total_episodes_affected: number;
  };
  new_data: {
    primary_patient: {
      patient_name: string;
      date_of_birth: string;
      total_episodes: number;
    };
    episode_ids_updated: string[];
  };
}

interface UserProfile {
  full_name: string;
  email: string;
}

export function PatientMergeHistory() {
  const [mergeHistory, setMergeHistory] = useState<MergeAuditLog[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMergeHistory();
  }, []);

  const loadMergeHistory = async () => {
    setIsLoading(true);
    try {
      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("action", "patient_merge")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedLogs = logs as unknown as MergeAuditLog[];
      setMergeHistory(typedLogs);

      // Load user profiles for all unique user IDs
      const userIds = [...new Set(logs?.map((log) => log.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profileError) throw profileError;

        const profileMap: Record<string, UserProfile> = {};
        profiles?.forEach((profile) => {
          profileMap[profile.id] = {
            full_name: profile.full_name || profile.email || "Unknown User",
            email: profile.email || "",
          };
        });
        setUserProfiles(profileMap);
      }
    } catch (error) {
      console.error("Error loading merge history:", error);
      toast.error("Failed to load merge history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDOB = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Patient Merge History
        </CardTitle>
        <CardDescription>
          Complete audit trail of all patient record merges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading merge history...
          </div>
        ) : mergeHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No patient merges have been performed yet
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {mergeHistory.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          Merged into: {log.new_data.primary_patient.patient_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(log.created_at)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {userProfiles[log.user_id]?.full_name || "Unknown User"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {log.old_data.total_episodes_affected} episodes merged
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            View Details
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        {/* Primary Patient Info */}
                        <div className="rounded-lg border bg-primary/5 p-3">
                          <h4 className="font-semibold text-sm mb-2">Primary Patient (Kept)</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {log.new_data.primary_patient.patient_name}
                            </p>
                            <p>
                              <span className="font-medium">DOB:</span>{" "}
                              {formatDOB(log.new_data.primary_patient.date_of_birth)}
                            </p>
                            <p>
                              <span className="font-medium">Total Episodes:</span>{" "}
                              {log.new_data.primary_patient.total_episodes}
                            </p>
                          </div>
                        </div>

                        {/* Merged Patients */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">
                            Merged Records ({log.old_data.merged_patients.length})
                          </h4>
                          {log.old_data.merged_patients.map((patient, index) => (
                            <div
                              key={index}
                              className="rounded-lg border bg-muted/50 p-3 text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <p className="font-medium">{patient.patient_name}</p>
                                  <p className="text-muted-foreground">
                                    DOB: {formatDOB(patient.date_of_birth)}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {patient.episode_count} episode{patient.episode_count !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                Episode IDs: {patient.episode_ids.slice(0, 3).join(", ")}
                                {patient.episode_ids.length > 3 && ` +${patient.episode_ids.length - 3} more`}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Episode IDs Updated */}
                        <div className="rounded-lg border bg-muted/50 p-3">
                          <h4 className="font-semibold text-sm mb-2">
                            Episodes Updated ({log.new_data.episode_ids_updated.length})
                          </h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {log.new_data.episode_ids_updated.slice(0, 5).map((id) => (
                              <div key={id} className="font-mono">
                                {id}
                              </div>
                            ))}
                            {log.new_data.episode_ids_updated.length > 5 && (
                              <div className="text-center pt-1">
                                +{log.new_data.episode_ids_updated.length - 5} more episodes
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
