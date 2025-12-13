import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leadTracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  category: string;
}

const questions: Question[] = [
  { id: "pain", text: "Do you have persistent pain that hasn't resolved with rest or treatment?", category: "pain" },
  { id: "stiffness", text: "Do you experience stiffness that limits your movement?", category: "mobility" },
  { id: "weakness", text: "Do you notice weakness or loss of strength in any area?", category: "strength" },
  { id: "fatigue", text: "Do your muscles fatigue more quickly than expected during activity?", category: "endurance" },
  { id: "heaviness", text: "Does movement feel heavier or more effortful than it should?", category: "motor" },
  { id: "asymmetry", text: "Have you noticed differences between your left and right sides?", category: "asymmetry" },
  { id: "coordination", text: "Do you feel less coordinated than before?", category: "motor" },
  { id: "performance", text: "Has your physical performance declined from your previous level?", category: "function" },
  { id: "recovery", text: "Does it take longer than expected to recover from physical activity?", category: "recovery" },
  { id: "normal", text: "Do you feel like you can't return to normal function despite healing?", category: "function" },
];

const PatientSelfTestsMsk = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const symptoms: string[] = [];
    Object.entries(answers).forEach(([id, answer]) => {
      if (answer === "yes" || answer === "sometimes") {
        const question = questions.find(q => q.id === id);
        if (question) {
          symptoms.push(question.text.replace(/Do you |Have you |Does /gi, '').replace(/\?/g, ''));
        }
      }
    });
    return symptoms.slice(0, 5).join('; ');
  };

  const getRecommendation = () => {
    const score = calculateScore();
    if (score >= 12) {
      return {
        level: "high",
        title: "Significant Functional Concerns",
        message: "Your responses suggest significant neuromuscular dysfunction. A neurologic MSK evaluation can identify what's limiting your recovery.",
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/30",
      };
    } else if (score >= 6) {
      return {
        level: "moderate",
        title: "Moderate Concerns Detected",
        message: "Your responses suggest functional deficits that may benefit from neuromuscular evaluation. Consider scheduling an assessment.",
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
      };
    } else {
      return {
        level: "low",
        title: "Mild Concerns",
        message: "Your symptoms appear mild. Continue with your current approach, and if issues persist, consider an evaluation.",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/30",
      };
    }
  };

  const handleRequestEvaluation = async () => {
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const symptomSummary = getSymptomSummary();
      const recommendation = getRecommendation();

      // Create lead with assessment data
      await submitLead({
        severity_score: score,
        system_category: 'msk',
        tracking: {
          funnel_stage: 'schedule-eval',
          origin_page: '/patient/self-tests/msk',
          origin_cta: 'Request MSK Evaluation',
          pillar_origin: 'msk_pillar',
          utm_source: searchParams.get('utm_source') || '',
          utm_medium: searchParams.get('utm_medium') || '',
          utm_campaign: searchParams.get('utm_campaign') || '',
          utm_content: searchParams.get('utm_content') || '',
        },
      });

      // Store assessment data in session for concierge
      sessionStorage.setItem('msk_assessment', JSON.stringify({
        score,
        level: recommendation.level,
        symptomSummary,
        answers,
        completedAt: new Date().toISOString(),
      }));

      // Notify clinicians about new assessment lead
      await supabase.functions.invoke('send-clinician-notification', {
        body: {
          messageType: 'new_assessment_lead',
          assessmentType: 'MSK',
          severityScore: score,
          severityLevel: recommendation.level,
          symptomSummary,
        },
      });

      // Navigate to concierge with assessment params
      navigate(`/patient/concierge?assessment=msk&score=${score}&level=${recommendation.level}`);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Request Evaluation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
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
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl">MSK Self-Assessment</CardTitle>
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
              value={currentAnswer}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="flex-1 cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="sometimes" id="sometimes" />
                <Label htmlFor="sometimes" className="flex-1 cursor-pointer">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="flex-1 cursor-pointer">No</Label>
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

export default PatientSelfTestsMsk;
