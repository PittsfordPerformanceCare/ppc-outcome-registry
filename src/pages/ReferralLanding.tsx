import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ReferralLanding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code) {
      setReferralCode(code);
      validateReferralCode(code);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    try {
      const { data: referral, error } = await supabase
        .from("patient_referrals")
        .select(`
          id,
          referrer_patient_id,
          patient_accounts!patient_referrals_referrer_patient_id_fkey(full_name)
        `)
        .eq("referral_code", code)
        .single();

      if (error) {
        console.error("Invalid referral code:", error);
        toast({
          title: "Invalid Referral Code",
          description: "This referral link may have expired or is invalid.",
          variant: "destructive",
        });
        setReferralCode(null);
      } else if (referral) {
        const patientAccount = referral.patient_accounts as any;
        setReferrerName(patientAccount?.full_name || "A patient");
      }
    } catch (error) {
      console.error("Error validating referral:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartIntake = () => {
    // Store referral code in session storage for intake form
    if (referralCode) {
      sessionStorage.setItem("referral_code", referralCode);
    }
    navigate("/patient-intake");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {referrerName && (
            <div className="inline-block bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-full px-6 py-2 mb-6">
              <p className="text-sm font-medium">
                <Heart className="inline w-4 h-4 mr-2" />
                Referred by <span className="font-bold">{referrerName}</span>
              </p>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to Your Recovery Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {referrerName 
              ? `${referrerName} trusts us with their care, and we'd be honored to help you too.`
              : "Start your path to better health with expert physical therapy care."
            }
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Expert Care Team</h3>
                <p className="text-sm text-muted-foreground">
                  Work with licensed physical therapists who specialize in your condition
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick & Easy Process</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your intake form in minutes and get started faster
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your health information is protected with HIPAA-compliant security
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Personalized Treatment</h3>
                <p className="text-sm text-muted-foreground">
                  Custom treatment plans designed specifically for your goals
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Complete our quick intake form and we'll review it within 24 hours. 
              If you're a good fit, we'll reach out with next steps!
            </p>
            <Button 
              size="lg" 
              onClick={handleStartIntake}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Start Your Intake Form
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ⏱️ Takes only 5-10 minutes to complete
            </p>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at <a href="tel:555-123-4567" className="text-primary hover:underline">(555) 123-4567</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralLanding;
