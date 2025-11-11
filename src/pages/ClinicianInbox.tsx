import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Phone, MessageCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PatientMessage {
  id: string;
  patient_id: string;
  episode_id: string | null;
  subject: string;
  message: string;
  status: string;
  clinician_response: string | null;
  responded_at: string | null;
  created_at: string;
  message_type: string;
}

interface CallbackRequest {
  id: string;
  patient_id: string;
  episode_id: string | null;
  subject: string;
  message: string;
  status: string;
  clinician_response: string | null;
  responded_at: string | null;
  created_at: string;
  message_type: string;
}

export default function ClinicianInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<PatientMessage | null>(null);
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [callbackNotes, setCallbackNotes] = useState("");

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["patient-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_messages")
        .select(`
          *,
          patient_accounts!patient_messages_patient_id_fkey (full_name, email, phone),
          episodes (patient_name, region, clinician)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PatientMessage[];
    },
    enabled: !!user,
  });

  // Fetch callback requests (they're also in patient_messages with message_type='callback_request')
  const { data: callbacks = [], isLoading: callbacksLoading } = useQuery({
    queryKey: ["callback-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_messages")
        .select(`
          *,
          patient_accounts!patient_messages_patient_id_fkey (full_name, email, phone),
          episodes (patient_name, region, clinician)
        `)
        .eq("message_type", "callback_request")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CallbackRequest[];
    },
    enabled: !!user,
  });

  // Respond to message mutation
  const respondMutation = useMutation({
    mutationFn: async ({ messageId, response }: { messageId: string; response: string }) => {
      const { error } = await supabase
        .from("patient_messages")
        .update({
          status: "responded",
          clinician_response: response,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
        })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-messages"] });
      toast.success("Response sent successfully");
      setSelectedMessage(null);
      setResponseText("");
    },
    onError: () => {
      toast.error("Failed to send response");
    },
  });

  // Update callback status mutation
  const updateCallbackMutation = useMutation({
    mutationFn: async ({
      callbackId,
      status,
      notes,
    }: {
      callbackId: string;
      status: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("patient_messages")
        .update({
          status,
          clinician_response: notes,
          responded_at: status === "contacted" ? new Date().toISOString() : null,
          responded_by: user?.id,
        })
        .eq("id", callbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callback-requests"] });
      toast.success("Callback request updated");
      setSelectedCallback(null);
      setCallbackNotes("");
    },
    onError: () => {
      toast.error("Failed to update callback request");
    },
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const pendingCallbacks = callbacks.filter((c) => c.status === "pending").length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      unread: "default",
      read: "secondary",
      responded: "outline",
      pending: "default",
      contacted: "secondary",
      completed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clinician Inbox</h1>
        <p className="text-muted-foreground">
          Manage patient messages, callback requests, and feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Callbacks</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCallbacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">
            Messages {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="callbacks">
            Callback Requests {pendingCallbacks > 0 && `(${pendingCallbacks})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Messages</CardTitle>
              <CardDescription>View and respond to patient messages</CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <p className="text-muted-foreground">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground">No messages yet</p>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <Card
                        key={message.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedMessage(message)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {message.patient_accounts?.full_name || "Unknown Patient"}
                                </h4>
                                {getStatusBadge(message.status)}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {message.subject}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(message.created_at), "MMM d, yyyy h:mm a")}
                                </span>
                                {message.episodes && (
                                  <span>Episode: {message.episodes.patient_name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {selectedMessage && (
            <Card>
              <CardHeader>
                <CardTitle>Respond to Message</CardTitle>
                <CardDescription>
                  From: {(selectedMessage as any).patient_accounts?.full_name} -{" "}
                  {(selectedMessage as any).patient_accounts?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subject: {selectedMessage.subject}</h4>
                  <p className="text-sm mb-4">{selectedMessage.message}</p>
                </div>
                {selectedMessage.clinician_response ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Your Response:</p>
                    <p className="text-sm">{selectedMessage.clinician_response}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded on{" "}
                      {selectedMessage.responded_at &&
                        format(new Date(selectedMessage.responded_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder="Type your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={5}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          respondMutation.mutate({
                            messageId: selectedMessage.id,
                            response: responseText,
                          })
                        }
                        disabled={!responseText.trim() || respondMutation.isPending}
                      >
                        Send Response
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedMessage(null);
                          setResponseText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="callbacks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Callback Requests</CardTitle>
              <CardDescription>Manage patient callback requests</CardDescription>
            </CardHeader>
            <CardContent>
              {callbacksLoading ? (
                <p className="text-muted-foreground">Loading callback requests...</p>
              ) : callbacks.length === 0 ? (
                <p className="text-muted-foreground">No callback requests yet</p>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {callbacks.map((callback: any) => (
                      <Card
                        key={callback.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedCallback(callback)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {callback.patient_accounts?.full_name || "Unknown Patient"}
                                </h4>
                                {getStatusBadge(callback.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{callback.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(callback.created_at), "MMM d, yyyy h:mm a")}
                                </span>
                                <span>Phone: {callback.patient_accounts?.phone || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {selectedCallback && (
            <Card>
              <CardHeader>
                <CardTitle>Update Callback Request</CardTitle>
                <CardDescription>
                  Patient: {(selectedCallback as any).patient_accounts?.full_name} -{" "}
                  {(selectedCallback as any).patient_accounts?.phone}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Reason for callback:</h4>
                  <p className="text-sm mb-2">{selectedCallback.message}</p>
                </div>
                {selectedCallback.clinician_response ? (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Notes:</p>
                    <p className="text-sm">{selectedCallback.clinician_response}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {selectedCallback.status}
                      {selectedCallback.responded_at &&
                        ` - Contacted on ${format(
                          new Date(selectedCallback.responded_at),
                          "MMM d, yyyy h:mm a"
                        )}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder="Add notes about the callback..."
                      value={callbackNotes}
                      onChange={(e) => setCallbackNotes(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          updateCallbackMutation.mutate({
                            callbackId: selectedCallback.id,
                            status: "contacted",
                            notes: callbackNotes,
                          })
                        }
                        disabled={!callbackNotes.trim() || updateCallbackMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Contacted
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateCallbackMutation.mutate({
                            callbackId: selectedCallback.id,
                            status: "completed",
                            notes: callbackNotes || "Completed",
                          })
                        }
                        disabled={updateCallbackMutation.isPending}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCallback(null);
                          setCallbackNotes("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
