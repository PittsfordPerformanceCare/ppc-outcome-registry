/**
 * Master List - Clinician Level Summary Comments
 * For PPC NeuroExam, Outcome Registry, and Clinical Notes
 * 
 * Standardized clinical interpretations organized by examination category and severity
 */

export type SeverityLevel = 'normal' | 'mild' | 'moderate' | 'severe';

export interface SummaryComment {
  severity: SeverityLevel;
  comment: string;
}

export const NEURO_EXAM_SUMMARY_COMMENTS = {
  // OCULOMOTOR - FIXATION
  fixation: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Fixation stable with minimal sway and no intrusions."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Intermittent fixation breaks with small square-wave jerks—suggestive of cerebellar–brainstem dyscontrol."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked fixation instability with intrusions and fatigue—reflects significant central integration weakness."
    }
  ],

  // OCULOMOTOR - SACCADES
  saccades: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Saccades brisk, accurate, and non-fatiguing."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Mild hypometria with small corrective saccades (R>L)."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Moderate dysmetria with increased latency and fatigability."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Significant saccadic fragmentation, disconjugacy, and symptom provocation—consistent with cerebellar–frontal–vestibular dysfunction."
    }
  ],

  // OCULOMOTOR - PURSUITS
  pursuits: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Smooth, conjugate pursuits without intrusions or symptoms."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Leftward pursuits mildly saccadic with occasional catch-up saccades."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Pursuits fragmented with reduced gain and moderate fatigability; vertical worse than horizontal."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked pursuit fragmentation with disconjugacy and provocation—suggesting cerebellar–parietal integration dysfunction."
    }
  ],

  // OPTOKINETIC RESPONSE (OPK)
  opk: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "OPK symmetric with appropriate slow-phase response."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Reduced leftward OPK gain with mild dizziness."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Asymmetric OPK with fragmented slow-phase velocity and early fatigue."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked OPK asymmetry with inconsistent fast-phase resets and prolonged after-nystagmus—consistent with central vestibular integrator dysfunction."
    }
  ],

  // VERGENCE - CONVERGENCE (NPC)
  convergence: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Convergence smooth and symmetric with NPC within normal limits."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "NPC break at 10 cm with mild eye strain; recovery intact."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "NPC break at 15 cm with tremulous convergence and dizziness—moderate oculomotor fatigue."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "NPC break >20 cm with diplopia and autonomic provocation—significant convergence insufficiency and brainstem fatigue."
    }
  ],

  // VISUAL - RED DESATURATION
  redDesaturation: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Red saturation equal bilaterally."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Subtle unilateral desaturation (~10–15%) indicating mild optic pathway fatigue."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Clear unilateral desaturation (~25%) worsening with repetition—moderate conduction fatigue."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked unilateral red desaturation (>30%) with symptoms—significant optic pathway stress and cortical underperformance."
    }
  ],

  // PUPILLARY FATIGUE
  pupillaryFatigue: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Pupils maintain constriction without escape or fatigue."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Early pupillary escape (~20 sec) with mild fatigue—reduced parasympathetic endurance."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Escape at ~10–12 sec with oscillations and symptom provocation—moderate midbrain–autonomic fatigue."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked asymmetry in pupillary endurance with dizziness—indicative of central autonomic dysregulation."
    }
  ],

  // BALANCE - ROMBERG
  romberg: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Romberg stable with minimal sway in all conditions."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Increased sway with eyes closed; maintains stance—mild vestibular/proprioceptive underperformance."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Moderate sway (R>L) with early onset after eye closure—consistent with vestibular/cerebellar integration deficit."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Large-amplitude sway with step-out and autonomic provocation—significant vestibular–cerebellar dysfunction."
    }
  ],

  // VESTIBULAR - VOR
  vor: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "VOR intact bilaterally with no corrective saccades."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Occasional refixation saccades on leftward impulse; mild dizziness."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Consistent corrective saccades (R>L), reduced gain, and early fatigue—moderate vestibular-cerebellar integration deficit."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked VOR asymmetry with persistent refixation saccades, poor cancellation, symptom provocation, and fatigue—significant vestibular hypofunction."
    }
  ],

  // CARDIAC
  cardiac: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Regular rate and rhythm; normal heart sounds; normal autonomic variability."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Mild sinus tachycardia with reduced variability—sympathetic predominance."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Reduced sound intensity and low respiratory variability—moderate autonomic imbalance."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Irregular rhythm with diminished perfusion markers—significant autonomic instability (consider cardiology input)."
    }
  ],

  // RESPIRATORY - LUNG
  respiratory: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Clear breath sounds with symmetric expansion and diaphragmatic breathing."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Mildly diminished bases with upper chest recruitment—sympathetic dominance."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Asymmetric expansion with accessory muscle use—moderate autonomic/postural imbalance."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Markedly diminished base sounds with paradoxical breathing—significant brainstem respiratory dysregulation."
    }
  ],

  // ABDOMEN
  abdomen: [
    {
      severity: 'normal' as SeverityLevel,
      comment: "Abdomen soft, non-tender, with normoactive bowel sounds."
    },
    {
      severity: 'mild' as SeverityLevel,
      comment: "Mild hypoactive bowel sounds with upper-abdominal tension—parasympathetic underactivation."
    },
    {
      severity: 'moderate' as SeverityLevel,
      comment: "Asymmetric abdominal wall tension with guarding—moderate autonomic/segmental sensitization."
    },
    {
      severity: 'severe' as SeverityLevel,
      comment: "Marked hypertonicity, hypoactive bowel sounds, and autonomic provocation—significant vagal suppression and autonomic dysregulation."
    }
  ]
} as const;

/**
 * Get summary comment for a specific exam category and severity
 */
export function getSummaryComment(
  category: keyof typeof NEURO_EXAM_SUMMARY_COMMENTS,
  severity: SeverityLevel
): string | undefined {
  const comments = NEURO_EXAM_SUMMARY_COMMENTS[category];
  const match = comments.find(c => c.severity === severity);
  return match?.comment;
}

/**
 * Get all comments for a specific category
 */
export function getCategoryComments(
  category: keyof typeof NEURO_EXAM_SUMMARY_COMMENTS
): readonly SummaryComment[] {
  return NEURO_EXAM_SUMMARY_COMMENTS[category];
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): Array<keyof typeof NEURO_EXAM_SUMMARY_COMMENTS> {
  return Object.keys(NEURO_EXAM_SUMMARY_COMMENTS) as Array<keyof typeof NEURO_EXAM_SUMMARY_COMMENTS>;
}

/**
 * Build a complete summary from multiple findings
 */
export function buildNeuroExamSummary(findings: Array<{
  category: keyof typeof NEURO_EXAM_SUMMARY_COMMENTS;
  severity: SeverityLevel;
}>): string {
  const summaryParts = findings
    .map(finding => getSummaryComment(finding.category, finding.severity))
    .filter(Boolean);
  
  return summaryParts.join('\n\n');
}
