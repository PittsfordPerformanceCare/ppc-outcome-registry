import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Mail, Phone, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReferralSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle2 className="h-20 w-20 text-green-500 animate-scale-in" />
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl mb-2">Thank You!</CardTitle>
            <CardDescription className="text-xl">
              Your inquiry has been received
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* What Happens Next */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              What Happens Next
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-4 items-start">
                <Badge variant="outline" className="mt-1 shrink-0">Step 1</Badge>
                <div>
                  <p className="font-medium">Review (Within 2-4 hours)</p>
                  <p className="text-sm text-muted-foreground">Our clinical team will review your inquiry to ensure we can provide the specialized care you need</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <Badge variant="outline" className="mt-1 shrink-0">Step 2</Badge>
                <div>
                  <p className="font-medium">Email Response (Same day)</p>
                  <p className="text-sm text-muted-foreground">You'll receive an email with next steps, including a link to complete your intake form and schedule your first visit</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <Badge variant="outline" className="mt-1 shrink-0">Step 3</Badge>
                <div>
                  <p className="font-medium">First Visit (Your choice)</p>
                  <p className="text-sm text-muted-foreground">Schedule your comprehensive evaluation at a time that works for you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check Status */}
          <div className="border-t pt-6">
            <Link to="/referral-status">
              <Button variant="outline" className="w-full" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Check Your Inquiry Status
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Need Help Right Away?</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Call us</p>
                  <p className="font-semibold">(585) 203-1050</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email us</p>
                  <p className="font-semibold text-sm">dr.rob@pittsfordperformancecare.com</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground italic">
              We're here Monday-Friday, 8am-5pm EST
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
