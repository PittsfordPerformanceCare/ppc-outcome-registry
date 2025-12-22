import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Printer, Download, Loader2 } from "lucide-react";
import { PCPDischargeSummary } from "./PCPDischargeSummary";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface CareTargetOutcome {
  name: string;
  status: "resolved" | "improved" | "stable" | "referred";
  baselineScore?: number;
  dischargeScore?: number;
  outcomeMeasure?: string;
  notes?: string;
}

interface PCPDischargeSummaryDialogProps {
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
  
  // Trigger
  trigger?: React.ReactNode;
}

export function PCPDischargeSummaryDialog({
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
  clinicName,
  clinicTagline,
  clinicPhone,
  clinicEmail,
  clinicAddress,
  clinicLogoUrl,
  trigger,
}: PCPDischargeSummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the summary");
      return;
    }

    const summaryElement = document.getElementById("pcp-discharge-summary-content");
    if (!summaryElement) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Episode Discharge Summary - ${patientName}</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 24px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 20px; margin-bottom: 8px; }
            h2 { font-size: 14px; margin-bottom: 8px; margin-top: 16px; }
            h3 { font-size: 13px; margin-bottom: 4px; }
            p { margin-bottom: 8px; }
            .border-b-4 { border-bottom: 4px solid #2563eb; }
            .border { border: 1px solid #e5e7eb; }
            .border-t-2 { border-top: 2px solid #d1d5db; }
            .rounded-lg { border-radius: 8px; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-white { background-color: #ffffff; }
            .bg-amber-50 { background-color: #fffbeb; }
            .p-4 { padding: 16px; }
            .pb-6 { padding-bottom: 24px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-6 { margin-top: 24px; }
            .pt-6 { padding-top: 24px; }
            .pt-4 { padding-top: 16px; }
            .mt-4 { margin-top: 16px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
            .gap-4 { gap: 16px; }
            .gap-6 { gap: 24px; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .gap-2 { gap: 8px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-primary { color: #2563eb; }
            .text-gray-900 { color: #111827; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-green-600 { color: #16a34a; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-xs { font-size: 10px; }
            .text-sm { font-size: 11px; }
            .text-lg { font-size: 14px; }
            .text-xl { font-size: 16px; }
            .text-2xl { font-size: 18px; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .whitespace-pre-line { white-space: pre-line; }
            .leading-relaxed { line-height: 1.625; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .ml-2 { margin-left: 8px; }
            .mt-0\\.5 { margin-top: 2px; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace; }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 600;
            }
            .badge-green { background-color: #16a34a; color: white; }
            .badge-blue { background-color: #2563eb; color: white; }
            .badge-amber { background-color: #d97706; color: white; }
            .badge-purple { background-color: #9333ea; color: white; }
            img { max-height: 56px; object-fit: contain; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${summaryElement.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const summaryElement = document.getElementById("pcp-discharge-summary-content");
      if (!summaryElement) {
        throw new Error("Summary content not found");
      }

      // Simple text-based PDF generation
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Episode Discharge Summary", 20, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient: ${patientName}`, 20, 35);
      doc.text(`Episode ID: ${episodeId}`, 20, 42);
      doc.text(`Discharge Date: ${dischargeDate}`, 20, 49);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Reason for Referral", 20, 65);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const splitReason = doc.splitTextToSize(reasonForReferral, 170);
      doc.text(splitReason, 20, 73);
      
      let yPos = 73 + (splitReason.length * 6);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Care Targets Addressed", 20, yPos + 10);
      yPos += 18;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      careTargets.forEach((target, idx) => {
        doc.text(`${idx + 1}. ${target.name} - ${target.status}`, 20, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary of Clinical Course", 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(clinicalCourseSummary, 170);
      doc.text(splitSummary, 20, yPos);
      yPos += splitSummary.length * 6;
      
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recommendations", 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      recommendations.forEach((rec, idx) => {
        const splitRec = doc.splitTextToSize(`• ${rec}`, 165);
        doc.text(splitRec, 25, yPos);
        yPos += splitRec.length * 6;
      });
      
      if (followUpGuidance) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Follow-Up Guidance", 20, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const splitFollowUp = doc.splitTextToSize(followUpGuidance, 170);
        doc.text(splitFollowUp, 20, yPos);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(
        "This document represents the authoritative conclusion of care for this episode.",
        20,
        pageHeight - 20
      );
      if (clinicianName) {
        doc.text(`Treating Clinician: ${clinicianName}${clinicianCredentials ? `, ${clinicianCredentials}` : ""}`, 20, pageHeight - 14);
      }

      doc.save(`Discharge_Summary_${episodeId}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Discharge Summary
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Episode Discharge Summary
          </DialogTitle>
          <DialogDescription>
            Professional discharge summary for referring provider
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF} 
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </Button>
        </div>

        <ScrollArea className="h-[60vh]">
          <div id="pcp-discharge-summary-content" className="p-4">
            <PCPDischargeSummary
              patientName={patientName}
              dateOfBirth={dateOfBirth}
              episodeId={episodeId}
              referringPhysician={referringPhysician}
              reasonForReferral={reasonForReferral}
              careTargets={careTargets}
              startDate={startDate}
              dischargeDate={dischargeDate}
              totalVisits={totalVisits}
              clinicalCourseSummary={clinicalCourseSummary}
              dischargeStatus={dischargeStatus}
              dischargeOutcome={dischargeOutcome}
              recommendations={recommendations}
              followUpGuidance={followUpGuidance}
              clinicianName={clinicianName}
              clinicianCredentials={clinicianCredentials}
              clinicianNPI={clinicianNPI}
              clinicName={clinicName}
              clinicTagline={clinicTagline}
              clinicPhone={clinicPhone}
              clinicEmail={clinicEmail}
              clinicAddress={clinicAddress}
              clinicLogoUrl={clinicLogoUrl}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}