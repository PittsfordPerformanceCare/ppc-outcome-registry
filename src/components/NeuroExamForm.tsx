import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface NeuroExamFormProps {
  episodeId: string;
  onSaved?: () => void;
}

export const NeuroExamForm = ({ episodeId, onSaved }: NeuroExamFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    exam_type: 'baseline',
    exam_date: new Date().toISOString().split('T')[0],
    exam_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('neurologic_exams')
        .insert({
          episode_id: episodeId,
          user_id: user.id,
          clinic_id: profile?.clinic_id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Exam Saved",
        description: "Neurologic examination saved successfully"
      });

      if (onSaved) onSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprehensive Neurologic & Physical Examination</CardTitle>
        <CardDescription>Complete the examination sections below</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {/* Exam Type Selection */}
          <div>
            <Label>Exam Type</Label>
            <RadioGroup
              value={formData.exam_type}
              onValueChange={(value) => updateField('exam_type', value)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="baseline" id="baseline" />
                <Label htmlFor="baseline" className="cursor-pointer font-normal">
                  Baseline (Initial/Intake)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="final" id="final" />
                <Label htmlFor="final" className="cursor-pointer font-normal">
                  Final (Discharge/Re-examination)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam_date">Exam Date</Label>
              <Input
                id="exam_date"
                type="date"
                value={formData.exam_date || ''}
                onChange={(e) => updateField('exam_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="exam_time">Exam Time</Label>
              <Input
                id="exam_time"
                type="time"
                value={formData.exam_time || ''}
                onChange={(e) => updateField('exam_time', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="reflexes">Reflexes</TabsTrigger>
            <TabsTrigger value="auscultation">Auscultation</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="neuro">Neuro</TabsTrigger>
            <TabsTrigger value="vestibular">Vestibular</TabsTrigger>
            <TabsTrigger value="motor">Motor/Inputs</TabsTrigger>
          </TabsList>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Blood Pressure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Position</div>
                <div className="font-medium">Right</div>
                <div className="font-medium">Left</div>
                
                <div>Supine</div>
                <Input placeholder="e.g., 118/84" value={formData.bp_supine_right || ''} onChange={(e) => updateField('bp_supine_right', e.target.value)} />
                <Input placeholder="e.g., 114/82" value={formData.bp_supine_left || ''} onChange={(e) => updateField('bp_supine_left', e.target.value)} />
                
                <div>Seated</div>
                <Input placeholder="e.g., 127/89" value={formData.bp_seated_right || ''} onChange={(e) => updateField('bp_seated_right', e.target.value)} />
                <Input placeholder="e.g., 117/88" value={formData.bp_seated_left || ''} onChange={(e) => updateField('bp_seated_left', e.target.value)} />
                
                <div>Standing (immediate)</div>
                <Input placeholder="e.g., 121/90" value={formData.bp_standing_immediate_right || ''} onChange={(e) => updateField('bp_standing_immediate_right', e.target.value)} />
                <Input value={formData.bp_standing_immediate_left || ''} onChange={(e) => updateField('bp_standing_immediate_left', e.target.value)} />
                
                <div>Standing (3 min)</div>
                <Input placeholder="e.g., 114/89" value={formData.bp_standing_3min_right || ''} onChange={(e) => updateField('bp_standing_3min_right', e.target.value)} />
                <Input value={formData.bp_standing_3min_left || ''} onChange={(e) => updateField('bp_standing_3min_left', e.target.value)} />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Other Vitals</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Measurement</div>
                <div className="font-medium">Right</div>
                <div className="font-medium">Left</div>
                
                <div>O2 Saturation (supine)</div>
                <Input placeholder="e.g., 100" value={formData.o2_saturation_supine_right || ''} onChange={(e) => updateField('o2_saturation_supine_right', e.target.value)} />
                <Input placeholder="e.g., 100" value={formData.o2_saturation_supine_left || ''} onChange={(e) => updateField('o2_saturation_supine_left', e.target.value)} />
                
                <div>Heart Rate (supine)</div>
                <Input placeholder="e.g., 65" value={formData.heart_rate_supine_right || ''} onChange={(e) => updateField('heart_rate_supine_right', e.target.value)} />
                <Input placeholder="e.g., 70" value={formData.heart_rate_supine_left || ''} onChange={(e) => updateField('heart_rate_supine_left', e.target.value)} />
                
                <div>Temperature</div>
                <Input placeholder="e.g., 93.6° UE 94.4° LE" value={formData.temperature_right || ''} onChange={(e) => updateField('temperature_right', e.target.value)} />
                <Input placeholder="e.g., 93.6° UE 96.4° LE" value={formData.temperature_left || ''} onChange={(e) => updateField('temperature_left', e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="vitals_notes">Notes</Label>
              <Textarea
                id="vitals_notes"
                placeholder="Additional vitals observations..."
                value={formData.vitals_notes || ''}
                onChange={(e) => updateField('vitals_notes', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Reflexes Tab */}
          <TabsContent value="reflexes" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Reflex</div>
              <div className="font-medium">Right</div>
              <div className="font-medium">Left</div>
              
              <div>Tricep</div>
              <Input value={formData.reflex_tricep_right || ''} onChange={(e) => updateField('reflex_tricep_right', e.target.value)} />
              <Input value={formData.reflex_tricep_left || ''} onChange={(e) => updateField('reflex_tricep_left', e.target.value)} />
              
              <div>Bicep</div>
              <Input value={formData.reflex_bicep_right || ''} onChange={(e) => updateField('reflex_bicep_right', e.target.value)} />
              <Input value={formData.reflex_bicep_left || ''} onChange={(e) => updateField('reflex_bicep_left', e.target.value)} />
              
              <div>Brachioradialis</div>
              <Input value={formData.reflex_brachioradialis_right || ''} onChange={(e) => updateField('reflex_brachioradialis_right', e.target.value)} />
              <Input value={formData.reflex_brachioradialis_left || ''} onChange={(e) => updateField('reflex_brachioradialis_left', e.target.value)} />
              
              <div>Patellar</div>
              <Input value={formData.reflex_patellar_right || ''} onChange={(e) => updateField('reflex_patellar_right', e.target.value)} />
              <Input value={formData.reflex_patellar_left || ''} onChange={(e) => updateField('reflex_patellar_left', e.target.value)} />
              
              <div>Achilles</div>
              <Input value={formData.reflex_achilles_right || ''} onChange={(e) => updateField('reflex_achilles_right', e.target.value)} />
              <Input value={formData.reflex_achilles_left || ''} onChange={(e) => updateField('reflex_achilles_left', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="reflexes_notes">Notes</Label>
              <Textarea
                id="reflexes_notes"
                placeholder="Reflex observations..."
                value={formData.reflexes_notes || ''}
                onChange={(e) => updateField('reflexes_notes', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Auscultation Tab */}
          <TabsContent value="auscultation" className="space-y-4">
            <div>
              <Label htmlFor="auscultation_heart">Heart</Label>
              <Textarea
                id="auscultation_heart"
                placeholder="Heart auscultation findings..."
                value={formData.auscultation_heart || ''}
                onChange={(e) => updateField('auscultation_heart', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="auscultation_lungs">Lungs</Label>
              <Textarea
                id="auscultation_lungs"
                placeholder="Lung auscultation findings..."
                value={formData.auscultation_lungs || ''}
                onChange={(e) => updateField('auscultation_lungs', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="auscultation_abdomen">Abdomen</Label>
              <Textarea
                id="auscultation_abdomen"
                placeholder="Abdominal auscultation findings..."
                value={formData.auscultation_abdomen || ''}
                onChange={(e) => updateField('auscultation_abdomen', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="auscultation_notes">Notes</Label>
              <Textarea
                id="auscultation_notes"
                placeholder="Additional auscultation observations..."
                value={formData.auscultation_notes || ''}
                onChange={(e) => updateField('auscultation_notes', e.target.value)}
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Visual System Tab */}
          <TabsContent value="visual" className="space-y-4">
            <div>
              <Label htmlFor="visual_opk">OPK</Label>
              <Input
                id="visual_opk"
                value={formData.visual_opk || ''}
                onChange={(e) => updateField('visual_opk', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visual_saccades">Saccades/Antisaccades</Label>
              <Input
                id="visual_saccades"
                value={formData.visual_saccades || ''}
                onChange={(e) => updateField('visual_saccades', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visual_pursuits">Pursuits</Label>
              <Input
                id="visual_pursuits"
                value={formData.visual_pursuits || ''}
                onChange={(e) => updateField('visual_pursuits', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visual_convergence">Convergence</Label>
              <Input
                id="visual_convergence"
                value={formData.visual_convergence || ''}
                onChange={(e) => updateField('visual_convergence', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visual_maddox_rod">Maddox Rod</Label>
              <Input
                id="visual_maddox_rod"
                value={formData.visual_maddox_rod || ''}
                onChange={(e) => updateField('visual_maddox_rod', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visual_notes">Notes</Label>
              <Textarea
                id="visual_notes"
                placeholder="Visual system observations..."
                value={formData.visual_notes || ''}
                onChange={(e) => updateField('visual_notes', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Neuro Exam Tab */}
          <TabsContent value="neuro" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Red Desaturation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="red_desat_right"
                    checked={formData.neuro_red_desaturation_right || false}
                    onCheckedChange={(checked) => updateField('neuro_red_desaturation_right', checked)}
                  />
                  <Label htmlFor="red_desat_right">Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="red_desat_left"
                    checked={formData.neuro_red_desaturation_left || false}
                    onCheckedChange={(checked) => updateField('neuro_red_desaturation_left', checked)}
                  />
                  <Label htmlFor="red_desat_left">Left</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pupillary Fatigue</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pupil_fatigue_right">Right (seconds)</Label>
                  <Input
                    id="pupil_fatigue_right"
                    placeholder="e.g., 1 second"
                    value={formData.neuro_pupillary_fatigue_right || ''}
                    onChange={(e) => updateField('neuro_pupillary_fatigue_right', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pupil_fatigue_left">Left (seconds)</Label>
                  <Input
                    id="pupil_fatigue_left"
                    placeholder="e.g., 1 second"
                    value={formData.neuro_pupillary_fatigue_left || ''}
                    onChange={(e) => updateField('neuro_pupillary_fatigue_left', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor="pupil_fatigue_notes">Notes</Label>
                <Textarea
                  id="pupil_fatigue_notes"
                  placeholder="e.g., sluggish constriction bilaterally"
                  value={formData.neuro_pupillary_fatigue_notes || ''}
                  onChange={(e) => updateField('neuro_pupillary_fatigue_notes', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">UE Extensor Weakness</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ue_weakness_right"
                    checked={formData.neuro_ue_extensor_weakness_right || false}
                    onCheckedChange={(checked) => updateField('neuro_ue_extensor_weakness_right', checked)}
                  />
                  <Label htmlFor="ue_weakness_right">Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ue_weakness_left"
                    checked={formData.neuro_ue_extensor_weakness_left || false}
                    onCheckedChange={(checked) => updateField('neuro_ue_extensor_weakness_left', checked)}
                  />
                  <Label htmlFor="ue_weakness_left">Left</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Other Tests</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Test</div>
                <div className="font-medium">Right</div>
                <div className="font-medium">Left</div>
                
                <div>Finger to Nose</div>
                <Input placeholder="e.g., 9/10" value={formData.neuro_finger_to_nose_right || ''} onChange={(e) => updateField('neuro_finger_to_nose_right', e.target.value)} />
                <Input placeholder="e.g., 9/10" value={formData.neuro_finger_to_nose_left || ''} onChange={(e) => updateField('neuro_finger_to_nose_left', e.target.value)} />
                
                <div>UPRDS</div>
                <Input placeholder="e.g., 0" value={formData.neuro_uprds_right || ''} onChange={(e) => updateField('neuro_uprds_right', e.target.value)} />
                <Input placeholder="e.g., 0" value={formData.neuro_uprds_left || ''} onChange={(e) => updateField('neuro_uprds_left', e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="neuro_notes">Notes</Label>
              <Textarea
                id="neuro_notes"
                placeholder="Additional neuro findings..."
                value={formData.neuro_notes || ''}
                onChange={(e) => updateField('neuro_notes', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Vestibular Tab */}
          <TabsContent value="vestibular" className="space-y-4">
            <div>
              <Label htmlFor="vestibular_rombergs">Rombergs/Sway Test</Label>
              <Input
                id="vestibular_rombergs"
                value={formData.vestibular_rombergs || ''}
                onChange={(e) => updateField('vestibular_rombergs', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vestibular_fakuda">Fakuda</Label>
              <Input
                id="vestibular_fakuda"
                placeholder="e.g., 2 feet anterior translation w/ 45° R rotation"
                value={formData.vestibular_fakuda || ''}
                onChange={(e) => updateField('vestibular_fakuda', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vestibular_shunt_eo">Shunt Stability Eyes Open</Label>
                <Input
                  id="vestibular_shunt_eo"
                  placeholder="e.g., 7/10"
                  value={formData.vestibular_shunt_stability_eo || ''}
                  onChange={(e) => updateField('vestibular_shunt_stability_eo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vestibular_shunt_ec">Shunt Stability Eyes Closed</Label>
                <Input
                  id="vestibular_shunt_ec"
                  placeholder="e.g., 7/10"
                  value={formData.vestibular_shunt_stability_ec || ''}
                  onChange={(e) => updateField('vestibular_shunt_stability_ec', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">OTR (Oculomotor Tracking Response)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otr_right"
                    checked={formData.vestibular_otr_right || false}
                    onCheckedChange={(checked) => updateField('vestibular_otr_right', checked)}
                  />
                  <Label htmlFor="otr_right">Right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otr_left"
                    checked={formData.vestibular_otr_left || false}
                    onCheckedChange={(checked) => updateField('vestibular_otr_left', checked)}
                  />
                  <Label htmlFor="otr_left">Left</Label>
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor="otr_notes">OTR Notes</Label>
                <Textarea
                  id="otr_notes"
                  placeholder="e.g., moderate OTR standing, no OTR seated"
                  value={formData.vestibular_otr_notes || ''}
                  onChange={(e) => updateField('vestibular_otr_notes', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vestibular_canal">Canal Testing</Label>
              <Input
                id="vestibular_canal"
                placeholder="e.g., RHC best 9/10"
                value={formData.vestibular_canal_testing || ''}
                onChange={(e) => updateField('vestibular_canal_testing', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="vestibular_vor">VOR</Label>
              <Input
                id="vestibular_vor"
                value={formData.vestibular_vor || ''}
                onChange={(e) => updateField('vestibular_vor', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="vestibular_notes">Notes</Label>
              <Textarea
                id="vestibular_notes"
                placeholder="Additional vestibular observations..."
                value={formData.vestibular_notes || ''}
                onChange={(e) => updateField('vestibular_notes', e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Motor & Inputs Tab */}
          <TabsContent value="motor" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Motor Testing (Supine)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Muscle</div>
                <div className="font-medium">Right</div>
                <div className="font-medium">Left</div>
                
                <div>Deltoid</div>
                <Input placeholder="e.g., 1/5" value={formData.motor_deltoid_right || ''} onChange={(e) => updateField('motor_deltoid_right', e.target.value)} />
                <Input value={formData.motor_deltoid_left || ''} onChange={(e) => updateField('motor_deltoid_left', e.target.value)} />
                
                <div>Latissimus Dorsi</div>
                <Input value={formData.motor_latissimus_right || ''} onChange={(e) => updateField('motor_latissimus_right', e.target.value)} />
                <Input value={formData.motor_latissimus_left || ''} onChange={(e) => updateField('motor_latissimus_left', e.target.value)} />
                
                <div>Iliopsoas</div>
                <Input placeholder="e.g., 1/5" value={formData.motor_iliopsoas_right || ''} onChange={(e) => updateField('motor_iliopsoas_right', e.target.value)} />
                <Input value={formData.motor_iliopsoas_left || ''} onChange={(e) => updateField('motor_iliopsoas_left', e.target.value)} />
                
                <div>Gluteus Maximus</div>
                <Input value={formData.motor_gluteus_max_right || ''} onChange={(e) => updateField('motor_gluteus_max_right', e.target.value)} />
                <Input value={formData.motor_gluteus_max_left || ''} onChange={(e) => updateField('motor_gluteus_max_left', e.target.value)} />
              </div>
              <div className="mt-4">
                <Label htmlFor="motor_notes">Motor Notes</Label>
                <Textarea
                  id="motor_notes"
                  placeholder="Motor testing observations..."
                  value={formData.motor_notes || ''}
                  onChange={(e) => updateField('motor_notes', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Inputs (Integration Testing)</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_cerebellar_right"
                        checked={formData.inputs_cerebellar_right || false}
                        onCheckedChange={(checked) => updateField('inputs_cerebellar_right', checked)}
                      />
                      <Label htmlFor="inputs_cerebellar_right">Cerebellar Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_cerebellar_left"
                        checked={formData.inputs_cerebellar_left || false}
                        onCheckedChange={(checked) => updateField('inputs_cerebellar_left', checked)}
                      />
                      <Label htmlFor="inputs_cerebellar_left">Cerebellar Left</Label>
                    </div>
                  </div>
                  <Input
                    placeholder="e.g., tests 3/5"
                    value={formData.inputs_cerebellar_notes || ''}
                    onChange={(e) => updateField('inputs_cerebellar_notes', e.target.value)}
                  />
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_isometric_right"
                        checked={formData.inputs_isometric_right || false}
                        onCheckedChange={(checked) => updateField('inputs_isometric_right', checked)}
                      />
                      <Label htmlFor="inputs_isometric_right">Isometric Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_isometric_left"
                        checked={formData.inputs_isometric_left || false}
                        onCheckedChange={(checked) => updateField('inputs_isometric_left', checked)}
                      />
                      <Label htmlFor="inputs_isometric_left">Isometric Left</Label>
                    </div>
                  </div>
                  <Input
                    placeholder="e.g., tests 5/5"
                    value={formData.inputs_isometric_notes || ''}
                    onChange={(e) => updateField('inputs_isometric_notes', e.target.value)}
                  />
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_parietal_right"
                        checked={formData.inputs_parietal_right || false}
                        onCheckedChange={(checked) => updateField('inputs_parietal_right', checked)}
                      />
                      <Label htmlFor="inputs_parietal_right">Parietal Right</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inputs_parietal_left"
                        checked={formData.inputs_parietal_left || false}
                        onCheckedChange={(checked) => updateField('inputs_parietal_left', checked)}
                      />
                      <Label htmlFor="inputs_parietal_left">Parietal Left</Label>
                    </div>
                  </div>
                  <Input
                    value={formData.inputs_parietal_notes || ''}
                    onChange={(e) => updateField('inputs_parietal_notes', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="inputs_therapy_localization">Therapy Localization</Label>
                  <Input
                    id="inputs_therapy_localization"
                    value={formData.inputs_therapy_localization || ''}
                    onChange={(e) => updateField('inputs_therapy_localization', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="inputs_notes">Inputs Notes</Label>
                  <Textarea
                    id="inputs_notes"
                    placeholder="Additional integration testing observations..."
                    value={formData.inputs_notes || ''}
                    onChange={(e) => updateField('inputs_notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div>
            <Label htmlFor="clinical_history">Clinical History</Label>
            <Textarea
              id="clinical_history"
              placeholder="Patient history, symptoms, timeline..."
              value={formData.clinical_history || ''}
              onChange={(e) => updateField('clinical_history', e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="overall_notes">Overall Summary & Impression</Label>
            <Textarea
              id="overall_notes"
              placeholder="Clinical impression and summary..."
              value={formData.overall_notes || ''}
              onChange={(e) => updateField('overall_notes', e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Examination
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};