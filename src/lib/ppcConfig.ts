// PPC Configuration Constants
export const PPC_CONFIG = {
  version: "1.0",
  brandColor: "#A51C30",
  mcid: {
    NDI: 7.5,
    ODI: 6,
    QuickDASH: 10,
    LEFS: 9,
    RPQ: 12, // MCID for RPQ - to be validated
  },
  regionEnum: [
    "Cervical",
    "Thoracic",
    "Lumbar",
    "Shoulder",
    "Elbow",
    "Wrist/Hand",
    "Hip",
    "Knee",
    "Ankle/Foot",
    "Brain/Head",
  ],
  episodeTypeEnum: ["MSK", "Neurology"],
  statusLabels: {
    stable: "Stable at 90 days",
    improving: "Continuing to improve at 90 days",
    declining: "Decline at 90 days",
  },
  regionToIndices(region: string, episodeType?: string): string[] {
    // If Neurology episode, always return RPQ
    if (episodeType === "Neurology") {
      return ["RPQ"];
    }
    
    // MSK logic (existing)
    const r = (region || "").toLowerCase();
    const want = new Set<string>();
    
    if (r.includes("brain") || r.includes("head")) want.add("RPQ");
    if (r.includes("cervical")) want.add("NDI");
    if (r.includes("lumbar") || r.includes("thoracic")) want.add("ODI");
    if (["shoulder", "elbow", "wrist", "hand", "wrist/hand"].some((k) => r.includes(k))) {
      want.add("QuickDASH");
    }
    if (["hip", "knee", "ankle", "foot", "ankle/foot"].some((k) => r.includes(k))) {
      want.add("LEFS");
    }
    
    if (want.size === 0) want.add("NDI");
    return Array.from(want);
  },
  
  getOutcomeForEpisodeType(episodeType: string): string[] {
    if (episodeType === "Neurology") {
      return ["RPQ"];
    }
    return []; // MSK uses region-based selection
  },
} as const;

export type IndexType = "NDI" | "ODI" | "QuickDASH" | "LEFS" | "RPQ";
export type RegionType = typeof PPC_CONFIG.regionEnum[number];
export type EpisodeType = typeof PPC_CONFIG.episodeTypeEnum[number];
