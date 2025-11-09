import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (
    elementId: string,
    filename: string,
    options?: {
      orientation?: "portrait" | "landscape";
      format?: "a4" | "letter";
    }
  ) => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error("Element not found");
      }

      // Temporarily show print-hidden elements and hide print-only elements
      const printHidden = element.querySelectorAll('.print\\:hidden');
      printHidden.forEach(el => el.classList.add('pdf-temp-show'));

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Restore classes
      printHidden.forEach(el => el.classList.remove('pdf-temp-show'));

      // Calculate PDF dimensions
      const imgWidth = options?.orientation === "landscape" ? 297 : 210; // A4 dimensions in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: options?.orientation || "portrait",
        unit: "mm",
        format: options?.format || "a4",
      });

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // Add additional pages if content is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      // Save the PDF
      pdf.save(filename);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}
