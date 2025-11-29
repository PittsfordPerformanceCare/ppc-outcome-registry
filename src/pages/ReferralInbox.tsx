import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle, Baby, Mail, Phone, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type ReferralInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  care_for: 'self' | 'child';
  chief_complaint: string;
  referral_source: string | null;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  reviewed_at: string | null;
  decline_reason: string | null;
};

export default function ReferralInbox() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ReferralInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ReferralInquiry | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    loadInquiries();

    const channel = supabase
      .channel('referral-inquiries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_inquiries',
        },
        () => {
          loadInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries((data || []) as ReferralInquiry[]);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast({
        variant: "destructive",
        title: "Error loading inquiries",
        description: "Please refresh the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (inquiry: ReferralInquiry) => {
    setIsApproving(true);
    try {
      // Update status
      const { error: updateError } = await supabase
        .from('referral_inquiries')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', inquiry.id);

      if (updateError) throw updateError;

      // Send approval email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-referral-approval', {
        body: {
          inquiryId: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Inquiry Approved",
        description: `${inquiry.name} has been sent the intake form.`,
      });

      setSelectedInquiry(null);
    } catch (error) {
      console.error('Error approving inquiry:', error);
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: "Please try again.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedInquiry) return;
    
    setIsDeclining(true);
    try {
      // Update status
      const { error: updateError } = await supabase
        .from('referral_inquiries')
        .update({
          status: 'declined',
          reviewed_at: new Date().toISOString(),
          decline_reason: declineReason,
        })
        .eq('id', selectedInquiry.id);

      if (updateError) throw updateError;

      // Send decline email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-referral-decline', {
        body: {
          inquiryId: selectedInquiry.id,
          name: selectedInquiry.name,
          email: selectedInquiry.email,
          declineReason,
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Inquiry Declined",
        description: `${selectedInquiry.name} has been notified.`,
      });

      setSelectedInquiry(null);
      setShowDeclineDialog(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Error declining inquiry:', error);
      toast({
        variant: "destructive",
        title: "Decline failed",
        description: "Please try again.",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const InquiryCard = ({ inquiry }: { inquiry: ReferralInquiry }) => (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedInquiry(inquiry)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {inquiry.care_for === 'self' ? (
                <UserCircle className="h-5 w-5" />
              ) : (
                <Baby className="h-5 w-5" />
              )}
              {inquiry.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={
            inquiry.status === 'pending' ? 'default' :
            inquiry.status === 'approved' ? 'default' :
            'secondary'
          }>
            {inquiry.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {inquiry.chief_complaint}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {inquiry.email}
          </span>
          {inquiry.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {inquiry.phone}
            </span>
          )}
        </div>
        {inquiry.referral_source && (
          <Badge variant="outline" className="text-xs">
            Via: {inquiry.referral_source}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  const pendingInquiries = inquiries.filter(i => i.status === 'pending');
  const approvedInquiries = inquiries.filter(i => i.status === 'approved');
  const declinedInquiries = inquiries.filter(i => i.status === 'declined');

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Referral Inquiry Inbox</h1>
          <p className="text-muted-foreground">
            Review and respond to prospective patient screening inquiries
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="declined">
              Declined ({declinedInquiries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : pendingInquiries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending inquiries</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingInquiries.map(inquiry => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedInquiries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved inquiries</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvedInquiries.map(inquiry => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="declined" className="space-y-4">
            {declinedInquiries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No declined inquiries</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {declinedInquiries.map(inquiry => (
                  <InquiryCard key={inquiry.id} inquiry={inquiry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {selectedInquiry.care_for === 'self' ? (
                    <UserCircle className="h-6 w-6" />
                  ) : (
                    <Baby className="h-6 w-6" />
                  )}
                  {selectedInquiry.name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Submitted {formatDistanceToNow(new Date(selectedInquiry.created_at), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedInquiry.email}
                    </p>
                    {selectedInquiry.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedInquiry.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Seeking Care For</Label>
                  <p className="mt-1 text-sm capitalize">{selectedInquiry.care_for === 'self' ? 'Themselves' : 'Their child'}</p>
                </div>

                <div>
                  <Label>Chief Complaint</Label>
                  <p className="mt-1 text-sm">{selectedInquiry.chief_complaint}</p>
                </div>

                {selectedInquiry.referral_source && (
                  <div>
                    <Label>Referral Source</Label>
                    <p className="mt-1 text-sm">{selectedInquiry.referral_source}</p>
                  </div>
                )}

                {selectedInquiry.status === 'declined' && selectedInquiry.decline_reason && (
                  <div>
                    <Label>Decline Reason</Label>
                    <p className="mt-1 text-sm">{selectedInquiry.decline_reason}</p>
                  </div>
                )}
              </div>

              {selectedInquiry.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeclineDialog(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedInquiry)}
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Send Intake
                      </>
                    )}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Decline Dialog */}
        <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Inquiry</DialogTitle>
              <DialogDescription>
                Provide a brief recommendation or reason for declining
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="declineReason">Recommendation</Label>
                <Textarea
                  id="declineReason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="We recommend seeking care from a specialist in..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDecline} disabled={isDeclining}>
                {isDeclining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Send Decline Message'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
