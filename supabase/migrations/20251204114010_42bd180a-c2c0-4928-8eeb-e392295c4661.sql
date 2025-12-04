-- Performance indexes for frequently queried columns

-- Episodes table indexes
CREATE INDEX IF NOT EXISTS idx_episodes_user_id ON public.episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_clinic_id ON public.episodes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_episodes_current_status ON public.episodes(current_status);
CREATE INDEX IF NOT EXISTS idx_episodes_discharge_date ON public.episodes(discharge_date);
CREATE INDEX IF NOT EXISTS idx_episodes_date_of_service ON public.episodes(date_of_service DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_user_status ON public.episodes(user_id, current_status);

-- Intake forms indexes
CREATE INDEX IF NOT EXISTS idx_intake_forms_status ON public.intake_forms(status);
CREATE INDEX IF NOT EXISTS idx_intake_forms_submitted_at ON public.intake_forms(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_forms_status_submitted ON public.intake_forms(status, submitted_at DESC);

-- Outcome scores indexes
CREATE INDEX IF NOT EXISTS idx_outcome_scores_episode_id ON public.outcome_scores(episode_id);
CREATE INDEX IF NOT EXISTS idx_outcome_scores_created_at ON public.outcome_scores(created_at DESC);

-- Followups indexes
CREATE INDEX IF NOT EXISTS idx_followups_episode_id ON public.followups(episode_id);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled_date ON public.followups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON public.followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_user_id ON public.followups(user_id);

-- Notifications history indexes
CREATE INDEX IF NOT EXISTS idx_notifications_history_user_id ON public.notifications_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_history_status ON public.notifications_history(status);
CREATE INDEX IF NOT EXISTS idx_notifications_history_created_at ON public.notifications_history(created_at DESC);

-- Pending episodes indexes
CREATE INDEX IF NOT EXISTS idx_pending_episodes_user_id ON public.pending_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_episodes_status ON public.pending_episodes(status);
CREATE INDEX IF NOT EXISTS idx_pending_episodes_clinic_id ON public.pending_episodes(clinic_id);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_checkpoint_status ON public.leads(checkpoint_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Audit logs indexes (for compliance queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);