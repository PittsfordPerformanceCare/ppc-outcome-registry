// PPC Local Storage Management
export interface EpisodeMeta {
  episodeId: string;
  patientName: string;
  region: string;
  dateOfService: string;
  indices: string[];
  baselineScores?: Record<string, number>;
  dischargeScores?: Record<string, number>;
  dischargeDate?: string;
  followupDate?: string;
  dob?: string;
  clinician?: string;
  diagnosis?: string;
  npi?: string;
  start_date?: string;
  visits?: string;
  resolution_days?: string;
  compliance_rating?: string;
  compliance_notes?: string;
  referred_out?: boolean;
  referral_reason?: string;
  injuryDate?: string;
  injuryMechanism?: string;
  painLevel?: string;
  referringPhysician?: string;
  insurance?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medications?: string;
  medicalHistory?: string;
  priorTreatments?: string;
  functionalLimitations?: string;
  treatmentGoals?: string;
  cis_pre?: number | null;
  cis_post?: number | null;
  cis_delta?: number | null;
  pain_pre?: number | null;
  pain_post?: number | null;
  pain_delta?: number | null;
}

export interface FollowupMeta {
  episodeId: string;
  scheduledDate: string;
  completedDate?: string;
  scores?: Record<string, number>;
  status?: "stable" | "improving" | "declining";
}

const STORAGE_KEYS = {
  episodeMeta: (ep: string) => `ppc_episode_meta_${ep}`,
  followupMeta: (ep: string) => `ppc_followup_meta_${ep}`,
  followupStatus: (ep: string) => `ppc_followup_status_${ep}`,
  followupCompleted: (ep: string) => `ppc_followup_completed_${ep}`,
  episodes: "ppc_episodes",
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

export const PPC_STORE = {
  // Episode Management
  getEpisodeMeta(ep: string): EpisodeMeta | null {
    return readJSON<EpisodeMeta | null>(STORAGE_KEYS.episodeMeta(ep), null);
  },

  setEpisodeMeta(ep: string, obj: EpisodeMeta): void {
    writeJSON(STORAGE_KEYS.episodeMeta(ep), obj);
    
    // Add to episodes list
    const episodes = this.getAllEpisodes();
    if (!episodes.includes(ep)) {
      episodes.push(ep);
      writeJSON(STORAGE_KEYS.episodes, episodes);
    }
  },

  getAllEpisodes(): string[] {
    return readJSON<string[]>(STORAGE_KEYS.episodes, []);
  },

  // Follow-up Management
  getFollowupMeta(ep: string): FollowupMeta | null {
    return readJSON<FollowupMeta | null>(STORAGE_KEYS.followupMeta(ep), null);
  },

  setFollowupMeta(ep: string, obj: FollowupMeta): void {
    writeJSON(STORAGE_KEYS.followupMeta(ep), obj);
  },

  getFollowupStatus(ep: string): string | null {
    return localStorage.getItem(STORAGE_KEYS.followupStatus(ep));
  },

  setFollowupStatus(ep: string, status: string): void {
    localStorage.setItem(STORAGE_KEYS.followupStatus(ep), status);
  },

  isFollowupCompleted(ep: string): boolean {
    return localStorage.getItem(STORAGE_KEYS.followupCompleted(ep)) === "true";
  },

  setFollowupCompleted(ep: string, completed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.followupCompleted(ep), String(completed));
  },

  // Clear storage
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ppc_")) {
        localStorage.removeItem(key);
      }
    });
  },
};
