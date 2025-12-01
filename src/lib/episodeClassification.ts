// Episode Type and Body Region Classification
// Classifies chief complaints into episode types and body regions

export type EpisodeType = 'MSK' | 'Neuro';

export interface ClassificationResult {
  episodeType: EpisodeType;
  bodyRegion: string | null;
  confidence: 'high' | 'medium' | 'low';
}

// Keywords for Neurological conditions
const NEURO_KEYWORDS = [
  'concussion', 'headache', 'migraine', 'vertigo', 'dizziness', 'dizzy',
  'balance', 'vision', 'visual', 'eye', 'nausea', 'brain', 'head injury',
  'post-concussion', 'pcs', 'tbi', 'traumatic brain', 'whiplash',
  'vestibular', 'neurologic', 'neurological', 'nerve', 'neuropathy',
  'tremor', 'coordination', 'cognitive', 'memory', 'light sensitivity',
  'sound sensitivity', 'photophobia', 'phonophobia', 'nystagmus',
  'post-trauma', 'brain fog', 'confusion'
];

// Body region keywords
const REGION_KEYWORDS = {
  'Cervical Spine': ['neck', 'cervical', 'c-spine', 'whiplash', 'throat'],
  'Thoracic Spine': ['upper back', 'thoracic', 't-spine', 'mid back', 'ribcage', 'ribs'],
  'Lumbar Spine': ['low back', 'lower back', 'lumbar', 'l-spine', 'lumbago', 'sciatica'],
  'Shoulder': ['shoulder', 'rotator cuff', 'cuff', 'deltoid', 'clavicle', 'collarbone'],
  'Elbow': ['elbow', 'forearm', 'tennis elbow', 'golfers elbow'],
  'Wrist/Hand': ['wrist', 'hand', 'finger', 'thumb', 'carpal', 'palm'],
  'Hip': ['hip', 'groin', 'pelvis', 'pelvic', 'glute', 'gluteal', 'piriformis'],
  'Knee': ['knee', 'patella', 'kneecap', 'meniscus', 'acl', 'pcl', 'mcl', 'lcl'],
  'Ankle/Foot': ['ankle', 'foot', 'heel', 'achilles', 'toe', 'arch', 'plantar'],
  'Head': ['head', 'skull', 'face', 'jaw', 'tmj', 'concussion', 'headache']
};

export function classifyEpisode(chiefComplaint: string): ClassificationResult {
  const complaint = chiefComplaint.toLowerCase();
  
  // Count matches for neurological keywords
  const neuroMatches = NEURO_KEYWORDS.filter(keyword => 
    complaint.includes(keyword.toLowerCase())
  ).length;

  // Determine episode type - defaults to MSK
  let episodeType: EpisodeType = 'MSK';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (neuroMatches > 0) {
    episodeType = 'Neuro';
    confidence = neuroMatches >= 2 ? 'high' : 'medium';
  }

  // Determine body region
  let bodyRegion: string | null = null;
  let maxMatches = 0;

  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      complaint.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bodyRegion = region;
    }
  }

  // If we found body region matches and no clear neuro indicators, it's MSK
  if (bodyRegion && maxMatches >= 1) {
    if (confidence === 'low') {
      confidence = 'medium';
      // If body region found but not neuro, it's MSK with medium confidence
      if (episodeType === 'MSK') {
        confidence = 'medium';
      }
    }
  }

  return {
    episodeType,
    bodyRegion,
    confidence
  };
}

// Helper to format classification for display
export function formatClassification(result: ClassificationResult): string {
  const parts: string[] = [result.episodeType];
  if (result.bodyRegion) {
    parts.push(result.bodyRegion);
  }
  return parts.join(' - ');
}
