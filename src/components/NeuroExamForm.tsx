import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CheckCircle2, Circle } from "lucide-react";

interface NeuroExamFormProps {
  episodeId: string;
  onSaved?: () => void;
}

// Field definitions for each tab section
const SECTION_FIELDS = {
  vitals: [
    'bp_supine_right', 'bp_supine_left', 'bp_seated_right', 'bp_seated_left',
    'bp_standing_immediate_right', 'bp_standing_immediate_left',
    'bp_standing_3min_right', 'bp_standing_3min_left',
    'o2_saturation_supine_right', 'o2_saturation_supine_left',
    'heart_rate_supine_right', 'heart_rate_supine_left',
    'temperature_right', 'temperature_left', 'vitals_notes'
  ],
  reflexes: [
    'reflex_tricep_right', 'reflex_tricep_left', 'reflex_bicep_right', 'reflex_bicep_left',
    'reflex_brachioradialis_right', 'reflex_brachioradialis_left',
    'reflex_patellar_right', 'reflex_patellar_left',
    'reflex_achilles_right', 'reflex_achilles_left', 'reflexes_notes'
  ],
  auscultation: [
    'auscultation_heart', 'auscultation_lungs', 'auscultation_abdomen', 'auscultation_notes'
  ],
  visual: [
    'visual_opk', 'visual_saccades', 'visual_pursuits', 'visual_convergence',
    'visual_maddox_rod', 'visual_notes'
  ],
  neuro: [
    'neuro_red_desaturation_right', 'neuro_red_desaturation_left',
    'neuro_pupillary_fatigue_right', 'neuro_pupillary_fatigue_left', 'neuro_pupillary_fatigue_notes',
    'neuro_ue_extensor_weakness_right', 'neuro_ue_extensor_weakness_left',
    'neuro_finger_to_nose_right', 'neuro_finger_to_nose_left',
    'neuro_uprds_right', 'neuro_uprds_left', 'neuro_notes'
  ],
  vestibular: [
    'vestibular_rombergs', 'vestibular_fakuda', 'vestibular_shunt_stability_eo',
    'vestibular_shunt_stability_ec', 'vestibular_otr_right', 'vestibular_otr_left',
    'vestibular_otr_notes', 'vestibular_canal_testing', 'vestibular_vor', 'vestibular_notes'
  ],
  motor: [
    'motor_deltoid_right', 'motor_deltoid_left', 'motor_latissimus_right', 'motor_latissimus_left',
    'motor_iliopsoas_right', 'motor_iliopsoas_left', 'motor_gluteus_max_right', 'motor_gluteus_max_left',
    'motor_notes', 'inputs_cerebellar_right', 'inputs_cerebellar_left', 'inputs_cerebellar_notes',
    'inputs_isometric_right', 'inputs_isometric_left', 'inputs_isometric_notes',
    'inputs_parietal_right', 'inputs_parietal_left', 'inputs_parietal_notes',
    'inputs_therapy_localization', 'inputs_notes'
  ]
};

export const NeuroExamForm = ({ episodeId, onSaved }: NeuroExamFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [formData, setFormData] = useState<any>({
    exam_type: 'baseline',
    exam_date: new Date().toISOString().split('T')[0],
    exam_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: draft } = await supabase
          .from('neurologic_exam_drafts')
          .select('*')
          .eq('episode_id', episodeId)
          .eq('user_id', user.id)
          .single();

        if (draft && draft.draft_data && typeof draft.draft_data === 'object') {
          setFormData((prev: any) => ({ ...prev, ...draft.draft_data as Record<string, any> }));
          setLastSaved(new Date(draft.last_saved_at));
          toast({
            title: "Draft Restored",
            description: "Your previous work has been restored",
          });
        }
      } catch (error) {
        // No draft found, which is fine
      } finally {
        setDraftLoading(false);
      }
    };

    loadDraft();
  }, [episodeId, toast]);

  // Auto-save functionality
  useEffect(() => {
    // Don't auto-save if still loading draft or if no changes made
    if (draftLoading || Object.keys(formData).length <= 3) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('id', user.id)
          .single();

        const { error } = await supabase
          .from('neurologic_exam_drafts')
          .upsert({
            episode_id: episodeId,
            user_id: user.id,
            clinic_id: profile?.clinic_id,
            draft_data: formData,
          }, {
            onConflict: 'episode_id,user_id'
          });

        if (!error) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, draftLoading, episodeId]);

  // Calculate completion for each section
  const sectionProgress = useMemo(() => {
    const progress: Record<string, { filled: number; total: number; percentage: number }> = {};
    
    Object.entries(SECTION_FIELDS).forEach(([section, fields]) => {
      const filled = fields.filter(field => {
        const value = formData[field];
        return value !== undefined && value !== null && value !== '' && value !== false;
      }).length;
      const total = fields.length;
      const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
      
      progress[section] = { filled, total, percentage };
    });
    
    return progress;
  }, [formData]);

  // Calculate overall completion
  const overallProgress = useMemo(() => {
    const allFields = Object.values(SECTION_FIELDS).flat();
    const totalFields = allFields.length;
    const filledFields = allFields.filter(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '' && value !== false;
    }).length;
    
    return {
      filled: filledFields,
      total: totalFields,
      percentage: Math.round((filledFields / totalFields) * 100)
    };
  }, [formData]);

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

      // Delete the draft after successful save
      await supabase
        .from('neurologic_exam_drafts')
        .delete()
        .eq('episode_id', episodeId)
        .eq('user_id', user.id);

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

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (draftLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading examination form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Comprehensive Neurologic & Physical Examination</CardTitle>
            <CardDescription>Complete the examination sections below</CardDescription>
          </div>
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span>Draft saved {getLastSavedText()}</span>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Overall Progress Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Completion</span>
            <span className="text-muted-foreground">
              {overallProgress.filled} of {overallProgress.total} fields completed
            </span>
          </div>
          <Progress value={overallProgress.percentage} className="h-2" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{overallProgress.percentage}% complete</span>
            {overallProgress.percentage < 100 && (
              <span>• {overallProgress.total - overallProgress.filled} fields remaining</span>
            )}
          </div>
        </div>
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
            <TabsTrigger value="vitals" className="flex items-center gap-1.5">
              {sectionProgress.vitals.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.vitals.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.vitals.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Vitals</span>
            </TabsTrigger>
            <TabsTrigger value="reflexes" className="flex items-center gap-1.5">
              {sectionProgress.reflexes.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.reflexes.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.reflexes.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Reflexes</span>
            </TabsTrigger>
            <TabsTrigger value="auscultation" className="flex items-center gap-1.5">
              {sectionProgress.auscultation.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.auscultation.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.auscultation.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Auscultation</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-1.5">
              {sectionProgress.visual.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.visual.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.visual.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Visual</span>
            </TabsTrigger>
            <TabsTrigger value="neuro" className="flex items-center gap-1.5">
              {sectionProgress.neuro.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.neuro.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.neuro.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Neuro</span>
            </TabsTrigger>
            <TabsTrigger value="vestibular" className="flex items-center gap-1.5">
              {sectionProgress.vestibular.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.vestibular.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.vestibular.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Vestibular</span>
            </TabsTrigger>
            <TabsTrigger value="motor" className="flex items-center gap-1.5">
              {sectionProgress.motor.percentage === 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : sectionProgress.motor.percentage > 0 ? (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {sectionProgress.motor.percentage}
                </Badge>
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Motor/Inputs</span>
            </TabsTrigger>
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