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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CheckCircle2, Circle, AlertCircle, ChevronRight, List, Info, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NeuroExamFormProps {
  episodeId: string;
  onSaved?: () => void;
}

// Validation rules for vitals with reference ranges
const VITALS_RANGES = {
  bloodPressure: { min: 60, max: 200, label: "Blood Pressure", normal: "90-120/60-80 mmHg", tooltip: "Normal BP: 90-120 systolic / 60-80 diastolic" },
  heartRate: { min: 40, max: 180, label: "Heart Rate", normal: "60-100 bpm", tooltip: "Normal resting HR: 60-100 beats per minute" },
  o2Saturation: { min: 70, max: 100, label: "O2 Saturation", normal: "95-100%", tooltip: "Normal O2 saturation: 95-100%" },
  temperature: { min: 90, max: 105, label: "Temperature", normal: "97.8-99.1°F", tooltip: "Normal body temperature: 97.8-99.1°F (36.5-37.3°C)" }
};

// Reference ranges for reflexes
const REFLEX_SCALE = {
  label: "Reflex Scale",
  tooltip: "0 = Absent, 1+ = Diminished, 2+ = Normal, 3+ = Increased, 4+ = Hyperactive with clonus"
};

// Clinical findings for visual saccades with interpretations
const SACCADE_FINDINGS = [
  {
    category: "Accuracy",
    findings: [
      {
        label: "Hypometric saccades noted bilaterally",
        interpretation: "Suggests cerebellar under-shooting, impaired cerebellar calibration."
      },
      {
        label: "Hypermetric saccades on rightward gaze",
        interpretation: "Suggests ipsilateral cerebellar overshoot or poor braking capacity."
      },
      {
        label: "Consistent overshoot/undershoot requiring corrective saccades",
        interpretation: "Indicates impaired cerebellar error-correction loop."
      }
    ]
  },
  {
    category: "Speed / Velocity",
    findings: [
      {
        label: "Saccades are slow to initiate and slow to complete",
        interpretation: "Possible frontal lobe involvement or fatigue of brainstem burst neurons."
      },
      {
        label: "Saccades show normal onset but decreased peak velocity",
        interpretation: "Suggests potential brainstem involvement (PPRF/riMLF) or diffuse metabolic impairment."
      }
    ]
  },
  {
    category: "Latency",
    findings: [
      {
        label: "Increased latency to initiate saccade, especially leftward",
        interpretation: "Frontal eye fields involvement; can indicate slowed executive/attentional drive."
      },
      {
        label: "Latency improves with verbal cueing",
        interpretation: "More frontal/executive performance deficit than structural issue."
      }
    ]
  },
  {
    category: "Fatigability",
    findings: [
      {
        label: "Saccades deteriorate with repetition (increased drift, slowing, more corrective movements)",
        interpretation: "Classic brainstem/cerebellar integrator fatigue; highly neurologically meaningful."
      }
    ]
  },
  {
    category: "Intrusions",
    findings: [
      {
        label: "Frequent square-wave jerks interrupting fixation",
        interpretation: "Cerebellar or brainstem dyscontrol."
      },
      {
        label: "Burst-like oscillations around the target (macrosaccadic oscillations)",
        interpretation: "More significant cerebellar pathology."
      },
      {
        label: "Catch-up saccades during smooth pursuit",
        interpretation: "Pursuit–saccade mismatch, cerebellar–parietal involvement."
      }
    ]
  },
  {
    category: "Conjugacy",
    findings: [
      {
        label: "Disconjugate saccades observed",
        interpretation: "Possibly internuclear ophthalmoplegia (INO) vs. vestibular mismatch."
      },
      {
        label: "Eyes reach target at different speeds",
        interpretation: "Can indicate asymmetric cerebellar or vestibular involvement."
      }
    ]
  },
  {
    category: "End-Point Nystagmus",
    findings: [
      {
        label: "End-gaze nystagmus after the saccade hold",
        interpretation: "Cerebellar flocculus/paraflocculus integrity issue."
      },
      {
        label: "Asymmetric end-point nystagmus (right > left)",
        interpretation: "Indicates sidedness of dysfunction."
      }
    ]
  },
  {
    category: "Following Error / Overshoot Drift",
    findings: [
      {
        label: "Eyes cannot maintain target after landing; drift back to midline before corrective saccade",
        interpretation: "Neural integrator weakness; cerebellar and brainstem involvement."
      }
    ]
  },
  {
    category: "Pre-Saccadic Posture",
    findings: [
      {
        label: "Patient stabilizes head prior to each saccade; suggests vestibular–ocular compensation",
        interpretation: "Vestibular contribution; often ipsilateral canal/otolith impairment."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "Saccades provoke dizziness/lightheadedness",
        interpretation: "Vestibular integration issue; often linked with otolith/velocity storage dysfunction."
      },
      {
        label: "Saccades provoke headache/fatigue",
        interpretation: "Often frontal load intolerance or autonomic dysregulation."
      }
    ]
  }
];

// Helper to get interpretation for a finding
export const getSaccadeInterpretation = (findingLabel: string): string => {
  for (const category of SACCADE_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected findings
export const getSaccadeInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getSaccadeInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Tab sections in order
const TAB_SECTIONS = ['vitals', 'reflexes', 'auscultation', 'visual', 'neuro', 'vestibular', 'motor'] as const;
type TabSection = typeof TAB_SECTIONS[number];

// Field definitions for each tab section
const SECTION_FIELDS = {
  vitals: [
    'bp_supine_right', 'bp_supine_left', 'bp_seated_right', 'bp_seated_left',
    'bp_standing_immediate_right', 'bp_standing_immediate_left',
    'bp_standing_3min_right', 'bp_standing_3min_left',
    'o2_saturation_supine_right', 'o2_saturation_supine_left',
    'heart_rate_supine_right', 'heart_rate_supine_left',
    'temperature_right', 'temperature_left', 
    'o2_saturation_walking', 'walking_o2_notes',
    'vitals_notes'
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabSection>('vitals');
  const [previousExams, setPreviousExams] = useState<any[]>([]);
  const [showPreviousValues, setShowPreviousValues] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<any>({
    exam_type: 'baseline',
    exam_date: new Date().toISOString().split('T')[0],
    exam_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  });

  // Validate blood pressure format and range
  const validateBloodPressure = (value: string): string | null => {
    if (!value) return null;
    const match = value.match(/^(\d+)\/(\d+)$/);
    if (!match) return "Format should be XXX/YY (e.g., 120/80)";
    
    const systolic = parseInt(match[1]);
    const diastolic = parseInt(match[2]);
    
    if (systolic < VITALS_RANGES.bloodPressure.min || systolic > VITALS_RANGES.bloodPressure.max) {
      return `Systolic should be ${VITALS_RANGES.bloodPressure.min}-${VITALS_RANGES.bloodPressure.max}`;
    }
    if (diastolic < 40 || diastolic > 130) {
      return "Diastolic should be 40-130";
    }
    if (systolic <= diastolic) {
      return "Systolic should be higher than diastolic";
    }
    return null;
  };

  // Validate numeric range
  const validateNumericRange = (value: string, range: { min: number; max: number; label: string }): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return `${range.label} must be a number`;
    if (num < range.min || num > range.max) {
      return `${range.label} should be ${range.min}-${range.max}`;
    }
    return null;
  };

  // Calculate Inter-Arm Difference (IAD)
  const calculateIAD = (rightBP: string, leftBP: string): { systolic: number | null; diastolic: number | null; hasWarning: boolean } => {
    if (!rightBP || !leftBP) return { systolic: null, diastolic: null, hasWarning: false };
    
    const rightMatch = rightBP.match(/^(\d+)\/(\d+)$/);
    const leftMatch = leftBP.match(/^(\d+)\/(\d+)$/);
    
    if (!rightMatch || !leftMatch) return { systolic: null, diastolic: null, hasWarning: false };
    
    const rightSystolic = parseInt(rightMatch[1]);
    const rightDiastolic = parseInt(rightMatch[2]);
    const leftSystolic = parseInt(leftMatch[1]);
    const leftDiastolic = parseInt(leftMatch[2]);
    
    const systolicDiff = Math.abs(rightSystolic - leftSystolic);
    const diastolicDiff = Math.abs(rightDiastolic - leftDiastolic);
    
    return {
      systolic: systolicDiff,
      diastolic: diastolicDiff,
      hasWarning: systolicDiff >= 5 || diastolicDiff >= 5
    };
  };

  // Get lowest supine O2 reading and side
  const getLowestSupineO2 = (): { value: number | null; side: 'right' | 'left' | null } => {
    const rightO2 = formData.o2_saturation_supine_right ? parseFloat(formData.o2_saturation_supine_right) : null;
    const leftO2 = formData.o2_saturation_supine_left ? parseFloat(formData.o2_saturation_supine_left) : null;
    
    if (rightO2 === null && leftO2 === null) return { value: null, side: null };
    if (rightO2 === null) return { value: leftO2, side: 'left' };
    if (leftO2 === null) return { value: rightO2, side: 'right' };
    
    return rightO2 <= leftO2 
      ? { value: rightO2, side: 'right' }
      : { value: leftO2, side: 'left' };
  };

  // Check if walking O2 dropped
  const checkWalkingO2Drop = (): { hasWarning: boolean; baseline: number | null; walking: number | null; drop: number | null } => {
    const baseline = getLowestSupineO2();
    const walking = formData.o2_saturation_walking ? parseFloat(formData.o2_saturation_walking) : null;
    
    if (baseline.value === null || walking === null) {
      return { hasWarning: false, baseline: baseline.value, walking, drop: null };
    }
    
    const drop = baseline.value - walking;
    return {
      hasWarning: drop > 0,
      baseline: baseline.value,
      walking,
      drop: drop > 0 ? drop : null
    };
  };

  // Update field with validation
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate on change for specific fields
    if (field.includes('bp_')) {
      const error = validateBloodPressure(value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    } else if (field.includes('heart_rate_')) {
      const error = validateNumericRange(value, VITALS_RANGES.heartRate);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    } else if (field.includes('o2_saturation_')) {
      const error = validateNumericRange(value, VITALS_RANGES.o2Saturation);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  // Load previous exams and draft on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load previous exams for reference
        const { data: exams } = await supabase
          .from('neurologic_exams')
          .select('*')
          .eq('episode_id', episodeId)
          .order('exam_date', { ascending: false })
          .limit(3);

        if (exams && exams.length > 0) {
          setPreviousExams(exams);
        }

        // Load existing draft
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

    loadData();
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

  // Find next incomplete section
  const getNextIncompleteSection = (): TabSection | null => {
    const currentIndex = TAB_SECTIONS.indexOf(currentTab);
    
    // Check sections after current
    for (let i = currentIndex + 1; i < TAB_SECTIONS.length; i++) {
      if (sectionProgress[TAB_SECTIONS[i]]?.percentage < 100) {
        return TAB_SECTIONS[i];
      }
    }
    
    // Check sections before current
    for (let i = 0; i < currentIndex; i++) {
      if (sectionProgress[TAB_SECTIONS[i]]?.percentage < 100) {
        return TAB_SECTIONS[i];
      }
    }
    
    return null;
  };

  // Navigate to next/previous tab
  const navigateTab = (direction: 'next' | 'prev') => {
    const currentIndex = TAB_SECTIONS.indexOf(currentTab);
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = currentIndex === TAB_SECTIONS.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? TAB_SECTIONS.length - 1 : currentIndex - 1;
    }
    
    setCurrentTab(TAB_SECTIONS[newIndex]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Arrow keys for tab navigation
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateTab('next');
          toast({
            title: "Next Section",
            description: "Use Ctrl+→ to navigate forward",
            duration: 1500,
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateTab('prev');
          toast({
            title: "Previous Section", 
            description: "Use Ctrl+← to navigate back",
            duration: 1500,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, toast]);

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
    // Validate all fields before saving
    const errors: Record<string, string> = {};
    
    // Validate blood pressure fields
    Object.keys(formData).forEach((field) => {
      if (field.includes('bp_') && formData[field]) {
        const error = validateBloodPressure(formData[field]);
        if (error) errors[field] = error;
      } else if (field.includes('heart_rate_') && formData[field]) {
        const error = validateNumericRange(formData[field], VITALS_RANGES.heartRate);
        if (error) errors[field] = error;
      } else if (field.includes('o2_saturation_') && formData[field]) {
        const error = validateNumericRange(formData[field], VITALS_RANGES.o2Saturation);
        if (error) errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidationSummary(true);
      toast({
        title: "Validation Errors",
        description: `Please correct ${Object.keys(errors).length} field(s) before saving`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle();

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

  // Helper to get previous value for a field
  const getPreviousValue = (fieldName: string) => {
    if (previousExams.length === 0 || !showPreviousValues) return null;
    const latestExam = previousExams[0];
    return latestExam[fieldName];
  };

  // Enhanced validated input with tooltips, side indicators, and previous values
  const ValidatedInput = ({ 
    field, 
    label, 
    side = null,
    tooltip = null,
    optional = false,
    ...props 
  }: {
    field: string;
    label?: string;
    side?: 'left' | 'right' | null;
    tooltip?: string | null;
    optional?: boolean;
    [key: string]: any;
  }) => {
    const hasError = !!validationErrors[field];
    const previousValue = getPreviousValue(field);
    const sideColor = side === 'left' ? 'text-blue-600' : side === 'right' ? 'text-orange-600' : '';
    const sideBg = side === 'left' ? 'bg-blue-50 dark:bg-blue-950' : side === 'right' ? 'bg-orange-50 dark:bg-orange-950' : '';

    return (
      <div className="space-y-1">
        {label && (
          <div className="flex items-center gap-2">
            {side && (
              <div className={`p-1 rounded ${sideBg}`}>
                {side === 'left' ? <ArrowLeft className={`h-3 w-3 ${sideColor}`} /> : <ArrowRight className={`h-3 w-3 ${sideColor}`} />}
              </div>
            )}
            <Label htmlFor={field} className={side ? sideColor : ''}>
              {label}
              {optional && <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <Input
          id={field}
          className={`${hasError ? "border-destructive focus-visible:ring-destructive" : ""} ${side ? sideBg : ""}`}
          value={formData[field] || ''}
          onChange={(e) => updateField(field, e.target.value)}
          {...props}
        />
        {previousValue && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="font-medium">Previous:</span> {previousValue}
          </p>
        )}
        {hasError && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationErrors[field]}
          </p>
        )}
      </div>
    );
  };

  // Format section name for display
  const formatSectionName = (section: TabSection): string => {
    const names: Record<TabSection, string> = {
      vitals: 'Vitals',
      reflexes: 'Reflexes',
      auscultation: 'Auscultation',
      visual: 'Visual',
      neuro: 'Neuro',
      vestibular: 'Vestibular',
      motor: 'Motor/Inputs'
    };
    return names[section];
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
          <div className="flex items-center gap-3">
            {previousExams.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviousValues(!showPreviousValues)}
              >
                {showPreviousValues ? 'Hide' : 'Show'} Previous Values
              </Button>
            )}
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
        </div>
        
        {/* Overall Progress Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Overall Completion</span>
              <span className="text-muted-foreground">
                {overallProgress.filled} of {overallProgress.total} fields completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Jump to section dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4 mr-2" />
                    Jump to Section
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navigate to Section</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {TAB_SECTIONS.map((section) => (
                    <DropdownMenuItem
                      key={section}
                      onClick={() => setCurrentTab(section)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {sectionProgress[section]?.percentage === 100 ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : sectionProgress[section]?.percentage > 0 ? (
                          <Circle className="h-4 w-4 fill-primary/20 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        {formatSectionName(section)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sectionProgress[section]?.percentage}%
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Next incomplete button */}
              {getNextIncompleteSection() && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const nextSection = getNextIncompleteSection();
                    if (nextSection) setCurrentTab(nextSection);
                  }}
                >
                  Next Incomplete
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          <Progress value={overallProgress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{overallProgress.percentage}% complete • {overallProgress.total - overallProgress.filled} fields remaining</span>
            <span className="text-muted-foreground/70">💡 Use Ctrl+← → to navigate sections</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Validation Summary */}
        {showValidationSummary && Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Please correct the following errors:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
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

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TabSection)} className="w-full">
          <div ref={tabsListRef} className="sticky top-0 z-10 bg-background pb-4 border-b">
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
          </div>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Normal Ranges:</strong> BP 90-120/60-80 mmHg • HR 60-100 bpm • O2 Sat 95-100% • Temp 97.8-99.1°F
              </AlertDescription>
            </Alert>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Blood Pressure</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        <Info className="h-3 w-3 mr-1" />
                        IAD Warning ≥5 mmHg
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        Inter-Arm Difference (IAD) of 5 mmHg or greater may indicate peripheral vascular disease or other cardiovascular issues
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium">Position</div>
                <div className="font-medium text-orange-600 flex items-center gap-1">
                  <ArrowRight className="h-4 w-4" /> Right
                </div>
                <div className="font-medium text-blue-600 flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Left
                </div>
                <div className="font-medium text-center">IAD</div>
                
                {/* Supine */}
                <div>Supine</div>
                <ValidatedInput field="bp_supine_right" side="right" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" />
                <ValidatedInput field="bp_supine_left" side="left" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" />
                <div className="flex items-center justify-center">
                  {(() => {
                    const iad = calculateIAD(formData.bp_supine_right, formData.bp_supine_left);
                    if (iad.systolic === null) return <span className="text-xs text-muted-foreground">-</span>;
                    return (
                      <Badge variant={iad.hasWarning ? "destructive" : "secondary"} className="text-xs">
                        {iad.systolic}/{iad.diastolic}
                      </Badge>
                    );
                  })()}
                </div>
                
                {/* Seated */}
                <div>Seated</div>
                <ValidatedInput field="bp_seated_right" side="right" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" />
                <ValidatedInput field="bp_seated_left" side="left" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" />
                <div className="flex items-center justify-center">
                  {(() => {
                    const iad = calculateIAD(formData.bp_seated_right, formData.bp_seated_left);
                    if (iad.systolic === null) return <span className="text-xs text-muted-foreground">-</span>;
                    return (
                      <Badge variant={iad.hasWarning ? "destructive" : "secondary"} className="text-xs">
                        {iad.systolic}/{iad.diastolic}
                      </Badge>
                    );
                  })()}
                </div>
                
                {/* Standing Immediate */}
                <div>Standing (immediate)</div>
                <ValidatedInput field="bp_standing_immediate_right" side="right" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" optional />
                <ValidatedInput field="bp_standing_immediate_left" side="left" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" optional />
                <div className="flex items-center justify-center">
                  {(() => {
                    const iad = calculateIAD(formData.bp_standing_immediate_right, formData.bp_standing_immediate_left);
                    if (iad.systolic === null) return <span className="text-xs text-muted-foreground">-</span>;
                    return (
                      <Badge variant={iad.hasWarning ? "destructive" : "secondary"} className="text-xs">
                        {iad.systolic}/{iad.diastolic}
                      </Badge>
                    );
                  })()}
                </div>
                
                {/* Standing 3 min */}
                <div>Standing (3 min)</div>
                <ValidatedInput field="bp_standing_3min_right" side="right" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" optional />
                <ValidatedInput field="bp_standing_3min_left" side="left" tooltip={VITALS_RANGES.bloodPressure.tooltip} placeholder="120/80" optional />
                <div className="flex items-center justify-center">
                  {(() => {
                    const iad = calculateIAD(formData.bp_standing_3min_right, formData.bp_standing_3min_left);
                    if (iad.systolic === null) return <span className="text-xs text-muted-foreground">-</span>;
                    return (
                      <Badge variant={iad.hasWarning ? "destructive" : "secondary"} className="text-xs">
                        {iad.systolic}/{iad.diastolic}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Other Vitals</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Measurement</div>
                <div className="font-medium text-orange-600 flex items-center gap-1">
                  <ArrowRight className="h-4 w-4" /> Right
                </div>
                <div className="font-medium text-blue-600 flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Left
                </div>
                
                <div>O2 Saturation (supine)</div>
                <ValidatedInput field="o2_saturation_supine_right" side="right" tooltip={VITALS_RANGES.o2Saturation.tooltip} placeholder="98" />
                <ValidatedInput field="o2_saturation_supine_left" side="left" tooltip={VITALS_RANGES.o2Saturation.tooltip} placeholder="98" />
                
                <div>Heart Rate (supine)</div>
                <ValidatedInput field="heart_rate_supine_right" side="right" tooltip={VITALS_RANGES.heartRate.tooltip} placeholder="72" />
                <ValidatedInput field="heart_rate_supine_left" side="left" tooltip={VITALS_RANGES.heartRate.tooltip} placeholder="72" />
                
                <div>Temperature</div>
                <ValidatedInput field="temperature_right" side="right" tooltip={VITALS_RANGES.temperature.tooltip} placeholder="98.6" optional />
                <ValidatedInput field="temperature_left" side="left" tooltip={VITALS_RANGES.temperature.tooltip} placeholder="98.6" optional />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Walking Oxygen Saturation Test</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        <Info className="h-3 w-3 mr-1" />
                        60-Second Test
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        Place oximeter on finger with lowest supine O2 reading. Patient walks for 60 seconds. 
                        O2 should remain stable or increase. A drop may indicate exercise-induced desaturation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                {(() => {
                  const lowestO2 = getLowestSupineO2();
                  const walkingCheck = checkWalkingO2Drop();
                  
                  return (
                    <>
                      {lowestO2.value !== null && (
                        <Alert className={lowestO2.side === 'right' ? 'bg-orange-50 dark:bg-orange-950' : 'bg-blue-50 dark:bg-blue-950'}>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Baseline Reading:</strong> {lowestO2.side === 'right' ? 'Right' : 'Left'} finger - {lowestO2.value}% O2
                            {lowestO2.value < 95 && ' (Below normal range)'}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="o2_saturation_walking">
                            O2 Saturation After 60s Walk
                            <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                          </Label>
                          <div className="flex gap-2 items-start">
                            <div className="flex-1">
                              <Input
                                id="o2_saturation_walking"
                                value={formData.o2_saturation_walking || ''}
                                onChange={(e) => updateField('o2_saturation_walking', e.target.value)}
                                placeholder="98"
                                className={walkingCheck.hasWarning ? 'border-destructive' : ''}
                              />
                              {walkingCheck.hasWarning && walkingCheck.drop !== null && (
                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3" />
                                  O2 dropped {walkingCheck.drop.toFixed(1)}% during walking test
                                </p>
                              )}
                            </div>
                            {walkingCheck.hasWarning && (
                              <Badge variant="destructive" className="mt-2">
                                ⚠️ Drop Detected
                              </Badge>
                            )}
                            {!walkingCheck.hasWarning && walkingCheck.walking !== null && walkingCheck.baseline !== null && (
                              <Badge variant="secondary" className="mt-2">
                                ✓ Stable
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="walking_o2_notes">
                            Test Notes
                            <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                          </Label>
                          <Textarea
                            id="walking_o2_notes"
                            value={formData.walking_o2_notes || ''}
                            onChange={(e) => updateField('walking_o2_notes', e.target.value)}
                            placeholder="Patient tolerance, symptoms during test, recovery time..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div>
              <Label htmlFor="vitals_notes">
                Notes
                <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
              </Label>
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
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Reflex Scale:</strong> 0 = Absent • 1+ = Diminished • 2+ = Normal • 3+ = Increased • 4+ = Hyperactive with clonus
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Reflex</div>
              <div className="font-medium text-orange-600 flex items-center gap-1">
                <ArrowRight className="h-4 w-4" /> Right
              </div>
              <div className="font-medium text-blue-600 flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Left
              </div>
              
              <div>Tricep</div>
              <ValidatedInput field="reflex_tricep_right" side="right" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              <ValidatedInput field="reflex_tricep_left" side="left" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              
              <div>Bicep</div>
              <ValidatedInput field="reflex_bicep_right" side="right" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              <ValidatedInput field="reflex_bicep_left" side="left" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              
              <div>Brachioradialis</div>
              <ValidatedInput field="reflex_brachioradialis_right" side="right" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              <ValidatedInput field="reflex_brachioradialis_left" side="left" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              
              <div>Patellar</div>
              <ValidatedInput field="reflex_patellar_right" side="right" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              <ValidatedInput field="reflex_patellar_left" side="left" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              
              <div>Achilles</div>
              <ValidatedInput field="reflex_achilles_right" side="right" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
              <ValidatedInput field="reflex_achilles_left" side="left" tooltip={REFLEX_SCALE.tooltip} placeholder="2+" optional />
            </div>

            <div>
              <Label htmlFor="reflexes_notes">
                Notes
                <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
              </Label>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Saccades/Antisaccades</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        <Info className="h-3 w-3 mr-1" />
                        Clinical Findings
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        Select all observed findings. Interpretations are automatically stored for summary generation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Parse current visual_saccades value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.visual_saccades || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.visual_saccades || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('visual_saccades', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('visual_saccades', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SACCADE_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`saccade-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`saccade-${finding.label}`}
                                    className="text-sm font-normal leading-tight cursor-pointer"
                                  >
                                    {finding.label}
                                  </Label>
                                  {selectedFindings.includes(finding.label) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <p className="text-xs text-muted-foreground mt-1 cursor-help flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            {finding.interpretation.substring(0, 50)}...
                                          </p>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-sm">
                                          <p className="text-sm">{finding.interpretation}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Custom notes field */}
                    <div>
                      <Label htmlFor="saccades_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="saccades_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional saccade observations not covered above..."
                        rows={3}
                      />
                    </div>

                    {/* Summary of selected findings */}
                    {selectedFindings.length > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{selectedFindings.length} finding{selectedFindings.length !== 1 ? 's' : ''} selected</strong>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedFindings.map(finding => (
                              <Badge key={finding} variant="secondary" className="text-xs">
                                {finding.split(' ').slice(0, 3).join(' ')}...
                              </Badge>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })()}
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