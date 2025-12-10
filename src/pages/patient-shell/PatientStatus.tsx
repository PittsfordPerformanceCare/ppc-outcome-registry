import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft, Home } from "lucide-react";

const PatientStatus = () => {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto mb-4">
            <Construction className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Patient Status Portal</CardTitle>
          <CardDescription>
            This feature is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This is the PPC patient status placeholder. Future use for readiness tracking 
            and portal-based progress monitoring. This feature will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              View your intake and evaluation status
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Track your progress through treatment
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Access your outcome measures and reports
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Communicate with your care team
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="outline">
              <Link to="/patient/concierge">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Concierge
              </Link>
            </Button>
            <Button asChild>
              <Link to="/site/hub">
                <Home className="mr-2 h-4 w-4" />
                Visit PPC Site
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientStatus;
