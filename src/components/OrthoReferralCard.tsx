import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, FileText, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrthoReferralCardProps {
  episodeId: string;
}

export function OrthoReferralCard({ episodeId }: OrthoReferralCardProps) {
  const [referral, setReferral] = useState<any>(null);
  const [orthoPartner, setOrthoPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, [episodeId]);

  const loadReferralData = async () => {
    try {
      const { data: referralData, error: referralError } = await supabase
        .from("ortho_referrals")
        .select("*")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (referralError && referralError.code !== "PGRST116") throw referralError;
      
      if (referralData) {
        setReferral(referralData);

        const { data: partnerData, error: partnerError } = await supabase
          .from("ortho_partners")
          .select("*")
          .eq("id", referralData.destination_ortho_id)
          .single();

        if (partnerError) throw partnerError;
        setOrthoPartner(partnerData);
      }
    } catch (error: any) {
      console.error("Error loading referral:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ortho Referral</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!referral) {
    return null;
  }

  const isOverdue = referral.expected_return_window_end && 
    new Date(referral.expected_return_window_end) < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ortho Referral
              {referral.priority_flag && (
                <Badge variant="destructive">Priority</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Referred on {format(new Date(referral.referral_date), "PPP")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {orthoPartner && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {orthoPartner.name}
            </h4>
            {orthoPartner.subspecialty && (
              <p className="text-sm text-muted-foreground">
                Subspecialty: {orthoPartner.subspecialty}
              </p>
            )}
            {orthoPartner.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {orthoPartner.location}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Referral Details</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Primary Reason:</span>{" "}
              {referral.referral_reason_primary}
            </p>
            {referral.suspected_procedure_type && (
              <p>
                <span className="text-muted-foreground">Suspected Procedure:</span>{" "}
                {referral.suspected_procedure_type}
              </p>
            )}
            {referral.procedure_class && (
              <p>
                <span className="text-muted-foreground">Procedure Class:</span>{" "}
                {referral.procedure_class}
              </p>
            )}
            {referral.communication_channel && (
              <p>
                <span className="text-muted-foreground">Communication:</span>{" "}
                {referral.communication_channel}
              </p>
            )}
          </div>
        </div>

        {(referral.expected_return_window_start || referral.expected_return_window_end) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expected Return Window
            </h4>
            <div className="text-sm">
              {referral.expected_return_window_start && referral.expected_return_window_end ? (
                <p>
                  {format(new Date(referral.expected_return_window_start), "PPP")} -{" "}
                  {format(new Date(referral.expected_return_window_end), "PPP")}
                </p>
              ) : (
                <p className="text-muted-foreground">Not calculated</p>
              )}
            </div>
            {isOverdue && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Return window has passed. Patient should be scheduled for final assessment.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {referral.notes_to_ortho && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes to Ortho
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {referral.notes_to_ortho}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}