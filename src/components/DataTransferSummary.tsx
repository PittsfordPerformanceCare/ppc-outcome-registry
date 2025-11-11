import { Check, AlertTriangle, X, FileText, User, Activity, Clipboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Transfer Summary
        </CardTitle>
        <CardDescription>
          Review what information was transferred from the intake form to the episode
        </CardDescription>
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
