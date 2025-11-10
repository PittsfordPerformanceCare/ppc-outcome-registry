import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, FileText, Clock, Shield } from "lucide-react";

export default function IntakeStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="mx-auto max-w-2xl w-full space-y-6">
        {/* Main Card */}
        <Card className="text-center">
          <CardContent className="pt-12 pb-12 px-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <ClipboardCheck className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Clinic</h1>
            <p className="text-xl text-muted-foreground mb-8">
              New Patient Digital Intake
            </p>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Please complete our digital intake form before your appointment. 
              This helps us prepare for your visit and ensures we have all the 
              information we need to provide you with the best care.
            </p>

            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 py-6 text-lg"
              onClick={() => navigate("/patient-intake")}
            >
              Start Intake Form
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Quick & Easy</h3>
              <p className="text-sm text-muted-foreground">
                Takes about 5-10 minutes to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your information is protected and confidential
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Complete Information</h3>
              <p className="text-sm text-muted-foreground">
                Helps us provide better care for you
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          If you need assistance, please ask a staff member
        </p>
      </div>
    </div>
  );
}
