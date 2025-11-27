import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NeuroExam {
  id: string;
  exam_type: 'baseline' | 'final';
  exam_date: string;
  exam_time?: string;
  clinical_history?: string;
  overall_notes?: string;
  // Vitals
  temperature_left?: string;
  temperature_right?: string;
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
  visual_convergence?: string;
  visual_maddox_rod?: string;
  visual_opk?: string;
  visual_notes?: string;
  // Neurologic
  neuro_pupillary_fatigue_left?: string;
  neuro_pupillary_fatigue_right?: string;
  neuro_pupillary_fatigue_notes?: string;
  neuro_red_desaturation_left?: boolean;
  neuro_red_desaturation_right?: boolean;
  neuro_ue_capillary_refill_left?: string;
  neuro_ue_capillary_refill_right?: string;
  neuro_ue_extensor_weakness_left?: boolean;
  neuro_ue_extensor_weakness_right?: boolean;
  neuro_uprds_left?: string;
  neuro_uprds_right?: string;
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
  vestibular_vor?: string;
  vestibular_otr_left?: boolean;
  vestibular_otr_right?: boolean;
  vestibular_otr_notes?: string;
  vestibular_rombergs?: string;
  vestibular_shunt_stability_eo?: string;
  vestibular_shunt_stability_ec?: string;
  vestibular_fakuda?: string;
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
}

interface NeuroExamComparisonProps {
  baselineExam: NeuroExam;
  finalExam: NeuroExam;
}

const ComparisonField = ({ 
  label, 
  baselineValue, 
  finalValue 
}: { 
  label: string; 
  baselineValue?: string | boolean | null; 
  finalValue?: string | boolean | null;
}) => {
  if (!baselineValue && !finalValue) return null;

  const baseline = baselineValue === true ? "Present" : baselineValue === false ? "Absent" : baselineValue || "—";
  const final = finalValue === true ? "Present" : finalValue === false ? "Absent" : finalValue || "—";
  const hasChanged = baseline !== final;

  return (
    <div className="grid grid-cols-[200px_1fr_40px_1fr] gap-4 items-center py-2">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-sm">{baseline}</div>
      <div className="flex justify-center">
        {hasChanged ? (
          baseline > final ? (
            <TrendingDown className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-amber-600" />
          )
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className={`text-sm ${hasChanged ? 'font-semibold' : ''}`}>{final}</div>
    </div>
  );
};

const BilateralComparisonField = ({ 
  label, 
  baselineLeft, 
  baselineRight, 
  finalLeft, 
  finalRight 
}: { 
  label: string; 
  baselineLeft?: string | boolean | null; 
  baselineRight?: string | boolean | null;
  finalLeft?: string | boolean | null;
  finalRight?: string | boolean | null;
}) => {
  if (!baselineLeft && !baselineRight && !finalLeft && !finalRight) return null;

  const formatValue = (val?: string | boolean | null) => 
    val === true ? "Present" : val === false ? "Absent" : val || "—";

  const leftChanged = formatValue(baselineLeft) !== formatValue(finalLeft);
  const rightChanged = formatValue(baselineRight) !== formatValue(finalRight);

  return (
    <div className="space-y-2 py-2">
      <div className="font-medium text-sm">{label}</div>
      <div className="grid grid-cols-[100px_1fr_40px_1fr] gap-4 pl-4">
        <div className="text-sm text-muted-foreground">Left:</div>
        <div className="text-sm">{formatValue(baselineLeft)}</div>
        <div className="flex justify-center">
          {leftChanged ? <ArrowRight className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className={`text-sm ${leftChanged ? 'font-semibold' : ''}`}>{formatValue(finalLeft)}</div>
      </div>
      <div className="grid grid-cols-[100px_1fr_40px_1fr] gap-4 pl-4">
        <div className="text-sm text-muted-foreground">Right:</div>
        <div className="text-sm">{formatValue(baselineRight)}</div>
        <div className="flex justify-center">
          {rightChanged ? <ArrowRight className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className={`text-sm ${rightChanged ? 'font-semibold' : ''}`}>{formatValue(finalRight)}</div>
      </div>
    </div>
  );
};

export const NeuroExamComparison = ({ baselineExam, finalExam }: NeuroExamComparisonProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Neurologic Exam Comparison</span>
          <div className="flex gap-2">
            <Badge variant="outline">Baseline: {new Date(baselineExam.exam_date).toLocaleDateString()}</Badge>
            <ArrowRight className="h-5 w-5" />
            <Badge variant="outline">Final: {new Date(finalExam.exam_date).toLocaleDateString()}</Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Side-by-side comparison of initial and final examination findings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Row */}
        <div className="grid grid-cols-[200px_1fr_40px_1fr] gap-4 font-semibold text-sm border-b pb-2">
          <div>Finding</div>
          <div>Baseline</div>
          <div className="text-center">Change</div>
          <div>Final</div>
        </div>

        {/* Clinical History */}
        {(baselineExam.clinical_history || finalExam.clinical_history) && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Clinical History</h3>
              <ComparisonField 
                label="History" 
                baselineValue={baselineExam.clinical_history} 
                finalValue={finalExam.clinical_history} 
              />
            </div>
            <Separator />
          </>
        )}

        {/* Vitals */}
        <div>
          <h3 className="font-semibold mb-3">Vital Signs</h3>
          <BilateralComparisonField
            label="Temperature"
            baselineLeft={baselineExam.temperature_left}
            baselineRight={baselineExam.temperature_right}
            finalLeft={finalExam.temperature_left}
            finalRight={finalExam.temperature_right}
          />
          <BilateralComparisonField
            label="BP Supine"
            baselineLeft={baselineExam.bp_supine_left}
            baselineRight={baselineExam.bp_supine_right}
            finalLeft={finalExam.bp_supine_left}
            finalRight={finalExam.bp_supine_right}
          />
          <BilateralComparisonField
            label="Heart Rate Supine"
            baselineLeft={baselineExam.heart_rate_supine_left}
            baselineRight={baselineExam.heart_rate_supine_right}
            finalLeft={finalExam.heart_rate_supine_left}
            finalRight={finalExam.heart_rate_supine_right}
          />
          {baselineExam.vitals_notes && (
            <ComparisonField label="Notes" baselineValue={baselineExam.vitals_notes} finalValue={finalExam.vitals_notes} />
          )}
        </div>
        <Separator />

        {/* Reflexes */}
        <div>
          <h3 className="font-semibold mb-3">Reflexes</h3>
          <BilateralComparisonField
            label="Bicep"
            baselineLeft={baselineExam.reflex_bicep_left}
            baselineRight={baselineExam.reflex_bicep_right}
            finalLeft={finalExam.reflex_bicep_left}
            finalRight={finalExam.reflex_bicep_right}
          />
          <BilateralComparisonField
            label="Tricep"
            baselineLeft={baselineExam.reflex_tricep_left}
            baselineRight={baselineExam.reflex_tricep_right}
            finalLeft={finalExam.reflex_tricep_left}
            finalRight={finalExam.reflex_tricep_right}
          />
          <BilateralComparisonField
            label="Patellar"
            baselineLeft={baselineExam.reflex_patellar_left}
            baselineRight={baselineExam.reflex_patellar_right}
            finalLeft={finalExam.reflex_patellar_left}
            finalRight={finalExam.reflex_patellar_right}
          />
          <BilateralComparisonField
            label="Achilles"
            baselineLeft={baselineExam.reflex_achilles_left}
            baselineRight={baselineExam.reflex_achilles_right}
            finalLeft={finalExam.reflex_achilles_left}
            finalRight={finalExam.reflex_achilles_right}
          />
        </div>
        <Separator />

        {/* Neurologic */}
        <div>
          <h3 className="font-semibold mb-3">Neurologic Assessment</h3>
          <BilateralComparisonField
            label="Pupillary Fatigue"
            baselineLeft={baselineExam.neuro_pupillary_fatigue_left}
            baselineRight={baselineExam.neuro_pupillary_fatigue_right}
            finalLeft={finalExam.neuro_pupillary_fatigue_left}
            finalRight={finalExam.neuro_pupillary_fatigue_right}
          />
          <BilateralComparisonField
            label="Red Desaturation"
            baselineLeft={baselineExam.neuro_red_desaturation_left}
            baselineRight={baselineExam.neuro_red_desaturation_right}
            finalLeft={finalExam.neuro_red_desaturation_left}
            finalRight={finalExam.neuro_red_desaturation_right}
          />
          <BilateralComparisonField
            label="Finger to Nose"
            baselineLeft={baselineExam.neuro_finger_to_nose_left}
            baselineRight={baselineExam.neuro_finger_to_nose_right}
            finalLeft={finalExam.neuro_finger_to_nose_left}
            finalRight={finalExam.neuro_finger_to_nose_right}
          />
          <BilateralComparisonField
            label="Babinski"
            baselineLeft={baselineExam.neuro_babinski_left}
            baselineRight={baselineExam.neuro_babinski_right}
            finalLeft={finalExam.neuro_babinski_left}
            finalRight={finalExam.neuro_babinski_right}
          />
        </div>
        <Separator />

        {/* Vestibular */}
        <div>
          <h3 className="font-semibold mb-3">Vestibular Assessment</h3>
          <ComparisonField
            label="VOR"
            baselineValue={baselineExam.vestibular_vor}
            finalValue={finalExam.vestibular_vor}
          />
          <BilateralComparisonField
            label="OTR"
            baselineLeft={baselineExam.vestibular_otr_left}
            baselineRight={baselineExam.vestibular_otr_right}
            finalLeft={finalExam.vestibular_otr_left}
            finalRight={finalExam.vestibular_otr_right}
          />
          <ComparisonField
            label="Romberg's"
            baselineValue={baselineExam.vestibular_rombergs}
            finalValue={finalExam.vestibular_rombergs}
          />
        </div>
        <Separator />

        {/* Motor */}
        <div>
          <h3 className="font-semibold mb-3">Motor Assessment</h3>
          <BilateralComparisonField
            label="Deltoid"
            baselineLeft={baselineExam.motor_deltoid_left}
            baselineRight={baselineExam.motor_deltoid_right}
            finalLeft={finalExam.motor_deltoid_left}
            finalRight={finalExam.motor_deltoid_right}
          />
          <BilateralComparisonField
            label="Iliopsoas"
            baselineLeft={baselineExam.motor_iliopsoas_left}
            baselineRight={baselineExam.motor_iliopsoas_right}
            finalLeft={finalExam.motor_iliopsoas_left}
            finalRight={finalExam.motor_iliopsoas_right}
          />
          <BilateralComparisonField
            label="Gluteus Max"
            baselineLeft={baselineExam.motor_gluteus_max_left}
            baselineRight={baselineExam.motor_gluteus_max_right}
            finalLeft={finalExam.motor_gluteus_max_left}
            finalRight={finalExam.motor_gluteus_max_right}
          />
        </div>
        <Separator />

        {/* Overall Notes */}
        {(baselineExam.overall_notes || finalExam.overall_notes) && (
          <div>
            <h3 className="font-semibold mb-3">Overall Assessment</h3>
            <ComparisonField 
              label="Notes" 
              baselineValue={baselineExam.overall_notes} 
              finalValue={finalExam.overall_notes} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
