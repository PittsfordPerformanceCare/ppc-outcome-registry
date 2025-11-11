import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share2, Check, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PatientReferralCardProps {
  patientId: string;
}

const PatientReferralCard = ({ patientId }: PatientReferralCardProps) => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateOrGetReferralCode();
  }, [patientId]);

  const generateOrGetReferralCode = async () => {
    try {
      // Check if patient already has a referral code
      const { data: existing, error: fetchError } = await supabase
        .from("patient_referrals")
        .select("referral_code")
        .eq("referrer_patient_id", patientId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existing?.referral_code) {
        setReferralCode(existing.referral_code);
        const link = `${window.location.origin}/referral?ref=${existing.referral_code}`;
        setReferralLink(link);
      } else {
        // Generate new referral code
        const { data: codeData, error: codeError } = await supabase.rpc(
          "generate_referral_code",
          { p_patient_id: patientId }
        );

        if (codeError) throw codeError;

        const newCode = codeData as string;

        // Create referral record
        const { error: insertError } = await supabase
          .from("patient_referrals")
          .insert({
            referrer_patient_id: patientId,
            referral_code: newCode,
            status: "pending",
          });

        if (insertError) throw insertError;

        setReferralCode(newCode);
        const link = `${window.location.origin}/referral?ref=${newCode}`;
        setReferralLink(link);
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me at PPC Physical Therapy!",
          text: "I've had a great experience with PPC Physical Therapy. Check them out!",
          url: referralLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Share the Care</h3>
          <p className="text-sm text-muted-foreground">
            Help others discover the same quality care you've experienced. Share your referral code with friends and family.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* QR Code Section */}
        <div className="flex justify-center p-6 bg-background rounded-lg border border-border">
          <QRCodeSVG
            value={referralLink}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Referral Code */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Referral Code</p>
          <div className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg px-6 py-3">
            <p className="text-2xl font-bold tracking-wider">{referralCode}</p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <Button
            onClick={copyToClipboard}
            className="w-full"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="mr-2 w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 w-4 h-4" />
                Copy Referral Link
              </>
            )}
          </Button>

          {navigator.share && (
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Share2 className="mr-2 w-4 h-4" />
              Share via...
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Share your QR code or link with friends and family</li>
            <li>They scan/click and complete the intake form</li>
            <li>Our team will reach out to help them on their recovery journey</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3 italic">
            We'll recognize your support privately after they're approved
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PatientReferralCard;
