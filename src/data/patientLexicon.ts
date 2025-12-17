/**
 * Patient-Facing Lexicon
 * Plain language definitions for clinical terms
 * Keep definitions to 1-2 sentences, avoid jargon
 */

export interface LexiconEntry {
  id: string;
  label: string;
  definition: string;
  version: "v1" | "v2";
  locked: boolean;
  priority: "foundational" | "pilot";
  domains: string[];
  allowed_page_groups: string[];
  aliases: string[];
}

export const patientLexicon: LexiconEntry[] = [
  // --- v1 FOUNDATIONAL TERMS ---
  {
    id: "episode_of_care",
    label: "Episode of Care",
    definition: "A focused period of care designed to address one specific problem from start to resolution.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["general"],
    allowed_page_groups: ["our_approach", "pillars", "intake", "about", "faq", "registry_explainer"],
    aliases: ["episode", "episode-based care", "episode model"]
  },
  {
    id: "msk_evaluation",
    label: "MSK Evaluation",
    definition: "An exam focused on joints, muscles, movement, and pain to understand why a specific area isn't functioning normally.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["msk", "general"],
    allowed_page_groups: ["pillars_msk", "cluster_msk", "intake", "our_approach"],
    aliases: ["musculoskeletal evaluation", "MSK exam", "MSK new patient exam"]
  },
  {
    id: "neurologic_evaluation",
    label: "Neurologic Evaluation",
    definition: "An exam that looks at how the brain, balance system, eyes, and nervous system may be contributing to symptoms like dizziness, headaches, or brain fog.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion", "general"],
    allowed_page_groups: ["pillars_neuro", "pillars_concussion", "cluster_neuro", "intake", "our_approach"],
    aliases: ["neuro evaluation", "neurologic exam", "neuro new patient exam"]
  },
  {
    id: "vestibular_system",
    label: "Vestibular System",
    definition: "The part of your nervous system that helps control balance, motion, and your sense of where your body is in space.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion"],
    allowed_page_groups: ["pillars_neuro", "pillars_concussion", "cluster_neuro", "cluster_concussion", "our_approach"],
    aliases: ["vestibular", "balance system"]
  },
  {
    id: "autonomic_nervous_system",
    label: "Autonomic Nervous System",
    definition: "The system that helps regulate energy, heart rate, blood pressure, and recovery—often involved when people feel fatigued or lightheaded.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion", "general"],
    allowed_page_groups: ["pillars_neuro", "pillars_concussion", "cluster_neuro", "cluster_concussion", "our_approach"],
    aliases: ["autonomic", "ANS"]
  },
  {
    id: "care_coordination_pause",
    label: "Care Coordination Pause",
    definition: "A temporary pause in care when additional information—such as imaging or a specialist consult—is needed before safely continuing treatment.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["general", "msk", "neuro", "concussion"],
    allowed_page_groups: ["our_approach", "faq", "patient_portal_explainer"],
    aliases: ["pause", "care pause", "coordination pause"]
  },
  {
    id: "episode_discharge",
    label: "Episode Discharge",
    definition: "The point at which a specific problem has been addressed and that episode of care is intentionally completed.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["general"],
    allowed_page_groups: ["our_approach", "faq", "registry_explainer", "patient_portal_explainer"],
    aliases: ["discharge", "episode completion"]
  },
  {
    id: "neuro_based_care",
    label: "Neuro-Based Care",
    definition: "Care that focuses on how the brain and nervous system influence movement, balance, pain, and performance—not just the area that hurts.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion", "performance", "general"],
    allowed_page_groups: ["our_approach", "pillars", "about"],
    aliases: ["neurologic model", "neurologic approach"]
  },
  {
    id: "sensory_mismatch",
    label: "Sensory Mismatch",
    definition: "When the brain receives conflicting information from the eyes, balance system, or body—often leading to dizziness, headaches, or disorientation.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion"],
    allowed_page_groups: ["pillars_concussion", "pillars_neuro", "cluster_concussion", "cluster_neuro"],
    aliases: ["mismatch", "visual-vestibular mismatch"]
  },
  {
    id: "postural_control",
    label: "Postural Control",
    definition: "The ability to maintain balance and stability while standing, moving, or changing positions.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["msk", "neuro", "concussion", "general"],
    allowed_page_groups: ["pillars", "cluster_msk", "cluster_neuro", "our_approach"],
    aliases: ["posture control", "balance control"]
  },
  {
    id: "neuroplasticity",
    label: "Neuroplasticity",
    definition: "The brain's ability to adapt and improve function in response to the right type of input and training.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["neuro", "concussion", "performance", "general"],
    allowed_page_groups: ["our_approach", "pillars", "cluster_neuro", "cluster_concussion", "performance_pages"],
    aliases: ["plasticity", "brain adaptation"]
  },
  {
    id: "outcome_registry",
    label: "Outcome Registry",
    definition: "A system that tracks how long it takes to resolve specific problems and how many visits are needed—so care is guided by real results, not guesswork.",
    version: "v1",
    locked: true,
    priority: "foundational",
    domains: ["general"],
    allowed_page_groups: ["our_approach", "about", "professional_portal", "registry_explainer"],
    aliases: ["registry", "outcomes registry"]
  },

  // --- v2 PILOT TERMS ---
  {
    id: "performance_readiness",
    label: "Performance Readiness",
    definition: "The state in which the brain and body are prepared to safely handle physical or cognitive demand.",
    version: "v2",
    locked: false,
    priority: "pilot",
    domains: ["performance"],
    allowed_page_groups: ["performance_pages", "athlete_pages", "return_to_play"],
    aliases: ["readiness"]
  },
  {
    id: "return_to_play",
    label: "Return-to-Play",
    definition: "A structured process used to determine when an athlete is ready to safely resume sport without increasing injury risk.",
    version: "v2",
    locked: false,
    priority: "pilot",
    domains: ["performance", "concussion"],
    allowed_page_groups: ["athlete_pages", "return_to_play", "pillars_concussion"],
    aliases: ["RTP", "return to sport"]
  },
  {
    id: "neurologic_readiness",
    label: "Neurologic Readiness",
    definition: "How prepared the brain and nervous system are to manage speed, coordination, reaction time, and decision-making.",
    version: "v2",
    locked: false,
    priority: "pilot",
    domains: ["performance", "concussion"],
    allowed_page_groups: ["performance_pages", "athlete_pages", "return_to_play"],
    aliases: ["brain readiness"]
  },
  {
    id: "central_integration",
    label: "Central Integration",
    definition: "How effectively the brain combines information from the eyes, balance system, and body to guide movement and performance.",
    version: "v2",
    locked: false,
    priority: "pilot",
    domains: ["performance", "neuro", "concussion"],
    allowed_page_groups: ["performance_pages", "athlete_pages", "return_to_play"],
    aliases: ["integration", "central processing"]
  },
  {
    id: "load_tolerance",
    label: "Load Tolerance",
    definition: "The body's ability to handle physical or cognitive stress without symptom flare-up.",
    version: "v2",
    locked: false,
    priority: "pilot",
    domains: ["performance", "concussion", "msk"],
    allowed_page_groups: ["performance_pages", "athlete_pages", "return_to_play"],
    aliases: ["tolerance", "capacity"]
  }
];

/**
 * Get a lexicon entry by ID
 */
export const getLexiconById = (id: string): LexiconEntry | undefined => {
  return patientLexicon.find(entry => entry.id === id);
};

/**
 * Get a lexicon entry by matching term text (checks label and aliases)
 */
export const getLexiconByTerm = (term: string): LexiconEntry | undefined => {
  const lowerTerm = term.toLowerCase();
  return patientLexicon.find(entry => 
    entry.label.toLowerCase() === lowerTerm ||
    entry.aliases.some(alias => alias.toLowerCase() === lowerTerm)
  );
};

/**
 * Get all lexicon entries for a specific domain
 */
export const getLexiconByDomain = (domain: string): LexiconEntry[] => {
  return patientLexicon.filter(entry => entry.domains.includes(domain));
};

/**
 * Get all foundational (v1) terms
 */
export const getFoundationalTerms = (): LexiconEntry[] => {
  return patientLexicon.filter(entry => entry.version === "v1");
};

/**
 * Get all pilot (v2) terms
 */
export const getPilotTerms = (): LexiconEntry[] => {
  return patientLexicon.filter(entry => entry.version === "v2");
};
