-- Fix profiles table - ensure RLS is enabled and remove any public access policies

-- First ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop any potentially permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;

-- The secure policy should already exist, but recreate to be safe
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);