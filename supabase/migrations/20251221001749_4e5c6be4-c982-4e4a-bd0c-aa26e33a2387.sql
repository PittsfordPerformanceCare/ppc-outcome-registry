-- Fix security issues: Add RLS policies to publicly exposed tables
-- First drop all existing permissive policies, then create secure ones

-- 1. PROFILES TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinicians and admins can view intake forms" ON public.intake_forms;

-- 2. PATIENT_ACCOUNTS TABLE
ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Public can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Patients can view own account" ON public.patient_accounts;

-- 3. EPISODES TABLE
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Public can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can view their own episodes" ON public.episodes;

-- 4. NEUROLOGIC_EXAMS TABLE
ALTER TABLE public.neurologic_exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Public can view neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Users can view their own neurologic exams" ON public.neurologic_exams;

-- 5. OUTCOME_SCORES TABLE
ALTER TABLE public.outcome_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view outcome scores" ON public.outcome_scores;
DROP POLICY IF EXISTS "Public can view outcome scores" ON public.outcome_scores;
DROP POLICY IF EXISTS "Users can view their own outcome scores" ON public.outcome_scores;

-- 6. PATIENT_MESSAGES TABLE
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view patient messages" ON public.patient_messages;
DROP POLICY IF EXISTS "Public can view patient messages" ON public.patient_messages;
DROP POLICY IF EXISTS "Patients and clinicians can view messages" ON public.patient_messages;

-- 7. REFERRAL_INQUIRIES TABLE
ALTER TABLE public.referral_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Public can view referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Clinicians and admins can view referral inquiries" ON public.referral_inquiries;

-- 8. NEUROLOGIC_INTAKE_LEADS TABLE
ALTER TABLE public.neurologic_intake_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view neurologic intake leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Public can view neurologic intake leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Clinicians and admins can view neurologic intake leads" ON public.neurologic_intake_leads;

-- 9. CONTACT_MESSAGES TABLE - already has RLS from schema
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;

-- 10. INTAKE_PROGRESS TABLE
ALTER TABLE public.intake_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Public can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Clinicians and admins can view intake progress" ON public.intake_progress;

-- 11. INTAKES TABLE
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view intakes" ON public.intakes;
DROP POLICY IF EXISTS "Public can view intakes" ON public.intakes;
DROP POLICY IF EXISTS "Clinicians and admins can view intakes" ON public.intakes;

-- 12. ORTHO_REFERRALS TABLE
ALTER TABLE public.ortho_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view ortho referrals" ON public.ortho_referrals;
DROP POLICY IF EXISTS "Public can view ortho referrals" ON public.ortho_referrals;
DROP POLICY IF EXISTS "Users can view their own ortho referrals" ON public.ortho_referrals;

-- 13. PATIENT_LETTERS TABLE
ALTER TABLE public.patient_letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view patient letters" ON public.patient_letters;
DROP POLICY IF EXISTS "Public can view patient letters" ON public.patient_letters;
DROP POLICY IF EXISTS "Clinicians and admins can view patient letters" ON public.patient_letters;

-- 14. CARE_REQUESTS TABLE
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view care requests" ON public.care_requests;
DROP POLICY IF EXISTS "Public can view care requests" ON public.care_requests;
DROP POLICY IF EXISTS "Admins can view care requests" ON public.care_requests;

-- 15. COMMUNICATION_TASKS TABLE - already has RLS
DROP POLICY IF EXISTS "Anyone can view communication tasks" ON public.communication_tasks;
DROP POLICY IF EXISTS "Public can view communication tasks" ON public.communication_tasks;
DROP POLICY IF EXISTS "Assigned clinicians and admins can view tasks" ON public.communication_tasks;

-- 16. TEAM_MESSAGES TABLE
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view team messages" ON public.team_messages;
DROP POLICY IF EXISTS "Public can view team messages" ON public.team_messages;
DROP POLICY IF EXISTS "Team members can view relevant messages" ON public.team_messages;

-- Now create the secure policies

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Patients can view own account" 
ON public.patient_accounts FOR SELECT 
USING (auth.uid() = id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own episodes" 
ON public.episodes FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own neurologic exams" 
ON public.neurologic_exams FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own outcome scores" 
ON public.outcome_scores FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients and clinicians can view messages" 
ON public.patient_messages FOR SELECT 
USING (auth.uid() = patient_id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians and admins can view referral inquiries" 
ON public.referral_inquiries FOR SELECT 
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians and admins can view neurologic intake leads" 
ON public.neurologic_intake_leads FOR SELECT 
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians and admins can view intake progress" 
ON public.intake_progress FOR SELECT 
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians and admins can view intakes" 
ON public.intakes FOR SELECT 
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own ortho referrals" 
ON public.ortho_referrals FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians and admins can view patient letters" 
ON public.patient_letters FOR SELECT 
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view care requests" 
ON public.care_requests FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned clinicians and admins can view tasks" 
ON public.communication_tasks FOR SELECT 
USING (assigned_clinician_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view relevant messages" 
ON public.team_messages FOR SELECT 
USING (sender_user_id = auth.uid() OR recipient_user_id = auth.uid() OR has_team_chat_access(auth.uid()));