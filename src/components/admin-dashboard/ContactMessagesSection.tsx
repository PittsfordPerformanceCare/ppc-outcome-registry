import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, Clock, Check, Eye, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function ContactMessagesSection() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status,
          reviewed_at: status !== 'new' ? new Date().toISOString() : null,
          notes: notes || null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Message marked as ${status}`
      });

      fetchMessages();
      setSelectedMessage(null);
      setNotes("");
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNotes(message.notes || "");
  };

  const newCount = messages.filter(m => m.status === 'new').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Only show if there are messages
  if (messages.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Reviewed</Badge>;
      case 'responded':
        return <Badge variant="outline" className="border-green-500 text-green-600">Responded</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Contact Messages</CardTitle>
                <CardDescription>
                  Messages from the website contact form
                </CardDescription>
              </div>
            </div>
            {newCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {newCount} new
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.slice(0, 5).map((message) => (
              <div
                key={message.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => openMessage(message)}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{message.name}</span>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {message.message}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {message.email}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {messages.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{messages.length - 5} more messages
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Message from {selectedMessage?.name}
              {selectedMessage && getStatusBadge(selectedMessage.status)}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {selectedMessage.email}
                </a>
                {selectedMessage.phone && (
                  <a 
                    href={`tel:${selectedMessage.phone}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {selectedMessage.phone}
                  </a>
                )}
              </div>

              {/* Message */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this message..."
                  rows={3}
                />
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Select
                  defaultValue={selectedMessage.status}
                  onValueChange={(value) => updateStatus(selectedMessage.id, value)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="default"
                  onClick={() => updateStatus(selectedMessage.id, 'responded')}
                  disabled={updating}
                  className="gap-2"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Mark Responded
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
