import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Pill,
  Stethoscope,
  Activity,
  FileText,
  Shield,
  Heart,
  UserCheck,
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { IntakeSummaryPrintable } from "@/components/intake/IntakeSummaryPrintable";

interface IntakeFormData {
  id: string;
  patient_name: string;
  date_of_birth: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  chief_complaint: string;
  complaints?: Array<{
    text: string;
    severity?: string;
    duration?: string;
    category?: string;
    isPrimary?: boolean;
  }> | null;
  pain_level?: number | null;
  injury_date?: string | null;
  injury_mechanism?: string | null;
  symptoms?: string | null;
  allergies?: string | null;
  current_medications?: string | null;
  medical_history?: string | null;
  surgery_history?: string | null;
  hospitalization_history?: string | null;
  review_of_systems?: string[] | null;
  insurance_provider?: string | null;
  insurance_id?: string | null;
  primary_care_physician?: string | null;
  pcp_phone?: string | null;
  pcp_fax?: string | null;
  referring_physician?: string | null;
  referral_source?: string | null;
  consent_signed_name?: string | null;
  consent_date?: string | null;
  hipaa_acknowledged?: boolean | null;
  submitted_at?: string | null;
}

interface IntakeFormSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intakeForm: IntakeFormData | null;
}

export function IntakeFormSummaryDialog({ 
  open, 
  onOpenChange, 
  intakeForm 
}: IntakeFormSummaryDialogProps) {
  const [showPrintView, setShowPrintView] = useState(false);
  
  if (!intakeForm) return null;

  const handlePrint = () => {
    setShowPrintView(true);
    // Wait for render then print
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(intakeForm.date_of_birth);
  const isPediatric = age < 18;

  // Determine severity badge color
  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-destructive text-destructive-foreground';
      case 'moderate': return 'bg-orange-500 text-white';
      case 'mild': return 'bg-yellow-500 text-yellow-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Check for red flags
  const redFlags: string[] = [];
  if (intakeForm.pain_level && intakeForm.pain_level >= 8) {
    redFlags.push(`High pain level (${intakeForm.pain_level}/10)`);
  }
  if (intakeForm.allergies && intakeForm.allergies.toLowerCase() !== 'none' && intakeForm.allergies.toLowerCase() !== 'n/a') {
    redFlags.push('Has allergies');
  }
  const primaryComplaint = intakeForm.complaints?.find(c => c.isPrimary);
  if (primaryComplaint?.severity?.toLowerCase() === 'severe') {
    redFlags.push('Severe primary complaint');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Intake Form Summary
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted {intakeForm.submitted_at 
                  ? format(new Date(intakeForm.submitted_at), "MMM d, yyyy 'at' h:mm a")
                  : 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {redFlags.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {redFlags.length} Alert{redFlags.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Red Flags Alert */}
            {redFlags.length > 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <h4 className="font-semibold text-destructive flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Clinical Alerts
                </h4>
                <ul className="text-sm space-y-1">
                  {redFlags.map((flag, idx) => (
                    <li key={idx} className="text-destructive/90">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Patient Demographics */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{intakeForm.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age / DOB</p>
                  <p className="font-medium">
                    {age} years old 
                    {isPediatric && <Badge variant="outline" className="ml-2 text-xs">Pediatric</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(intakeForm.date_of_birth), "MMM d, yyyy")}
                  </p>
                </div>
                {intakeForm.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{intakeForm.phone}</p>
                    </div>
                  </div>
                )}
                {intakeForm.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{intakeForm.email}</p>
                    </div>
                  </div>
                )}
                {intakeForm.address && (
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium text-sm">{intakeForm.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {intakeForm.emergency_contact_name && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Emergency Contact
                </h3>
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="font-medium">{intakeForm.emergency_contact_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {intakeForm.emergency_contact_relationship}
                    {intakeForm.emergency_contact_phone && ` • ${intakeForm.emergency_contact_phone}`}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Chief Complaint & Clinical Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Chief Complaint
              </h3>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium text-base">{intakeForm.chief_complaint}</p>
                {intakeForm.pain_level !== null && intakeForm.pain_level !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Pain Level:</span>
                    <Badge className={intakeForm.pain_level >= 7 ? 'bg-destructive' : intakeForm.pain_level >= 4 ? 'bg-orange-500' : 'bg-green-500'}>
                      {intakeForm.pain_level}/10
                    </Badge>
                  </div>
                )}
              </div>

              {/* Detailed Complaints */}
              {intakeForm.complaints && intakeForm.complaints.length > 0 && (
                <div className="space-y-2">
                  {intakeForm.complaints.map((complaint, idx) => (
                    <div key={idx} className="p-3 rounded-md border bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{complaint.text}</p>
                        <Badge className={getSeverityColor(complaint.severity)}>
                          {complaint.severity || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        {complaint.duration && <span>Duration: {complaint.duration}</span>}
                        {complaint.category && <span>Category: {complaint.category}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Injury Details */}
              {(intakeForm.injury_date || intakeForm.injury_mechanism) && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Injury Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {intakeForm.injury_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Injury</p>
                        <p className="font-medium">{format(new Date(intakeForm.injury_date), "MMM d, yyyy")}</p>
                      </div>
                    )}
                    {intakeForm.injury_mechanism && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Mechanism</p>
                        <p className="font-medium">{intakeForm.injury_mechanism}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {intakeForm.symptoms && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
                  <p className="text-sm">{intakeForm.symptoms}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Medical History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Medical History
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {intakeForm.allergies && (
                  <div className={`p-3 rounded-lg border ${intakeForm.allergies.toLowerCase() !== 'none' ? 'bg-destructive/5 border-destructive/30' : 'bg-muted/30'}`}>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Allergies
                    </p>
                    <p className="text-sm font-medium">{intakeForm.allergies}</p>
                  </div>
                )}
                {intakeForm.current_medications && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Pill className="h-3 w-3" /> Current Medications
                    </p>
                    <p className="text-sm font-medium">{intakeForm.current_medications}</p>
                  </div>
                )}
                {intakeForm.surgery_history && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Surgical History</p>
                    <p className="text-sm font-medium">{intakeForm.surgery_history}</p>
                  </div>
                )}
                {intakeForm.hospitalization_history && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Hospitalization History</p>
                    <p className="text-sm font-medium">{intakeForm.hospitalization_history}</p>
                  </div>
                )}
              </div>
              {intakeForm.medical_history && (
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Past Medical History</p>
                  <p className="text-sm">{intakeForm.medical_history}</p>
                </div>
              )}
            </div>

            {/* Review of Systems */}
            {intakeForm.review_of_systems && intakeForm.review_of_systems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Review of Systems
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {intakeForm.review_of_systems.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Insurance & Provider Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Insurance & Providers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {intakeForm.insurance_provider && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Insurance</p>
                    <p className="font-medium text-sm">{intakeForm.insurance_provider}</p>
                    {intakeForm.insurance_id && (
                      <p className="text-xs text-muted-foreground">ID: {intakeForm.insurance_id}</p>
                    )}
                  </div>
                )}
                {intakeForm.primary_care_physician && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Primary Care Physician</p>
                    <p className="font-medium text-sm">{intakeForm.primary_care_physician}</p>
                    {intakeForm.pcp_phone && (
                      <p className="text-xs text-muted-foreground">{intakeForm.pcp_phone}</p>
                    )}
                  </div>
                )}
                {intakeForm.referring_physician && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Referring Physician</p>
                    <p className="font-medium text-sm">{intakeForm.referring_physician}</p>
                  </div>
                )}
                {intakeForm.referral_source && (
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Referral Source</p>
                    <p className="font-medium text-sm">{intakeForm.referral_source}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Consent Status */}
            {(intakeForm.consent_signed_name || intakeForm.hipaa_acknowledged) && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      Legal Documents Completed
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-green-600 dark:text-green-500">
                    {intakeForm.consent_signed_name && (
                      <p>Consent signed by: {intakeForm.consent_signed_name} on {intakeForm.consent_date ? format(new Date(intakeForm.consent_date), "MMM d, yyyy") : 'N/A'}</p>
                    )}
                    {intakeForm.hipaa_acknowledged && (
                      <p>HIPAA acknowledged ✓</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Hidden print view - uses the standardized print format */}
      {showPrintView && (
        <IntakeSummaryPrintable 
          data={{
            patient_name: intakeForm.patient_name,
            date_of_birth: intakeForm.date_of_birth,
            phone: intakeForm.phone || undefined,
            email: intakeForm.email || undefined,
            address: intakeForm.address || undefined,
            insurance_provider: intakeForm.insurance_provider || undefined,
            insurance_id: intakeForm.insurance_id || undefined,
            emergency_contact_name: intakeForm.emergency_contact_name || undefined,
            emergency_contact_phone: intakeForm.emergency_contact_phone || undefined,
            emergency_contact_relationship: intakeForm.emergency_contact_relationship || undefined,
            primary_care_physician: intakeForm.primary_care_physician || undefined,
            pcp_phone: intakeForm.pcp_phone || undefined,
            pcp_fax: intakeForm.pcp_fax || undefined,
            current_medications: intakeForm.current_medications || undefined,
            allergies: intakeForm.allergies || undefined,
            medical_history: intakeForm.medical_history || undefined,
            chief_complaint: intakeForm.chief_complaint,
            complaints: intakeForm.complaints?.map(c => ({
              text: c.text,
              category: c.category || '',
              severity: c.severity || '',
              duration: c.duration || '',
              isPrimary: c.isPrimary || false,
            })),
            injury_date: intakeForm.injury_date || undefined,
            injury_mechanism: intakeForm.injury_mechanism || undefined,
            pain_level: intakeForm.pain_level ?? undefined,
            symptoms: intakeForm.symptoms || undefined,
            review_of_systems: intakeForm.review_of_systems || undefined,
            consent_signed_name: intakeForm.consent_signed_name || undefined,
            consent_date: intakeForm.consent_date || undefined,
            submitted_at: intakeForm.submitted_at || undefined,
          }}
        />
      )}
    </Dialog>
  );
}
