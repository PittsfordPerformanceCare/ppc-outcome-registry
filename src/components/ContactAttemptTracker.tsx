import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, Plus, Clock, CalendarIcon, Pause, Play } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContactAttempt {
  id: string;
  attempt_number: number;
  method: string;
  notes: string | null;
  contacted_at: string;
}

interface ContactAttemptTrackerProps {
  leadId: string;
  leadStatus: string;
  contactAttemptCount: number;
  nextFollowUpDate: string | null;
  lastContactedAt: string | null;
  attempts: ContactAttempt[];
  onUpdate: () => void;
}

export function ContactAttemptTracker({
  leadId,
  leadStatus,
  contactAttemptCount,
  nextFollowUpDate,
  lastContactedAt,
  attempts,
  onUpdate
}: ContactAttemptTrackerProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [method, setMethod] = useState<string>("phone");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleLogAttempt = async () => {
    if (!method) {
      toast.error("Please select a contact method");
      return;
    }

    setSaving(true);
    try {
      const newAttemptCount = contactAttemptCount + 1;
      const today = new Date();
      
      // Calculate next follow-up based on attempt count
      let newNextFollowUp: Date | null = null;
      let newStatus = "attempting";

      if (newAttemptCount === 1) {
        // First attempt: follow up in 3 days
        newNextFollowUp = addDays(today, 3);
      } else if (newAttemptCount === 2) {
        // Second attempt: follow up in 7 days
        newNextFollowUp = addDays(today, 7);
      } else if (newAttemptCount === 3) {
        // Third attempt: show pause dialog
        setShowPauseDialog(true);
        setSaving(false);
        return;
      }

      // Insert contact attempt record
      const { error: attemptError } = await supabase
        .from("lead_contact_attempts")
        .insert({
          lead_id: leadId,
          attempt_number: newAttemptCount,
          method,
          notes: notes || null,
          contacted_at: new Date().toISOString()
        });

      if (attemptError) throw attemptError;

      // Update lead with new count, status, and next follow-up
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          contact_attempt_count: newAttemptCount,
          last_contacted_at: new Date().toISOString(),
          next_follow_up_date: newNextFollowUp ? format(newNextFollowUp, "yyyy-MM-dd") : null,
          lead_status: newStatus
        })
        .eq("id", leadId);

      if (leadError) throw leadError;

      toast.success(`Contact attempt logged. Next follow-up: ${newNextFollowUp ? format(newNextFollowUp, "MMM d") : "Not set"}`);
      setShowLogForm(false);
      setNotes("");
      onUpdate();
    } catch (error) {
      console.error("Error logging contact attempt:", error);
      toast.error("Failed to log contact attempt");
    } finally {
      setSaving(false);
    }
  };

  const handleThirdAttemptDecision = async (pause: boolean) => {
    setSaving(true);
    try {
      const today = new Date();
      let newStatus: string;
      let newNextFollowUp: Date;

      if (pause) {
        newStatus = "paused";
        newNextFollowUp = addDays(today, 30);
      } else {
        newStatus = "attempting";
        newNextFollowUp = customDate || addDays(today, 7);
      }

      // Insert the third contact attempt
      const { error: attemptError } = await supabase
        .from("lead_contact_attempts")
        .insert({
          lead_id: leadId,
          attempt_number: 3,
          method,
          notes: notes || null,
          contacted_at: new Date().toISOString()
        });

      if (attemptError) throw attemptError;

      // Update lead
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          contact_attempt_count: 3,
          last_contacted_at: new Date().toISOString(),
          next_follow_up_date: format(newNextFollowUp, "yyyy-MM-dd"),
          lead_status: newStatus
        })
        .eq("id", leadId);

      if (leadError) throw leadError;

      toast.success(
        pause 
          ? `Lead paused for 30 days. Will reappear on ${format(newNextFollowUp, "MMM d")}` 
          : `Next follow-up set for ${format(newNextFollowUp, "MMM d")}`
      );
      
      setShowPauseDialog(false);
      setShowLogForm(false);
      setNotes("");
      setCustomDate(undefined);
      onUpdate();
    } catch (error) {
      console.error("Error processing third attempt:", error);
      toast.error("Failed to process contact attempt");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFollowUpDate = async (date: Date) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          next_follow_up_date: format(date, "yyyy-MM-dd")
        })
        .eq("id", leadId);

      if (error) throw error;
      toast.success(`Follow-up date updated to ${format(date, "MMM d, yyyy")}`);
      setShowDatePicker(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating follow-up date:", error);
      toast.error("Failed to update follow-up date");
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "new":
        return { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "attempting":
        return { label: "Attempting Contact", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "scheduled":
        return { label: "Scheduled", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "paused":
        return { label: "Paused", className: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
      default:
        return { label: status, className: "bg-muted text-muted-foreground" };
    }
  };

  const statusConfig = getStatusBadgeConfig(leadStatus);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Attempts
            </CardTitle>
            <Badge className={statusConfig.className}>
              {leadStatus === "paused" && <Pause className="h-3 w-3 mr-1" />}
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status & Follow-up Info */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Attempts: <strong className="text-foreground">{contactAttemptCount}</strong></span>
            </div>
            {lastContactedAt && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>Last: <strong className="text-foreground">{format(new Date(lastContactedAt), "MMM d, h:mm a")}</strong></span>
              </div>
            )}
          </div>

          {/* Next Follow-up with edit */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Next Follow-Up:</span>
              <span className="font-medium">
                {nextFollowUpDate 
                  ? format(new Date(nextFollowUpDate), "MMM d, yyyy")
                  : "Not set"
                }
              </span>
            </div>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Edit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={nextFollowUpDate ? new Date(nextFollowUpDate) : undefined}
                  onSelect={(date) => date && handleUpdateFollowUpDate(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Attempt History */}
          {attempts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">History</p>
              <div className="space-y-1.5">
                {attempts.map((attempt) => (
                  <div 
                    key={attempt.id} 
                    className="flex items-center gap-3 text-sm p-2 bg-background border rounded-md"
                  >
                    <Badge variant="outline" className="text-xs">
                      #{attempt.attempt_number}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {attempt.method === "phone" ? (
                        <Phone className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Mail className="h-3 w-3 text-blue-600" />
                      )}
                      <span className="capitalize">{attempt.method}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(attempt.contacted_at), "MMM d, h:mm a")}
                    </span>
                    {attempt.notes && (
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        — {attempt.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Form */}
          {showLogForm ? (
            <div className="space-y-3 pt-2 border-t">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleLogAttempt} 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Log Attempt"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowLogForm(false);
                    setNotes("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowLogForm(true)}
            >
              <Plus className="h-4 w-4" />
              Log Contact Attempt
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Third Attempt Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>3 Contact Attempts Made</DialogTitle>
            <DialogDescription>
              You've attempted to reach this lead 3 times without success. Would you like to pause this lead for 30 days?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Pause className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium">Pause for 30 days</p>
                <p className="text-sm text-muted-foreground">
                  Lead will appear in "Ready to Rewarm" on {format(addDays(new Date(), 30), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">— or —</div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Set a custom follow-up date:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={setCustomDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => handleThirdAttemptDecision(false)}
              disabled={saving}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Keep Active {customDate ? `(${format(customDate, "MMM d")})` : ""}
            </Button>
            <Button 
              onClick={() => handleThirdAttemptDecision(true)}
              disabled={saving}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Yes, Pause for 30 Days
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
