-- Create neurologic_exams table
CREATE TABLE IF NOT EXISTS public.neurologic_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id text NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  clinic_id uuid REFERENCES public.clinics(id),
  exam_date date NOT NULL DEFAULT CURRENT_DATE,
  exam_time text,
  
  -- Vitals (all support bilateral measurements)
  bp_supine_right text,
  bp_supine_left text,
  bp_seated_right text,
  bp_seated_left text,
  bp_standing_immediate_right text,
  bp_standing_immediate_left text,
  bp_standing_3min_right text,
  bp_standing_3min_left text,
  o2_saturation_supine_right text,
  o2_saturation_supine_left text,
  heart_rate_supine_right text,
  heart_rate_supine_left text,
  temperature_right text,
  temperature_left text,
  vitals_notes text,
  
  -- Reflexes (bilateral)
  reflex_tricep_right text,
  reflex_tricep_left text,
  reflex_bicep_right text,
  reflex_bicep_left text,
  reflex_brachioradialis_right text,
  reflex_brachioradialis_left text,
  reflex_patellar_right text,
  reflex_patellar_left text,
  reflex_achilles_right text,
  reflex_achilles_left text,
  reflexes_notes text,
  
  -- Auscultation
  auscultation_heart text,
  auscultation_lungs text,
  auscultation_abdomen text,
  auscultation_notes text,
  
  -- Visual System
  visual_opk text,
  visual_saccades text,
  visual_pursuits text,
  visual_convergence text,
  visual_maddox_rod text,
  visual_notes text,
  
  -- Neuro Exam
  neuro_red_desaturation_right boolean,
  neuro_red_desaturation_left boolean,
  neuro_pupillary_fatigue_right text,
  neuro_pupillary_fatigue_left text,
  neuro_pupillary_fatigue_notes text,
  neuro_ue_extensor_weakness_right boolean,
  neuro_ue_extensor_weakness_left boolean,
  neuro_ue_capillary_refill_right text,
  neuro_ue_capillary_refill_left text,
  neuro_babinski_right text,
  neuro_babinski_left text,
  neuro_digit_sense_right text,
  neuro_digit_sense_left text,
  neuro_2pt_localization_right text,
  neuro_2pt_localization_left text,
  neuro_finger_to_nose_right text,
  neuro_finger_to_nose_left text,
  neuro_uprds_right text,
  neuro_uprds_left text,
  neuro_notes text,
  
  -- Vestibular System
  vestibular_rombergs text,
  vestibular_fakuda text,
  vestibular_shunt_stability_eo text,
  vestibular_shunt_stability_ec text,
  vestibular_otr_right boolean,
  vestibular_otr_left boolean,
  vestibular_otr_notes text,
  vestibular_canal_testing text,
  vestibular_vor text,
  vestibular_notes text,
  
  -- Motor Testing (supine)
  motor_deltoid_right text,
  motor_deltoid_left text,
  motor_latissimus_right text,
  motor_latissimus_left text,
  motor_iliopsoas_right text,
  motor_iliopsoas_left text,
  motor_gluteus_max_right text,
  motor_gluteus_max_left text,
  motor_notes text,
  
  -- Inputs (Integration Testing)
  inputs_cerebellar_right boolean,
  inputs_cerebellar_left boolean,
  inputs_cerebellar_notes text,
  inputs_isometric_right boolean,
  inputs_isometric_left boolean,
  inputs_isometric_notes text,
  inputs_parietal_right boolean,
  inputs_parietal_left boolean,
  inputs_parietal_notes text,
  inputs_therapy_localization text,
  inputs_notes text,
  
  -- Clinical History and Summary
  clinical_history text,
  overall_notes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.neurologic_exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neurologic_exams' AND policyname = 'Users can view neurologic exams'
  ) THEN
    CREATE POLICY "Users can view neurologic exams"
      ON public.neurologic_exams FOR SELECT
      USING (
        auth.uid() = user_id OR 
        is_admin(auth.uid()) OR 
        (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neurologic_exams' AND policyname = 'Users can create neurologic exams'
  ) THEN
    CREATE POLICY "Users can create neurologic exams"
      ON public.neurologic_exams FOR INSERT
      WITH CHECK (
        auth.uid() = user_id AND 
        (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neurologic_exams' AND policyname = 'Users can update neurologic exams'
  ) THEN
    CREATE POLICY "Users can update neurologic exams"
      ON public.neurologic_exams FOR UPDATE
      USING (
        auth.uid() = user_id OR 
        is_admin(auth.uid()) OR 
        (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neurologic_exams' AND policyname = 'Users can delete neurologic exams'
  ) THEN
    CREATE POLICY "Users can delete neurologic exams"
      ON public.neurologic_exams FOR DELETE
      USING (
        auth.uid() = user_id OR 
        is_admin(auth.uid())
      );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_neurologic_exams_episode_id ON public.neurologic_exams(episode_id);
CREATE INDEX IF NOT EXISTS idx_neurologic_exams_user_id ON public.neurologic_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_neurologic_exams_clinic_id ON public.neurologic_exams(clinic_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_neurologic_exams_updated_at ON public.neurologic_exams;
CREATE TRIGGER update_neurologic_exams_updated_at
  BEFORE UPDATE ON public.neurologic_exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();