import { useState, useRef } from "react";
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
  guardian_phone?: string | null;
  access_code?: string | null;
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
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  
  if (!intakeForm) return null;

  const formatDateStr = (dateStr?: string | null) => {
    if (!dateStr) return "Not provided";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    const iframe = printIframeRef.current;
    if (!iframe) return;

    const complaints = intakeForm.complaints || [];
    const primaryComplaint = complaints.find(c => c.isPrimary) || complaints[0];
    const reviewOfSystems = intakeForm.review_of_systems || [];

    // Build the print HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Intake Form Summary - ${intakeForm.patient_name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; padding: 20px; color: #000; }
          .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; }
          .header h1 { font-size: 18px; font-weight: bold; }
          .header-right { text-align: right; font-size: 10px; }
          .section-header { background: #f3f4f6; padding: 4px 8px; font-weight: bold; font-size: 11px; margin-bottom: 4px; }
          .section-header-dark { background: #1f2937; color: white; padding: 4px 8px; font-weight: bold; font-size: 11px; margin-bottom: 4px; }
          .section-header-alert { background: #fee2e2; color: #991b1b; padding: 4px 8px; font-weight: bold; font-size: 11px; margin-bottom: 4px; }
          .section { margin-bottom: 16px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
          .col-span-2 { grid-column: span 2; }
          .complaint-box { border: 2px solid #1f2937; padding: 8px; }
          .alert-text { color: #b91c1c; font-weight: bold; }
          .footer { border-top: 2px solid #000; padding-top: 12px; margin-top: 16px; }
          .notes-box { background: #fafafa; border: 1px solid #d1d5db; padding: 12px; min-height: 80px; }
          .timestamp { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 8px; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>NEW PATIENT INTAKE SUMMARY</h1>
            <p style="font-size: 12px; color: #666;">Pittsford Performance Care</p>
          </div>
          <div class="header-right">
            <p><strong>Received:</strong> ${formatDateStr(intakeForm.submitted_at)}</p>
            ${intakeForm.access_code ? `<p><strong>Code:</strong> ${intakeForm.access_code}</p>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-header">PATIENT INFORMATION</div>
          <div class="grid-2">
            <p><strong>Name:</strong> ${intakeForm.patient_name}</p>
            <p><strong>DOB:</strong> ${formatDateStr(intakeForm.date_of_birth)}</p>
            <p><strong>Phone:</strong> ${intakeForm.phone || "—"}</p>
            <p><strong>Email:</strong> ${intakeForm.email || "—"}</p>
            ${intakeForm.guardian_phone ? `<p class="col-span-2"><strong>Guardian Phone:</strong> ${intakeForm.guardian_phone}</p>` : ''}
            ${intakeForm.address ? `<p class="col-span-2"><strong>Address:</strong> ${intakeForm.address}</p>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="grid-2">
            <div>
              <div class="section-header">EMERGENCY CONTACT</div>
              <p><strong>Name:</strong> ${intakeForm.emergency_contact_name || "—"}</p>
              <p><strong>Phone:</strong> ${intakeForm.emergency_contact_phone || "—"}</p>
              <p><strong>Relationship:</strong> ${intakeForm.emergency_contact_relationship || "—"}</p>
            </div>
            <div>
              <div class="section-header">INSURANCE</div>
              <p><strong>Provider:</strong> ${intakeForm.insurance_provider || "—"}</p>
              <p><strong>ID:</strong> ${intakeForm.insurance_id || "—"}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header-dark">CHIEF COMPLAINT</div>
          <div class="complaint-box">
            ${primaryComplaint ? `
              <p style="font-weight: bold;">${primaryComplaint.category || 'General'} — ${primaryComplaint.severity || 'Unknown'} — ${primaryComplaint.duration || 'Not specified'}</p>
              <p style="margin-top: 4px;">${primaryComplaint.text || intakeForm.chief_complaint}</p>
            ` : `<p>${intakeForm.chief_complaint || "Not specified"}</p>`}
            ${intakeForm.pain_level !== null && intakeForm.pain_level !== undefined ? `<p style="margin-top: 4px;"><strong>Pain Level:</strong> ${intakeForm.pain_level}/10</p>` : ''}
          </div>
        </div>

        ${complaints.length > 1 ? `
          <div class="section">
            <div class="section-header">ADDITIONAL CONCERNS</div>
            ${complaints.filter(c => !c.isPrimary).map((complaint, i) => `
              <p style="border-bottom: 1px solid #e5e7eb; padding: 4px 0;"><strong>#${i + 2}:</strong> ${complaint.category || 'General'} — ${complaint.severity || 'Unknown'} — ${complaint.text}</p>
            `).join('')}
          </div>
        ` : ''}

        ${(intakeForm.injury_date || intakeForm.injury_mechanism || intakeForm.symptoms) ? `
          <div class="section">
            <div class="section-header">INJURY DETAILS</div>
            <div class="grid-2">
              ${intakeForm.injury_date ? `<p><strong>Date:</strong> ${formatDateStr(intakeForm.injury_date)}</p>` : ''}
              ${intakeForm.injury_mechanism ? `<p class="col-span-2"><strong>Mechanism:</strong> ${intakeForm.injury_mechanism}</p>` : ''}
              ${intakeForm.symptoms ? `<p class="col-span-2"><strong>Symptoms:</strong> ${intakeForm.symptoms}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <div class="section">
          <div class="grid-2">
            <div>
              <div class="section-header">MEDICAL HISTORY</div>
              <p>${intakeForm.medical_history || "None reported"}</p>
            </div>
            <div>
              <div class="section-header">CURRENT MEDICATIONS</div>
              <p>${intakeForm.current_medications || "None reported"}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="${intakeForm.allergies && intakeForm.allergies.toLowerCase() !== 'none' && intakeForm.allergies.toLowerCase() !== 'nkda' ? 'section-header-alert' : 'section-header'}">
            ALLERGIES ${intakeForm.allergies && intakeForm.allergies.toLowerCase() !== 'none' ? '⚠️' : ''}
          </div>
          <p class="${intakeForm.allergies && intakeForm.allergies.toLowerCase() !== 'none' ? 'alert-text' : ''}">${intakeForm.allergies || "NKDA (No Known Drug Allergies)"}</p>
        </div>

        ${intakeForm.primary_care_physician ? `
          <div class="section">
            <div class="section-header">PRIMARY CARE PHYSICIAN</div>
            <div class="grid-3">
              <p><strong>Name:</strong> ${intakeForm.primary_care_physician}</p>
              <p><strong>Phone:</strong> ${intakeForm.pcp_phone || "—"}</p>
              <p><strong>Fax:</strong> ${intakeForm.pcp_fax || "—"}</p>
            </div>
          </div>
        ` : ''}

        ${reviewOfSystems.length > 0 ? `
          <div class="section">
            <div class="section-header">REVIEW OF SYSTEMS — POSITIVE FINDINGS</div>
            <p style="font-size: 10px;">${reviewOfSystems.join(" • ")}</p>
          </div>
        ` : ''}

        <div class="footer">
          <div class="notes-box">
            <p style="font-weight: bold; font-size: 11px; margin-bottom: 8px;">EHR NOTES / ACTION ITEMS:</p>
          </div>
        </div>

        <p class="timestamp">Printed: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
      </body>
      </html>
    `;

    // Write to iframe and print
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 100);
    }
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

      {/* Hidden iframe for printing */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: 0, height: 0 }}
        title="Print Intake Summary"
      />
    </Dialog>
  );
}
