import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ReferralSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Thank You!</CardTitle>
          <CardDescription className="text-lg">
            Your inquiry has been received
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We'll review your information and get back to you within 24 hours.
          </p>
          <p className="text-muted-foreground">
            Please check your email for our response.
          </p>
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Have an urgent question?
            </p>
            <p className="text-lg font-semibold">
              Call us at: (585) 555-7700
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
