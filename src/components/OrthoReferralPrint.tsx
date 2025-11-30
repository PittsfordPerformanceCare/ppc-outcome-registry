import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ClinicHeader } from "@/components/ClinicHeader";

interface OrthoReferralPrintProps {
  episodeId: string;
  trigger?: React.ReactNode;
}

export function OrthoReferralPrint({ episodeId, trigger }: OrthoReferralPrintProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadReferralData();
    }
  }, [open, episodeId]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Get episode with referral data
      const { data: episode, error: episodeError } = await supabase
        .from("episodes")
        .select(`
          *,
          ortho_referrals!episodes_referral_id_fkey (
            *,
            ortho_partners!ortho_referrals_destination_ortho_id_fkey (
              *
            )
          )
        `)
        .eq("id", episodeId)
        .single();

      if (episodeError) throw episodeError;

      // Get clinic settings
      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("*")
        .single();

      setReferralData({
        episode,
        referral: episode.ortho_referrals,
        partner: episode.ortho_referrals?.ortho_partners,
        clinic: settings,
      });
    } catch (error: any) {
      console.error("Error loading referral:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Printer className="h-4 w-4 mr-2" />
          Print Referral
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print:hidden">
            <DialogTitle>Ortho Referral Document</DialogTitle>
            <DialogDescription>
              Review and print this referral to fax to the orthopedic partner
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading referral...</div>
          ) : referralData ? (
            <>
              <div className="print:hidden flex justify-end mb-4">
                <Button onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Document
                </Button>
              </div>

              {/* Printable Content */}
              <div id="referral-print" className="print:p-8 space-y-6">
                {/* Clinic Header */}
                <ClinicHeader clinicSettings={referralData.clinic} />

                {/* Document Title */}
                <div className="text-center">
                  <h2 className="text-xl font-bold">ORTHOPEDIC REFERRAL</h2>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(), "MMMM d, yyyy")}
                  </p>
                </div>

                {/* Referral Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Referring To:</h3>
                    <div className="grid gap-2">
                      <p><strong>Provider:</strong> {referralData.partner?.name}</p>
                      {referralData.partner?.group_name && (
                        <p><strong>Practice:</strong> {referralData.partner.group_name}</p>
                      )}
                      {referralData.partner?.subspecialty && (
                        <p><strong>Subspecialty:</strong> {referralData.partner.subspecialty}</p>
                      )}
                      {referralData.partner?.location && (
                        <p><strong>Location:</strong> {referralData.partner.location}</p>
                      )}
                      {referralData.partner?.direct_secure_address && (
                        <p><strong>Direct Secure:</strong> {referralData.partner.direct_secure_address}</p>
                      )}
                      {referralData.partner?.fax_or_email_backup && (
                        <p><strong>Fax/Email:</strong> {referralData.partner.fax_or_email_backup}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Patient Information:</h3>
                    <div className="grid gap-2">
                      <p><strong>Name:</strong> {referralData.episode.patient_name}</p>
                      <p><strong>Date of Birth:</strong> {referralData.episode.date_of_birth ? format(new Date(referralData.episode.date_of_birth), "MM/dd/yyyy") : "Not provided"}</p>
                      <p><strong>Episode ID:</strong> {referralData.episode.id}</p>
                      {referralData.episode.insurance && (
                        <p><strong>Insurance:</strong> {referralData.episode.insurance}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Clinical Information:</h3>
                    <div className="grid gap-2">
                      <p><strong>Body Region:</strong> {referralData.episode.region}</p>
                      {referralData.episode.diagnosis && (
                        <p><strong>Diagnosis:</strong> {referralData.episode.diagnosis}</p>
                      )}
                      {referralData.episode.injury_date && (
                        <p><strong>Injury Date:</strong> {format(new Date(referralData.episode.injury_date), "MM/dd/yyyy")}</p>
                      )}
                      {referralData.episode.injury_mechanism && (
                        <p><strong>Mechanism:</strong> {referralData.episode.injury_mechanism}</p>
                      )}
                      {referralData.episode.pain_level && (
                        <p><strong>Pain Level:</strong> {referralData.episode.pain_level}/10</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Referral Details:</h3>
                    <div className="grid gap-2">
                      <p><strong>Referral Date:</strong> {format(new Date(referralData.referral.referral_date), "MM/dd/yyyy")}</p>
                      <p><strong>Primary Reason:</strong> {referralData.referral.referral_reason_primary}</p>
                      {referralData.referral.referral_reason_secondary?.length > 0 && (
                        <p><strong>Secondary Reasons:</strong> {referralData.referral.referral_reason_secondary.join(", ")}</p>
                      )}
                      {referralData.referral.suspected_procedure_type && (
                        <p><strong>Suspected Procedure:</strong> {referralData.referral.suspected_procedure_type}</p>
                      )}
                      {referralData.referral.procedure_class && (
                        <p><strong>Procedure Class:</strong> {referralData.referral.procedure_class}</p>
                      )}
                      {referralData.referral.priority_flag && (
                        <p className="text-destructive"><strong>⚠️ PRIORITY REFERRAL</strong></p>
                      )}
                    </div>
                  </div>

                  {referralData.referral.expected_return_window_start && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">Expected Return Window:</h3>
                      <p>
                        {format(new Date(referralData.referral.expected_return_window_start), "MMMM d, yyyy")} 
                        {" to "}
                        {format(new Date(referralData.referral.expected_return_window_end), "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Patient is expected to return to our clinic for final discharge assessment during this window.
                      </p>
                    </div>
                  )}

                  {referralData.referral.notes_to_ortho && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">Clinical Notes:</h3>
                      <p className="whitespace-pre-wrap">{referralData.referral.notes_to_ortho}</p>
                    </div>
                  )}

                  {referralData.partner?.return_instructions && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Return Instructions:</h3>
                      <p className="text-sm">{referralData.partner.return_instructions}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-muted pt-4 mt-8">
                  <p className="text-sm">
                    <strong>Referring Clinician:</strong> {referralData.episode.clinician}
                    {referralData.episode.clinician_credentials && `, ${referralData.episode.clinician_credentials}`}
                  </p>
                  {referralData.episode.npi && (
                    <p className="text-sm"><strong>NPI:</strong> {referralData.episode.npi}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Please contact us at {referralData.clinic?.phone || "our clinic"} if you have any questions regarding this referral.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No referral data found</div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #referral-print, #referral-print * {
            visibility: visible;
          }
          #referral-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
