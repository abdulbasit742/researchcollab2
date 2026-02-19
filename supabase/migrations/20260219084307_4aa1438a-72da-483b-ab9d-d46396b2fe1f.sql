
-- Pilot UX Feedback collection
CREATE TABLE public.pilot_ux_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'confusion_point', 'friction_point', 'ui_bottleneck',
    'escrow_clarity', 'milestone_clarity', 'improvement_suggestion', 'general'
  )),
  page_context TEXT,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  screenshot_url TEXT,
  resolved BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_ux_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ux feedback"
  ON public.pilot_ux_feedback FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Pilot participants can submit feedback"
  ON public.pilot_ux_feedback FOR INSERT
  TO authenticated
  WITH CHECK (public.is_pilot_participant(auth.uid()));

CREATE POLICY "Users can view own feedback"
  ON public.pilot_ux_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add manual_review_required flag to pilot transaction log
ALTER TABLE public.pilot_transaction_log
  ADD COLUMN IF NOT EXISTS requires_manual_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;
