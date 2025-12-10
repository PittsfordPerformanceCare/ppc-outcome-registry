import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, ArrowRight, ArrowLeft, ClipboardCheck } from "lucide-react";

const PatientSelfTests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  const selfTests = [
    {
      id: "concussion",
      title: "Concussion Self-Assessment",
      description: "Check for common post-concussion symptoms and severity",
      icon: Brain,
      route: "/patient/self-tests/concussion",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      duration: "3-5 minutes",
    },
    {
      id: "msk",
      title: "MSK Self-Assessment",
      description: "Evaluate musculoskeletal symptoms and movement concerns",
      icon: Activity,
      route: "/patient/self-tests/msk",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      duration: "3-5 minutes",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Link 
        to="/patient/concierge" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Concierge
      </Link>

      {/* Hero */}
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Self-Assessment Tools</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Not sure if you need an evaluation? These brief self-assessments can help you 
          understand your symptoms and determine if neurologic care is right for you.
        </p>
      </div>

      {/* Self-Test Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {selfTests.map((test) => (
          <Card 
            key={test.id}
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
            onClick={() => navigate(getRouteWithParams(test.route))}
          >
            <CardHeader>
              <div className={`w-14 h-14 rounded-full ${test.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <test.icon className={`h-7 w-7 ${test.color}`} />
              </div>
              <CardTitle className="text-lg">{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{test.duration}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Start
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Important Note</h3>
        <p className="text-sm text-muted-foreground">
          These self-assessments are educational tools only and do not replace professional 
          medical evaluation. They can help you identify symptoms that may benefit from 
          neurologic care, but a comprehensive evaluation is needed for diagnosis and treatment planning.
        </p>
      </div>

      {/* Direct to Concierge */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Ready to schedule your evaluation?
        </p>
        <Button asChild>
          <Link to="/patient/concierge">
            Start Your Intake
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PatientSelfTests;
