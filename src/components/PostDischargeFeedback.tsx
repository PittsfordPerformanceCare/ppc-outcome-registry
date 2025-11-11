import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";

interface PostDischargeFeedbackProps {
  patientId: string;
  episodeId: string;
  onComplete?: () => void;
}

export default function PostDischargeFeedback({ 
  patientId, 
  episodeId, 
  onComplete 
}: PostDischargeFeedbackProps) {
  const { toast } = useToast();
  const [surprise, setSurprise] = useState("");
  const [confidence, setConfidence] = useState([7]);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [allowTestimonial, setAllowTestimonial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!surprise.trim()) {
      toast({
        title: "Required Field",
        description: "Please share what surprised you about your recovery",
        variant: "destructive",
      });
      return;
    }

    if (recommend === null) {
      toast({
        title: "Required Field",
        description: "Please let us know if you'd recommend our services",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("patient_feedback")
        .insert({
          patient_id: patientId,
          episode_id: episodeId,
          recovery_surprise: surprise.trim(),
          confidence_level: confidence[0],
          would_recommend: recommend,
          additional_comments: comments.trim() || null,
          allow_testimonial: allowTestimonial,
        });

      if (error) throw error;

      toast({
        title: "Thank You!",
        description: "Your feedback helps us improve our care",
      });

      setSubmitted(true);
      if (onComplete) onComplete();
    } catch (error: any) {
      toast({
        title: "Failed to Submit",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your feedback has been received and will help us provide even better care
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Share Your Recovery Story
        </CardTitle>
        <CardDescription>
          Help us understand your journey and inspire others
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="surprise">
            What surprised you most about your recovery? *
          </Label>
          <Textarea
            id="surprise"
            placeholder="I didn't expect to..."
            value={surprise}
            onChange={(e) => setSurprise(e.target.value)}
            rows={4}
            disabled={submitting}
            className="mt-2"
          />
        </div>

        <div>
          <Label>
            How confident do you feel now? *
          </Label>
          <div className="mt-4 space-y-2">
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              max={10}
              min={1}
              step={1}
              disabled={submitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not confident (1)</span>
              <span className="font-semibold text-primary text-lg">{confidence[0]}/10</span>
              <span>Very confident (10)</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Would you recommend our services to others? *</Label>
          <div className="flex gap-3 mt-3">
            <Button
              type="button"
              variant={recommend === true ? "default" : "outline"}
              onClick={() => setRecommend(true)}
              disabled={submitting}
              className="flex-1"
            >
              Yes, definitely
            </Button>
            <Button
              type="button"
              variant={recommend === false ? "destructive" : "outline"}
              onClick={() => setRecommend(false)}
              disabled={submitting}
              className="flex-1"
            >
              Not likely
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="comments">
            Any additional thoughts? (Optional)
          </Label>
          <Textarea
            id="comments"
            placeholder="Tell us more..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            disabled={submitting}
            className="mt-2"
          />
        </div>

        <div className="flex items-start space-x-2 p-4 rounded-lg bg-muted/50">
          <Checkbox
            id="testimonial"
            checked={allowTestimonial}
            onCheckedChange={(checked) => setAllowTestimonial(checked as boolean)}
            disabled={submitting}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="testimonial"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Share as testimonial
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow us to use your feedback (anonymously) to help others understand the benefits of physical therapy
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !surprise.trim() || recommend === null}
          className="w-full gap-2"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}