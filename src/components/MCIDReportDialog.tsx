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
import { FileText, Printer, Download } from "lucide-react";
import { MCIDReport } from "./MCIDReport";
import { MCIDSummary } from "@/lib/mcidTracking";
import { toast } from "sonner";
import { useClinicSettings } from "@/hooks/useClinicSettings";

interface MCIDReportDialogProps {
  patientName: string;
  dateOfBirth?: string;
  region: string;
  diagnosis?: string;
  startDate: string;
  dischargeDate: string;
  clinicianName?: string;
  clinicianNPI?: string;
  referringPhysician?: string;
  summary: MCIDSummary;
  daysInCare: number;
}

export function MCIDReportDialog(props: MCIDReportDialogProps) {
  const [open, setOpen] = useState(false);
  const { settings } = useClinicSettings();

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the report");
      return;
    }

    // Get the report content
    const reportContent = document.querySelector(".mcid-report");
    if (!reportContent) {
      toast.error("Report content not found");
      return;
    }

    // Write the HTML with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MCID Achievement Report - ${props.patientName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: white;
              padding: 40px;
            }
            
            .mcid-report {
              max-width: 900px;
              margin: 0 auto;
            }
            
            h1, h2, h3 {
              color: #2563eb;
              margin-bottom: 0.5rem;
            }
            
            .page-break {
              page-break-before: always;
              margin: 2rem 0;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              button {
                display: none;
              }
            }
            
            .grid {
              display: grid;
            }
            
            .grid-cols-2 {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .grid-cols-3 {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .gap-4 {
              gap: 1rem;
            }
            
            .gap-6 {
              gap: 1.5rem;
            }
            
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-8 { margin-top: 2rem; }
            
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .pb-6 { padding-bottom: 1.5rem; }
            .pt-4 { padding-top: 1rem; }
            
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .text-4xl { font-size: 2.25rem; }
            
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .border { border: 1px solid #e5e7eb; }
            .border-2 { border-width: 2px; }
            .border-b-4 { border-bottom-width: 4px; }
            .border-l-4 { border-left-width: 4px; }
            .border-t-2 { border-top-width: 2px; }
            
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.5rem; }
            
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            
            .bg-white { background-color: white; }
            
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            
            .text-green-600 { color: #16a34a; }
            .text-blue-600 { color: #2563eb; }
            .text-red-600 { color: #dc2626; }
            
            .bg-green-600 { background-color: #16a34a; }
            
            .uppercase { text-transform: uppercase; }
            .italic { font-style: italic; }
            
            .tracking-wide { letter-spacing: 0.025em; }
            
            .leading-relaxed { line-height: 1.625; }
          </style>
        </head>
        <body>
          ${reportContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success("Opening print dialog...");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Generate MCID Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>MCID Achievement Report</DialogTitle>
          <DialogDescription>
            Comprehensive outcome report for referring physicians
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button variant="outline" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export PDF
            <span className="text-xs text-muted-foreground ml-1">(Coming Soon)</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="pr-4">
            <MCIDReport
              {...props}
              clinicName={settings?.clinic_name}
              clinicTagline={settings?.tagline || undefined}
              clinicPhone={settings?.phone || undefined}
              clinicEmail={settings?.email || undefined}
              clinicAddress={settings?.address || undefined}
              clinicLogoUrl={settings?.logo_url || undefined}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
