import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  AlertCircle,
  Brain,
  Activity
} from "lucide-react";

interface LeadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    name: string;
    email: string;
    phone: string | null;
    primaryConcern: string | null;
    systemCategory: string | null;
    createdAt: string;
    notes?: string;
    symptomSummary?: string;
    whoIsThisFor?: string;
    preferredContactMethod?: string;
  } | null;
}

// Parse the notes field which contains structured intake data
function parseIntakeNotes(notes: string | undefined): Record<string, string> {
  if (!notes) return {};
  
  const parsed: Record<string, string> = {};
  const parts = notes.split(". ");
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Handle "Key: value" format
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();
      parsed[key] = value;
    }
  }
  
  return parsed;
}

// Map internal keys to display labels
const LABEL_MAP: Record<string, string> = {
  "child age": "Child's Age",
  "grade": "Grade",
  "duration": "Symptom Duration",
  "school symptoms": "Symptoms at School",
  "athletic symptoms": "Symptoms During Athletics",
  "head injury evaluation": "Prior Head Injury Evaluation",
  "previous evaluation": "Previously Evaluated",
  "previous treatment": "Previous Treatment",
  "has referral": "Has Referral",
};

export function LeadDetailsDialog({ open, onOpenChange, lead }: LeadDetailsDialogProps) {
  if (!lead) return null;

  const parsedNotes = parseIntakeNotes(lead.notes);
  const isPediatric = lead.whoIsThisFor === "child" || lead.name.includes("Parent:");
  const isConcussion = lead.systemCategory === "concussion" || lead.primaryConcern === "concussion";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lead Intake Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Patient Information
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{lead.name}</p>
                  {isPediatric && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Pediatric Patient
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
              
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Submitted {format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              {lead.preferredContactMethod && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Preferred contact: <span className="font-medium capitalize">{lead.preferredContactMethod}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Clinical Information
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              {lead.primaryConcern && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Concern</p>
                    <p className="font-medium capitalize">{lead.primaryConcern}</p>
                  </div>
                </div>
              )}

              {lead.systemCategory && (
                <div className="flex items-center gap-3">
                  {lead.systemCategory === "concussion" || lead.systemCategory === "neuro" ? (
                    <Brain className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">System Category</p>
                    <Badge 
                      variant="outline" 
                      className={
                        lead.systemCategory === "concussion" || lead.systemCategory === "neuro"
                          ? "border-purple-300 text-purple-700 bg-purple-50"
                          : "border-blue-300 text-blue-700 bg-blue-50"
                      }
                    >
                      {lead.systemCategory.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}

              {lead.symptomSummary && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Symptoms Described</p>
                  <p className="text-sm bg-background/50 p-2 rounded border">
                    {lead.symptomSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Intake Details (parsed from notes) */}
          {Object.keys(parsedNotes).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {isPediatric ? "Pediatric Intake Details" : "Intake Details"}
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(parsedNotes).map(([key, value]) => {
                    const displayLabel = LABEL_MAP[key] || key.charAt(0).toUpperCase() + key.slice(1);
                    const isHighlight = key === "head injury evaluation" && value.startsWith("yes");
                    
                    return (
                      <div 
                        key={key} 
                        className={`p-2 rounded ${isHighlight ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-background/50'}`}
                      >
                        <p className="text-xs text-muted-foreground">{displayLabel}</p>
                        <p className={`text-sm font-medium capitalize ${isHighlight ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Raw Notes Fallback */}
          {lead.notes && Object.keys(parsedNotes).length === 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Notes
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
