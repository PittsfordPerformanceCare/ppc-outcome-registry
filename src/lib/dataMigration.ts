import { PPC_STORE } from "./ppcStore";
import { createEpisode, saveOutcomeScore, createFollowup } from "./dbOperations";

export async function migrateLocalStorageToDatabase() {
  const episodes = PPC_STORE.getAllEpisodes();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const episodeId of episodes) {
    try {
      const meta = PPC_STORE.getEpisodeMeta(episodeId);
      if (!meta) continue;

      // Create episode in database
      await createEpisode({
        id: meta.episodeId,
        patient_name: meta.patientName,
        date_of_birth: meta.dob,
        region: meta.region,
        diagnosis: meta.diagnosis,
        date_of_service: meta.dateOfService,
        injury_date: meta.injuryDate,
        injury_mechanism: meta.injuryMechanism,
        pain_level: meta.painLevel,
        referring_physician: meta.referringPhysician,
        insurance: meta.insurance,
        emergency_contact: meta.emergencyContact,
        emergency_phone: meta.emergencyPhone,
        medications: meta.medications,
        medical_history: meta.medicalHistory,
        prior_treatments: meta.prior_treatments,
        prior_treatments_other: meta.prior_treatments_other,
        functional_limitations: meta.functional_limitations,
        functional_limitation: meta.functional_limitation,
        treatment_goals: meta.goals,
        goals_other: meta.goals_other,
        start_date: meta.start_date,
        visits: meta.visits,
        resolution_days: meta.resolution_days,
        compliance_rating: meta.compliance_rating,
        compliance_notes: meta.compliance_notes,
        referred_out: meta.referred_out,
        referral_reason: meta.referral_reason,
        discharge_date: meta.dischargeDate,
        followup_date: meta.followupDate,
        cis_pre: meta.cis_pre ?? undefined,
        cis_post: meta.cis_post ?? undefined,
        cis_delta: meta.cis_delta ?? undefined,
        pain_pre: meta.pain_pre ?? undefined,
        pain_post: meta.pain_post ?? undefined,
        pain_delta: meta.pain_delta ?? undefined,
      });

      // Migrate baseline scores
      if (meta.baselineScores) {
        for (const [indexType, score] of Object.entries(meta.baselineScores)) {
          await saveOutcomeScore(meta.episodeId, indexType, "baseline", score);
        }
      }

      // Migrate discharge scores
      if (meta.dischargeScores) {
        for (const [indexType, score] of Object.entries(meta.dischargeScores)) {
          await saveOutcomeScore(meta.episodeId, indexType, "discharge", score);
        }
      }

      // Migrate followup if exists
      const followupMeta = PPC_STORE.getFollowupMeta(episodeId);
      if (followupMeta) {
        await createFollowup(meta.episodeId, followupMeta.scheduledDate);
      }

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${episodeId}: ${error.message}`);
    }
  }

  return results;
}

export function clearLocalStorage() {
  PPC_STORE.clearAll();
}
