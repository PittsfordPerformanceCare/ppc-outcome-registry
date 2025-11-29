import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ComplaintData {
  text: string;
  category: string;
  severity: string;
  duration: string;
  isPrimary: boolean;
  priority?: number;
}

interface FormData {
  patientName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  primaryCarePhysician?: string;
  pcpPhone?: string;
  pcpFax?: string;
  currentMedications?: string;
  allergies?: string;
  medicalHistory?: string;
  complaints: ComplaintData[];
  injuryDate?: string;
  injuryMechanism?: string;
  painLevel: number;
  symptoms?: string;
  reviewOfSystems: string[];
  consentSignedName: string;
  consentDate: string;
}

export function generateIntakePDF(formData: FormData, accessCode: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let currentY = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Intake Form", pageWidth / 2, currentY, { align: "center" });
  currentY += 15;

  // Access Code
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Access Code: ${accessCode}`, margin, currentY);
  doc.text(`Submitted: ${new Date().toLocaleString()}`, pageWidth - margin, currentY, { align: "right" });
  currentY += 10;

  // Personal Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", margin, currentY);
  currentY += 8;

  const personalInfo = [
    ["Name", formData.patientName],
    ["Date of Birth", formData.dateOfBirth],
    ["Phone", formData.phone || "Not provided"],
    ["Email", formData.email || "Not provided"],
    ["Address", formData.address || "Not provided"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: personalInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Insurance Information
  if (formData.insuranceProvider || formData.insuranceId) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Insurance Information", margin, currentY);
    currentY += 8;

    const insuranceInfo = [
      ["Provider", formData.insuranceProvider || "Not provided"],
      ["Insurance ID", formData.insuranceId || "Not provided"],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: insuranceInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Emergency Contact
  if (formData.emergencyContactName) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Emergency Contact", margin, currentY);
    currentY += 8;

    const emergencyInfo = [
      ["Name", formData.emergencyContactName || "Not provided"],
      ["Phone", formData.emergencyContactPhone || "Not provided"],
      ["Relationship", formData.emergencyContactRelationship || "Not provided"],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: emergencyInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add new page for medical information
  doc.addPage();
  currentY = 20;

  // Medical History
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Medical History", margin, currentY);
  currentY += 8;

  const medicalInfo: string[][] = [];
  if (formData.primaryCarePhysician) medicalInfo.push(["Primary Care Physician", formData.primaryCarePhysician]);
  if (formData.pcpPhone) medicalInfo.push(["PCP Phone", formData.pcpPhone]);
  if (formData.pcpFax) medicalInfo.push(["PCP Fax", formData.pcpFax]);
  if (formData.currentMedications) medicalInfo.push(["Current Medications", formData.currentMedications]);
  if (formData.allergies) medicalInfo.push(["Allergies", formData.allergies]);
  if (formData.medicalHistory) medicalInfo.push(["Medical History", formData.medicalHistory]);

  if (medicalInfo.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [],
      body: medicalInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Current Concerns
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Current Concerns", margin, currentY);
  currentY += 8;

  const complaintsData = formData.complaints.map((complaint, index) => [
    `Priority #${complaint.priority || index + 1}`,
    complaint.category,
    complaint.severity,
    complaint.duration,
    complaint.text
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Priority', 'Location', 'Severity', 'Duration', 'Description']],
    body: complaintsData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Additional Concern Details
  if (formData.injuryDate || formData.injuryMechanism || formData.symptoms) {
    const concernDetails: string[][] = [];
    if (formData.injuryDate) concernDetails.push(["Injury Date", formData.injuryDate]);
    if (formData.injuryMechanism) concernDetails.push(["How It Happened", formData.injuryMechanism]);
    if (formData.symptoms) concernDetails.push(["Additional Symptoms", formData.symptoms]);
    concernDetails.push(["Current Pain Level", `${formData.painLevel}/10`]);

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: concernDetails,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Review of Systems
  if (formData.reviewOfSystems.length > 0) {
    // Check if we need a new page
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Review of Systems", margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const symptomText = formData.reviewOfSystems.join(", ");
    const splitText = doc.splitTextToSize(symptomText, pageWidth - 2 * margin);
    doc.text(splitText, margin, currentY);
    currentY += splitText.length * 5 + 10;
  }

  // Add new page for consent
  doc.addPage();
  currentY = 20;

  // Consent Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Consent & Acknowledgment", margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Signed Name: ${formData.consentSignedName}`, margin, currentY);
  currentY += 6;
  doc.text(`Date: ${formData.consentDate}`, margin, currentY);
  currentY += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Patient has acknowledged informed consent for treatment and HIPAA Privacy Notice.", margin, currentY);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
}
