import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClinicalReadiness, ReadyPatient } from "@/hooks/useClinicalReadiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  RefreshCw, 
  ClipboardCheck,
  Brain,
  Bone,
  Clock,
  CheckCircle2,
  ArrowRightLeft
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { IntakeFormSummaryDialog } from "@/components/lead-dashboard/IntakeFormSummaryDialog";
import { OutstandingTasksTile } from "@/components/lead-dashboard";
import { ActionQueueSection } from "@/components/clinician/ActionQueueSection";
import { supabase } from "@/integrations/supabase/client";

export default function ClinicalDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isRefetching } = useClinicalReadiness();
  const [selectedPatient, setSelectedPatient] = useState<ReadyPatient | null>(null);
  const [showEpisodeDialog, setShowEpisodeDialog] = useState(false);
  const [intakeFormSummaryOpen, setIntakeFormSummaryOpen] = useState(false);
  const [selectedIntakeForm, setSelectedIntakeForm] = useState<any>(null);

  const handleViewIntakeSummary = async (patient: ReadyPatient) => {
    // Fetch intake form data
    const { data: intakeForm } = await supabase
      .from("intake_forms")
      .select("*")
      .or(`patient_name.ilike.${patient.patientName},email.ilike.${patient.email || ''}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (intakeForm) {
      setSelectedIntakeForm(intakeForm);
      setIntakeFormSummaryOpen(true);
    }
  };

  const handleCreateEpisode = (patient: ReadyPatient) => {
    setSelectedPatient(patient);
    setShowEpisodeDialog(true);
  };

  const handleEpisodeTypeSelect = (type: 'Neurologic' | 'MSK') => {
    if (!selectedPatient) return;
    
    // Store patient data in sessionStorage for pre-fill
    const episodeData = {
      patientName: selectedPatient.patientName,
      dateOfBirth: selectedPatient.dateOfBirth,
      email: selectedPatient.email,
      phone: selectedPatient.phone,
      chiefComplaint: selectedPatient.primaryComplaint,
      episodeType: type,
      sourceId: selectedPatient.id,
      sourceType: selectedPatient.source
    };
    
    sessionStorage.setItem('newEpisodeFromClinical', JSON.stringify(episodeData));
    setShowEpisodeDialog(false);
    navigate(`/new-episode?care_request=${selectedPatient.id}`);
  };

  const totalReady = (data?.newNeuroPatients?.length || 0) + 
    (data?.newMskPatients?.length || 0) + 
    (data?.returningNeuroPatients?.length || 0) + 
    (data?.returningMskPatients?.length || 0) + 
    (data?.internalNeuroPatients?.length || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Clinical Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Communication, tasks, and episode readiness
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Top Row: Communication Log and Task Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Communication Log */}
          <div>
            <ActionQueueSection />
          </div>
          
          {/* Task Manager */}
          <div>
            <OutstandingTasksTile />
          </div>
        </div>

        {/* Episode Readiness Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">Episode Readiness</h2>
                <p className="text-sm text-muted-foreground">
                  {totalReady === 0 
                    ? "No patients awaiting episodes" 
                    : `${totalReady} patient${totalReady !== 1 ? 's' : ''} ready for episode creation`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Episode Readiness Sections */}
          <div className="space-y-8">
            {/* Section 1: New Neuro Patients */}
            <PatientSection
              icon={<Brain className="h-4 w-4 text-primary" />}
              iconBgClass="bg-primary/10"
              title="New Neuro Patients"
              subtitle="First-time neurologic presentations, intake complete"
              patients={data?.newNeuroPatients || []}
              isLoading={isLoading}
              onCreateEpisode={handleCreateEpisode}
              onViewIntakeSummary={handleViewIntakeSummary}
              emptyMessage="No new neuro patients awaiting episodes"
            />

            {/* Section 2: New MSK Patients */}
            <PatientSection
              icon={<Bone className="h-4 w-4 text-accent" />}
              iconBgClass="bg-accent/10"
              title="New MSK Patients"
              subtitle="First-time musculoskeletal presentations, intake complete"
              patients={data?.newMskPatients || []}
              isLoading={isLoading}
              onCreateEpisode={handleCreateEpisode}
              onViewIntakeSummary={handleViewIntakeSummary}
              emptyMessage="No new MSK patients awaiting episodes"
            />

            {/* Section 3: Returning Neuro Patients */}
            <PatientSection
              icon={<Brain className="h-4 w-4 text-primary" />}
              iconBgClass="bg-primary/10"
              title="Returning Neuro Patients"
              subtitle="Previously discharged, presenting with new neurologic complaint"
              patients={data?.returningNeuroPatients || []}
              isLoading={isLoading}
              onCreateEpisode={handleCreateEpisode}
              onViewIntakeSummary={handleViewIntakeSummary}
              emptyMessage="No returning neuro patients awaiting episodes"
              showPriorContext
            />

            {/* Section 4: Returning MSK Patients */}
            <PatientSection
              icon={<Bone className="h-4 w-4 text-accent" />}
              iconBgClass="bg-accent/10"
              title="Returning MSK Patients"
              subtitle="Previously discharged, presenting with new MSK complaint"
              patients={data?.returningMskPatients || []}
              isLoading={isLoading}
              onCreateEpisode={handleCreateEpisode}
              onViewIntakeSummary={handleViewIntakeSummary}
              emptyMessage="No returning MSK patients awaiting episodes"
              showPriorContext
            />

            {/* Section 5: Internal Neuro Referrals */}
            <PatientSection
              icon={<ArrowRightLeft className="h-4 w-4 text-chart-3" />}
              iconBgClass="bg-chart-3/10"
              title="Internal Neuro Referrals"
              subtitle="Referred internally for neurologic evaluation"
              patients={data?.internalNeuroPatients || []}
              isLoading={isLoading}
              onCreateEpisode={handleCreateEpisode}
              onViewIntakeSummary={handleViewIntakeSummary}
              emptyMessage="No internal neuro referrals awaiting episodes"
            />
          </div>
        </div>
      </div>

      {/* Episode Type Selection Dialog */}
      <Dialog open={showEpisodeDialog} onOpenChange={setShowEpisodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Episode</DialogTitle>
            <DialogDescription>
              Select the episode type for {selectedPatient?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start gap-4 hover:bg-primary/5 hover:border-primary"
              onClick={() => handleEpisodeTypeSelect('Neurologic')}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Neurologic Episode</div>
                <div className="text-sm text-muted-foreground">
                  Concussion, vestibular, autonomic, cognitive
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 justify-start gap-4 hover:bg-accent/5 hover:border-accent"
              onClick={() => handleEpisodeTypeSelect('MSK')}
            >
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Bone className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-medium">MSK Episode</div>
                <div className="text-sm text-muted-foreground">
                  Musculoskeletal, spine, extremity
                </div>
              </div>
            </Button>
          </div>
          
          {/* Suggested classification hint */}
          {selectedPatient && (
            <div className="text-xs text-muted-foreground text-center pb-2">
              Based on intake: {selectedPatient.complaintClassification} presentation
              {selectedPatient.systemFocus && ` (${selectedPatient.systemFocus})`}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Intake Form Summary Dialog */}
      <IntakeFormSummaryDialog
        open={intakeFormSummaryOpen}
        onOpenChange={setIntakeFormSummaryOpen}
        intakeForm={selectedIntakeForm}
      />
    </div>
  );
}

// Patient Section Component
interface PatientSectionProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  subtitle: string;
  patients: ReadyPatient[];
  isLoading: boolean;
  onCreateEpisode: (patient: ReadyPatient) => void;
  onViewIntakeSummary: (patient: ReadyPatient) => void;
  emptyMessage: string;
  showPriorContext?: boolean;
}

function PatientSection({ 
  icon, 
  iconBgClass, 
  title, 
  subtitle, 
  patients, 
  isLoading, 
  onCreateEpisode,
  onViewIntakeSummary,
  emptyMessage,
  showPriorContext 
}: PatientSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-8 w-8 rounded-full ${iconBgClass} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground">
            {title}
            {!isLoading && patients.length > 0 && (
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({patients.length})
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map(i => (
            <Card key={i} className="border border-border">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <Card className="border border-dashed border-border bg-muted/30">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onCreateEpisode={onCreateEpisode}
              onViewIntakeSummary={onViewIntakeSummary}
              showPriorContext={showPriorContext}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Patient Card Component
interface PatientCardProps {
  patient: ReadyPatient;
  onCreateEpisode: (patient: ReadyPatient) => void;
  onViewIntakeSummary: (patient: ReadyPatient) => void;
  showPriorContext?: boolean;
}

function PatientCard({ patient, onCreateEpisode, onViewIntakeSummary, showPriorContext }: PatientCardProps) {
  return (
    <Card className="border border-border hover:border-border/80 transition-colors">
      <CardContent className="p-5">
        {/* Patient Name & Badge */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 
              className="font-medium text-foreground cursor-pointer hover:text-primary hover:underline transition-colors"
              onClick={() => onViewIntakeSummary(patient)}
            >
              {patient.patientName}
            </h3>
            {showPriorContext && patient.priorEpisodeContext && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {patient.priorEpisodeContext}
              </p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs font-normal ${
              patient.complaintClassification === 'Neurologic' 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-accent/10 text-accent border-accent/20'
            }`}
          >
            {patient.complaintClassification}
          </Badge>
        </div>
        
        {/* Complaint */}
        <p className="text-sm text-foreground/80 mb-1 line-clamp-2">
          {patient.primaryComplaint || 'No complaint specified'}
        </p>
        
        {/* System focus (subtle) */}
        {patient.systemFocus && (
          <p className="text-xs text-muted-foreground mb-3">
            {patient.systemFocus}
          </p>
        )}
        
        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3" />
          <span>
            Intake completed {formatDistanceToNow(new Date(patient.intakeCompletedAt), { addSuffix: true })}
          </span>
        </div>
        
        {/* Action */}
        <Button
          onClick={() => onCreateEpisode(patient)}
          className="w-full"
          size="sm"
        >
          Create Episode
        </Button>
      </CardContent>
    </Card>
  );
}
