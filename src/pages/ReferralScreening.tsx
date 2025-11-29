import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Baby } from 'lucide-react';

export default function ReferralScreening() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    careFor: 'self' as 'self' | 'child',
    chiefComplaint: '',
    referralSource: searchParams.get('ref') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('referral_inquiries')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          care_for: formData.careFor,
          chief_complaint: formData.chiefComplaint,
          referral_source: formData.referralSource,
          referral_code: searchParams.get('code') || null,
          clinic_id: null, // Will be set by clinic in future enhancement
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your inquiry has been received. We'll review it and get back to you shortly.",
      });

      navigate('/referral-success');
    } catch (error) {
      console.error('Error submitting referral inquiry:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please try again or call us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Pittsford Performance Care</CardTitle>
          <CardDescription className="text-lg">
            Let's see if we're a good fit for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Are you seeking care for: *</Label>
              <RadioGroup
                value={formData.careFor}
                onValueChange={(value) => setFormData({ ...formData, careFor: value as 'self' | 'child' })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self" className="flex items-center gap-2 cursor-pointer flex-1">
                    <UserCircle className="h-5 w-5" />
                    Yourself
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="child" id="child" />
                  <Label htmlFor="child" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Baby className="h-5 w-5" />
                    Your child
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">What brings you in? *</Label>
              <Textarea
                id="chiefComplaint"
                required
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="Briefly describe the issue..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Input
                id="referralSource"
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                placeholder="Referral source"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
