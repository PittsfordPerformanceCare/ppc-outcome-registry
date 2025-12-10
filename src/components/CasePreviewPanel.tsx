import { ClinicianAppointment } from "@/hooks/useClinicianAppointments";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Activity,
  Pill,
  AlertTriangle,
  Target,
  Heart
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface CasePreviewPanelProps {
  appointment: ClinicianAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CasePreviewPanel({ appointment, open, onOpenChange }: CasePreviewPanelProps) {
  if (!appointment) return null;

  const getConditionBadge = (type: string) => {
    switch (type) {
      case "neuro":
        return <Badge className="bg-purple-500/10 text-purple-700 border-purple-200">Neurologic</Badge>;
      case "msk":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">MSK</Badge>;
      case "pediatric":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">Pediatric</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return time;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {appointment.patient_name}
              </SheetTitle>
              <SheetDescription className="mt-2 flex flex-wrap items-center gap-2">
                {getConditionBadge(appointment.condition_type)}
                {appointment.is_referral && (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    Referral
                  </Badge>
                )}
                {appointment.lead_data?.severity_score && (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    Severity: {appointment.lead_data.severity_score}/10
                  </Badge>
                )}
              </SheetDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(parseISO(appointment.scheduled_date), "EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatTime(appointment.scheduled_time)}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Form Status Card */}
            <Card className={appointment.form_status === "completed" 
              ? "border-green-200 bg-green-50/50" 
              : "border-muted bg-muted/20"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {appointment.form_status === "completed" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">New Patient Forms Completed</p>
                        <p className="text-sm text-green-600">
                          Submitted {appointment.intake_form_data?.submitted_at 
                            ? format(parseISO(appointment.intake_form_data.submitted_at), "MMM d 'at' h:mm a")
                            : "recently"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Forms Not Yet Completed</p>
                        <p className="text-sm text-muted-foreground">
                          Many patients complete them during check-in on the day of their visit.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lead Intake Snapshot */}
            {appointment.lead_data && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Lead Intake Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {appointment.lead_data.primary_concern && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Primary Concern</p>
                      <p className="font-medium">{appointment.lead_data.primary_concern}</p>
                    </div>
                  )}
                  
                  {appointment.lead_data.symptom_summary && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Symptom Description</p>
                      <p>{appointment.lead_data.symptom_summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {appointment.lead_data.system_category && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Category</p>
                        <p className="font-medium capitalize">{appointment.lead_data.system_category}</p>
                      </div>
                    )}
                    {appointment.lead_data.who_is_this_for && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Patient Type</p>
                        <p className="font-medium capitalize">{appointment.lead_data.who_is_this_for}</p>
                      </div>
                    )}
                    {appointment.lead_data.pillar_origin && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Pillar</p>
                        <p className="font-medium capitalize">{appointment.lead_data.pillar_origin}</p>
                      </div>
                    )}
                    {appointment.lead_data.utm_source && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Source</p>
                        <p className="font-medium capitalize">{appointment.lead_data.utm_source}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Lead Data */}
            {!appointment.lead_data && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Lead Not Linked</p>
                  <p className="text-sm">No lead intake data found for this appointment.</p>
                </CardContent>
              </Card>
            )}

            {/* NP Form Summary (if completed) */}
            {appointment.intake_form_data && appointment.form_status === "completed" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    New Patient Form Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {/* Chief Complaint */}
                  {appointment.intake_form_data.chief_complaint && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Chief Complaint
                      </p>
                      <p className="font-medium">{appointment.intake_form_data.chief_complaint}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Medical History */}
                  {appointment.intake_form_data.medical_history && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Medical History (Key Items)
                      </p>
                      <p className="line-clamp-3">{appointment.intake_form_data.medical_history}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {appointment.intake_form_data.current_medications && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Pill className="h-3 w-3" /> Medications
                      </p>
                      <p className="line-clamp-2">{appointment.intake_form_data.current_medications}</p>
                    </div>
                  )}

                  {/* Allergies */}
                  {appointment.intake_form_data.allergies && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> Allergies
                      </p>
                      <p className="text-amber-700 font-medium">{appointment.intake_form_data.allergies}</p>
                    </div>
                  )}

                  {/* Pain Level */}
                  {appointment.intake_form_data.pain_level !== null && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Pain Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2" 
                            style={{ width: `${(appointment.intake_form_data.pain_level / 10) * 100}%` }} 
                          />
                        </div>
                        <span className="font-medium">{appointment.intake_form_data.pain_level}/10</span>
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {appointment.intake_form_data.symptoms && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Symptoms</p>
                      <p className="line-clamp-3">{appointment.intake_form_data.symptoms}</p>
                    </div>
                  )}

                  {/* Referring Physician */}
                  {appointment.intake_form_data.referring_physician && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Referring Physician</p>
                      <p className="font-medium">{appointment.intake_form_data.referring_physician}</p>
                    </div>
                  )}

                  {/* PCP */}
                  {appointment.intake_form_data.primary_care_physician && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Primary Care Physician</p>
                      <p>{appointment.intake_form_data.primary_care_physician}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Link */}
            <div className="pt-2">
              <Button variant="outline" className="w-full" asChild>
                <a href={`/admin-shell/patients`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Patient Record
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
