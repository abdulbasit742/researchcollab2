-- ===========================================================================
-- ACCOUNTABILITY SYSTEM: THE LINKEDIN KILLER
-- Verified Collaboration + Escrow + Trust Loop
-- ===========================================================================

-- 1. ACCOUNTABILITY RECORDS: Immutable collaboration proof
CREATE TABLE public.accountability_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Collaboration parties
  project_id UUID REFERENCES public.offers(id),
  initiator_id UUID NOT NULL,
  executor_id UUID NOT NULL,
  funder_id UUID, -- Optional if different from initiator
  
  -- Collaboration details
  collaboration_type TEXT NOT NULL DEFAULT 'project' CHECK (collaboration_type IN ('project', 'grant', 'research', 'consultation', 'mentorship')),
  roles JSONB DEFAULT '{}', -- {"initiator_role": "client", "executor_role": "researcher"}
  
  -- Promises & Deadlines
  promised_deliverables TEXT[] NOT NULL DEFAULT '{}',
  deadline TIMESTAMPTZ,
  
  -- Money (the truth layer)
  escrow_amount DECIMAL(12,2) DEFAULT 0,
  escrow_locked_at TIMESTAMPTZ,
  escrow_released_at TIMESTAMPTZ,
  total_paid DECIMAL(12,2) DEFAULT 0,
  
  -- Outcome (immutable truth)
  outcome_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (outcome_status IN ('in_progress', 'completed', 'failed', 'disputed', 'abandoned')),
  outcome_evidence JSONB DEFAULT '{}', -- Links to deliverables, reports, etc.
  outcome_verdict TEXT, -- Final assessment
  
  -- Failure tracking (LinkedIn can't do this)
  failure_reason TEXT,
  failure_attributed_to UUID, -- Who is responsible for failure
  
  -- Trust consequences (auto-computed)
  trust_impact_initiator INTEGER DEFAULT 0, -- +/- trust points
  trust_impact_executor INTEGER DEFAULT 0,
  trust_impact_applied BOOLEAN DEFAULT FALSE,
  
  -- Verification
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  verification_method TEXT, -- 'escrow_release', 'peer_review', 'institution', 'milestone_completion'
  
  -- Metadata
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_accountability_initiator ON public.accountability_records(initiator_id);
CREATE INDEX idx_accountability_executor ON public.accountability_records(executor_id);
CREATE INDEX idx_accountability_outcome ON public.accountability_records(outcome_status);
CREATE INDEX idx_accountability_project ON public.accountability_records(project_id);

-- 2. TRUST ACCESS GATES: Control what users can do based on trust
CREATE TABLE public.trust_access_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_name TEXT NOT NULL UNIQUE,
  gate_description TEXT,
  feature_type TEXT NOT NULL, -- 'project_value', 'messaging', 'grants', 'collaboration'
  
  -- Requirements
  min_trust_score INTEGER DEFAULT 0,
  min_trust_tier TEXT DEFAULT 'bronze' CHECK (min_trust_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  min_projects_completed INTEGER DEFAULT 0,
  min_escrow_success_rate DECIMAL(5,2) DEFAULT 0,
  requires_verification BOOLEAN DEFAULT FALSE,
  max_dispute_rate DECIMAL(5,2) DEFAULT 100,
  
  -- Gate behavior
  is_active BOOLEAN DEFAULT TRUE,
  denial_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default gates
INSERT INTO public.trust_access_gates (gate_name, gate_description, feature_type, min_trust_score, min_trust_tier, min_projects_completed, min_escrow_success_rate) VALUES
('high_value_projects', 'Projects over $10,000', 'project_value', 50, 'silver', 3, 80),
('unlimited_messaging', 'Message anyone without limits', 'messaging', 30, 'bronze', 1, 70),
('grant_applications', 'Apply to institutional grants', 'grants', 60, 'gold', 5, 85),
('premium_collaboration', 'Join premium research teams', 'collaboration', 70, 'gold', 10, 90),
('institutional_projects', 'Work with verified institutions', 'collaboration', 40, 'silver', 2, 75);

-- 3. TRUST EVENTS LOG: Every trust change is permanent and visible
CREATE TABLE public.trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'project_completed', 'project_failed', 
    'milestone_approved', 'milestone_rejected',
    'escrow_released', 'escrow_disputed',
    'verification_gained', 'verification_lost',
    'peer_review_positive', 'peer_review_negative',
    'dispute_won', 'dispute_lost',
    'inactivity_decay', 'manual_adjustment'
  )),
  event_source TEXT, -- 'escrow_system', 'peer_review', 'institution', 'admin'
  
  -- Impact
  trust_delta INTEGER NOT NULL, -- Can be negative
  trust_before INTEGER NOT NULL,
  trust_after INTEGER NOT NULL,
  tier_before TEXT,
  tier_after TEXT,
  
  -- Reference
  reference_type TEXT, -- 'accountability_record', 'milestone', 'dispute', etc.
  reference_id UUID,
  
  -- Evidence (immutable)
  evidence_summary TEXT,
  evidence_links JSONB DEFAULT '{}',
  
  -- Visibility (failures are visible by design)
  is_public BOOLEAN DEFAULT TRUE,
  hide_reason TEXT, -- Only if hidden by admin with justification
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trust_events_user ON public.trust_events(user_id);
CREATE INDEX idx_trust_events_type ON public.trust_events(event_type);
CREATE INDEX idx_trust_events_created ON public.trust_events(created_at DESC);

-- 4. REALITY FEED: Only system events, no social noise
CREATE TABLE public.reality_feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event classification
  event_type TEXT NOT NULL CHECK (event_type IN (
    'project_started', 'project_completed', 'project_failed',
    'milestone_submitted', 'milestone_approved', 'milestone_rejected',
    'escrow_locked', 'escrow_released', 'escrow_disputed',
    'grant_awarded', 'grant_completed',
    'trust_increased', 'trust_decreased',
    'verification_approved', 'collaboration_ended',
    'institution_verified', 'dispute_resolved'
  )),
  
  -- Actors
  primary_actor_id UUID NOT NULL,
  primary_actor_type TEXT DEFAULT 'user' CHECK (primary_actor_type IN ('user', 'institution', 'system')),
  secondary_actor_id UUID,
  
  -- Content
  title TEXT NOT NULL,
  summary TEXT,
  
  -- Financial truth (if applicable)
  amount_involved DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Reference
  reference_type TEXT, -- 'offer', 'milestone', 'grant', 'accountability_record'
  reference_id UUID,
  
  -- Trust impact (visible)
  trust_impact INTEGER, -- Shows trust change in feed
  
  -- Visibility
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'private')),
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reality_feed_type ON public.reality_feed_events(event_type);
CREATE INDEX idx_reality_feed_created ON public.reality_feed_events(created_at DESC);
CREATE INDEX idx_reality_feed_actor ON public.reality_feed_events(primary_actor_id);

-- 5. CONSEQUENCE LEDGER: User's permanent record (shows failures)
CREATE TABLE public.consequence_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Attempt vs Success (LinkedIn can't show this)
  projects_attempted INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  projects_failed INTEGER DEFAULT 0,
  projects_abandoned INTEGER DEFAULT 0,
  
  -- Money handled (truth layer)
  total_escrow_handled DECIMAL(12,2) DEFAULT 0,
  total_escrow_released DECIMAL(12,2) DEFAULT 0,
  total_escrow_disputed DECIMAL(12,2) DEFAULT 0,
  
  -- Success rates
  completion_rate DECIMAL(5,2) DEFAULT 0, -- completed / attempted
  escrow_success_rate DECIMAL(5,2) DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Disputes (failure visibility)
  disputes_raised INTEGER DEFAULT 0,
  disputes_won INTEGER DEFAULT 0,
  disputes_lost INTEGER DEFAULT 0,
  
  -- Trust trajectory
  trust_score_current INTEGER DEFAULT 0,
  trust_score_peak INTEGER DEFAULT 0,
  trust_score_lowest INTEGER DEFAULT 0,
  trust_trajectory TEXT DEFAULT 'stable' CHECK (trust_trajectory IN ('rising', 'stable', 'declining')),
  
  -- Institutional relationships
  institutions_worked_with TEXT[] DEFAULT '{}',
  verified_associations INTEGER DEFAULT 0,
  
  -- Activity
  last_completed_project_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_consequence_ledger_user ON public.consequence_ledgers(user_id);

-- 6. FUNCTION: Update trust automatically on accountability outcomes
CREATE OR REPLACE FUNCTION update_trust_on_accountability()
RETURNS TRIGGER AS $$
DECLARE
  v_initiator_delta INTEGER;
  v_executor_delta INTEGER;
  v_initiator_trust_before INTEGER;
  v_executor_trust_before INTEGER;
  v_initiator_trust_after INTEGER;
  v_executor_trust_after INTEGER;
BEGIN
  -- Only process when outcome changes to final state
  IF NEW.outcome_status IN ('completed', 'failed', 'disputed') AND 
     OLD.outcome_status = 'in_progress' AND
     NEW.trust_impact_applied = FALSE THEN
    
    -- Get current trust scores
    SELECT COALESCE(trust_score, 0) INTO v_initiator_trust_before 
    FROM user_trust_profiles WHERE user_id = NEW.initiator_id;
    
    SELECT COALESCE(trust_score, 0) INTO v_executor_trust_before 
    FROM user_trust_profiles WHERE user_id = NEW.executor_id;
    
    -- Calculate trust deltas based on outcome
    IF NEW.outcome_status = 'completed' THEN
      v_initiator_delta := 2; -- Small gain for successful project posting
      v_executor_delta := 5 + COALESCE(FLOOR(NEW.escrow_amount / 1000), 0)::INTEGER; -- More for delivery + escrow bonus
    ELSIF NEW.outcome_status = 'failed' THEN
      -- Failure attribution matters
      IF NEW.failure_attributed_to = NEW.executor_id THEN
        v_executor_delta := -10;
        v_initiator_delta := 1; -- Small gain for reporting
      ELSIF NEW.failure_attributed_to = NEW.initiator_id THEN
        v_initiator_delta := -10;
        v_executor_delta := 2;
      ELSE
        v_initiator_delta := -3;
        v_executor_delta := -3;
      END IF;
    ELSIF NEW.outcome_status = 'disputed' THEN
      v_initiator_delta := -5;
      v_executor_delta := -5;
    END IF;
    
    -- Apply trust changes
    v_initiator_trust_after := GREATEST(0, LEAST(100, v_initiator_trust_before + v_initiator_delta));
    v_executor_trust_after := GREATEST(0, LEAST(100, v_executor_trust_before + v_executor_delta));
    
    -- Update trust profiles
    UPDATE user_trust_profiles 
    SET trust_score = v_initiator_trust_after, updated_at = now()
    WHERE user_id = NEW.initiator_id;
    
    UPDATE user_trust_profiles 
    SET trust_score = v_executor_trust_after, updated_at = now()
    WHERE user_id = NEW.executor_id;
    
    -- Log trust events for both parties
    INSERT INTO trust_events (user_id, event_type, event_source, trust_delta, trust_before, trust_after, reference_type, reference_id, evidence_summary)
    VALUES 
      (NEW.initiator_id, 
       CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
       'escrow_system', v_initiator_delta, v_initiator_trust_before, v_initiator_trust_after,
       'accountability_record', NEW.id, 'Project: ' || COALESCE(NEW.promised_deliverables[1], 'Unnamed')),
      (NEW.executor_id, 
       CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
       'escrow_system', v_executor_delta, v_executor_trust_before, v_executor_trust_after,
       'accountability_record', NEW.id, 'Project: ' || COALESCE(NEW.promised_deliverables[1], 'Unnamed'));
    
    -- Mark trust impact as applied
    NEW.trust_impact_applied := TRUE;
    NEW.trust_impact_initiator := v_initiator_delta;
    NEW.trust_impact_executor := v_executor_delta;
    
    -- Create reality feed event
    INSERT INTO reality_feed_events (event_type, primary_actor_id, secondary_actor_id, title, summary, amount_involved, reference_type, reference_id, trust_impact, is_verified)
    VALUES (
      CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
      NEW.executor_id,
      NEW.initiator_id,
      CASE WHEN NEW.outcome_status = 'completed' 
           THEN 'Project Completed Successfully' 
           ELSE 'Project Failed' END,
      NEW.outcome_verdict,
      NEW.total_paid,
      'accountability_record',
      NEW.id,
      v_executor_delta,
      TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_trust_on_accountability
BEFORE UPDATE ON public.accountability_records
FOR EACH ROW
EXECUTE FUNCTION update_trust_on_accountability();

-- 7. FUNCTION: Compute consequence ledger
CREATE OR REPLACE FUNCTION compute_consequence_ledger(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_stats RECORD;
  v_trust_score INTEGER;
  v_peak INTEGER;
  v_lowest INTEGER;
BEGIN
  -- Aggregate accountability stats
  SELECT 
    COUNT(*) FILTER (WHERE initiator_id = p_user_id OR executor_id = p_user_id) as attempted,
    COUNT(*) FILTER (WHERE outcome_status = 'completed' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as completed,
    COUNT(*) FILTER (WHERE outcome_status = 'failed' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as failed,
    COUNT(*) FILTER (WHERE outcome_status = 'abandoned' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as abandoned,
    COALESCE(SUM(escrow_amount) FILTER (WHERE initiator_id = p_user_id OR executor_id = p_user_id), 0) as total_escrow,
    COALESCE(SUM(total_paid) FILTER (WHERE outcome_status = 'completed' AND (initiator_id = p_user_id OR executor_id = p_user_id)), 0) as released,
    COALESCE(SUM(escrow_amount) FILTER (WHERE outcome_status = 'disputed' AND (initiator_id = p_user_id OR executor_id = p_user_id)), 0) as disputed
  INTO v_stats
  FROM accountability_records;
  
  -- Get trust trajectory
  SELECT trust_score INTO v_trust_score FROM user_trust_profiles WHERE user_id = p_user_id;
  SELECT COALESCE(MAX(trust_after), 0), COALESCE(MIN(trust_after), 0) 
  INTO v_peak, v_lowest
  FROM trust_events WHERE user_id = p_user_id;
  
  -- Upsert consequence ledger
  INSERT INTO consequence_ledgers (
    user_id, projects_attempted, projects_completed, projects_failed, projects_abandoned,
    total_escrow_handled, total_escrow_released, total_escrow_disputed,
    completion_rate, trust_score_current, trust_score_peak, trust_score_lowest,
    trust_trajectory, computed_at
  ) VALUES (
    p_user_id,
    v_stats.attempted,
    v_stats.completed,
    v_stats.failed,
    v_stats.abandoned,
    v_stats.total_escrow,
    v_stats.released,
    v_stats.disputed,
    CASE WHEN v_stats.attempted > 0 THEN (v_stats.completed::DECIMAL / v_stats.attempted * 100) ELSE 0 END,
    COALESCE(v_trust_score, 0),
    COALESCE(v_peak, v_trust_score, 0),
    COALESCE(v_lowest, v_trust_score, 0),
    CASE 
      WHEN v_trust_score > v_peak - 10 THEN 'rising'
      WHEN v_trust_score < v_lowest + 10 THEN 'declining'
      ELSE 'stable'
    END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    projects_attempted = EXCLUDED.projects_attempted,
    projects_completed = EXCLUDED.projects_completed,
    projects_failed = EXCLUDED.projects_failed,
    projects_abandoned = EXCLUDED.projects_abandoned,
    total_escrow_handled = EXCLUDED.total_escrow_handled,
    total_escrow_released = EXCLUDED.total_escrow_released,
    total_escrow_disputed = EXCLUDED.total_escrow_disputed,
    completion_rate = EXCLUDED.completion_rate,
    trust_score_current = EXCLUDED.trust_score_current,
    trust_score_peak = EXCLUDED.trust_score_peak,
    trust_score_lowest = EXCLUDED.trust_score_lowest,
    trust_trajectory = EXCLUDED.trust_trajectory,
    computed_at = EXCLUDED.computed_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCTION: Check trust gate access
CREATE OR REPLACE FUNCTION check_trust_gate(p_user_id UUID, p_gate_name TEXT)
RETURNS JSONB AS $$
DECLARE
  v_gate RECORD;
  v_user RECORD;
  v_ledger RECORD;
  v_passed BOOLEAN := TRUE;
  v_denial_reasons TEXT[] := '{}';
BEGIN
  -- Get gate requirements
  SELECT * INTO v_gate FROM trust_access_gates WHERE gate_name = p_gate_name AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', TRUE, 'gate_not_found', TRUE);
  END IF;
  
  -- Get user trust profile
  SELECT * INTO v_user FROM user_trust_profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', FALSE, 'reason', 'No trust profile');
  END IF;
  
  -- Get consequence ledger
  SELECT * INTO v_ledger FROM consequence_ledgers WHERE user_id = p_user_id;
  
  -- Check requirements
  IF v_user.trust_score < v_gate.min_trust_score THEN
    v_passed := FALSE;
    v_denial_reasons := array_append(v_denial_reasons, 'Trust score too low');
  END IF;
  
  IF v_user.total_projects_completed < v_gate.min_projects_completed THEN
    v_passed := FALSE;
    v_denial_reasons := array_append(v_denial_reasons, 'Not enough completed projects');
  END IF;
  
  IF COALESCE(v_ledger.escrow_success_rate, 0) < v_gate.min_escrow_success_rate THEN
    v_passed := FALSE;
    v_denial_reasons := array_append(v_denial_reasons, 'Escrow success rate too low');
  END IF;
  
  IF v_gate.requires_verification AND NOT (v_user.is_verified_student OR v_user.is_verified_researcher OR v_user.is_verified_partner) THEN
    v_passed := FALSE;
    v_denial_reasons := array_append(v_denial_reasons, 'Verification required');
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_passed,
    'gate_name', v_gate.gate_name,
    'denial_reasons', v_denial_reasons,
    'denial_message', v_gate.denial_message,
    'requirements', jsonb_build_object(
      'min_trust_score', v_gate.min_trust_score,
      'min_projects', v_gate.min_projects_completed,
      'min_success_rate', v_gate.min_escrow_success_rate
    ),
    'current', jsonb_build_object(
      'trust_score', v_user.trust_score,
      'projects_completed', v_user.total_projects_completed,
      'escrow_success_rate', COALESCE(v_ledger.escrow_success_rate, 0)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS POLICIES
ALTER TABLE public.accountability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_access_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consequence_ledgers ENABLE ROW LEVEL SECURITY;

-- Accountability records: Public can view, participants can create
CREATE POLICY "accountability_records_select" ON public.accountability_records FOR SELECT USING (is_public = TRUE OR auth.uid() IN (initiator_id, executor_id, funder_id));
CREATE POLICY "accountability_records_insert" ON public.accountability_records FOR INSERT WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "accountability_records_update" ON public.accountability_records FOR UPDATE USING (auth.uid() IN (initiator_id, executor_id));

-- Trust gates: Public read
CREATE POLICY "trust_gates_select" ON public.trust_access_gates FOR SELECT USING (TRUE);

-- Trust events: Public can view public events, user sees own
CREATE POLICY "trust_events_select" ON public.trust_events FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

-- Reality feed: Public visibility
CREATE POLICY "reality_feed_select" ON public.reality_feed_events FOR SELECT USING (visibility = 'public' OR auth.uid() = primary_actor_id OR auth.uid() = secondary_actor_id);

-- Consequence ledgers: Public read (transparency)
CREATE POLICY "consequence_ledgers_select" ON public.consequence_ledgers FOR SELECT USING (TRUE);

-- 10. Enable realtime for the feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.reality_feed_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trust_events;