import { useEffect, useRef } from "react";
import { format } from "date-fns";

interface ComplaintData {
  text: string;
  category: string;
  severity: string;
  duration: string;
  isPrimary: boolean;
  priority?: number;
}

interface IntakeFormData {
  patient_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  address?: string;
  guardian_phone?: string;
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  primary_care_physician?: string;
  pcp_phone?: string;
  pcp_fax?: string;
  current_medications?: string;
  allergies?: string;
  medical_history?: string;
  chief_complaint?: string;
  complaints?: ComplaintData[];
  injury_date?: string;
  injury_mechanism?: string;
  pain_level?: number;
  symptoms?: string;
  review_of_systems?: string[];
  consent_signed_name?: string;
  consent_date?: string;
  submitted_at?: string;
  access_code?: string;
}

interface IntakeSummaryPrintableProps {
  data: IntakeFormData;
  onPrintComplete?: () => void;
  autoPrint?: boolean;
}

export function IntakeSummaryPrintable({ data, onPrintComplete, autoPrint = false }: IntakeSummaryPrintableProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoPrint && printRef.current) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        window.print();
        onPrintComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, onPrintComplete]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not provided";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const complaints = data.complaints || [];
  const primaryComplaint = complaints.find(c => c.isPrimary) || complaints[0];
  const reviewOfSystems = data.review_of_systems || [];

  return (
    <>
      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body > *:not(.print-intake-summary) {
              display: none !important;
            }
            .print-intake-summary {
              display: block !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              z-index: 99999 !important;
            }
          }
        `}
      </style>
      <div 
        ref={printRef}
        className="print-intake-summary hidden print:block bg-white text-black p-6 max-w-[8.5in] mx-auto"
        style={{ fontSize: "11px", lineHeight: "1.3" }}
      >
      {/* Header */}
      <div className="border-b-2 border-black pb-2 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">NEW PATIENT INTAKE SUMMARY</h1>
            <p className="text-sm text-gray-600">Pittsford Performance Care</p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Received:</strong> {formatDate(data.submitted_at)}</p>
            {data.access_code && <p><strong>Code:</strong> {data.access_code}</p>}
          </div>
        </div>
      </div>

      {/* Patient Demographics - Compact Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4">
        <div className="col-span-2 bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
          PATIENT INFORMATION
        </div>
        <p><strong>Name:</strong> {data.patient_name}</p>
        <p><strong>DOB:</strong> {formatDate(data.date_of_birth)}</p>
        <p><strong>Phone:</strong> {data.phone || "—"}</p>
        <p><strong>Email:</strong> {data.email || "—"}</p>
        {data.guardian_phone && (
          <p className="col-span-2"><strong>Guardian Phone:</strong> {data.guardian_phone}</p>
        )}
        {data.address && (
          <p className="col-span-2"><strong>Address:</strong> {data.address}</p>
        )}
      </div>

      {/* Emergency Contact & Insurance - Side by Side */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4">
        <div>
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            EMERGENCY CONTACT
          </div>
          <p><strong>Name:</strong> {data.emergency_contact_name || "—"}</p>
          <p><strong>Phone:</strong> {data.emergency_contact_phone || "—"}</p>
          <p><strong>Relationship:</strong> {data.emergency_contact_relationship || "—"}</p>
        </div>
        <div>
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            INSURANCE
          </div>
          <p><strong>Provider:</strong> {data.insurance_provider || "—"}</p>
          <p><strong>ID:</strong> {data.insurance_id || "—"}</p>
        </div>
      </div>

      {/* Chief Complaint - Highlighted */}
      <div className="mb-4">
        <div className="bg-gray-800 text-white px-2 py-1 font-bold text-sm mb-1">
          CHIEF COMPLAINT
        </div>
        <div className="border-2 border-gray-800 p-2">
          {primaryComplaint ? (
            <div>
              <p className="font-bold">{primaryComplaint.category} — {primaryComplaint.severity} — {primaryComplaint.duration}</p>
              <p className="mt-1">{primaryComplaint.text || data.chief_complaint}</p>
              {data.pain_level !== undefined && data.pain_level !== null && (
                <p className="mt-1"><strong>Pain Level:</strong> {data.pain_level}/10</p>
              )}
            </div>
          ) : (
            <p>{data.chief_complaint || "Not specified"}</p>
          )}
        </div>
      </div>

      {/* Additional Concerns */}
      {complaints.length > 1 && (
        <div className="mb-4">
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            ADDITIONAL CONCERNS
          </div>
          {complaints.filter(c => !c.isPrimary).map((complaint, i) => (
            <div key={i} className="border-b border-gray-200 py-1">
              <p><strong>#{i + 2}:</strong> {complaint.category} — {complaint.severity} — {complaint.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Injury Details */}
      {(data.injury_date || data.injury_mechanism || data.symptoms) && (
        <div className="mb-4">
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            INJURY DETAILS
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            {data.injury_date && <p><strong>Date:</strong> {formatDate(data.injury_date)}</p>}
            {data.injury_mechanism && <p className="col-span-2"><strong>Mechanism:</strong> {data.injury_mechanism}</p>}
            {data.symptoms && <p className="col-span-2"><strong>Symptoms:</strong> {data.symptoms}</p>}
          </div>
        </div>
      )}

      {/* Medical History & Medications - Side by Side */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4">
        <div>
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            MEDICAL HISTORY
          </div>
          <p>{data.medical_history || "None reported"}</p>
        </div>
        <div>
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            CURRENT MEDICATIONS
          </div>
          <p>{data.current_medications || "None reported"}</p>
        </div>
      </div>

      {/* Allergies - Highlighted if present */}
      <div className="mb-4">
        <div className={`px-2 py-1 font-bold text-sm mb-1 ${data.allergies ? "bg-red-100 text-red-800" : "bg-gray-100"}`}>
          ALLERGIES {data.allergies ? "⚠️" : ""}
        </div>
        <p className={data.allergies ? "font-bold text-red-700" : ""}>{data.allergies || "NKDA (No Known Drug Allergies)"}</p>
      </div>

      {/* PCP Information */}
      {data.primary_care_physician && (
        <div className="mb-4">
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            PRIMARY CARE PHYSICIAN
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            <p><strong>Name:</strong> {data.primary_care_physician}</p>
            <p><strong>Phone:</strong> {data.pcp_phone || "—"}</p>
            <p><strong>Fax:</strong> {data.pcp_fax || "—"}</p>
          </div>
        </div>
      )}

      {/* Review of Systems - Compact */}
      {reviewOfSystems.length > 0 && (
        <div className="mb-4">
          <div className="bg-gray-100 px-2 py-1 font-bold text-sm mb-1">
            REVIEW OF SYSTEMS — POSITIVE FINDINGS
          </div>
          <p className="text-xs">{reviewOfSystems.join(" • ")}</p>
        </div>
      )}

      {/* Footer with EHR Notes Space */}
      <div className="border-t-2 border-black pt-3 mt-4">
        <div className="bg-gray-50 border border-gray-300 p-3 min-h-[80px]">
          <p className="font-bold text-sm mb-2">EHR NOTES / ACTION ITEMS:</p>
          <div className="h-16"></div>
        </div>
      </div>

      {/* Print Timestamp */}
      <div className="text-xs text-gray-400 text-center mt-2">
        Printed: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
      </div>
    </div>
    </>
  );
}
