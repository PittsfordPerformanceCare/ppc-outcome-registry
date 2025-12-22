import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText,
  User,
  Calendar,
  Activity,
  Target,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  ClipboardList,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface CareTargetOutcome {
  name: string;
  status: "resolved" | "improved" | "stable" | "referred";
  baselineScore?: number;
  dischargeScore?: number;
  outcomeMeasure?: string;
  notes?: string;
}

interface PCPDischargeSummaryProps {
  // Patient & Episode Information
  patientName: string;
  dateOfBirth?: string;
  episodeId: string;
  
  // Referral Information
  referringPhysician?: string;
  reasonForReferral: string;
  
  // Care Targets
  careTargets: CareTargetOutcome[];
  
  // Clinical Course
  startDate: string;
  dischargeDate: string;
  totalVisits?: number;
  clinicalCourseSummary: string;
  
  // Discharge Information
  dischargeStatus: "goals_met" | "functional_plateau" | "patient_discharge" | "referred_out";
  dischargeOutcome?: string;
  
  // Recommendations
  recommendations: string[];
  followUpGuidance?: string;
  
  // Clinician Information
  clinicianName?: string;
  clinicianCredentials?: string;
  clinicianNPI?: string;
  
  // Clinic Branding
  clinicName?: string;
  clinicTagline?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string;
}

export function PCPDischargeSummary({
  patientName,
  dateOfBirth,
  episodeId,
  referringPhysician,
  reasonForReferral,
  careTargets,
  startDate,
  dischargeDate,
  totalVisits,
  clinicalCourseSummary,
  dischargeStatus,
  dischargeOutcome,
  recommendations,
  followUpGuidance,
  clinicianName,
  clinicianCredentials,
  clinicianNPI,
  clinicName = "Pittsford Performance Care",
  clinicTagline,
  clinicPhone,
  clinicEmail,
  clinicAddress,
  clinicLogoUrl,
}: PCPDischargeSummaryProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getDischargeStatusLabel = (status: typeof dischargeStatus) => {
    switch (status) {
      case "goals_met":
        return "Treatment Goals Achieved";
      case "functional_plateau":
        return "Functional Plateau Reached";
      case "patient_discharge":
        return "Patient-Initiated Discharge";
      case "referred_out":
        return "Referred for Specialty Care";
      default:
        return "Episode Closed";
    }
  };

  const getCareTargetStatusBadge = (status: CareTargetOutcome["status"]) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-600 text-white">Resolved</Badge>;
      case "improved":
        return <Badge className="bg-blue-600 text-white">Improved</Badge>;
      case "stable":
        return <Badge className="bg-amber-600 text-white">Stable</Badge>;
      case "referred":
        return <Badge className="bg-purple-600 text-white">Referred</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const calculateDaysInCare = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(dischargeDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const daysInCare = calculateDaysInCare();

  return (
    <div className="pcp-discharge-summary bg-white text-black print:text-black">
      {/* Document Header */}
      <div className="border-b-4 border-primary pb-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FileText className="h-4 w-4" />
              <span className="uppercase tracking-wider font-medium">Episode Discharge Summary</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Primary Care Provider Communication
            </h1>
            <p className="text-sm text-gray-600">
              Authoritative conclusion of episode of care
            </p>
          </div>
          <div className="text-right">
            {clinicLogoUrl && (
              <div className="mb-3">
                <img
                  src={clinicLogoUrl}
                  alt="Clinic logo"
                  className="h-14 w-auto ml-auto object-contain"
                />
              </div>
            )}
            <div className="text-xl font-bold text-primary">{clinicName}</div>
            {clinicTagline && (
              <div className="text-sm text-gray-600">{clinicTagline}</div>
            )}
            {(clinicPhone || clinicEmail || clinicAddress) && (
              <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                {clinicPhone && (
                  <div className="flex items-center justify-end gap-1">
                    <Phone className="h-3 w-3" />
                    {clinicPhone}
                  </div>
                )}
                {clinicEmail && (
                  <div className="flex items-center justify-end gap-1">
                    <Mail className="h-3 w-3" />
                    {clinicEmail}
                  </div>
                )}
                {clinicAddress && (
                  <div className="flex items-center justify-end gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-right">{clinicAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient & Episode Header */}
      <section className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Patient</div>
              <div className="font-semibold text-lg">{patientName}</div>
              {dateOfBirth && (
                <div className="text-gray-600 text-sm">DOB: {formatDate(dateOfBirth)}</div>
              )}
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Episode ID</div>
              <div className="font-mono text-sm">{episodeId}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Treatment Period</div>
              <div className="text-sm">
                {formatDate(startDate)} — {formatDate(dischargeDate)}
              </div>
              {daysInCare !== null && (
                <div className="text-gray-600 text-xs">({daysInCare} days)</div>
              )}
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Visits</div>
              <div className="font-semibold">{totalVisits ?? "—"}</div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* Reason for Referral */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Reason for Referral
        </h2>
        <div className="bg-white border rounded-lg p-4">
          {referringPhysician && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Referring Provider:</span> {referringPhysician}
            </div>
          )}
          <p className="text-gray-800">{reasonForReferral}</p>
        </div>
      </section>

      {/* Care Targets Addressed */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Care Targets Addressed
        </h2>
        <div className="space-y-3">
          {careTargets.map((target, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{target.name}</h3>
                {getCareTargetStatusBadge(target.status)}
              </div>
              {target.outcomeMeasure && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Outcome Measure:</span> {target.outcomeMeasure}
                  {target.baselineScore !== undefined && target.dischargeScore !== undefined && (
                    <span className="ml-2">
                      ({target.baselineScore} → {target.dischargeScore})
                    </span>
                  )}
                </div>
              )}
              {target.notes && (
                <p className="text-sm text-gray-700">{target.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Summary of Clinical Course */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Summary of Clinical Course
        </h2>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">
            {clinicalCourseSummary}
          </p>
        </div>
      </section>

      {/* Outcomes at Discharge */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Outcomes at Discharge
        </h2>
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Discharge Status</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">
                  {getDischargeStatusLabel(dischargeStatus)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Care Targets</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {careTargets.filter(t => t.status === "resolved" || t.status === "improved").length} / {careTargets.length}
                </span>
                <span className="text-sm text-gray-600">resolved or improved</span>
              </div>
            </div>
          </div>
          {dischargeOutcome && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Discharge Notes</div>
              <p className="text-gray-800">{dischargeOutcome}</p>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Recommendations
        </h2>
        <div className="bg-white border rounded-lg p-4">
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-800">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Follow-Up Guidance */}
      {followUpGuidance && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Follow-Up Guidance
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-gray-800">{followUpGuidance}</p>
          </div>
        </section>
      )}

      <Separator className="my-6" />

      {/* Signature Block */}
      <footer className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Treating Clinician</div>
            <div className="font-semibold text-gray-900">
              {clinicianName || "—"}
              {clinicianCredentials && `, ${clinicianCredentials}`}
            </div>
            {clinicianNPI && (
              <div className="text-sm text-gray-600">NPI: {clinicianNPI}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Report Generated</div>
            <div className="text-sm text-gray-700">
              {format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            This document represents the authoritative conclusion of care for this episode and should be treated as a medico-legal clinical document.
          </p>
          <p className="mt-1">
            Questions regarding this report may be directed to {clinicPhone || clinicEmail || clinicName}.
          </p>
        </div>
      </footer>
    </div>
  );
}