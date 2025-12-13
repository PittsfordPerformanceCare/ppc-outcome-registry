import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { submitLead } from "@/lib/leadTracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  category: string;
}

const questions: Question[] = [
  { id: "headache", text: "Do you experience headaches more than before?", category: "physical" },
  { id: "fatigue", text: "Do you feel more fatigued than normal, even after rest?", category: "physical" },
  { id: "dizziness", text: "Do you experience dizziness or balance problems?", category: "vestibular" },
  { id: "visual", text: "Do you have trouble with visual tasks (reading, screens, busy environments)?", category: "visual" },
  { id: "concentration", text: "Do you have difficulty concentrating or staying focused?", category: "cognitive" },
  { id: "memory", text: "Do you have trouble remembering things?", category: "cognitive" },
  { id: "sleep", text: "Has your sleep been affected (too much, too little, or unrefreshing)?", category: "autonomic" },
  { id: "irritability", text: "Are you more irritable or emotionally reactive than before?", category: "emotional" },
  { id: "light", text: "Are you more sensitive to light than before?", category: "sensory" },
  { id: "noise", text: "Are you more sensitive to noise than before?", category: "sensory" },
];

const PatientSelfTestsConcussion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const getRouteWithParams = (basePath: string) => {
    const params = searchParams.toString();
    return params ? `${basePath}?${params}` : basePath;
  };

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    const yesCount = Object.values(answers).filter(a => a === "yes").length;
    const sometimesCount = Object.values(answers).filter(a => a === "sometimes").length;
    return yesCount * 2 + sometimesCount;
  };

  const getSymptomSummary = () => {
    const yesSymptoms = questions
      .filter(q => answers[q.id] === "yes")
      .map(q => q.id);
    const sometimesSymptoms = questions
      .filter(q => answers[q.id] === "sometimes")
      .map(q => q.id);
    return { yesSymptoms, sometimesSymptoms };
  };

  const getRecommendation = () => {
    const score = calculateScore();
    if (score >= 12) {
      return {
        level: "high",
        title: "Significant Symptoms Detected",
        message: "Your responses suggest significant post-concussion symptoms. We strongly recommend scheduling a neurologic evaluation.",
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/30",
      };
    } else if (score >= 6) {
      return {
        level: "moderate",
        title: "Moderate Symptoms Detected",
        message: "Your responses suggest moderate symptoms that could benefit from neurologic evaluation. Consider scheduling an assessment.",
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
      };
    } else {
      return {
        level: "low",
        title: "Mild Symptoms",
        message: "Your symptoms appear mild. Continue to monitor, and if they persist or worsen, consider scheduling an evaluation.",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/30",
      };
    }
  };

  const handleRequestEvaluation = async () => {
    const score = calculateScore();
    const { yesSymptoms, sometimesSymptoms } = getSymptomSummary();
    const symptomSummary = [
      yesSymptoms.length > 0 ? `Persistent: ${yesSymptoms.join(", ")}` : "",
      sometimesSymptoms.length > 0 ? `Intermittent: ${sometimesSymptoms.join(", ")}` : ""
    ].filter(Boolean).join("; ");

    // Create lead with assessment data
    const result = await submitLead({
      severity_score: score,
      system_category: "concussion",
      tracking: {
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_content: searchParams.get('utm_content'),
        origin_page: "/patient/self-tests/concussion",
        origin_cta: "Schedule Neurologic Evaluation",
        funnel_stage: "schedule-eval",
        pillar_origin: "concussion_pillar",
      },
    });

    if (result.success && result.leadId) {
      // Store assessment data for the intake form
      sessionStorage.setItem('concussion_assessment', JSON.stringify({
        leadId: result.leadId,
        score,
        symptomSummary,
        level: getRecommendation().level,
        completedAt: new Date().toISOString(),
      }));

      // Notify clinicians about the new assessment lead
      try {
        await supabase.functions.invoke('send-clinician-notification', {
          body: {
            messageType: 'new_assessment_lead',
            subject: 'New Concussion Assessment - Evaluation Requested',
            assessmentType: 'concussion',
            severityScore: score,
            severityLevel: getRecommendation().level,
            symptomSummary,
          }
        });
      } catch (err) {
        console.error("Failed to send clinician notification:", err);
      }

      toast.success("Your assessment has been submitted. Let's get your contact information.");
    }

    // Navigate to concierge with assessment context
    const params = new URLSearchParams(searchParams);
    params.set('assessment', 'concussion');
    params.set('score', score.toString());
    navigate(`/patient/concierge?${params.toString()}`);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers[questions[currentQuestion]?.id];

  if (isComplete) {
    const recommendation = getRecommendation();
    
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete</CardTitle>
            <CardDescription>
              Based on your responses, here's what we recommend:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`${recommendation.bgColor} rounded-lg p-6`}>
              <h3 className={`font-semibold text-lg ${recommendation.color}`}>
                {recommendation.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {recommendation.message}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This self-assessment is for educational purposes only 
                and does not constitute medical advice or diagnosis. Please consult with a healthcare 
                professional for proper evaluation and treatment.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleRequestEvaluation}
              >
                Request Evaluation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" asChild>
                <Link to="/patient/self-tests">
                  Take Another Assessment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link 
        to="/patient/self-tests" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Self-Tests
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Concussion Self-Assessment</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="py-4">
            <h3 className="text-lg font-medium mb-6">
              {questions[currentQuestion].text}
            </h3>
            
            <RadioGroup
              value={currentAnswer || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleAnswer("yes")}
              >
                <RadioGroupItem value="yes" id={`q${currentQuestion}-yes`} />
                <Label htmlFor={`q${currentQuestion}-yes`} className="flex-1 cursor-pointer">Yes</Label>
              </div>
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleAnswer("sometimes")}
              >
                <RadioGroupItem value="sometimes" id={`q${currentQuestion}-sometimes`} />
                <Label htmlFor={`q${currentQuestion}-sometimes`} className="flex-1 cursor-pointer">Sometimes</Label>
              </div>
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleAnswer("no")}
              >
                <RadioGroupItem value="no" id={`q${currentQuestion}-no`} />
                <Label htmlFor={`q${currentQuestion}-no`} className="flex-1 cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSelfTestsConcussion;
