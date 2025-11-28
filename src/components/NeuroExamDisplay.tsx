import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Eye, Brain, Ear } from "lucide-react";

interface NeuroExam {
  exam_date: string;
  exam_time?: string;
  clinical_history?: string;
  
  // Vitals
  bp_supine_left?: string;
  bp_supine_right?: string;
  bp_seated_left?: string;
  bp_seated_right?: string;
  bp_standing_immediate_left?: string;
  bp_standing_immediate_right?: string;
  bp_standing_3min_left?: string;
  bp_standing_3min_right?: string;
  heart_rate_supine_left?: string;
  heart_rate_supine_right?: string;
  o2_saturation_supine_left?: string;
  o2_saturation_supine_right?: string;
  temperature_left?: string;
  temperature_right?: string;
  vitals_notes?: string;
  
  // Reflexes
  reflex_bicep_left?: string;
  reflex_bicep_right?: string;
  reflex_tricep_left?: string;
  reflex_tricep_right?: string;
  reflex_brachioradialis_left?: string;
  reflex_brachioradialis_right?: string;
  reflex_patellar_left?: string;
  reflex_patellar_right?: string;
  reflex_achilles_left?: string;
  reflex_achilles_right?: string;
  reflexes_notes?: string;
  
  // Auscultation
  auscultation_heart?: string;
  auscultation_lungs?: string;
  auscultation_abdomen?: string;
  auscultation_notes?: string;
  
  // Visual
  visual_pursuits?: string;
  visual_saccades?: string;
  visual_opk?: string;
  visual_convergence?: string;
  visual_maddox_rod?: string;
  visual_notes?: string;
  
  // Neuro
  neuro_pupillary_fatigue_left?: string;
  neuro_pupillary_fatigue_right?: string;
  neuro_pupillary_fatigue_notes?: string;
  neuro_red_desaturation_left?: boolean;
  neuro_red_desaturation_right?: boolean;
  neuro_uprds_left?: string;
  neuro_uprds_right?: string;
  neuro_ue_capillary_refill_left?: string;
  neuro_ue_capillary_refill_right?: string;
  neuro_ue_extensor_weakness_left?: boolean;
  neuro_ue_extensor_weakness_right?: boolean;
  neuro_finger_to_nose_left?: string;
  neuro_finger_to_nose_right?: string;
  neuro_2pt_localization_left?: string;
  neuro_2pt_localization_right?: string;
  neuro_digit_sense_left?: string;
  neuro_digit_sense_right?: string;
  neuro_babinski_left?: string;
  neuro_babinski_right?: string;
  neuro_notes?: string;
  
  // Vestibular
  vestibular_rombergs?: string;
  vestibular_shunt_stability_eo?: string;
  vestibular_shunt_stability_ec?: string;
  vestibular_fakuda?: string;
  vestibular_vor?: string;
  vestibular_otr_left?: boolean;
  vestibular_otr_right?: boolean;
  vestibular_otr_notes?: string;
  vestibular_canal_testing?: string;
  vestibular_notes?: string;
  
  // Motor
  motor_deltoid_left?: string;
  motor_deltoid_right?: string;
  motor_latissimus_left?: string;
  motor_latissimus_right?: string;
  motor_iliopsoas_left?: string;
  motor_iliopsoas_right?: string;
  motor_gluteus_max_left?: string;
  motor_gluteus_max_right?: string;
  motor_notes?: string;
  
  // Inputs
  inputs_parietal_left?: boolean;
  inputs_parietal_right?: boolean;
  inputs_parietal_notes?: string;
  inputs_cerebellar_left?: boolean;
  inputs_cerebellar_right?: boolean;
  inputs_cerebellar_notes?: string;
  inputs_isometric_left?: boolean;
  inputs_isometric_right?: boolean;
  inputs_isometric_notes?: string;
  inputs_therapy_localization?: string;
  inputs_notes?: string;
  
  overall_notes?: string;
}

interface NeuroExamDisplayProps {
  exam: NeuroExam;
}

const BilateralField = ({ 
  label, 
  leftValue, 
  rightValue 
}: { 
  label: string; 
  leftValue?: string; 
  rightValue?: string;
}) => {
  if (!leftValue && !rightValue) return null;
  
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">L: {leftValue || "—"}</div>
      <div className="text-sm">R: {rightValue || "—"}</div>
    </div>
  );
};

const BooleanField = ({ 
  label, 
  leftValue, 
  rightValue 
}: { 
  label: string; 
  leftValue?: boolean; 
  rightValue?: boolean;
}) => {
  if (leftValue === undefined && rightValue === undefined) return null;
  
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">
        L: {leftValue !== undefined ? (
          <Badge variant={leftValue ? "default" : "secondary"} className="text-xs">
            {leftValue ? "+" : "−"}
          </Badge>
        ) : "—"}
      </div>
      <div className="text-sm">
        R: {rightValue !== undefined ? (
          <Badge variant={rightValue ? "default" : "secondary"} className="text-xs">
            {rightValue ? "+" : "−"}
          </Badge>
        ) : "—"}
      </div>
    </div>
  );
};

export function NeuroExamDisplay({ exam }: NeuroExamDisplayProps) {
  const hasVitals = exam.bp_supine_left || exam.bp_supine_right || exam.heart_rate_supine_left || exam.temperature_left;
  const hasReflexes = exam.reflex_bicep_left || exam.reflex_patellar_left || exam.reflex_achilles_left;
  const hasAuscultation = exam.auscultation_heart || exam.auscultation_lungs || exam.auscultation_abdomen;
  const hasVisual = exam.visual_pursuits || exam.visual_saccades || exam.visual_convergence;
  const hasNeuro = exam.neuro_pupillary_fatigue_left || exam.neuro_uprds_left || exam.neuro_finger_to_nose_left;
  const hasVestibular = exam.vestibular_rombergs || exam.vestibular_vor || exam.vestibular_otr_left !== undefined;
  const hasMotor = exam.motor_deltoid_left || exam.motor_iliopsoas_left;
  const hasInputs = exam.inputs_parietal_left !== undefined || exam.inputs_cerebellar_left !== undefined;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>Neurologic Examination</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Exam Date: {exam.exam_date} {exam.exam_time && `at ${exam.exam_time}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {exam.clinical_history && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Clinical History</h3>
            <p className="text-sm text-muted-foreground">{exam.clinical_history}</p>
          </div>
        )}
        
        {hasVitals && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Vital Signs</h3>
              <div className="space-y-1">
                <BilateralField label="BP Supine" leftValue={exam.bp_supine_left} rightValue={exam.bp_supine_right} />
                <BilateralField label="BP Seated" leftValue={exam.bp_seated_left} rightValue={exam.bp_seated_right} />
                <BilateralField label="BP Standing (imm)" leftValue={exam.bp_standing_immediate_left} rightValue={exam.bp_standing_immediate_right} />
                <BilateralField label="BP Standing (3min)" leftValue={exam.bp_standing_3min_left} rightValue={exam.bp_standing_3min_right} />
                <BilateralField label="HR Supine" leftValue={exam.heart_rate_supine_left} rightValue={exam.heart_rate_supine_right} />
                <BilateralField label="O2 Saturation" leftValue={exam.o2_saturation_supine_left} rightValue={exam.o2_saturation_supine_right} />
                <BilateralField label="Temperature" leftValue={exam.temperature_left} rightValue={exam.temperature_right} />
              </div>
              {exam.vitals_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{exam.vitals_notes}</p>
              )}
            </div>
          </>
        )}
        
        {hasReflexes && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Deep Tendon Reflexes</h3>
              <div className="space-y-1">
                <BilateralField label="Bicep" leftValue={exam.reflex_bicep_left} rightValue={exam.reflex_bicep_right} />
                <BilateralField label="Tricep" leftValue={exam.reflex_tricep_left} rightValue={exam.reflex_tricep_right} />
                <BilateralField label="Brachioradialis" leftValue={exam.reflex_brachioradialis_left} rightValue={exam.reflex_brachioradialis_right} />
                <BilateralField label="Patellar" leftValue={exam.reflex_patellar_left} rightValue={exam.reflex_patellar_right} />
                <BilateralField label="Achilles" leftValue={exam.reflex_achilles_left} rightValue={exam.reflex_achilles_right} />
              </div>
              {exam.reflexes_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{exam.reflexes_notes}</p>
              )}
            </div>
          </>
        )}
        
        {hasAuscultation && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Auscultation</h3>
              <div className="space-y-2">
                {exam.auscultation_heart && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Heart: </span>
                    <span className="text-sm">{exam.auscultation_heart}</span>
                  </div>
                )}
                {exam.auscultation_lungs && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Lungs: </span>
                    <span className="text-sm">{exam.auscultation_lungs}</span>
                  </div>
                )}
                {exam.auscultation_abdomen && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Abdomen: </span>
                    <span className="text-sm">{exam.auscultation_abdomen}</span>
                  </div>
                )}
                {exam.auscultation_notes && (
                  <p className="text-sm text-muted-foreground italic">{exam.auscultation_notes}</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {hasVisual && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Visual System</h3>
              </div>
              <div className="space-y-2">
                {exam.visual_pursuits && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Pursuits: </span>
                    <span className="text-sm">{exam.visual_pursuits}</span>
                  </div>
                )}
                {exam.visual_saccades && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Saccades: </span>
                    <span className="text-sm">{exam.visual_saccades}</span>
                  </div>
                )}
                {exam.visual_opk && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">OPK: </span>
                    <span className="text-sm">{exam.visual_opk}</span>
                  </div>
                )}
                {exam.visual_convergence && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Convergence: </span>
                    <span className="text-sm">{exam.visual_convergence}</span>
                  </div>
                )}
                {exam.visual_maddox_rod && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Maddox Rod: </span>
                    <span className="text-sm">{exam.visual_maddox_rod}</span>
                  </div>
                )}
                {exam.visual_notes && (
                  <p className="text-sm text-muted-foreground italic">{exam.visual_notes}</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {hasNeuro && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Neurologic Examination</h3>
              </div>
              <div className="space-y-1">
                <BilateralField label="Pupillary Fatigue" leftValue={exam.neuro_pupillary_fatigue_left} rightValue={exam.neuro_pupillary_fatigue_right} />
                {exam.neuro_pupillary_fatigue_notes && (
                  <p className="text-sm text-muted-foreground pl-4 italic">{exam.neuro_pupillary_fatigue_notes}</p>
                )}
                <BooleanField label="Red Desaturation" leftValue={exam.neuro_red_desaturation_left} rightValue={exam.neuro_red_desaturation_right} />
                <BilateralField label="UPRDS" leftValue={exam.neuro_uprds_left} rightValue={exam.neuro_uprds_right} />
                <BilateralField label="UE Capillary Refill" leftValue={exam.neuro_ue_capillary_refill_left} rightValue={exam.neuro_ue_capillary_refill_right} />
                <BooleanField label="Distal Extensor Weakness" leftValue={exam.neuro_ue_extensor_weakness_left} rightValue={exam.neuro_ue_extensor_weakness_right} />
                <BilateralField label="Finger to Nose" leftValue={exam.neuro_finger_to_nose_left} rightValue={exam.neuro_finger_to_nose_right} />
                <BilateralField label="2-Point Localization" leftValue={exam.neuro_2pt_localization_left} rightValue={exam.neuro_2pt_localization_right} />
                <BilateralField label="Digit Sense" leftValue={exam.neuro_digit_sense_left} rightValue={exam.neuro_digit_sense_right} />
                <BilateralField label="Babinski" leftValue={exam.neuro_babinski_left} rightValue={exam.neuro_babinski_right} />
              </div>
              {exam.neuro_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{exam.neuro_notes}</p>
              )}
            </div>
          </>
        )}
        
        {hasVestibular && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ear className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Vestibular System</h3>
              </div>
              <div className="space-y-2">
                {exam.vestibular_rombergs && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Romberg's: </span>
                    <span className="text-sm">{exam.vestibular_rombergs}</span>
                  </div>
                )}
                {exam.vestibular_shunt_stability_eo && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Shunt Stability (EO): </span>
                    <span className="text-sm">{exam.vestibular_shunt_stability_eo}</span>
                  </div>
                )}
                {exam.vestibular_shunt_stability_ec && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Shunt Stability (EC): </span>
                    <span className="text-sm">{exam.vestibular_shunt_stability_ec}</span>
                  </div>
                )}
                {exam.vestibular_fakuda && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Fakuda: </span>
                    <span className="text-sm">{exam.vestibular_fakuda}</span>
                  </div>
                )}
                {exam.vestibular_vor && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">VOR: </span>
                    <span className="text-sm">{exam.vestibular_vor}</span>
                  </div>
                )}
                <BooleanField label="OTR" leftValue={exam.vestibular_otr_left} rightValue={exam.vestibular_otr_right} />
                {exam.vestibular_otr_notes && (
                  <p className="text-sm text-muted-foreground pl-4 italic">{exam.vestibular_otr_notes}</p>
                )}
                {exam.vestibular_canal_testing && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Canal Testing: </span>
                    <span className="text-sm">{exam.vestibular_canal_testing}</span>
                  </div>
                )}
                {exam.vestibular_notes && (
                  <p className="text-sm text-muted-foreground italic">{exam.vestibular_notes}</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {hasMotor && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Motor Testing</h3>
              <div className="space-y-1">
                <BilateralField label="Deltoid" leftValue={exam.motor_deltoid_left} rightValue={exam.motor_deltoid_right} />
                <BilateralField label="Latissimus" leftValue={exam.motor_latissimus_left} rightValue={exam.motor_latissimus_right} />
                <BilateralField label="Iliopsoas" leftValue={exam.motor_iliopsoas_left} rightValue={exam.motor_iliopsoas_right} />
                <BilateralField label="Gluteus Max" leftValue={exam.motor_gluteus_max_left} rightValue={exam.motor_gluteus_max_right} />
              </div>
              {exam.motor_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{exam.motor_notes}</p>
              )}
            </div>
          </>
        )}
        
        {hasInputs && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Inputs Assessment</h3>
              <div className="space-y-1">
                <BooleanField label="Parietal" leftValue={exam.inputs_parietal_left} rightValue={exam.inputs_parietal_right} />
                {exam.inputs_parietal_notes && (
                  <p className="text-sm text-muted-foreground pl-4 italic">{exam.inputs_parietal_notes}</p>
                )}
                <BooleanField label="Cerebellar" leftValue={exam.inputs_cerebellar_left} rightValue={exam.inputs_cerebellar_right} />
                {exam.inputs_cerebellar_notes && (
                  <p className="text-sm text-muted-foreground pl-4 italic">{exam.inputs_cerebellar_notes}</p>
                )}
                <BooleanField label="Isometric" leftValue={exam.inputs_isometric_left} rightValue={exam.inputs_isometric_right} />
                {exam.inputs_isometric_notes && (
                  <p className="text-sm text-muted-foreground pl-4 italic">{exam.inputs_isometric_notes}</p>
                )}
              </div>
              {exam.inputs_therapy_localization && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-muted-foreground">Therapy Localization: </span>
                  <span className="text-sm">{exam.inputs_therapy_localization}</span>
                </div>
              )}
              {exam.inputs_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">{exam.inputs_notes}</p>
              )}
            </div>
          </>
        )}
        
        {exam.overall_notes && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-2">Overall Notes</h3>
              <p className="text-sm text-muted-foreground">{exam.overall_notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
