-- Create team_messages table for direct messages
CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT different_users CHECK (sender_user_id != recipient_user_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_team_messages_conversation ON public.team_messages (sender_user_id, recipient_user_id, created_at);
CREATE INDEX idx_team_messages_recipient_unread ON public.team_messages (recipient_user_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has team chat access (uses text cast to avoid enum transaction issues)
CREATE OR REPLACE FUNCTION public.has_team_chat_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'clinician', 'owner')
  )
$$;

-- RLS Policies for team_messages
-- Users can view messages they sent or received (if they have chat access)
CREATE POLICY "Users can view their own messages"
ON public.team_messages
FOR SELECT
USING (
  has_team_chat_access(auth.uid()) AND
  (sender_user_id = auth.uid() OR recipient_user_id = auth.uid())
);

-- Users can send messages (if they have chat access)
CREATE POLICY "Users can send messages"
ON public.team_messages
FOR INSERT
WITH CHECK (
  has_team_chat_access(auth.uid()) AND
  sender_user_id = auth.uid() AND
  has_team_chat_access(recipient_user_id)
);

-- Users can update read_at on messages they received
CREATE POLICY "Users can mark messages as read"
ON public.team_messages
FOR UPDATE
USING (
  has_team_chat_access(auth.uid()) AND
  recipient_user_id = auth.uid()
)
WITH CHECK (
  recipient_user_id = auth.uid()
);

-- Enable realtime for team_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;