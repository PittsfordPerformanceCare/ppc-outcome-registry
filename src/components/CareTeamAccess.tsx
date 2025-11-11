import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Phone, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CareTeamAccessProps {
  patientId: string;
  episodeId?: string;
}

export default function CareTeamAccess({ patientId, episodeId }: CareTeamAccessProps) {
  const { toast } = useToast();
  const [messageSubject, setMessageSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [callbackMessage, setCallbackMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from("patient_messages")
        .insert({
          patient_id: patientId,
          episode_id: episodeId,
          message_type: "message",
          subject: messageSubject.trim() || "Message from patient",
          message: messageText.trim(),
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Your care team will respond soon",
      });

      setMessageSubject("");
      setMessageText("");
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleRequestCallback = async () => {
    if (!callbackMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please tell us what you'd like to discuss",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from("patient_messages")
        .insert({
          patient_id: patientId,
          episode_id: episodeId,
          message_type: "callback_request",
          subject: "Callback Request",
          message: callbackMessage.trim(),
        });

      if (error) throw error;

      toast({
        title: "Callback Requested!",
        description: "Your care team will call you back shortly",
      });

      setCallbackMessage("");
    } catch (error: any) {
      toast({
        title: "Failed to Request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Contact Your Care Team
        </CardTitle>
        <CardDescription>
          Get quick support from your clinician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="message" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="message" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </TabsTrigger>
            <TabsTrigger value="callback" className="gap-2">
              <Phone className="h-4 w-4" />
              Request Callback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="Brief topic..."
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                disabled={sending}
              />
            </div>
            <div>
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Hi, I have a question about..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                disabled={sending}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={sending || !messageText.trim()}
              className="w-full gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Message
            </Button>
          </TabsContent>

          <TabsContent value="callback" className="space-y-4">
            <div>
              <Label htmlFor="callback">What would you like to discuss?</Label>
              <Textarea
                id="callback"
                placeholder="I'd like to talk about my exercises..."
                value={callbackMessage}
                onChange={(e) => setCallbackMessage(e.target.value)}
                rows={5}
                disabled={sending}
              />
            </div>
            <Button 
              onClick={handleRequestCallback} 
              disabled={sending || !callbackMessage.trim()}
              className="w-full gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              Request Callback
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}