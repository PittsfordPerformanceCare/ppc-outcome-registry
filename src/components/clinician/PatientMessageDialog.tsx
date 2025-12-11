import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessageSquare, Phone, User, Calendar, Loader2, Send, CheckCircle2 } from "lucide-react";

interface PatientMessage {
  id: string;
  patient_id: string;
  episode_id: string | null;
  message_type: string;
  subject: string | null;
  message: string;
  status: string;
  clinician_response: string | null;
  responded_at: string | null;
  created_at: string;
}

interface PatientMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string | null;
  onMessageHandled?: () => void;
}

export function PatientMessageDialog({
  open,
  onOpenChange,
  messageId,
  onMessageHandled,
}: PatientMessageDialogProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState<PatientMessage | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (open && messageId) {
      loadMessage();
    }
  }, [open, messageId]);

  const loadMessage = async () => {
    if (!messageId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patient_messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (error) throw error;
      setMessage(data);

      // Get patient name
      if (data?.patient_id) {
        const { data: patientData } = await supabase
          .from("patient_accounts")
          .select("full_name")
          .eq("id", data.patient_id)
          .single();
        
        if (patientData?.full_name) {
          setPatientName(patientData.full_name);
        }
      }
    } catch (error: any) {
      console.error("Error loading message:", error);
      toast({
        title: "Error",
        description: "Failed to load message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!message || !response.trim()) return;

    setResponding(true);
    try {
      const { error } = await supabase
        .from("patient_messages")
        .update({
          clinician_response: response.trim(),
          responded_at: new Date().toISOString(),
          status: "responded",
        })
        .eq("id", message.id);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been recorded",
      });

      setResponse("");
      onMessageHandled?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  const handleMarkAsHandled = async () => {
    if (!message) return;

    setResponding(true);
    try {
      const { error } = await supabase
        .from("patient_messages")
        .update({
          status: "responded",
          responded_at: new Date().toISOString(),
        })
        .eq("id", message.id);

      if (error) throw error;

      toast({
        title: "Marked as Handled",
        description: "Message has been marked as responded",
      });

      onMessageHandled?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {message?.message_type === "callback_request" ? (
              <>
                <Phone className="h-5 w-5 text-amber-500" />
                Callback Request
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 text-primary" />
                Patient Message
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {patientName && `From ${patientName}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : message ? (
          <div className="space-y-4">
            {/* Message Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <Badge variant={message.status === "pending" ? "secondary" : "default"}>
                {message.status === "pending" ? "Pending" : "Responded"}
              </Badge>
              {message.message_type === "callback_request" && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">
                  Callback
                </Badge>
              )}
            </div>

            {/* Subject */}
            {message.subject && (
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{message.subject}</p>
              </div>
            )}

            {/* Message Content */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>

            {/* Existing Response */}
            {message.clinician_response && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Your Response</span>
                  {message.responded_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.responded_at), "MMM d 'at' h:mm a")}
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.clinician_response}</p>
              </div>
            )}

            {/* Response Form (only if not already responded) */}
            {message.status === "pending" && (
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label htmlFor="response">Your Response (Optional)</Label>
                  <Textarea
                    id="response"
                    placeholder="Add a note or response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={3}
                    disabled={responding}
                  />
                </div>
                <div className="flex gap-2">
                  {response.trim() ? (
                    <Button
                      onClick={handleSendResponse}
                      disabled={responding}
                      className="flex-1 gap-2"
                    >
                      {responding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Response
                    </Button>
                  ) : (
                    <Button
                      onClick={handleMarkAsHandled}
                      disabled={responding}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      {responding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Mark as Handled
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Message not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
