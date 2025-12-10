import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Stethoscope, ArrowRight } from "lucide-react";

const PatientIntakeShell = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  const intakeOptions = [
    {
      id: "adult",
      title: "Adult Intake",
      description: "For adults seeking neurologic evaluation for themselves",
      icon: User,
      route: "/patient/intake/adult",
    },
    {
      id: "pediatric",
      title: "Pediatric Intake",
      description: "For parents seeking evaluation for their child",
      icon: Users,
      route: "/patient/intake/pediatric",
    },
    {
      id: "referral",
      title: "Provider Referral",
      description: "For healthcare providers referring a patient",
      icon: Stethoscope,
      route: "/patient/intake/referral",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl font-bold">Lead Intake</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Complete your intake to begin the process of scheduling your neurologic evaluation.
          Select the intake type that best describes your situation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {intakeOptions.map((option) => (
          <Card 
            key={option.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(getRouteWithParams(option.route))}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <option.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <CardDescription className="text-sm">{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <Button variant="outline" size="sm">
                Start <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/patient/concierge" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to Concierge
        </Link>
      </div>
    </div>
  );
};

export default PatientIntakeShell;
