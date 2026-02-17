
-- KYC Verification System
CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('sponsor', 'faculty', 'student')),
  verification_level TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'basic', 'enhanced', 'full')),
  business_email TEXT,
  company_registration TEXT,
  institution_email TEXT,
  student_id_number TEXT,
  payment_method_verified BOOLEAN DEFAULT FALSE,
  legal_entity_confirmed BOOLEAN DEFAULT FALSE,
  admin_approved BOOLEAN DEFAULT FALSE,
  admin_approved_by UUID,
  admin_approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all KYC" ON public.kyc_verifications
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update KYC" ON public.kyc_verifications
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- IP Contract Engine
CREATE TABLE public.ip_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fyp_id UUID,
  sponsor_id UUID NOT NULL,
  student_ids UUID[] NOT NULL DEFAULT '{}',
  faculty_id UUID,
  ip_model_type TEXT NOT NULL CHECK (ip_model_type IN ('sponsor_owned', 'student_owned', 'shared', 'license', 'royalty')),
  contract_terms JSONB DEFAULT '{}'::jsonb,
  contract_hash TEXT,
  sponsor_signed BOOLEAN DEFAULT FALSE,
  sponsor_signed_at TIMESTAMPTZ,
  student_signed BOOLEAN DEFAULT FALSE,
  student_signed_at TIMESTAMPTZ,
  faculty_signed BOOLEAN DEFAULT FALSE,
  faculty_signed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'active', 'expired', 'terminated')),
  royalty_percentage NUMERIC(5,2),
  license_duration_months INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ip_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view contracts" ON public.ip_contracts
  FOR SELECT USING (
    auth.uid() = sponsor_id OR 
    auth.uid() = faculty_id OR 
    auth.uid() = ANY(student_ids) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Sponsors can create contracts" ON public.ip_contracts
  FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Participants can update contracts" ON public.ip_contracts
  FOR UPDATE USING (
    auth.uid() = sponsor_id OR 
    auth.uid() = faculty_id OR 
    auth.uid() = ANY(student_ids)
  );

-- Escrow Audit Log (Immutable)
CREATE TABLE public.escrow_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fyp_id UUID,
  sponsor_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('funded', 'escrow_locked', 'milestone_released', 'disputed', 'refunded', 'partial_release')),
  actor_id UUID NOT NULL,
  amount NUMERIC(12,2),
  milestone_reference TEXT,
  ip_contract_id UUID REFERENCES public.ip_contracts(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON public.escrow_audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Sponsors can view own audit logs" ON public.escrow_audit_logs
  FOR SELECT USING (auth.uid() = sponsor_id);

CREATE POLICY "System can insert audit logs" ON public.escrow_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- No UPDATE/DELETE policies — immutable by design

-- Funding Declarations
CREATE TABLE public.funding_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL,
  fyp_id UUID,
  funding_source TEXT NOT NULL,
  legal_compliance_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  declaration_text TEXT,
  declared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can view own declarations" ON public.funding_declarations
  FOR SELECT USING (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can insert declarations" ON public.funding_declarations
  FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Admins can view all declarations" ON public.funding_declarations
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Dispute Resolution (Enhanced)
CREATE TABLE public.fyp_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fyp_id UUID,
  milestone_id UUID,
  initiated_by UUID NOT NULL,
  respondent_id UUID NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('milestone_rejection', 'quality_issue', 'deadline_breach', 'payment_dispute', 'ip_violation', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'evidence_submitted', 'faculty_mediation', 'admin_arbitration', 'resolved', 'escalated', 'closed')),
  mediator_id UUID,
  arbitrator_id UUID,
  resolution_summary TEXT,
  escrow_decision TEXT CHECK (escrow_decision IN ('release_full', 'release_partial', 'refund_full', 'refund_partial', 'hold')),
  escrow_decision_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fyp_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view disputes" ON public.fyp_disputes
  FOR SELECT USING (
    auth.uid() = initiated_by OR 
    auth.uid() = respondent_id OR 
    auth.uid() = mediator_id OR
    auth.uid() = arbitrator_id OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Users can initiate disputes" ON public.fyp_disputes
  FOR INSERT WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Participants and admins can update disputes" ON public.fyp_disputes
  FOR UPDATE USING (
    auth.uid() = initiated_by OR 
    auth.uid() = respondent_id OR 
    auth.uid() = mediator_id OR
    auth.uid() = arbitrator_id OR
    public.is_admin(auth.uid())
  );

-- Sponsor Risk Scores
CREATE TABLE public.sponsor_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL UNIQUE,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  funding_consistency_score INTEGER DEFAULT 50,
  dispute_history_score INTEGER DEFAULT 100,
  approval_delay_score INTEGER DEFAULT 100,
  escrow_abandonment_score INTEGER DEFAULT 100,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view risk scores" ON public.sponsor_risk_scores
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can manage risk scores" ON public.sponsor_risk_scores
  FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_kyc_user ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(status);
CREATE INDEX idx_ip_contracts_sponsor ON public.ip_contracts(sponsor_id);
CREATE INDEX idx_ip_contracts_status ON public.ip_contracts(status);
CREATE INDEX idx_escrow_audit_fyp ON public.escrow_audit_logs(fyp_id);
CREATE INDEX idx_escrow_audit_sponsor ON public.escrow_audit_logs(sponsor_id);
CREATE INDEX idx_fyp_disputes_status ON public.fyp_disputes(status);
CREATE INDEX idx_sponsor_risk ON public.sponsor_risk_scores(sponsor_id);
