import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle, Baby, Mail, Phone, Clock, CheckCircle, XCircle, Loader2, Activity, Building, Stethoscope } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type NeurologicLead = {
  id: string;
  email: string;
  persona: string;
  name: string | null;
  phone: string | null;
  primary_concern: string | null;
  symptom_profile: string | null;
  duration: string | null;
  parent_name: string | null;
  child_name: string | null;
  child_age: string | null;
  symptom_location: string | null;
  referrer_name: string | null;
  role: string | null;
  organization: string | null;
  patient_name: string | null;
  patient_age: string | null;
  urgency: string | null;
  notes: string | null;
  source: string | null;
  status: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

type ReferralInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  care_for: 'self' | 'child';
  chief_complaint: string;
  referral_source: string | null;
  status: 'prospect_awaiting_review' | 'approved' | 'declined' | 'scheduled' | 'converted';
  created_at: string;
  reviewed_at: string | null;
  decline_reason: string | null;
};

export default function ReferralInbox() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ReferralInquiry[]>([]);
  const [neurologicLeads, setNeurologicLeads] = useState<NeurologicLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ReferralInquiry | null>(null);
  const [selectedLead, setSelectedLead] = useState<NeurologicLead | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  useEffect(() => {
    loadInquiries();
    loadNeurologicLeads();

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

    const neuroChannel = supabase
      .channel('neurologic-leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'neurologic_intake_leads',
        },
        () => {
          loadNeurologicLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(neuroChannel);
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

  const loadNeurologicLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('neurologic_intake_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNeurologicLeads((data || []) as NeurologicLead[]);
    } catch (error) {
      console.error('Error loading neurologic leads:', error);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setIsUpdatingLead(true);
    try {
      const { error } = await supabase
        .from('neurologic_intake_leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Lead status changed to ${newStatus}`,
      });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Please try again.",
      });
    } finally {
      setIsUpdatingLead(false);
    }
  };

  const handleApprove = async (inquiry: ReferralInquiry) => {
    setIsApproving(true);
    try {
      // Get current user and clinic info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      // Classify the episode type and body region from chief complaint
      const { classifyEpisode } = await import('@/lib/episodeClassification');
      const classification = classifyEpisode(inquiry.chief_complaint);

      // Create pre-episode shell
      const { data: pendingEpisode, error: pendingError } = await supabase
        .from('pending_episodes')
        .insert({
          referral_inquiry_id: inquiry.id,
          patient_name: inquiry.name,
          complaint_text: inquiry.chief_complaint,
          complaint_category: classification.bodyRegion || 'General',
          complaint_priority: 2, // Medium priority by default
          episode_type: classification.episodeType,
          body_region: classification.bodyRegion,
          status: 'pending',
          user_id: user.id,
          clinic_id: profile?.clinic_id || null,
          notes: `Auto-classified as ${classification.episodeType}${classification.bodyRegion ? ` - ${classification.bodyRegion}` : ''} (${classification.confidence} confidence)`,
        })
        .select()
        .single();

      if (pendingError) throw pendingError;

      // Update referral inquiry status and link to pending episode
      const { error: updateError } = await supabase
        .from('referral_inquiries')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          pending_episode_id: pendingEpisode.id,
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
        title: "Prospect Approved",
        description: `Pre-episode shell created (${classification.episodeType}${classification.bodyRegion ? ` - ${classification.bodyRegion}` : ''}). ${inquiry.name} has been sent the intake form.`,
      });

      setSelectedInquiry(null);
    } catch (error) {
      console.error('Error approving inquiry:', error);
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: error instanceof Error ? error.message : String(error),
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
          <Badge 
            variant={
              inquiry.status === 'prospect_awaiting_review' ? 'default' :
              inquiry.status === 'approved' ? 'default' :
              inquiry.status === 'scheduled' ? 'default' :
              inquiry.status === 'converted' ? 'default' :
              'secondary'
            }
            className={
              inquiry.status === 'prospect_awaiting_review' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
              inquiry.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              inquiry.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
              inquiry.status === 'converted' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
              ''
            }
          >
            {inquiry.status === 'prospect_awaiting_review' ? 'Prospect – Awaiting Review' :
             inquiry.status === 'approved' ? 'Approved – Intake Pending' :
             inquiry.status === 'scheduled' ? 'Scheduled' :
             inquiry.status === 'converted' ? 'Converted' :
             inquiry.status}
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

  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case 'self': return <UserCircle className="h-5 w-5" />;
      case 'parent': return <Baby className="h-5 w-5" />;
      case 'professional': return <Stethoscope className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getPersonaLabel = (persona: string) => {
    switch (persona) {
      case 'self': return 'Individual';
      case 'parent': return 'Parent/Guardian';
      case 'professional': return 'Healthcare Professional';
      default: return persona;
    }
  };

  const getLeadStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      new: { className: 'bg-amber-100 text-amber-800', label: 'New' },
      contacted: { className: 'bg-blue-100 text-blue-800', label: 'Contacted' },
      qualified: { className: 'bg-green-100 text-green-800', label: 'Qualified' },
      converted: { className: 'bg-purple-100 text-purple-800', label: 'Converted' },
      declined: { className: 'bg-gray-100 text-gray-800', label: 'Declined' },
    };
    const config = statusConfig[status] || { className: '', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const NeurologicLeadCard = ({ lead }: { lead: NeurologicLead }) => (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500"
      onClick={() => setSelectedLead(lead)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {getPersonaIcon(lead.persona)}
              {lead.name || lead.parent_name || lead.referrer_name || lead.email}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          {getLeadStatusBadge(lead.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lead.primary_concern || lead.symptom_profile || 'No details provided'}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {lead.email}
          </span>
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs bg-purple-50">
            {getPersonaLabel(lead.persona)}
          </Badge>
          {lead.source && (
            <Badge variant="outline" className="text-xs">
              Via: {lead.source}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const pendingInquiries = inquiries.filter(i => i.status === 'prospect_awaiting_review');
  const approvedInquiries = inquiries.filter(i => ['approved', 'scheduled', 'converted'].includes(i.status));
  const declinedInquiries = inquiries.filter(i => i.status === 'declined');
  
  const newLeads = neurologicLeads.filter(l => l.status === 'new');
  const processedLeads = neurologicLeads.filter(l => ['contacted', 'qualified', 'converted', 'declined'].includes(l.status));

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Lead Generation Inbox</h1>
          <p className="text-muted-foreground">
            Review and respond to prospective patient inquiries from QR codes and the Pillar app
          </p>
        </div>

        <Tabs defaultValue="pillar" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pillar" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Pillar App Leads ({newLeads.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              QR Prospects ({pendingInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="processed">
              Processed Leads ({processedLeads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pillar" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : newLeads.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No new Pillar app leads</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {newLeads.map(lead => (
                  <NeurologicLeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </TabsContent>

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

          <TabsContent value="processed" className="space-y-4">
            {processedLeads.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No processed leads yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {processedLeads.map(lead => (
                  <NeurologicLeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Neurologic Lead Detail Dialog */}
        {selectedLead && (
          <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {getPersonaIcon(selectedLead.persona)}
                  {selectedLead.name || selectedLead.parent_name || selectedLead.referrer_name || selectedLead.email}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {getPersonaLabel(selectedLead.persona)} • Submitted {formatDistanceToNow(new Date(selectedLead.created_at), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedLead.email}
                    </p>
                    {selectedLead.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedLead.phone}
                      </p>
                    )}
                  </div>
                </div>

                {selectedLead.primary_concern && (
                  <div>
                    <Label>Primary Concern</Label>
                    <p className="mt-1 text-sm">{selectedLead.primary_concern}</p>
                  </div>
                )}

                {selectedLead.symptom_profile && (
                  <div>
                    <Label>Symptom Profile</Label>
                    <p className="mt-1 text-sm">{selectedLead.symptom_profile}</p>
                  </div>
                )}

                {selectedLead.duration && (
                  <div>
                    <Label>Duration</Label>
                    <p className="mt-1 text-sm">{selectedLead.duration}</p>
                  </div>
                )}

                {selectedLead.symptom_location && (
                  <div>
                    <Label>Symptom Location</Label>
                    <p className="mt-1 text-sm">{selectedLead.symptom_location}</p>
                  </div>
                )}

                {/* Parent-specific fields */}
                {selectedLead.persona === 'parent' && (
                  <>
                    {selectedLead.child_name && (
                      <div>
                        <Label>Child's Name</Label>
                        <p className="mt-1 text-sm">{selectedLead.child_name}</p>
                      </div>
                    )}
                    {selectedLead.child_age && (
                      <div>
                        <Label>Child's Age</Label>
                        <p className="mt-1 text-sm">{selectedLead.child_age}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Professional-specific fields */}
                {selectedLead.persona === 'professional' && (
                  <>
                    {selectedLead.organization && (
                      <div>
                        <Label>Organization</Label>
                        <p className="mt-1 text-sm">{selectedLead.organization}</p>
                      </div>
                    )}
                    {selectedLead.role && (
                      <div>
                        <Label>Role</Label>
                        <p className="mt-1 text-sm">{selectedLead.role}</p>
                      </div>
                    )}
                    {selectedLead.patient_name && (
                      <div>
                        <Label>Patient Name</Label>
                        <p className="mt-1 text-sm">{selectedLead.patient_name}</p>
                      </div>
                    )}
                  </>
                )}

                {selectedLead.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="mt-1 text-sm">{selectedLead.notes}</p>
                  </div>
                )}

                {selectedLead.source && (
                  <div>
                    <Label>Source</Label>
                    <Badge variant="outline">{selectedLead.source}</Badge>
                  </div>
                )}

                {(selectedLead.utm_source || selectedLead.utm_campaign) && (
                  <div>
                    <Label>Attribution</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedLead.utm_source && <Badge variant="outline">Source: {selectedLead.utm_source}</Badge>}
                      {selectedLead.utm_medium && <Badge variant="outline">Medium: {selectedLead.utm_medium}</Badge>}
                      {selectedLead.utm_campaign && <Badge variant="outline">Campaign: {selectedLead.utm_campaign}</Badge>}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Update Status</Label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}
                    disabled={isUpdatingLead}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedLead.email}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                {selectedLead.phone && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `tel:${selectedLead.phone}`}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

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

              {selectedInquiry.status === 'prospect_awaiting_review' && (
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
