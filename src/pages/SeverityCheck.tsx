import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUTMParams } from "@/hooks/useUTMParams";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Eye, Activity, Zap, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

type SystemCategory = "visual" | "vestibular" | "cerebellar" | "autonomic";

interface Question {
  id: string;
  text: string;
  category: SystemCategory;
}

const questions: Question[] = [
  // Visual System
  { id: "v1", text: "Do you experience blurred vision or difficulty focusing?", category: "visual" },
  { id: "v2", text: "Are you sensitive to bright lights?", category: "visual" },
  { id: "v3", text: "Do you have difficulty reading or tracking moving objects?", category: "visual" },
  { id: "v4", text: "Do you experience double vision?", category: "visual" },
  
  // Vestibular System
  { id: "ve1", text: "Do you feel dizzy or have a spinning sensation?", category: "vestibular" },
  { id: "ve2", text: "Do you have difficulty with balance or feel unsteady?", category: "vestibular" },
  { id: "ve3", text: "Do movements like turning your head make symptoms worse?", category: "vestibular" },
  { id: "ve4", text: "Do you feel motion sickness in cars or while scrolling?", category: "vestibular" },
  
  // Cerebellar System
  { id: "c1", text: "Do you have difficulty with coordination or fine motor tasks?", category: "cerebellar" },
  { id: "c2", text: "Is your handwriting noticeably worse than before?", category: "cerebellar" },
  { id: "c3", text: "Do you feel clumsy or bump into things more often?", category: "cerebellar" },
  { id: "c4", text: "Do you have trouble with speech or slurred words?", category: "cerebellar" },
  
  // Autonomic System
  { id: "a1", text: "Do you experience headaches that worsen with physical activity?", category: "autonomic" },
  { id: "a2", text: "Do you feel fatigued even with minimal exertion?", category: "autonomic" },
  { id: "a3", text: "Do you have trouble sleeping or feel unrested after sleep?", category: "autonomic" },
  { id: "a4", text: "Do you feel lightheaded when standing up quickly?", category: "autonomic" },
];

const categoryInfo: Record<SystemCategory, { label: string; icon: React.ElementType; color: string }> = {
  visual: { label: "Visual System", icon: Eye, color: "text-blue-500" },
  vestibular: { label: "Vestibular System", icon: Activity, color: "text-purple-500" },
  cerebellar: { label: "Cerebellar System", icon: Brain, color: "text-teal-500" },
  autonomic: { label: "Autonomic System", icon: Zap, color: "text-orange-500" },
};

const SeverityCheck = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const utm = useUTMParams();
  
  const [leadId, setLeadId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    totalScore: number;
    categoryScores: Record<SystemCategory, number>;
    dominantCategory: SystemCategory;
  } | null>(null);

  // Create lead on component mount
  useEffect(() => {
    const createLead = async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .insert({
            utm_source: utm.utm_source || searchParams.get("utm_source"),
            utm_medium: utm.utm_medium || searchParams.get("utm_medium"),
            utm_campaign: utm.utm_campaign || searchParams.get("utm_campaign"),
            utm_content: utm.utm_content || searchParams.get("utm_content"),
            checkpoint_status: "severity_check_started",
          })
          .select("id")
          .single();

        if (error) throw error;
        setLeadId(data.id);
      } catch (error) {
        console.error("Error creating lead:", error);
      }
    };

    createLead();
  }, [utm, searchParams]);

  const handleAnswer = (score: number) => {
    const question = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [question.id]: score }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    setIsSubmitting(true);
    
    // Calculate category scores
    const categoryScores: Record<SystemCategory, number> = {
      visual: 0,
      vestibular: 0,
      cerebellar: 0,
      autonomic: 0,
    };

    questions.forEach(q => {
      const score = answers[q.id] || 0;
      categoryScores[q.category] += score;
    });

    const totalScore = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    
    // Find dominant category
    let dominantCategory: SystemCategory = "visual";
    let maxScore = 0;
    (Object.entries(categoryScores) as [SystemCategory, number][]).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantCategory = cat;
      }
    });

    // Update lead in database
    if (leadId) {
      try {
        const { error } = await supabase
          .from("leads")
          .update({
            severity_score: totalScore,
            system_category: dominantCategory,
            checkpoint_status: "severity_check_completed",
          })
          .eq("id", leadId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating lead:", error);
      }
    }

    setResults({ totalScore, categoryScores, dominantCategory });
    setIsComplete(true);
    setIsSubmitting(false);
  };

  const getSeverityLevel = (score: number): { label: string; color: string; description: string } => {
    if (score <= 16) return { 
      label: "Mild", 
      color: "text-green-600", 
      description: "Your symptoms appear mild. Recovery is typically straightforward with proper guidance." 
    };
    if (score <= 32) return { 
      label: "Moderate", 
      color: "text-yellow-600", 
      description: "Your symptoms are moderate. A structured treatment plan can significantly improve your recovery." 
    };
    if (score <= 48) return { 
      label: "Significant", 
      color: "text-orange-600", 
      description: "Your symptoms are significant. Professional evaluation is strongly recommended." 
    };
    return { 
      label: "Severe", 
      color: "text-red-600", 
      description: "Your symptoms are severe. Please seek professional neurologic evaluation promptly." 
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isComplete && results) {
    const severity = getSeverityLevel(results.totalScore);
    const DominantIcon = categoryInfo[results.dominantCategory].icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-[#0a1628]">
                Your Severity Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="text-5xl font-bold text-[#0a1628] mb-2">{results.totalScore}</div>
                <div className={`text-xl font-semibold ${severity.color}`}>{severity.label} Severity</div>
                <p className="text-slate-600 mt-2 text-sm">{severity.description}</p>
              </div>

              {/* Dominant System */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <DominantIcon className={`h-6 w-6 ${categoryInfo[results.dominantCategory].color}`} />
                  <span className="font-semibold text-[#0a1628]">Primary Area of Concern</span>
                </div>
                <p className="text-slate-600">{categoryInfo[results.dominantCategory].label}</p>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0a1628]">System Breakdown</h3>
                {(Object.entries(results.categoryScores) as [SystemCategory, number][]).map(([cat, score]) => {
                  const info = categoryInfo[cat];
                  const Icon = info.icon;
                  const maxCategoryScore = 12; // 4 questions * 3 max points
                  const percentage = (score / maxCategoryScore) * 100;
                  
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${info.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{info.label}</span>
                          <span className="font-medium">{score}/{maxCategoryScore}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={async () => {
                    // Create intake record
                    try {
                      const { data: intake, error } = await supabase
                        .from("intakes")
                        .insert({
                          lead_id: leadId,
                          progress: 0,
                          status: "started",
                        })
                        .select("id")
                        .single();

                      if (error) throw error;

                      // Update lead status
                      if (leadId) {
                        await supabase
                          .from("leads")
                          .update({ checkpoint_status: "intake_started" })
                          .eq("id", leadId);
                      }

                      // Navigate to intake form with IDs
                      navigate(`/neurologic-intake?intake=${intake.id}&lead=${leadId || ""}`);
                    } catch (err) {
                      console.error("Error starting intake:", err);
                      navigate("/neurologic-intake");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-6 text-lg"
                >
                  Start Full Intake
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const CategoryIcon = categoryInfo[currentQ.category].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628]">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Symptom Severity Check
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Quick Symptom Assessment
          </h1>
          <p className="text-slate-300">
            Answer a few questions to understand your symptom severity
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <CategoryIcon className={`h-4 w-4 ${categoryInfo[currentQ.category].color}`} />
                <span className={`text-sm font-medium ${categoryInfo[currentQ.category].color}`}>
                  {categoryInfo[currentQ.category].label}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2 mb-6" />
            <CardTitle className="text-xl text-[#0a1628] leading-relaxed">
              {currentQ.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { score: 0, label: "Not at all", desc: "I don't experience this" },
              { score: 1, label: "Mild", desc: "Occasionally or slightly" },
              { score: 2, label: "Moderate", desc: "Frequently or noticeably" },
              { score: 3, label: "Severe", desc: "Constantly or severely" },
            ].map(option => (
              <button
                key={option.score}
                onClick={() => handleAnswer(option.score)}
                className="w-full p-4 text-left rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#0a1628] group-hover:text-teal-700">
                      {option.label}
                    </div>
                    <div className="text-sm text-slate-500">{option.desc}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}

            {currentQuestion > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mt-4 text-slate-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Question
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeverityCheck;