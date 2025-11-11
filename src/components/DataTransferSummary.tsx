import { Check, AlertTriangle, X, FileText, User, Activity, Clipboard, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface DataField {
  label: string;
  intakeValue?: string | string[] | number | null;
  episodeField: string;
  isCritical?: boolean;
}

interface DataTransferSummaryProps {
  intakeData: any;
  episodeData: any;
}

export function DataTransferSummary({ intakeData, episodeData }: DataTransferSummaryProps) {
  const dataCategories = [
    {
      title: "Patient Demographics",
      icon: User,
      fields: [
        { label: "Patient Name", intakeValue: intakeData.patient_name, episodeField: "patient_name", isCritical: true },
        { label: "Date of Birth", intakeValue: intakeData.date_of_birth, episodeField: "date_of_birth", isCritical: true },
        { label: "Phone", intakeValue: intakeData.phone, episodeField: "phone" },
        { label: "Email", intakeValue: intakeData.email, episodeField: "email" },
      ]
    },
    {
      title: "Injury & Condition Details",
      icon: Activity,
      fields: [
        { label: "Chief Complaint", intakeValue: intakeData.chief_complaint, episodeField: "diagnosis", isCritical: true },
        { label: "Injury Date", intakeValue: intakeData.injury_date, episodeField: "injury_date" },
        { label: "Injury Mechanism", intakeValue: intakeData.injury_mechanism, episodeField: "injury_mechanism" },
        { label: "Symptoms", intakeValue: intakeData.symptoms, episodeField: "injury_mechanism (appended)" },
        { label: "Pain Level", intakeValue: intakeData.pain_level, episodeField: "pain_level" },
      ]
    },
    {
      title: "Medical Background",
      icon: Clipboard,
      fields: [
        { label: "Medical History", intakeValue: intakeData.medical_history, episodeField: "medical_history", isCritical: true },
        { label: "Allergies", intakeValue: intakeData.allergies, episodeField: "medical_history (appended)", isCritical: true },
        { label: "Current Medications", intakeValue: intakeData.current_medications, episodeField: "medications", isCritical: true },
        { label: "Surgery History", intakeValue: intakeData.surgery_history, episodeField: "medical_history (appended)" },
        { label: "Hospitalization History", intakeValue: intakeData.hospitalization_history, episodeField: "medical_history (appended)" },
        { label: "Specialist Seen", intakeValue: intakeData.specialist_seen, episodeField: "medical_history (appended)" },
      ]
    },
    {
      title: "Care Coordination",
      icon: FileText,
      fields: [
        { label: "Primary Care Physician", intakeValue: intakeData.primary_care_physician, episodeField: "medical_history (appended)" },
        { label: "Referring Physician", intakeValue: intakeData.referring_physician, episodeField: "referring_physician" },
        { label: "Insurance Provider", intakeValue: intakeData.insurance_provider, episodeField: "insurance" },
        { label: "Emergency Contact", intakeValue: intakeData.emergency_contact_name, episodeField: "emergency_contact" },
        { label: "Emergency Phone", intakeValue: intakeData.emergency_contact_phone, episodeField: "emergency_phone" },
      ]
    },
    {
      title: "Functional Status & Treatment",
      icon: Activity,
      fields: [
        { label: "Functional Limitations", intakeValue: intakeData.complaints ? "Extracted from complaints" : null, episodeField: "functional_limitations" },
        { label: "Prior Treatments", intakeValue: intakeData.complaints ? "Extracted from complaints" : null, episodeField: "prior_treatments" },
      ]
    }
  ];

  const getFieldStatus = (field: DataField): "populated" | "missing" | "missing-critical" => {
    const hasValue = field.intakeValue !== null && 
                     field.intakeValue !== undefined && 
                     field.intakeValue !== "" &&
                     !(Array.isArray(field.intakeValue) && field.intakeValue.length === 0);
    
    if (hasValue) return "populated";
    if (field.isCritical) return "missing-critical";
    return "missing";
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "Not provided";
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "Not provided";
    }
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") {
      return value.length > 100 ? value.substring(0, 100) + "..." : value;
    }
    return String(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "populated":
        return <Check className="h-4 w-4 text-green-500" />;
      case "missing-critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "missing":
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "populated":
        return <Badge variant="default" className="bg-green-500">Transferred</Badge>;
      case "missing-critical":
        return <Badge variant="destructive">Critical - Missing</Badge>;
      case "missing":
        return <Badge variant="secondary">Not Provided</Badge>;
      default:
        return null;
    }
  };

  // Calculate overall statistics
  const totalFields = dataCategories.reduce((sum, cat) => sum + cat.fields.length, 0);
  const populatedFields = dataCategories.reduce((sum, cat) => 
    sum + cat.fields.filter(f => getFieldStatus(f) === "populated").length, 0
  );
  const missingCritical = dataCategories.reduce((sum, cat) => 
    sum + cat.fields.filter(f => getFieldStatus(f) === "missing-critical").length, 0
  );
  const completionRate = Math.round((populatedFields / totalFields) * 100);

  // Export as CSV
  const exportAsCSV = () => {
    try {
      // Create CSV header
      const headers = ["Category", "Field", "Intake Value", "Episode Field", "Status", "Critical"];
      
      // Create CSV rows
      const rows: string[][] = [];
      dataCategories.forEach(category => {
        category.fields.forEach(field => {
          const status = getFieldStatus(field);
          const statusText = status === "populated" ? "Transferred" : 
                           status === "missing-critical" ? "Critical Missing" : "Not Provided";
          const value = formatValue(field.intakeValue).replace(/"/g, '""'); // Escape quotes
          
          rows.push([
            category.title,
            field.label,
            `"${value}"`,
            field.episodeField,
            statusText,
            field.isCritical ? "Yes" : "No"
          ]);
        });
      });
      
      // Combine into CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `data-transfer-summary-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  // Export as PDF
  const exportAsPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Data Transfer Summary", pageWidth / 2, 15, { align: "center" });
      
      // Add patient info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient: ${intakeData.patient_name}`, 14, 25);
      doc.text(`DOB: ${new Date(intakeData.date_of_birth).toLocaleDateString()}`, 14, 32);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 39);
      
      // Add statistics
      doc.setFontSize(10);
      doc.text(`Transferred: ${populatedFields}/${totalFields} (${completionRate}%)`, 14, 46);
      doc.text(`Critical Missing: ${missingCritical}`, 14, 52);
      
      let yPos = 60;
      
      // Add data by category
      dataCategories.forEach((category, categoryIndex) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Category header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(category.title, 14, yPos);
        yPos += 8;
        
        // Create table data for this category
        const tableData = category.fields.map(field => {
          const status = getFieldStatus(field);
          const statusText = status === "populated" ? "✓" : 
                           status === "missing-critical" ? "⚠" : "✗";
          let value = formatValue(field.intakeValue);
          // Truncate long values for PDF
          if (value.length > 60) {
            value = value.substring(0, 57) + "...";
          }
          
          return [
            field.label,
            value,
            field.episodeField,
            statusText
          ];
        });
        
        // Add table
        autoTable(doc, {
          startY: yPos,
          head: [["Field", "Intake Value", "Episode Field", "Status"]],
          body: tableData,
          theme: "grid",
          headStyles: { 
            fillColor: [59, 130, 246],
            fontSize: 9,
            fontStyle: "bold"
          },
          bodyStyles: { 
            fontSize: 8
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 65 },
            2: { cellWidth: 50 },
            3: { cellWidth: 15, halign: "center" }
          },
          margin: { left: 14 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      });
      
      // Add footer with legend
      const finalY = (doc as any).lastAutoTable?.finalY || yPos;
      if (finalY < 270) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("Legend: ✓ = Transferred, ⚠ = Critical Missing, ✗ = Not Provided", 14, finalY + 5);
      }
      
      // Save the PDF
      doc.save(`data-transfer-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Transfer Summary
            </CardTitle>
            <CardDescription>
              Review what information was transferred from the intake form to the episode
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
                <FileText className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">{populatedFields}</span>
            </div>
            <span className="text-sm text-muted-foreground">Transferred</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">{missingCritical}</span>
            </div>
            <span className="text-sm text-muted-foreground">Critical Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-semibold">{completionRate}%</span>
            </div>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="multiple" defaultValue={dataCategories.map((_, i) => `item-${i}`)}>
            {dataCategories.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              const categoryStats = {
                populated: category.fields.filter(f => getFieldStatus(f) === "populated").length,
                missingCritical: category.fields.filter(f => getFieldStatus(f) === "missing-critical").length,
                total: category.fields.length
              };

              return (
                <AccordionItem key={`item-${categoryIndex}`} value={`item-${categoryIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{category.title}</span>
                      <div className="flex gap-2 ml-auto mr-2">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                          {categoryStats.populated}/{categoryStats.total}
                        </Badge>
                        {categoryStats.missingCritical > 0 && (
                          <Badge variant="destructive">
                            {categoryStats.missingCritical} critical
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {category.fields.map((field, fieldIndex) => {
                        const status = getFieldStatus(field);
                        return (
                          <div key={fieldIndex} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="mt-1">
                              {getStatusIcon(status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{field.label}</span>
                                {field.isCritical && status === "missing-critical" && (
                                  <Badge variant="outline" className="text-xs">Critical</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1 break-words">
                                {formatValue(field.intakeValue)}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">→ Episode: {field.episodeField}</span>
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
