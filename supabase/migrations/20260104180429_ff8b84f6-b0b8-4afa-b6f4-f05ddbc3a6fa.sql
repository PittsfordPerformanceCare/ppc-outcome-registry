-- Add FRONT_DESK_QR to allowed source values for care_requests
ALTER TABLE public.care_requests DROP CONSTRAINT care_requests_source_check;

ALTER TABLE public.care_requests ADD CONSTRAINT care_requests_source_check 
CHECK (source = ANY (ARRAY['WEBSITE'::text, 'PHYSICIAN_REFERRAL'::text, 'SCHOOL'::text, 'ATHLETE_PROGRAM'::text, 'INTERNAL'::text, 'FRONT_DESK_QR'::text]));