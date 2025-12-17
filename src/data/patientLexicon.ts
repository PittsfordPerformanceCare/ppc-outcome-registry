/**
 * Patient-Facing Lexicon
 * Plain language definitions for clinical terms
 * Keep definitions to 1-2 sentences, avoid jargon
 */

export interface LexiconEntry {
  term: string;
  definition: string;
}

export const patientLexicon: Record<string, LexiconEntry> = {
  // Neurologic / Concussion Terms
  "episode-of-care": {
    term: "Episode of Care",
    definition: "The full journey of your treatment from your first visit through discharge. It captures everything we do together to help you recover."
  },
  "vestibular": {
    term: "Vestibular",
    definition: "Relates to your inner ear and balance system. It helps you stay steady and know where your body is in space."
  },
  "proprioception": {
    term: "Proprioception",
    definition: "Your body's ability to sense its position and movement without looking. It's how you know where your arm is even with your eyes closed."
  },
  "cervicogenic": {
    term: "Cervicogenic",
    definition: "Symptoms that come from your neck. For example, some headaches or dizziness can actually start from neck tension or stiffness."
  },
  "post-concussion": {
    term: "Post-Concussion",
    definition: "The period after a concussion when you may still experience symptoms like headaches, fatigue, or difficulty concentrating as your brain heals."
  },
  "autonomic": {
    term: "Autonomic",
    definition: "The automatic systems in your body that you don't control consciously—like heart rate, digestion, and blood pressure regulation."
  },
  "exertional-tolerance": {
    term: "Exertional Tolerance",
    definition: "How much physical or mental activity you can handle before symptoms appear or worsen. We gradually build this up during recovery."
  },
  "symptom-threshold": {
    term: "Symptom Threshold",
    definition: "The point at which activity starts to bring on or worsen your symptoms. We work to raise this threshold over time."
  },
  
  // MSK Terms
  "functional-limitation": {
    term: "Functional Limitation",
    definition: "An activity you're having trouble doing because of your condition—like bending, lifting, or walking without discomfort."
  },
  "referred-pain": {
    term: "Referred Pain",
    definition: "Pain felt in one area that actually comes from somewhere else in your body. For example, a neck problem might cause arm pain."
  },
  "motor-control": {
    term: "Motor Control",
    definition: "How well your brain coordinates your muscles to produce smooth, accurate movements. It's about quality of movement, not just strength."
  },
  "load-tolerance": {
    term: "Load Tolerance",
    definition: "How much stress or demand your body can handle—from daily activities to exercise—without causing pain or setback."
  },
  
  // General Clinical Terms
  "baseline": {
    term: "Baseline",
    definition: "Your starting point when you begin care. We measure this so we can track your progress and see how much you've improved."
  },
  "discharge": {
    term: "Discharge",
    definition: "The point when you've met your recovery goals and are ready to continue independently. It's graduation from active treatment."
  },
  "outcome-measure": {
    term: "Outcome Measure",
    definition: "A standardized questionnaire that helps track changes in your symptoms or function over time. It's one piece of your recovery picture."
  }
};

/**
 * Helper to get a lexicon entry by key
 */
export const getLexiconEntry = (key: string): LexiconEntry | undefined => {
  return patientLexicon[key];
};

/**
 * Get all lexicon entries as an array
 */
export const getAllLexiconEntries = (): LexiconEntry[] => {
  return Object.values(patientLexicon);
};
