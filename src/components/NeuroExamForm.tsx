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

// Clinical findings for smooth pursuits with interpretations
const PURSUIT_FINDINGS = [
  {
    category: "Smoothness / Quality",
    findings: [
      {
        label: "Pursuits are smooth and continuous without interruptions",
        interpretation: "Normal pursuit tracking."
      },
      {
        label: "Tracking is saccadic with frequent catch-up saccades",
        interpretation: "Cerebellar flocculus/paraflocculus involvement; potential parietal tracking deficit."
      },
      {
        label: "Pursuits are fragmented with small corrective saccades",
        interpretation: "Impaired neural integration."
      }
    ]
  },
  {
    category: "Direction-Specific",
    findings: [
      {
        label: "Leftward pursuits more saccadic than rightward",
        interpretation: "Suggests cerebellar asymmetry (ipsilateral)."
      },
      {
        label: "Vertical pursuits impaired > horizontal pursuits",
        interpretation: "More concerning: vertical pursuit deficits often implicate midbrain pretectum or diffuse metabolic/central processing issues."
      }
    ]
  },
  {
    category: "Conjugacy",
    findings: [
      {
        label: "Eyes maintain conjugacy throughout pursuit",
        interpretation: "Normal conjugate tracking."
      },
      {
        label: "Disconjugate tracking noted during vertical pursuits",
        interpretation: "Possible internuclear ophthalmoplegia (INO) or vestibular mismatch."
      }
    ]
  },
  {
    category: "Range & End-Range Stability",
    findings: [
      {
        label: "Pursuits degrade at end range with drift and corrective saccades",
        interpretation: "Neural integrator fatigue (cerebellar or brainstem involvement)."
      },
      {
        label: "Patient unable to maintain end-range hold without oscillation",
        interpretation: "Flocculus/paraflocculus insufficiency."
      }
    ]
  },
  {
    category: "Velocity Matching (Gain)",
    findings: [
      {
        label: "Pursuit gain appears normal",
        interpretation: "Normal velocity matching to target."
      },
      {
        label: "Reduced pursuit gain with delayed matching to target speed",
        interpretation: "Parietal or cerebellar processing weakness."
      }
    ]
  },
  {
    category: "Attention / Fatigue",
    findings: [
      {
        label: "Performance consistent throughout exam",
        interpretation: "Normal sustained attention."
      },
      {
        label: "Pursuit quality deteriorates with repetition (fatigability)",
        interpretation: "Frontal-cerebellar endurance limitation; clinical significance for concussion/PCS."
      }
    ]
  },
  {
    category: "Intrusions",
    findings: [
      {
        label: "Frequent rightward catch-up saccades interrupt pursuit",
        interpretation: "Pursuit–saccade system mismatch; cerebellar/parietal involvement."
      },
      {
        label: "Occasional back-up saccades during downward tracking",
        interpretation: "Impaired target prediction and inhibitory control."
      },
      {
        label: "SWJs occurring during fixation between pursuit sweeps",
        interpretation: "Cerebellar or upper brainstem dyscontrol."
      }
    ]
  },
  {
    category: "Vertical-Specific Clues",
    findings: [
      {
        label: "Upward pursuits saccadic > downward pursuits",
        interpretation: "Possible dorsal midbrain dysfunction."
      },
      {
        label: "Downward pursuits provoke dizziness or nausea",
        interpretation: "Brainstem integration issue; vestibular–ocular mismatch."
      },
      {
        label: "Vertical pursuits slow with delayed initiation",
        interpretation: "Consider central involvement over peripheral."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "Pursuits provoke dizziness/lightheadedness",
        interpretation: "Vestibular contribution or cerebellar load intolerance."
      },
      {
        label: "Pursuits provoke headache or cognitive fatigue",
        interpretation: "Frontal load intolerance; common in PCS, migraine, autonomic dysfunction."
      },
      {
        label: "Pursuits cause visual strain or blurred vision",
        interpretation: "Accommodative involvement or poor binocular integration."
      }
    ]
  },
  {
    category: "Behavioral/Compensatory",
    findings: [
      {
        label: "Patient stabilizes head or moves head with target",
        interpretation: "Suggests VOR/pursuit mismatch or vestibular avoidance."
      },
      {
        label: "Patient blinks excessively during pursuits",
        interpretation: "Sympathetic/autonomic component; visually-evoked stress."
      }
    ]
  }
];

// Helper to get interpretation for a pursuit finding
export const getPursuitInterpretation = (findingLabel: string): string => {
  for (const category of PURSUIT_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected pursuit findings
export const getPursuitInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getPursuitInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for OPK (Optokinetic) with interpretations
const OPTOKINETIC_FINDINGS = [
  {
    category: "OPK Gain",
    findings: [
      {
        label: "OPK gain is symmetric and appropriate across all directions",
        interpretation: "Normal optokinetic response."
      },
      {
        label: "Reduced OPK gain bilaterally",
        interpretation: "Central processing deficit; reduced parietal–cerebellar modulation."
      },
      {
        label: "Reduced OPK gain on leftward stimulation",
        interpretation: "Suggests ipsilateral cerebellar flocculus/paraflocculus dysfunction."
      },
      {
        label: "OPK response appears hypermetric or excessively strong",
        interpretation: "Often reflects loss of inhibitory control (frontal or cerebellar inhibition deficit)."
      }
    ]
  },
  {
    category: "Asymmetry",
    findings: [
      {
        label: "Rightward OPK stronger than leftward",
        interpretation: "Suggests left cerebellar underdrive."
      },
      {
        label: "Vertical OPK responses asymmetric (upward > downward or vice versa)",
        interpretation: "Vertical asymmetry is especially central and highly clinically meaningful."
      },
      {
        label: "Marked asymmetry with inconsistent slow-phase generation",
        interpretation: "Indicates disrupted velocity storage or central vestibular processing."
      }
    ]
  },
  {
    category: "Slow-Phase Velocity",
    findings: [
      {
        label: "Slow-phase segments are smooth and continuous",
        interpretation: "Normal slow-phase tracking."
      },
      {
        label: "Slow phases are irregular, fragmented, or drop out",
        interpretation: "Poor cerebellar modulation or parietal tracking dysfunction."
      },
      {
        label: "Slow-phase velocity decreases over time (fatigability)",
        interpretation: "Brainstem or cerebellar endurance deficit."
      }
    ]
  },
  {
    category: "Fast-Phase Quality",
    findings: [
      {
        label: "Fast-phases present and symmetric",
        interpretation: "Normal fast-phase reset."
      },
      {
        label: "Fast-phase generation inconsistent or absent",
        interpretation: "Concern for more significant central involvement."
      },
      {
        label: "Fast-phase beats overshoot target repeatedly",
        interpretation: "Poor cerebellar control/overshoot tendency."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "OPK provokes dizziness/lightheadedness",
        interpretation: "Brainstem–cerebellar mismatch or velocity storage irritation."
      },
      {
        label: "OPK provokes nausea",
        interpretation: "Classic vestibular-ocular mismatch."
      },
      {
        label: "OPK causes visual overload or cognitive fatigue",
        interpretation: "Frontal-parietal intolerance; common in PCS."
      },
      {
        label: "OPK exposure induces autonomic response (heat, sweating, pressure)",
        interpretation: "Autonomic dysregulation / limbic–brainstem involvement."
      }
    ]
  },
  {
    category: "After-Nystagmus",
    findings: [
      {
        label: "Normal brief after-nystagmus following cessation",
        interpretation: "Normal velocity storage response."
      },
      {
        label: "Prolonged after-nystagmus",
        interpretation: "Velocity storage dysfunction (central vestibular integrator)."
      },
      {
        label: "Asymmetric after-nystagmus (R > L or U > D)",
        interpretation: "Indicates sidedness of dysfunction."
      }
    ]
  },
  {
    category: "Vertical OPK-Specific",
    findings: [
      {
        label: "Downward OPK is diminished relative to upward",
        interpretation: "Parietal-occipital integration issue or midbrain involvement."
      },
      {
        label: "Upward OPK produces consistent symptoms",
        interpretation: "Suggests dorsal midbrain or central vestibular involvement."
      },
      {
        label: "Vertical OPK response is fragmented with inconsistent slow-phase generation",
        interpretation: "High clinical significance—often central injury pattern (PCS, migraine, dysautonomia)."
      }
    ]
  },
  {
    category: "Visual-Motor Control",
    findings: [
      {
        label: "Patient attempts to fixate on a single point rather than engage OPK stimulus",
        interpretation: "Frontal inhibition or compensatory mechanism to eliminate visual motion."
      },
      {
        label: "Patient blinks excessively during OPK",
        interpretation: "Visual–autonomic stress response."
      },
      {
        label: "Head movement used to compensate during OPK",
        interpretation: "Vestibular avoidance or central intolerance."
      }
    ]
  },
  {
    category: "Fatigability & Endurance",
    findings: [
      {
        label: "OPK response consistent throughout exposure",
        interpretation: "Normal endurance and sustained response."
      },
      {
        label: "Slow-phase velocity declines with continued stimulation",
        interpretation: "Cerebellar/brainstem fatigue; highly relevant in concussion or dysautonomia."
      }
    ]
  }
];

// Helper to get interpretation for an OPK finding
export const getOPKInterpretation = (findingLabel: string): string => {
  for (const category of OPTOKINETIC_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected OPK findings
export const getOPKInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getOPKInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Visual Convergence with interpretations
const CONVERGENCE_FINDINGS = [
  {
    category: "Near Point of Convergence (NPC)",
    findings: [
      {
        label: "NPC break at 3–6 cm, within normal limits",
        interpretation: "Normal near point of convergence."
      },
      {
        label: "NPC break at 12–20 cm, indicating convergence insufficiency",
        interpretation: "Common in PCS, migraine, autonomic dysfunction."
      },
      {
        label: "NPC break inconsistent across trials",
        interpretation: "Cerebellar–frontal fatigue pattern; reduced endurance or attentional drive."
      },
      {
        label: "Asymmetric NPC break (R > L accommodative convergence)",
        interpretation: "Suggests asymmetric oculomotor activation or dominance pattern."
      }
    ]
  },
  {
    category: "Recovery Point",
    findings: [
      {
        label: "Recovery smooth and within normal range",
        interpretation: "Normal convergence recovery."
      },
      {
        label: "Delayed recovery following break",
        interpretation: "Brainstem–oculomotor integrator fatigue or frontal endurance deficit."
      },
      {
        label: "Recovery incomplete without blinking/resetting",
        interpretation: "Binocular instability or autonomic-driven disintegration."
      }
    ]
  },
  {
    category: "Quality of Convergence",
    findings: [
      {
        label: "Convergence is smooth and symmetrical",
        interpretation: "Normal convergence quality."
      },
      {
        label: "Convergence tremulous approaching end-range",
        interpretation: "Cranial nerve III vergence fatigue; brainstem involvement."
      },
      {
        label: "Eyes drift outward during maintenance (exophoria tendency)",
        interpretation: "Poor fusional vergence capacity; common post-concussion."
      },
      {
        label: "Convergence maintained only briefly before decompensation",
        interpretation: "Oculomotor endurance insufficiency."
      }
    ]
  },
  {
    category: "Binocular Integration",
    findings: [
      {
        label: "Binocular alignment maintained throughout",
        interpretation: "Normal binocular integration."
      },
      {
        label: "Intermittent diplopia near the break point",
        interpretation: "Suggests breakdown in fusional reserves."
      },
      {
        label: "Patient suppresses one eye to maintain clarity",
        interpretation: "Decompensation strategy; often frontal–brainstem fatigue signature."
      },
      {
        label: "Marked exodeviation during convergence",
        interpretation: "Significant convergence insufficiency; CN III vergence system overload."
      }
    ]
  },
  {
    category: "Compensatory Behaviors",
    findings: [
      {
        label: "Patient moves the head toward the target to compensate",
        interpretation: "Suggests difficulty generating near-point convergence neurologically."
      },
      {
        label: "Patient blinks repeatedly as the target approaches",
        interpretation: "Visual-autonomic trigger; attempt to reset vergence."
      },
      {
        label: "Patient demonstrates increased body tension during convergence",
        interpretation: "Autonomic co-activation—important in dysautonomia or PCS."
      }
    ]
  },
  {
    category: "Symptom Provocation - Neurologic",
    findings: [
      {
        label: "Convergence provokes dizziness/lightheadedness",
        interpretation: "Vestibular–ocular interaction breakdown."
      },
      {
        label: "Convergence provokes head pressure or headache",
        interpretation: "Frontal load intolerance; common in PCS and migraine."
      },
      {
        label: "Convergence causes eye strain or burning sensation",
        interpretation: "Overutilization of vergence–accommodation system."
      }
    ]
  },
  {
    category: "Symptom Provocation - Autonomic",
    findings: [
      {
        label: "Convergence provokes heat, sweating, or nausea",
        interpretation: "Autonomic dysregulation; clinically meaningful."
      }
    ]
  },
  {
    category: "Symptom Provocation - Visual",
    findings: [
      {
        label: "Convergence causes diplopia",
        interpretation: "Fusional breakdown; often aligns with severity in concussion."
      },
      {
        label: "Convergence causes blurred vision",
        interpretation: "Accommodation-vergence coupling dysfunction."
      },
      {
        label: "Difficulty maintaining focus during convergence",
        interpretation: "Sustained vergence instability; common in dysautonomia."
      }
    ]
  },
  {
    category: "Fatigability & Endurance",
    findings: [
      {
        label: "Convergence remains stable over repeated trials",
        interpretation: "Normal convergence endurance."
      },
      {
        label: "Performance declines across trials, requiring more corrections",
        interpretation: "Oculomotor endurance deficit; frontal or brainstem fatigue."
      },
      {
        label: "NPC worsens significantly after 2–3 repetitions",
        interpretation: "Classic in post-concussion syndrome—highly clinically relevant."
      }
    ]
  },
  {
    category: "Accommodation Relationship",
    findings: [
      {
        label: "Convergence accompanied by appropriate accommodative response",
        interpretation: "Normal vergence–accommodation coupling."
      },
      {
        label: "Convergence achieved but accommodation lags",
        interpretation: "Impaired coupling; can show parietal or autonomic involvement."
      },
      {
        label: "Accommodation present without adequate convergence",
        interpretation: "Faulty vergence drive → CN III vergence pathway issue."
      }
    ]
  }
];

// Helper to get interpretation for a convergence finding
export const getConvergenceInterpretation = (findingLabel: string): string => {
  for (const category of CONVERGENCE_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected convergence findings
export const getConvergenceInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getConvergenceInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Heart Auscultation with interpretations
const HEART_AUSCULTATION_FINDINGS = [
  {
    category: "Rate & Rhythm",
    findings: [
      {
        label: "Regular rate and rhythm without irregularities",
        interpretation: "Normal cardiac rate and rhythm."
      },
      {
        label: "Sinus tachycardia noted at rest",
        interpretation: "Sympathetic dominance; possible frontal-autonomic dysregulation or physiologic stress."
      },
      {
        label: "Sinus bradycardia with appropriate perfusion",
        interpretation: "Possible high vagal tone vs. medication influence; relevant to autonomic balance."
      },
      {
        label: "Irregular rhythm with skipped beats",
        interpretation: "Autonomic instability or ectopy; consider further cardiology evaluation."
      },
      {
        label: "Respiratory sinus arrhythmia present",
        interpretation: "Good vagal flexibility—positive autonomic indicator."
      }
    ]
  },
  {
    category: "Heart Sounds (S1, S2)",
    findings: [
      {
        label: "Normal S1 and S2 with physiologic splitting",
        interpretation: "Normal heart sounds."
      },
      {
        label: "Diminished S1/S2 intensity",
        interpretation: "Reduced stroke volume, poor physiologic drive, dehydration, or autonomic under-activation."
      },
      {
        label: "Accentuated S2",
        interpretation: "Possible elevated sympathetic output or increased systemic vascular resistance (SVR)."
      },
      {
        label: "Fixed or wide splitting of S2",
        interpretation: "Red flag; structural or conduction-related → requires cardiology input."
      }
    ]
  },
  {
    category: "Extra Heart Sounds (S3, S4)",
    findings: [
      {
        label: "S3 present",
        interpretation: "Potential volume overload; commonly autonomic-related dysregulation of venous return or early dysfunction."
      },
      {
        label: "S4 present",
        interpretation: "Increased ventricular stiffness; often elevated sympathetic tone or vascular resistance."
      }
    ]
  },
  {
    category: "Murmurs",
    findings: [
      {
        label: "Soft flow murmur without radiation",
        interpretation: "Often benign; can reflect increased sympathetic tone or elevated cardiac output."
      },
      {
        label: "Systolic murmur grade 2/6 at LSB without radiation",
        interpretation: "May represent physiologic flow or early structural concerns."
      },
      {
        label: "Holosystolic murmur with radiation",
        interpretation: "Requires cardiology referral."
      },
      {
        label: "Diastolic murmurs present",
        interpretation: "Always pathologic → cardiology evaluation."
      }
    ]
  },
  {
    category: "Rhythm Variability",
    findings: [
      {
        label: "Good beat-to-beat variability noted",
        interpretation: "Strong vagal activity and healthy autonomic adaptability."
      },
      {
        label: "Low beat-to-beat variability",
        interpretation: "Sympathetic dominance or reduced parasympathetic tone; relevant in PCS, dysautonomia, chronic stress patterns."
      },
      {
        label: "Abrupt rate changes with respiration",
        interpretation: "Dysregulated baroreceptor response; cerebellar/brainstem autonomic involvement."
      }
    ]
  },
  {
    category: "Perfusion Clues",
    findings: [
      {
        label: "Peripheral perfusion appears reduced (cool hands, delayed refill)",
        interpretation: "Elevated sympathetic tone or shunting; common in dysautonomia."
      },
      {
        label: "Warm extremities with stable perfusion",
        interpretation: "Balanced autonomic function."
      },
      {
        label: "Jugular venous pulsation appears elevated",
        interpretation: "Consider cardiovascular contribution to autonomic symptoms."
      }
    ]
  },
  {
    category: "Postural Changes (Supine → Seated)",
    findings: [
      {
        label: "Heart rate increases >20 bpm when seated",
        interpretation: "Orthostatic intolerance or POTS-like physiology."
      },
      {
        label: "Murmur intensity changes with posture",
        interpretation: "Hemodynamic load variation; sometimes autonomic-driven."
      }
    ]
  },
  {
    category: "Postural Changes (Seated → Standing)",
    findings: [
      {
        label: "Significant tachycardic response (>30 bpm increase)",
        interpretation: "Autonomic dysregulation consistent with POTS physiology."
      },
      {
        label: "No significant postural change",
        interpretation: "Good autonomic buffering and baroreceptor responsiveness."
      }
    ]
  },
  {
    category: "Respiratory Influence",
    findings: [
      {
        label: "Rate slows on exhalation (normal vagal modulation)",
        interpretation: "Normal vagal modulation with respiration."
      },
      {
        label: "Minimal variation with breathing (reduced vagal tone)",
        interpretation: "Reduced parasympathetic activity."
      },
      {
        label: "Pronounced tachycardia with inhalation",
        interpretation: "Sympathetic sensitivity."
      }
    ]
  }
];

// Helper to get interpretation for a heart auscultation finding
export const getHeartAuscultationInterpretation = (findingLabel: string): string => {
  for (const category of HEART_AUSCULTATION_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected heart auscultation findings
export const getHeartAuscultationInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getHeartAuscultationInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Lung Auscultation with interpretations
const LUNG_AUSCULTATION_FINDINGS = [
  {
    category: "Respiratory Pattern",
    findings: [
      {
        label: "Respirations even, controlled, and diaphragmatic",
        interpretation: "Normal respiratory pattern."
      },
      {
        label: "Apical breathing dominant",
        interpretation: "Sympathetic dominance / reduced vagal diaphragm drive (common in PCS, anxiety, dysautonomia)."
      },
      {
        label: "Shallow respirations with poor diaphragm expansion",
        interpretation: "Ventral vagal underactivation; cerebellar–brainstem dyscoordination."
      },
      {
        label: "Irregular rhythm or inconsistent depth of respiration",
        interpretation: "Brainstem respiratory pattern generator instability (pre-Bötzinger involvement)."
      },
      {
        label: "Visible paradoxical breathing pattern",
        interpretation: "Abnormal intercostal–diaphragm timing → central dysregulation."
      }
    ]
  },
  {
    category: "Breath Sounds",
    findings: [
      {
        label: "Clear vesicular breath sounds bilaterally without added sounds",
        interpretation: "Normal breath sounds."
      },
      {
        label: "Diminished breath sounds at bases",
        interpretation: "Poor thoracic expansion → decreased autonomic flexibility or posture-related restriction."
      },
      {
        label: "Diminished breath sounds on one side",
        interpretation: "Possible unilateral motor drive deficit (thoracic spinal segment involvement)."
      },
      {
        label: "Prolonged expiratory phase",
        interpretation: "Increased sympathetic tone or bronchoconstriction tendency."
      }
    ]
  },
  {
    category: "Adventitious Sounds - Wheezes",
    findings: [
      {
        label: "Intermittent expiratory wheeze noted",
        interpretation: "Bronchoconstriction; may correlate with sympathetic overactivity or high vagal threat physiology."
      }
    ]
  },
  {
    category: "Adventitious Sounds - Crackles",
    findings: [
      {
        label: "Fine crackles at lower lobes",
        interpretation: "Fluid shift / restrictive physiology; may reflect poor autonomic control of thoracic perfusion."
      }
    ]
  },
  {
    category: "Adventitious Sounds - Other",
    findings: [
      {
        label: "Low-pitched rhonchi clearing with cough",
        interpretation: "Upper airway clearance issue—not central."
      },
      {
        label: "Inspiratory stridor detected",
        interpretation: "Immediate airway concern; possible laryngeal dysfunction or vagal recurrent laryngeal nerve fatigue."
      }
    ]
  },
  {
    category: "Lung Field Symmetry",
    findings: [
      {
        label: "Symmetric chest expansion",
        interpretation: "Normal chest wall expansion."
      },
      {
        label: "Asymmetric chest expansion (L < R)",
        interpretation: "Unilateral motor output weakness; possible thoracic spinal segment dysfunction or cerebellar-cortical asymmetry."
      },
      {
        label: "Reduced lower rib expansion",
        interpretation: "Diaphragmatic underdrive → vagal withdrawal."
      },
      {
        label: "Upper chest recruitment > lower chest activation",
        interpretation: "Sympathetic 'fight/flight' respiratory pattern."
      }
    ]
  },
  {
    category: "Work of Breathing",
    findings: [
      {
        label: "No accessory muscle recruitment",
        interpretation: "Normal breathing effort."
      },
      {
        label: "Accessory muscle recruitment (SCM/scalenes)",
        interpretation: "Sympathetic overactivation; decreased diaphragmatic efficiency."
      },
      {
        label: "Breathing effort increases with minimal exertion",
        interpretation: "CNS fatigue signature; autonomic dysregulation."
      },
      {
        label: "Audible sighing or breath-holding pattern",
        interpretation: "Frontal–limbic dysregulation; common in concussion, stress physiology."
      }
    ]
  },
  {
    category: "Vocal Resonance",
    findings: [
      {
        label: "Normal symmetrical vocal resonance",
        interpretation: "Normal vocal transmission through lung tissue."
      },
      {
        label: "Diminished vocal resonance on the right",
        interpretation: "Reduced lung inflation or mechanical restriction → could indicate postural asymmetry tied to cerebellar/vestibular imbalance."
      },
      {
        label: "Increased vocal resonance over upper lobes",
        interpretation: "Consolidation vs. poor ventilation pattern."
      }
    ]
  },
  {
    category: "Positional Influence",
    findings: [
      {
        label: "Breath sounds improve significantly when supine",
        interpretation: "Orthostatic physiology; sympathetic overactivation while upright."
      },
      {
        label: "Breath sounds diminish in seated posture",
        interpretation: "Postural collapse, decreased thoracic drive → brainstem/vestibular contribution."
      },
      {
        label: "Increased audible breathing with light exertion",
        interpretation: "Autonomic mismatch; poor aerobic ramp-up."
      },
      {
        label: "Delayed respiratory recovery post-exertion",
        interpretation: "Low vagal reactivation; autonomic stress."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "Dizziness with deep breathing",
        interpretation: "Cerebellar-vestibular mismatch or CO₂ instability."
      },
      {
        label: "Head pressure with slow inhalation",
        interpretation: "Autonomic dysregulation / intracranial pressure sensitivity."
      },
      {
        label: "Chest tightness with normal breath sounds",
        interpretation: "Sympathetic overdrive; not pulmonary."
      },
      {
        label: "Fatigue when performing diaphragm-driven breathing",
        interpretation: "Brainstem–vagal fatigue signature."
      }
    ]
  }
];

// Helper to get interpretation for a lung auscultation finding
export const getLungAuscultationInterpretation = (findingLabel: string): string => {
  for (const category of LUNG_AUSCULTATION_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected lung auscultation findings
export const getLungAuscultationInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getLungAuscultationInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Abdominal Exam with interpretations
const ABDOMINAL_EXAM_FINDINGS = [
  {
    category: "Inspection",
    findings: [
      {
        label: "Abdomen flat/symmetric without visible tension or guarding",
        interpretation: "Normal abdominal appearance."
      },
      {
        label: "Abdominal wall appears hypertonic with upper-abdominal dominance",
        interpretation: "Sympathetic overdrive, reduced vagal tone."
      },
      {
        label: "Lower abdominal under-activation noted",
        interpretation: "Weakness in abdominal–pelvic integration; often cerebellar or vestibular asymmetry pattern."
      },
      {
        label: "Paradoxical abdominal movement with respiration",
        interpretation: "Brainstem respiratory patterning dysfunction."
      },
      {
        label: "Visible abdominal distention",
        interpretation: "Could indicate visceral motility issues linked to reduced vagal drive."
      },
      {
        label: "Asymmetric abdominal wall expansion",
        interpretation: "Suggests thoraco-lumbar segmental asymmetry or postural dominance."
      }
    ]
  },
  {
    category: "Auscultation - Bowel Sounds",
    findings: [
      {
        label: "Normoactive bowel sounds in all quadrants",
        interpretation: "Normal bowel sounds."
      },
      {
        label: "Hypoactive bowel sounds",
        interpretation: "Strong vagal underdrive; reduced parasympathetic tone; common after concussion or chronic stress."
      },
      {
        label: "Hyperactive bowel sounds",
        interpretation: "Sympathetic irritation/instability; increased motility during autonomic rebound."
      },
      {
        label: "Absent bowel sounds",
        interpretation: "Red flag for obstruction or severe autonomic suppression."
      },
      {
        label: "High-pitched bowel sounds",
        interpretation: "Possible obstruction pattern; neurologically can reflect dysregulated peristaltic pacing."
      }
    ]
  },
  {
    category: "Light Palpation",
    findings: [
      {
        label: "Abdomen soft, non-tender, no guarding",
        interpretation: "Normal abdominal palpation."
      },
      {
        label: "Voluntary guarding",
        interpretation: "Pain expectation / limbic–autonomic activation."
      },
      {
        label: "Involuntary guarding",
        interpretation: "More concerning; reflexive brainstem protection pattern."
      },
      {
        label: "Increased fascial tension over lower quadrants",
        interpretation: "Sympathetic dominance inhibiting normal abdominal tone."
      },
      {
        label: "Tenderness over psoas or pelvic floor referral",
        interpretation: "Segmental involvement L1–L3; functional postural asymmetry."
      }
    ]
  },
  {
    category: "Deep Palpation",
    findings: [
      {
        label: "Epigastric tenderness with autonomic symptoms (nausea, sweating)",
        interpretation: "Vagal irritation; brainstem–autonomic coupling dysfunction."
      },
      {
        label: "Right lower quadrant guarding without rebound",
        interpretation: "Could indicate mechanical or autonomic irritation; needs differentiation."
      },
      {
        label: "Generalized tenderness with soft abdomen",
        interpretation: "Often visceral hypersensitivity linked to sympathetically driven limbic activation."
      },
      {
        label: "Rebound tenderness positive",
        interpretation: "Peritoneal irritation—true red flag."
      },
      {
        label: "Palpable abdominal wall trigger points",
        interpretation: "Thoraco-lumbar segment sensitization; commonly linked with chronic neuromuscular patterns."
      }
    ]
  },
  {
    category: "Percussion",
    findings: [
      {
        label: "Tympanic over gas-filled areas; normal liver dullness",
        interpretation: "Normal percussion findings."
      },
      {
        label: "Excessive tympany",
        interpretation: "Motility pattern disruption; possible vagal suppression."
      },
      {
        label: "Dullness where tympany expected",
        interpretation: "Mass/fluid concern; also seen in chronic diaphragmatic restriction."
      },
      {
        label: "Percussion provokes guarding or flinch",
        interpretation: "Hyper-responsive segmental reflex—cerebellar vs. spinal processing issue."
      }
    ]
  },
  {
    category: "Visceromotor Reflex",
    findings: [
      {
        label: "Palpation triggers sympathetic surge (HR increase, sweating)",
        interpretation: "Abnormal viscerosomatic reflex activation."
      },
      {
        label: "Abdominal exam induces vagal symptoms (nausea, warmth, brady response)",
        interpretation: "Heightened vagal sensitivity; brainstem under-buffering."
      },
      {
        label: "Dermatomal sensitivity (T7–L3)",
        interpretation: "Segmental sensitization; often corresponds with asymmetrical cortical drive."
      },
      {
        label: "Abdominal wall contraction asymmetrically stronger on one side",
        interpretation: "Cortical–spinal dominance pattern; clinically meaningful in gait/posture mapping."
      }
    ]
  }
];

// Helper to get interpretation for an abdominal exam finding
export const getAbdominalExamInterpretation = (findingLabel: string): string => {
  for (const category of ABDOMINAL_EXAM_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected abdominal exam findings
export const getAbdominalExamInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getAbdominalExamInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Red Desaturation with interpretations
const RED_DESATURATION_FINDINGS = [
  {
    category: "Normal Finding",
    findings: [
      {
        label: "Color saturation equal bilaterally with no perceived difference",
        interpretation: "Symmetric optic nerve conduction, balanced thalamic–occipital processing, no overt monocular conduction deficit."
      }
    ]
  },
  {
    category: "Reduced Saturation",
    findings: [
      {
        label: "Patient reports reduced red saturation in the left eye compared to right",
        interpretation: "Suggests relative afferent conduction reduction. Common in optic nerve fatigue after concussion, subclinical optic neuritis history, retinal processing asymmetry, cerebellar–visual integration imbalance."
      },
      {
        label: "Right eye perceives red as duller/faded relative to left",
        interpretation: "Suggests relative afferent conduction reduction. Early thalamic/occipital underperformance, autonomic load reducing ocular perfusion."
      }
    ]
  },
  {
    category: "Quality of Desaturation",
    findings: [
      {
        label: "Red appears washed-out/pinkish in left eye compared to right",
        interpretation: "Reduced neural firing density, mild optic nerve metabolic load, early demyelination pattern (if chronic), cerebral hypoperfusion on that side (functional)."
      },
      {
        label: "Red appears washed-out/pinkish in right eye compared to left",
        interpretation: "Reduced neural firing density, mild optic nerve metabolic load, early demyelination pattern (if chronic), cerebral hypoperfusion on that side (functional)."
      }
    ]
  },
  {
    category: "Severity",
    findings: [
      {
        label: "Marked red desaturation in the left eye (patient estimates ~30% reduction)",
        interpretation: "Strong indicator of optic nerve pathway stress. Often seen in post-concussion visual fatigue, autonomic dysregulation reducing retinal perfusion, thalamic relay asymmetry, optic tract irritation."
      },
      {
        label: "Marked red desaturation in the right eye (patient estimates ~30% reduction)",
        interpretation: "Strong indicator of optic nerve pathway stress. Often seen in post-concussion visual fatigue, autonomic dysregulation reducing retinal perfusion, thalamic relay asymmetry, optic tract irritation."
      }
    ]
  },
  {
    category: "Temporal Pattern",
    findings: [
      {
        label: "Red desaturation increases with repeated comparison trials",
        interpretation: "Neuronal fatigue—metabolic fragility of the visual system. Often linked with PCS, dysautonomia, migraine system activation, poor cortical endurance. Major functional neurology biomarker for reduced endurance of the visual–cortical network."
      },
      {
        label: "Desaturation resolves after brief rest or improved fixation",
        interpretation: "Eye movement system instability → intermittent cortical hypoactivation. Poor vergence–accommodation coupling. Fatigue rather than structure."
      },
      {
        label: "Red saturation fluctuates from trial to trial",
        interpretation: "Autonomic state influencing retinal/cortical function. Brainstem perfusion variability, thalamic relay instability. Highly common in dysautonomia and PCS."
      }
    ]
  },
  {
    category: "Associated Findings",
    findings: [
      {
        label: "Desaturation noted more in eye demonstrating convergence weakness",
        interpretation: "Oculomotor fatigue spilling into optic nerve performance. Asymmetric cortical energy utilization. Inferior parietal–frontal circuit fragility. Extremely common in concussion patients."
      },
      {
        label: "Left eye perceives red as darker/deeper",
        interpretation: "Rare but notable: possible excessive contrast gain, thalamic gating irregularity, cortical hyperactivation instead of hypoactivation."
      },
      {
        label: "Right eye perceives red as darker/deeper",
        interpretation: "Rare but notable: possible excessive contrast gain, thalamic gating irregularity, cortical hyperactivation instead of hypoactivation."
      }
    ]
  },
  {
    category: "Postural Influence",
    findings: [
      {
        label: "Left eye red saturation worsens in upright posture",
        interpretation: "Orthostatic autonomic dysregulation. Reduced perfusion to optic nerve. Sympathetic override of visual processing. Highly relevant in dysautonomia/POTS-spectrum patients."
      },
      {
        label: "Right eye red saturation worsens in upright posture",
        interpretation: "Orthostatic autonomic dysregulation. Reduced perfusion to optic nerve. Sympathetic override of visual processing. Highly relevant in dysautonomia/POTS-spectrum patients."
      }
    ]
  }
];

// Helper to get interpretation for a red desaturation finding
export const getRedDesaturationInterpretation = (findingLabel: string): string => {
  for (const category of RED_DESATURATION_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected red desaturation findings
export const getRedDesaturationInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getRedDesaturationInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Pupillary Fatigue with interpretations
const PUPILLARY_FATIGUE_FINDINGS = [
  {
    category: "Normal Response",
    findings: [
      {
        label: "Pupil maintains constriction without fading for duration of exam",
        interpretation: "Stable parasympathetic output from Edinger-Westphal nucleus and good autonomic endurance."
      }
    ]
  },
  {
    category: "Pupillary Escape (Classic Fatigue)",
    findings: [
      {
        label: "Left pupil: escape (dilation) < 10 seconds",
        interpretation: "Significant autonomic fatigue. Parasympathetic fatigue (CN III/Edinger-Westphal under-endurance), increased sympathetic override. Common midbrain endurance marker."
      },
      {
        label: "Right pupil: escape (dilation) < 10 seconds",
        interpretation: "Significant autonomic fatigue. Parasympathetic fatigue (CN III/Edinger-Westphal under-endurance), increased sympathetic override. Common midbrain endurance marker."
      },
      {
        label: "Left pupil: escape 10-20 seconds",
        interpretation: "Moderate parasympathetic endurance deficit. Indicates midbrain fatigue pattern in concussion, migraine, dysautonomia."
      },
      {
        label: "Right pupil: escape 10-20 seconds",
        interpretation: "Moderate parasympathetic endurance deficit. Indicates midbrain fatigue pattern in concussion, migraine, dysautonomia."
      },
      {
        label: "Left pupil: escape > 20 seconds",
        interpretation: "Mild to normal variation in parasympathetic endurance."
      },
      {
        label: "Right pupil: escape > 20 seconds",
        interpretation: "Mild to normal variation in parasympathetic endurance."
      }
    ]
  },
  {
    category: "Asymmetric Fatigue",
    findings: [
      {
        label: "Left pupil demonstrates earlier escape relative to right",
        interpretation: "Unilateral parasympathetic conduction fatigue. Possible midbrain (pretectal/E-W nucleus) asymmetry, retinal-afferent asymmetry, hemispheric autonomic imbalance."
      },
      {
        label: "Right pupil demonstrates earlier escape relative to left",
        interpretation: "Unilateral parasympathetic conduction fatigue. Possible midbrain (pretectal/E-W nucleus) asymmetry, retinal-afferent asymmetry, hemispheric autonomic imbalance."
      }
    ]
  },
  {
    category: "Fluctuating/Oscillatory Response",
    findings: [
      {
        label: "Left pupil: oscillatory constriction/dilation during sustained light",
        interpretation: "Instability in parasympathetic drive, cerebellar-brainstem dyscoordination, autonomic rhythm instability (common in dysautonomia)."
      },
      {
        label: "Right pupil: oscillatory constriction/dilation during sustained light",
        interpretation: "Instability in parasympathetic drive, cerebellar-brainstem dyscoordination, autonomic rhythm instability (common in dysautonomia)."
      }
    ]
  },
  {
    category: "Repetition Fatigue",
    findings: [
      {
        label: "Pupillary endurance worsens on repeated trials",
        interpretation: "Autonomic metabolic fragility, diminishing parasympathetic reserve. Clear physiologic fatigue marker in PCS and post-viral neuro fatigue."
      },
      {
        label: "Slowed pupillary constriction followed by early escape",
        interpretation: "Dual impairment: reduced afferent drive + weak parasympathetic efferent firing. Can reflect deeper midbrain involvement."
      }
    ]
  },
  {
    category: "Postural/Respiratory Influence",
    findings: [
      {
        label: "Pupillary fatigue increases in upright posture",
        interpretation: "Orthostatic autonomic intolerance, reduced perfusion to midbrain autonomic nuclei. Highly relevant in dysautonomia cases."
      },
      {
        label: "Pupil stabilizes with diaphragmatic breathing",
        interpretation: "Strong vagal restorative effect. Indicates brainstem-autonomic responsiveness to parasympathetic input."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "Sustained light exposure provokes dizziness",
        interpretation: "Midbrain/vestibular integration issue, autonomic stress response during sustained parasympathetic demand."
      },
      {
        label: "Sustained light exposure provokes head pressure",
        interpretation: "Intracranial sensitivity, autonomic stress, possible increased intracranial pressure sensitivity."
      },
      {
        label: "Sustained light exposure provokes nausea",
        interpretation: "Brainstem autonomic nuclei activation, vagal irritation pattern."
      },
      {
        label: "Sustained light exposure provokes eye strain/burning",
        interpretation: "Oculomotor fatigue pattern, increased metabolic demand exceeding parasympathetic support."
      }
    ]
  },
  {
    category: "Autonomic Dominance Patterns",
    findings: [
      {
        label: "Pattern suggests parasympathetic weakness (early escape, asymmetry, fatigue)",
        interpretation: "Reduced Edinger-Westphal nucleus output, common in concussion, chronic stress, autonomic fatigue states."
      },
      {
        label: "Pupil constriction resists sustained exposure; sympathetic override noted",
        interpretation: "Excessive sympathetic tone overriding normal parasympathetic constriction response. Seen in high stress states, dysautonomia."
      }
    ]
  }
];

// Helper to get interpretation for a pupillary fatigue finding
export const getPupillaryFatigueInterpretation = (findingLabel: string): string => {
  for (const category of PUPILLARY_FATIGUE_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected pupillary fatigue findings
export const getPupillaryFatigueInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getPupillaryFatigueInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Romberg Sway Test with interpretations
const ROMBERG_FINDINGS = [
  {
    category: "Normal Response",
    findings: [
      {
        label: "Minimal sway; stable with eyes open and eyes closed",
        interpretation: "Intact proprioceptive input, symmetric cerebellar modulation, adequate vestibular integration, balanced autonomic/brainstem control."
      }
    ]
  },
  {
    category: "Positive Romberg (Increased Sway Eyes Closed)",
    findings: [
      {
        label: "Mild: Increased sway but maintains stance",
        interpretation: "Reliance on visual system due to proprioceptive or vestibular underperformance."
      },
      {
        label: "Moderate: Large-amplitude sway requiring correction",
        interpretation: "Cervical proprioceptive deficit, posterior column sensory dysfunction, cerebellar under-activation (common in concussion/whiplash)."
      },
      {
        label: "Severe: Step-out or near-loss of balance",
        interpretation: "Significant vestibular dysfunction, poor cerebellar feed-forward control, autonomic dysregulation."
      }
    ]
  },
  {
    category: "Directional Sway Patterns",
    findings: [
      {
        label: "Left-lateral sway predominates",
        interpretation: "Left cerebellar underactivity, left vestibular hypofunction, proprioceptive asymmetry on left side, or possible right frontal drive deficiency."
      },
      {
        label: "Right-lateral sway predominates",
        interpretation: "Right cerebellar or right vestibular underperformance."
      },
      {
        label: "Anterior sway predominates",
        interpretation: "Visual dependency, vestibular underdrive, poor ankle strategy proprioception."
      },
      {
        label: "Posterior sway predominates",
        interpretation: "Cerebellar midline involvement, autonomic/vestibular compensation failure (posterior pull pattern)."
      }
    ]
  },
  {
    category: "Sway Amplitude & Frequency",
    findings: [
      {
        label: "Small-amplitude sway within normal limits",
        interpretation: "Normal postural control."
      },
      {
        label: "Moderate, high-frequency sway",
        interpretation: "Vestibulocerebellar imbalance."
      },
      {
        label: "Large-amplitude, low-frequency sway requiring correction",
        interpretation: "Proprioceptive reliance with vestibular underactivation."
      },
      {
        label: "High-frequency micro-corrections observed",
        interpretation: "Cerebellar compensatory overdrive, proprioceptive fatigue, thalamic-cortical noise increasing motor corrections."
      }
    ]
  },
  {
    category: "Step-Out / Balance Loss",
    findings: [
      {
        label: "Step-out required to maintain balance (eyes closed)",
        interpretation: "Significant vestibular dysfunction, poor cerebellar feed-forward control, autonomic dysregulation causing instability."
      },
      {
        label: "Loss of balance immediately upon eye closure",
        interpretation: "Severe reliance on visual system; severe vestibular/proprioceptive weakness."
      }
    ]
  },
  {
    category: "Onset Timing",
    findings: [
      {
        label: "Sway begins immediately upon eye closure",
        interpretation: "Severe vestibular/proprioceptive weakness, common in concussion or cervicogenic dysfunction."
      },
      {
        label: "Sway increases after 5-10 seconds",
        interpretation: "Endurance deficit; cerebellar or brainstem fatigue signature."
      }
    ]
  },
  {
    category: "Compensatory Behaviors",
    findings: [
      {
        label: "Breath-holding during balance test",
        interpretation: "Autonomic threat response, weak vestibular-autonomic coupling."
      },
      {
        label: "Increased muscular co-contraction noted",
        interpretation: "Protective strategy; poor cerebellar modulation."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "Dizziness provoked",
        interpretation: "Vestibular-autonomic dysregulation."
      },
      {
        label: "Lightheadedness provoked",
        interpretation: "Autonomic instability during vestibular challenge."
      },
      {
        label: "Nausea provoked",
        interpretation: "Vestibular-autonomic dysregulation; brainstem nuclei activation."
      },
      {
        label: "Head pressure provoked",
        interpretation: "Intracranial sensitivity, autonomic stress response."
      },
      {
        label: "Visual blur provoked",
        interpretation: "Vestibulo-ocular integration deficit."
      }
    ]
  },
  {
    category: "Fatigability",
    findings: [
      {
        label: "Sway amplifies with repeated trials",
        interpretation: "Vestibular/cerebellar endurance deficit; concussion or autonomic fatigue marker."
      }
    ]
  }
];

// Helper to get interpretation for a Romberg finding
export const getRombergInterpretation = (findingLabel: string): string => {
  for (const category of ROMBERG_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected Romberg findings
export const getRombergInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getRombergInterpretation(finding)
  })).filter(item => item.interpretation !== "");
};

// Clinical findings for Vestibulo-Ocular Reflex (VOR) with interpretations
const VOR_FINDINGS = [
  {
    category: "Normal VOR",
    findings: [
      {
        label: "VOR intact with stable visual fixation and no corrective saccades",
        interpretation: "Healthy vestibular afferents, cerebellar flocculus/paraflocculus modulation, intact brainstem ocular motor integrators."
      }
    ]
  },
  {
    category: "Refixation Saccades (Key Diagnostic Finding)",
    findings: [
      {
        label: "Refixation saccades present on rightward head impulse",
        interpretation: "Right vestibular hypofunction, poor right canal output (most often horizontal canals), cerebellar-vestibular integration deficit. Common post-concussion."
      },
      {
        label: "Refixation saccades present on leftward head impulse",
        interpretation: "Left vestibular hypofunction, poor left canal output (most often horizontal canals), cerebellar-vestibular integration deficit. Common post-concussion."
      },
      {
        label: "Corrective saccades noted bilaterally",
        interpretation: "Bilateral vestibular hypofunction or diffuse cerebellar-vestibular integration deficit."
      },
      {
        label: "Corrective saccades more pronounced on the left",
        interpretation: "Left peripheral vestibular weakness or left flocculus underdrive predominates."
      },
      {
        label: "Corrective saccades more pronounced on the right",
        interpretation: "Right peripheral vestibular weakness or right flocculus underdrive predominates."
      }
    ]
  },
  {
    category: "Asymmetric VOR",
    findings: [
      {
        label: "Leftward VOR response weaker than right",
        interpretation: "Left vestibular hypoactivity or left cerebellar underperformance."
      },
      {
        label: "Rightward VOR response weaker than left",
        interpretation: "Right vestibular hypoactivity or right cerebellar underperformance."
      },
      {
        label: "Rightward impulses consistently trigger corrective saccades",
        interpretation: "Right peripheral vestibular weakness or right flocculus underdrive."
      },
      {
        label: "Leftward impulses consistently trigger corrective saccades",
        interpretation: "Left peripheral vestibular weakness or left flocculus underdrive."
      }
    ]
  },
  {
    category: "Reduced VOR Gain",
    findings: [
      {
        label: "Reduced gain with diminished eye counter-rotation",
        interpretation: "Weak vestibular signal from semicircular canals, brainstem integrator inefficiency. Often associated with dizziness and visual 'bounce'."
      }
    ]
  },
  {
    category: "Overshoot / Hypermetric Response",
    findings: [
      {
        label: "Eye moves past target during VOR with corrective back-up",
        interpretation: "Cerebellar inhibition deficit, increased noise in vestibular system. Less common than low gain but highly meaningful."
      }
    ]
  },
  {
    category: "Delay in VOR Activation",
    findings: [
      {
        label: "Delayed eye stabilization after head movement",
        interpretation: "Brainstem vestibular nuclei lag, cerebellar timing dysfunction, fatigue within vestibular-cortical pathways."
      }
    ]
  },
  {
    category: "VOR Cancellation (VORc)",
    findings: [
      {
        label: "Patient unable to suppress VOR during cancellation task",
        interpretation: "Cerebellar flocculus/paraflocculus dysfunction, frontal executive involvement."
      },
      {
        label: "Head movement induces reflexive catch-up during cancellation",
        interpretation: "Difficulty shifting from reflexive to volitional control; frontal-cerebellar integration deficit."
      },
      {
        label: "VOR cancellation fatigues rapidly",
        interpretation: "Frontal-cerebellar endurance deficit."
      }
    ]
  },
  {
    category: "Vertical VOR Abnormalities",
    findings: [
      {
        label: "Vertical VOR less stable than horizontal",
        interpretation: "Central involvement, often midbrain or cerebellar nodulus pathways. Carries higher neurologic significance."
      },
      {
        label: "Upward VOR provokes dizziness",
        interpretation: "Vertical canal and cerebellar vertical integration deficit."
      },
      {
        label: "Downward VOR provokes symptoms",
        interpretation: "Vertical canal involvement, midbrain integration weakness."
      }
    ]
  },
  {
    category: "Symptom Provocation",
    findings: [
      {
        label: "VOR provokes dizziness/lightheadedness",
        interpretation: "Vestibular-autonomic mismatch; severity marker rather than localization."
      },
      {
        label: "VOR provokes nausea",
        interpretation: "Vestibular-autonomic dysregulation; brainstem nuclei activation."
      },
      {
        label: "VOR provokes visual blur",
        interpretation: "Vestibulo-ocular integration deficit; inadequate gain compensation."
      },
      {
        label: "VOR provokes head pressure",
        interpretation: "Autonomic stress response, intracranial pressure sensitivity."
      },
      {
        label: "VOR provokes autonomic activation (heat, sweating)",
        interpretation: "Vestibular-autonomic coupling dysfunction."
      }
    ]
  },
  {
    category: "Fatigability",
    findings: [
      {
        label: "VOR performance declines over repeated trials",
        interpretation: "Vestibular endurance deficit, cerebellar processing fatigue, autonomic instability. Critical in concussion and dysautonomia."
      }
    ]
  },
  {
    category: "Head Movement Quality",
    findings: [
      {
        label: "Patient restricts head movement due to fear or discomfort",
        interpretation: "Protective response, vestibular threat physiology."
      },
      {
        label: "Excessive co-contraction of cervical muscles",
        interpretation: "Cervical proprioceptive dominance or guarding pattern."
      }
    ]
  }
];

// Helper to get interpretation for a VOR finding
export const getVORInterpretation = (findingLabel: string): string => {
  for (const category of VOR_FINDINGS) {
    const finding = category.findings.find(f => f.label === findingLabel);
    if (finding) return finding.interpretation;
  }
  return "";
};

// Helper to get all interpretations for selected VOR findings
export const getVORInterpretations = (selectedFindings: string[]): Array<{finding: string, interpretation: string}> => {
  return selectedFindings.map(finding => ({
    finding,
    interpretation: getVORInterpretation(finding)
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Heart Auscultation</Label>
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
              
              {/* Parse current auscultation_heart value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.auscultation_heart || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.auscultation_heart || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('auscultation_heart', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('auscultation_heart', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {HEART_AUSCULTATION_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`heart-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`heart-${finding.label}`}
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
                      <Label htmlFor="heart_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="heart_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional heart auscultation observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lung Auscultation</Label>
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
              
              {/* Parse current auscultation_lungs value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.auscultation_lungs || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.auscultation_lungs || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('auscultation_lungs', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('auscultation_lungs', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LUNG_AUSCULTATION_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`lungs-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`lungs-${finding.label}`}
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
                      <Label htmlFor="lungs_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="lungs_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional lung auscultation observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Abdominal Examination</Label>
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
              
              {/* Parse current auscultation_abdomen value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.auscultation_abdomen || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.auscultation_abdomen || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('auscultation_abdomen', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('auscultation_abdomen', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ABDOMINAL_EXAM_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`abdomen-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`abdomen-${finding.label}`}
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
                      <Label htmlFor="abdomen_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="abdomen_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional abdominal exam observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>OPK (Optokinetic - Horizontal & Vertical)</Label>
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
              
              {/* Parse current visual_opk value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.visual_opk || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.visual_opk || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('visual_opk', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('visual_opk', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OPTOKINETIC_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`opk-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`opk-${finding.label}`}
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
                      <Label htmlFor="opk_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="opk_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional OPK observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Smooth Pursuits (Horizontal & Vertical)</Label>
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
              
              {/* Parse current visual_pursuits value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.visual_pursuits || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.visual_pursuits || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('visual_pursuits', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('visual_pursuits', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PURSUIT_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`pursuit-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`pursuit-${finding.label}`}
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
                      <Label htmlFor="pursuits_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="pursuits_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional pursuit observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Visual Convergence</Label>
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
              
              {/* Parse current visual_convergence value */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                try {
                  const parsed = JSON.parse(formData.visual_convergence || '{}');
                  selectedFindings = parsed.findings || [];
                  customNotes = parsed.notes || "";
                } catch {
                  // Legacy text format - keep as custom notes
                  customNotes = formData.visual_convergence || "";
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  updateField('visual_convergence', JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                };

                const handleNotesChange = (notes: string) => {
                  updateField('visual_convergence', JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CONVERGENCE_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`convergence-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`convergence-${finding.label}`}
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
                      <Label htmlFor="convergence_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="convergence_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional convergence observations not covered above..."
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Red Desaturation</h3>
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
              
              {/* Parse current red desaturation values - handle both old boolean format and new structured format */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                // Check if we have structured data stored anywhere
                const structuredDataField = 'neuro_red_desaturation_structured';
                try {
                  const structuredData = (formData as any)[structuredDataField];
                  if (structuredData) {
                    const parsed = JSON.parse(structuredData);
                    selectedFindings = parsed.findings || [];
                    customNotes = parsed.notes || "";
                  } else {
                    // Migrate from old boolean format if present
                    if (formData.neuro_red_desaturation_right && formData.neuro_red_desaturation_left) {
                      selectedFindings = [];
                    } else if (formData.neuro_red_desaturation_right) {
                      selectedFindings = ["Right eye perceives red as duller/faded relative to left"];
                    } else if (formData.neuro_red_desaturation_left) {
                      selectedFindings = ["Patient reports reduced red saturation in the left eye compared to right"];
                    }
                  }
                } catch {
                  // Default to empty
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  // Update structured field
                  updateField(structuredDataField, JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                  
                  // Also update boolean fields for backward compatibility
                  const hasLeft = newFindings.some(f => f.toLowerCase().includes('left eye'));
                  const hasRight = newFindings.some(f => f.toLowerCase().includes('right eye'));
                  updateField('neuro_red_desaturation_left', hasLeft);
                  updateField('neuro_red_desaturation_right', hasRight);
                };

                const handleNotesChange = (notes: string) => {
                  updateField(structuredDataField, JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {RED_DESATURATION_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`red-desat-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`red-desat-${finding.label}`}
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
                      <Label htmlFor="red_desat_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="red_desat_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional red desaturation observations not covered above..."
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

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pupillary Fatigue</h3>
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
              
              {/* Parse current pupillary fatigue values - handle both old text format and new structured format */}
              {(() => {
                let selectedFindings: string[] = [];
                let customNotes = "";
                
                // Check if we have structured data stored anywhere
                const structuredDataField = 'neuro_pupillary_fatigue_structured';
                try {
                  const structuredData = (formData as any)[structuredDataField];
                  if (structuredData) {
                    const parsed = JSON.parse(structuredData);
                    selectedFindings = parsed.findings || [];
                    customNotes = parsed.notes || "";
                  } else {
                    // Migrate from old text format if present
                    if (formData.neuro_pupillary_fatigue_notes) {
                      customNotes = formData.neuro_pupillary_fatigue_notes;
                    }
                  }
                } catch {
                  // Default to empty
                }

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  // Update structured field
                  updateField(structuredDataField, JSON.stringify({
                    findings: newFindings,
                    notes: customNotes
                  }));
                  
                  // Also update legacy text fields for backward compatibility
                  const hasLeftFindings = newFindings.some(f => f.toLowerCase().includes('left pupil'));
                  const hasRightFindings = newFindings.some(f => f.toLowerCase().includes('right pupil'));
                  
                  // Update old text fields with time if escape findings are present
                  const leftEscapeFindings = newFindings.filter(f => f.startsWith('Left pupil: escape'));
                  const rightEscapeFindings = newFindings.filter(f => f.startsWith('Right pupil: escape'));
                  
                  if (leftEscapeFindings.length > 0) {
                    const leftTime = leftEscapeFindings[0].includes('< 10') ? '< 10s' : 
                                    leftEscapeFindings[0].includes('10-20') ? '10-20s' : '> 20s';
                    updateField('neuro_pupillary_fatigue_left', leftTime);
                  } else if (!hasLeftFindings) {
                    updateField('neuro_pupillary_fatigue_left', '');
                  }
                  
                  if (rightEscapeFindings.length > 0) {
                    const rightTime = rightEscapeFindings[0].includes('< 10') ? '< 10s' : 
                                     rightEscapeFindings[0].includes('10-20') ? '10-20s' : '> 20s';
                    updateField('neuro_pupillary_fatigue_right', rightTime);
                  } else if (!hasRightFindings) {
                    updateField('neuro_pupillary_fatigue_right', '');
                  }
                };

                const handleNotesChange = (notes: string) => {
                  updateField(structuredDataField, JSON.stringify({
                    findings: selectedFindings,
                    notes
                  }));
                  // Also update legacy notes field
                  updateField('neuro_pupillary_fatigue_notes', notes);
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PUPILLARY_FATIGUE_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`pupil-fatigue-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`pupil-fatigue-${finding.label}`}
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

                    {/* Escape time input fields */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Record Exact Escape Time (seconds)
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pupil_escape_left" className="text-sm text-muted-foreground">
                            Left Pupil Escape Time
                          </Label>
                          <Input
                            id="pupil_escape_left"
                            placeholder="e.g., 8 seconds"
                            value={formData.neuro_pupillary_fatigue_left || ''}
                            onChange={(e) => updateField('neuro_pupillary_fatigue_left', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pupil_escape_right" className="text-sm text-muted-foreground">
                            Right Pupil Escape Time
                          </Label>
                          <Input
                            id="pupil_escape_right"
                            placeholder="e.g., 12 seconds"
                            value={formData.neuro_pupillary_fatigue_right || ''}
                            onChange={(e) => updateField('neuro_pupillary_fatigue_right', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom notes field */}
                    <div>
                      <Label htmlFor="pupil_fatigue_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="pupil_fatigue_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional pupillary fatigue observations not covered above..."
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

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Distal Extensor Weakness</h3>
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
            {/* Structured Romberg Assessment */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Romberg Sway Test</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm">
                      <p className="text-sm">Structured assessment with clinical interpretations from functional neurology</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {(() => {
                // Parse structured data from vestibular_rombergs field
                let structuredData: { findings: string[], customNotes: string } = { findings: [], customNotes: '' };
                try {
                  if (formData.vestibular_rombergs && formData.vestibular_rombergs.startsWith('{')) {
                    structuredData = JSON.parse(formData.vestibular_rombergs);
                  } else if (formData.vestibular_rombergs) {
                    // Legacy text value - treat as custom notes
                    structuredData.customNotes = formData.vestibular_rombergs;
                  }
                } catch (e) {
                  // If parse fails, treat as custom notes
                  structuredData.customNotes = formData.vestibular_rombergs || '';
                }

                const selectedFindings = structuredData.findings || [];
                const customNotes = structuredData.customNotes || '';

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  const newStructuredData = {
                    findings: newFindings,
                    customNotes: customNotes
                  };
                  
                  updateField('vestibular_rombergs', JSON.stringify(newStructuredData));
                };

                const handleNotesChange = (notes: string) => {
                  const newStructuredData = {
                    findings: selectedFindings,
                    customNotes: notes
                  };
                  updateField('vestibular_rombergs', JSON.stringify(newStructuredData));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ROMBERG_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`romberg-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`romberg-${finding.label}`}
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
                      <Label htmlFor="romberg_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="romberg_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional Romberg observations not covered above..."
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
                                {finding.split(' ').slice(0, 4).join(' ')}...
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

            <Separator />
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
              <h3 className="text-lg font-semibold mb-4">OTR (Ocular Tilt Response)</h3>
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
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Canal Testing</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm">
                      <p className="text-sm">Select which canals improve shunt stability with eyes closed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {(() => {
                // Parse canal selections from vestibular_canal_testing field
                let selectedCanals: string[] = [];
                let additionalNotes = '';
                
                try {
                  if (formData.vestibular_canal_testing && formData.vestibular_canal_testing.startsWith('{')) {
                    const parsed = JSON.parse(formData.vestibular_canal_testing);
                    selectedCanals = parsed.canals || [];
                    additionalNotes = parsed.notes || '';
                  } else if (formData.vestibular_canal_testing) {
                    // Legacy text value - treat as notes
                    additionalNotes = formData.vestibular_canal_testing;
                  }
                } catch (e) {
                  additionalNotes = formData.vestibular_canal_testing || '';
                }

                const canals = [
                  { id: 'RA', label: 'Right Anterior (RA)' },
                  { id: 'LA', label: 'Left Anterior (LA)' },
                  { id: 'RH', label: 'Right Horizontal (RH)' },
                  { id: 'LH', label: 'Left Horizontal (LH)' },
                  { id: 'RP', label: 'Right Posterior (RP)' },
                  { id: 'LP', label: 'Left Posterior (LP)' }
                ];

                const handleCanalToggle = (canalId: string) => {
                  const newCanals = selectedCanals.includes(canalId)
                    ? selectedCanals.filter(c => c !== canalId)
                    : [...selectedCanals, canalId];
                  
                  const newData = {
                    canals: newCanals,
                    notes: additionalNotes
                  };
                  
                  updateField('vestibular_canal_testing', JSON.stringify(newData));
                };

                const handleNotesChange = (notes: string) => {
                  const newData = {
                    canals: selectedCanals,
                    notes: notes
                  };
                  updateField('vestibular_canal_testing', JSON.stringify(newData));
                };

                return (
                  <div className="space-y-4">
                    <Card className="border-muted">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Select canals that improve shunt stability with eyes closed:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {canals.map((canal) => (
                            <div key={canal.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`canal-${canal.id}`}
                                checked={selectedCanals.includes(canal.id)}
                                onCheckedChange={() => handleCanalToggle(canal.id)}
                              />
                              <Label
                                htmlFor={`canal-${canal.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {canal.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        {selectedCanals.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              <strong>Selected:</strong> {selectedCanals.join(', ')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div>
                      <Label htmlFor="canal_notes">
                        Additional Canal Testing Notes
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="canal_notes"
                        value={additionalNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="e.g., RHC best 9/10, quality of improvement noted..."
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            <Separator />

            <Separator />

            {/* Structured VOR Assessment */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">VOR (Vestibulo-Ocular Reflex)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm">
                      <p className="text-sm">Comprehensive VOR assessment including horizontal, vertical, and cancellation findings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {(() => {
                // Parse structured data from vestibular_vor field
                let structuredData: { findings: string[], customNotes: string } = { findings: [], customNotes: '' };
                try {
                  if (formData.vestibular_vor && formData.vestibular_vor.startsWith('{')) {
                    structuredData = JSON.parse(formData.vestibular_vor);
                  } else if (formData.vestibular_vor) {
                    // Legacy text value - treat as custom notes
                    structuredData.customNotes = formData.vestibular_vor;
                  }
                } catch (e) {
                  // If parse fails, treat as custom notes
                  structuredData.customNotes = formData.vestibular_vor || '';
                }

                const selectedFindings = structuredData.findings || [];
                const customNotes = structuredData.customNotes || '';

                const handleFindingToggle = (findingLabel: string) => {
                  const newFindings = selectedFindings.includes(findingLabel)
                    ? selectedFindings.filter(f => f !== findingLabel)
                    : [...selectedFindings, findingLabel];
                  
                  const newStructuredData = {
                    findings: newFindings,
                    customNotes: customNotes
                  };
                  
                  updateField('vestibular_vor', JSON.stringify(newStructuredData));
                };

                const handleNotesChange = (notes: string) => {
                  const newStructuredData = {
                    findings: selectedFindings,
                    customNotes: notes
                  };
                  updateField('vestibular_vor', JSON.stringify(newStructuredData));
                };

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {VOR_FINDINGS.map((category) => (
                        <Card key={category.category} className="border-muted">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {category.findings.map((finding) => (
                              <div key={finding.label} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`vor-${finding.label}`}
                                  checked={selectedFindings.includes(finding.label)}
                                  onCheckedChange={() => handleFindingToggle(finding.label)}
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`vor-${finding.label}`}
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
                      <Label htmlFor="vor_custom_notes">
                        Additional Observations
                        <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                      </Label>
                      <Textarea
                        id="vor_custom_notes"
                        value={customNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Additional VOR observations not covered above..."
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
                                {finding.split(' ').slice(0, 4).join(' ')}...
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

            <Separator />

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