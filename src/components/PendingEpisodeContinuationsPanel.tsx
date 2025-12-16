import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  Clock, 
  User, 
  Stethoscope,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PendingContinuation {
  id: string;
  source_episode_id: string;
  patient_name: string;
  clinician_name: string | null;
  continuation_source: "documented" | "newly_identified";
  primary_complaint: string;
  category: string;
  documented_complaint_ref: string | null;
  outcome_tools_suggestion: string[] | null;
  status: "pending" | "setup_complete" | "cancelled";
  created_at: string;
  notes: string | null;
}

export function PendingEpisodeContinuationsPanel() {
  const [continuations, setContinuations] = useState<PendingContinuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingContinuation | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [newEpisodeId, setNewEpisodeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchContinuations = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_episode_continuations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setContinuations((data as PendingContinuation[]) || []);
    } catch (error: any) {
      console.error("Error fetching continuations:", error);
      toast.error("Failed to load pending continuations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContinuations();
  }, []);

  const handleSetupClick = (item: PendingContinuation) => {
    setSelectedItem(item);
    setNewEpisodeId("");
    setSetupDialogOpen(true);
  };

  const handleCompleteSetup = async () => {
    if (!selectedItem || !newEpisodeId.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("pending_episode_continuations")
        .update({
          status: "setup_complete",
          created_episode_id: newEpisodeId.trim(),
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success("Episode continuation setup complete");
      setSetupDialogOpen(false);
      setSelectedItem(null);
      fetchContinuations();
    } catch (error: any) {
      console.error("Error completing setup:", error);
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MSK: "bg-blue-100 text-blue-800 border-blue-200",
      Neuro: "bg-purple-100 text-purple-800 border-purple-200",
      Vestibular: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Performance: "bg-green-100 text-green-800 border-green-200",
      Concussion: "bg-amber-100 text-amber-800 border-amber-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || colors.Other;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Episodes Requiring Follow-On Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                New Episode Setup Required
              </CardTitle>
              <CardDescription>
                Action needed — create continuation episodes
              </CardDescription>
            </div>
            {continuations.length > 0 && (
              <Badge className="text-lg px-3 py-1 bg-primary text-primary-foreground">
                {continuations.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {continuations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mb-3" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                No pending episode continuations
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {continuations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{item.patient_name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getCategoryColor(item.category))}
                          >
                            {item.category}
                          </Badge>
                        </div>

                        <p className="text-sm text-foreground">
                          <span className="font-medium">Primary Concern:</span> {item.primary_complaint}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.clinician_name && (
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {item.clinician_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.continuation_source === "documented" ? (
                              <><FileText className="h-3 w-3 mr-1" /> Documented</>
                            ) : (
                              <><Plus className="h-3 w-3 mr-1" /> New Concern</>
                            )}
                          </Badge>
                        </div>

                        {item.outcome_tools_suggestion && item.outcome_tools_suggestion.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Suggested tools:</span>
                            {item.outcome_tools_suggestion.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleSetupClick(item)}
                        className="shrink-0"
                      >
                        Create Episode
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Setup Completion Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Episode Setup</DialogTitle>
            <DialogDescription>
              Enter the ID of the newly created episode for {selectedItem?.patient_name}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(selectedItem.category)}>
                    {selectedItem.category}
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.continuation_source === "documented" ? "Documented" : "New Concern"}
                  </Badge>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Primary Complaint:</span>{" "}
                  {selectedItem.primary_complaint}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Source Episode:</span>{" "}
                  {selectedItem.source_episode_id}
                </p>
                {selectedItem.outcome_tools_suggestion && selectedItem.outcome_tools_suggestion.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Suggested Outcome Tools:</span>{" "}
                    {selectedItem.outcome_tools_suggestion.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeId">New Episode ID *</Label>
                <Input
                  id="episodeId"
                  placeholder="Enter the episode ID you created"
                  value={newEpisodeId}
                  onChange={(e) => setNewEpisodeId(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Ensure the new episode has the correct outcome tools attached based on the category. 
                  Do not carry forward outcome measures from the discharged episode.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSetup} 
              disabled={submitting || !newEpisodeId.trim()}
            >
              {submitting ? "Completing..." : "Mark Setup Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}