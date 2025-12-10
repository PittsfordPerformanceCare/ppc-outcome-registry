import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, Clock, XCircle, Mail, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ReferralStatus = 'pending' | 'approved' | 'declined';

interface ReferralInquiry {
  id: string;
  name: string;
  email: string;
  status: ReferralStatus;
  created_at: string;
  reviewed_at: string | null;
  decline_reason: string | null;
}

export default function ReferralStatus() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [inquiry, setInquiry] = useState<ReferralInquiry | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setInquiry(null);

    try {
      const { data, error } = await supabase
        .from('referral_inquiries')
        .select('*')
        .eq('email', searchEmail.trim().toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setInquiry(data as ReferralInquiry);
      }
    } catch (error) {
      console.error('Error searching inquiry:', error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: ReferralStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'declined':
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const variants: Record<ReferralStatus, 'default' | 'secondary' | 'destructive'> = {
      pending: 'default',
      approved: 'default',
      declined: 'secondary',
    };
    
    return (
      <Badge variant={variants[status]} className="text-sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusMessage = (status: ReferralStatus) => {
    switch (status) {
      case 'pending':
        return "We're currently reviewing your inquiry. You'll receive an email once we've completed our review.";
      case 'approved':
        return "Great news! We've approved your inquiry. Please check your email for next steps and to complete your intake form.";
      case 'declined':
        return "After reviewing your inquiry, we've determined that we may not be the best fit for your specific needs. Please see our recommendation below.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Check Your Inquiry Status</CardTitle>
          <CardDescription className="text-lg">
            Enter your email to see the status of your referral inquiry
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="your@email.com"
                className="text-lg"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>
          </form>

          {notFound && (
            <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">No Inquiry Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find an inquiry with that email address.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you recently submitted an inquiry, please allow a few minutes for it to appear in our system.
                </p>
              </div>
            </div>
          )}

          {inquiry && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(inquiry.status)}
                    <div>
                      <h3 className="font-semibold text-xl">Hello, {inquiry.name}!</h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(inquiry.status)}
                </div>

                <div className="border-t pt-4">
                  <p className="text-muted-foreground">
                    {getStatusMessage(inquiry.status)}
                  </p>
                </div>

                {inquiry.status === 'declined' && inquiry.decline_reason && (
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Our Recommendation:</h4>
                    <p className="text-sm text-muted-foreground">{inquiry.decline_reason}</p>
                  </div>
                )}

                {inquiry.status === 'approved' && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-primary">Next Steps:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Check your email for the intake form link</li>
                      <li>Complete your medical history</li>
                      <li>Schedule your first appointment</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Need Assistance?</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Call us</p>
                      <p className="font-medium">(585) 203-1050</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email us</p>
                      <p className="font-medium text-sm">dr.rob@pittsfordperformancecare.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
