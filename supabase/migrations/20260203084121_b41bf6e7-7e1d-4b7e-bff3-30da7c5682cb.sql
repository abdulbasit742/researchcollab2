
-- =====================================================
-- PHASE 10: RESEARCH INFRASTRUCTURE & ACADEMIC INTEGRITY
-- =====================================================

-- =====================================================
-- 1. RESEARCH TIMELINES & VERSIONED WORKSPACES
-- =====================================================

-- Research Timeline Container
CREATE TABLE public.research_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  research_domain TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'collaborators', 'public')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Research Entries (chronological timeline entries)
CREATE TABLE public.research_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('idea', 'note', 'experiment', 'dataset', 'draft', 'revision', 'result')),
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Research Versions (version control)
CREATE TABLE public.research_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_entry_id UUID NOT NULL REFERENCES public.research_entries(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content_snapshot TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_entry_id, version_number)
);

-- Research Collaborators
CREATE TABLE public.research_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'contributor', 'editor')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_timeline_id, user_id)
);

-- Research Artifacts
CREATE TABLE public.research_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  related_entry_id UUID REFERENCES public.research_entries(id),
  file_url TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('dataset', 'code', 'image', 'pdf', 'notes', 'other')),
  file_name TEXT,
  file_size_bytes BIGINT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. PEER REVIEW & STRUCTURED FEEDBACK SYSTEM
-- =====================================================

-- Peer Review Requests
CREATE TABLE public.peer_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('research_timeline', 'research_entry', 'publication')),
  target_id UUID NOT NULL,
  review_type TEXT NOT NULL DEFAULT 'private' CHECK (review_type IN ('private', 'invited', 'open')),
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Peer Reviews
CREATE TABLE public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_request_id UUID NOT NULL REFERENCES public.peer_review_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 5),
  summary_feedback TEXT,
  visibility TEXT NOT NULL DEFAULT 'private_to_author' CHECK (visibility IN ('private_to_author', 'public')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_request_id, reviewer_id)
);

-- Peer Review Sections (structured critique)
CREATE TABLE public.peer_review_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peer_review_id UUID NOT NULL REFERENCES public.peer_reviews(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('clarity', 'methodology', 'originality', 'ethics', 'references', 'contribution')),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Review Assists
CREATE TABLE public.peer_review_ai_assists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('research_timeline', 'research_entry', 'publication')),
  target_id UUID NOT NULL,
  ai_feedback_summary TEXT,
  strengths_detected JSONB,
  weaknesses_detected JSONB,
  suggestions JSONB,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviewer Profiles
CREATE TABLE public.reviewer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviews_given INTEGER NOT NULL DEFAULT 0,
  avg_review_quality_score NUMERIC(3,2),
  total_review_words INTEGER NOT NULL DEFAULT 0,
  specialization_areas TEXT[],
  last_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. CONTRIBUTION GRAPH & CREDIT ATTRIBUTION
-- =====================================================

-- Contribution Records
CREATE TABLE public.contribution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_user_id UUID NOT NULL REFERENCES public.profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('research_timeline', 'research_entry', 'publication', 'dataset', 'code', 'peer_review')),
  target_id UUID NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('idea', 'methodology', 'data_collection', 'analysis', 'writing', 'review', 'supervision', 'funding', 'resources')),
  contribution_description TEXT,
  effort_weight NUMERIC(3,2) CHECK (effort_weight >= 0 AND effort_weight <= 1),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contribution Validations
CREATE TABLE public.contribution_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_record_id UUID NOT NULL REFERENCES public.contribution_records(id) ON DELETE CASCADE,
  validator_user_id UUID NOT NULL REFERENCES public.profiles(id),
  validation_type TEXT NOT NULL CHECK (validation_type IN ('approved', 'contested')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contribution_record_id, validator_user_id)
);

-- Contribution Disputes
CREATE TABLE public.contribution_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_record_id UUID NOT NULL REFERENCES public.contribution_records(id),
  raised_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contribution Graph Snapshots (precomputed metrics)
CREATE TABLE public.contribution_graph_snapshots (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_contributions INTEGER NOT NULL DEFAULT 0,
  contribution_diversity_score NUMERIC(3,2) NOT NULL DEFAULT 0,
  collaboration_depth_score NUMERIC(3,2) NOT NULL DEFAULT 0,
  validated_contributions INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. ACADEMIC DISPUTE RESOLUTION & OMBUDS SYSTEM
-- =====================================================

-- Academic Disputes
CREATE TABLE public.academic_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raised_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('authorship', 'contribution', 'review_bias', 'ethics', 'misconduct', 'supervision', 'other')),
  related_entity_type TEXT CHECK (related_entity_type IN ('research_timeline', 'publication', 'contribution_record', 'peer_review', 'project')),
  related_entity_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidentiality_level TEXT NOT NULL DEFAULT 'private' CHECK (confidentiality_level IN ('private', 'limited', 'institutional')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'mediation', 'escalated', 'resolved', 'dismissed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dispute Participants
CREATE TABLE public.dispute_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.academic_disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL CHECK (role IN ('complainant', 'respondent', 'witness', 'mediator')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dispute_id, user_id, role)
);

-- Dispute Evidence
CREATE TABLE public.dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.academic_disputes(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('text', 'file', 'link', 'reference')),
  title TEXT,
  content TEXT NOT NULL,
  file_url TEXT,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dispute Actions (resolution timeline)
CREATE TABLE public.dispute_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.academic_disputes(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('response', 'mediation_note', 'admin_note', 'resolution_decision', 'status_change')),
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  visibility TEXT NOT NULL DEFAULT 'participants' CHECK (visibility IN ('internal', 'participants', 'admin_only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ombuds Assignments
CREATE TABLE public.ombuds_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.academic_disputes(id) ON DELETE CASCADE,
  ombuds_user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL CHECK (role IN ('mediator', 'reviewer', 'adjudicator')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(dispute_id, ombuds_user_id)
);

-- =====================================================
-- 5. SCHOLAR PASSPORT & VERIFIED IDENTITY
-- =====================================================

-- Scholar Passports (canonical academic identity)
CREATE TABLE public.scholar_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  public_scholar_id TEXT NOT NULL UNIQUE,
  primary_affiliation TEXT,
  academic_role TEXT CHECK (academic_role IN ('student', 'researcher', 'faculty', 'supervisor', 'industry_researcher', 'independent')),
  research_interests TEXT[],
  verification_level TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'basic', 'institution_verified', 'fully_verified')),
  passport_status TEXT NOT NULL DEFAULT 'active' CHECK (passport_status IN ('active', 'limited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholar Credentials
CREATE TABLE public.scholar_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('degree', 'position', 'affiliation', 'certification', 'award', 'fellowship')),
  credential_title TEXT NOT NULL,
  issuing_body TEXT NOT NULL,
  issuing_body_verified BOOLEAN NOT NULL DEFAULT false,
  issued_date DATE,
  expires_at DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_source TEXT CHECK (verification_source IN ('institution', 'admin', 'org', 'government', 'self')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholar Verification Events (audit trail)
CREATE TABLE public.scholar_verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'verified', 'revoked', 'updated', 'level_changed')),
  previous_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholar Identity Links (external identity providers)
CREATE TABLE public.scholar_identity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('orcid', 'google_scholar', 'university_portal', 'researchgate', 'linkedin', 'github')),
  external_identifier TEXT NOT NULL,
  profile_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scholar_passport_id, provider)
);

-- =====================================================
-- 6. RESEARCH FUNDING & GRANTS SYSTEM
-- =====================================================

-- Funding Programs
CREATE TABLE public.funding_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  description TEXT,
  sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('government', 'university', 'ngo', 'industry', 'platform', 'foundation')),
  sponsor_org_id UUID REFERENCES public.organizations(id),
  sponsor_name TEXT,
  total_budget NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  min_amount NUMERIC(15,2),
  max_amount NUMERIC(15,2),
  eligibility_criteria JSONB,
  focus_areas TEXT[],
  application_deadline TIMESTAMPTZ,
  review_process TEXT NOT NULL DEFAULT 'committee' CHECK (review_process IN ('open', 'invited', 'committee')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funding Applications
CREATE TABLE public.funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_program_id UUID NOT NULL REFERENCES public.funding_programs(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL REFERENCES public.profiles(id),
  research_timeline_id UUID REFERENCES public.research_timelines(id),
  proposal_title TEXT NOT NULL,
  proposal_summary TEXT NOT NULL,
  detailed_proposal TEXT,
  requested_amount NUMERIC(15,2) NOT NULL,
  duration_months INTEGER,
  team_members JSONB,
  budget_breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funding_program_id, applicant_user_id)
);

-- Funding Reviews
CREATE TABLE public.funding_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_application_id UUID NOT NULL REFERENCES public.funding_applications(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES public.profiles(id),
  score INTEGER CHECK (score >= 1 AND score <= 10),
  innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 5),
  feasibility_score INTEGER CHECK (feasibility_score >= 1 AND feasibility_score <= 5),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_approve', 'approve', 'neutral', 'reject', 'strong_reject')),
  is_conflicted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funding_application_id, reviewer_user_id)
);

-- Funding Allocations
CREATE TABLE public.funding_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_application_id UUID NOT NULL UNIQUE REFERENCES public.funding_applications(id),
  approved_amount NUMERIC(15,2) NOT NULL,
  allocation_status TEXT NOT NULL DEFAULT 'active' CHECK (allocation_status IN ('active', 'paused', 'completed', 'terminated')),
  released_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  escrow_wallet_id UUID REFERENCES public.wallets(id),
  approval_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funding Milestones
CREATE TABLE public.funding_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_allocation_id UUID NOT NULL REFERENCES public.funding_allocations(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  milestone_title TEXT NOT NULL,
  required_outcome TEXT NOT NULL,
  deliverables JSONB,
  release_amount NUMERIC(15,2) NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'revised')),
  submission_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funding_allocation_id, milestone_number)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Research timelines
CREATE INDEX idx_research_timelines_owner ON public.research_timelines(owner_user_id);
CREATE INDEX idx_research_timelines_visibility ON public.research_timelines(visibility);
CREATE INDEX idx_research_timelines_status ON public.research_timelines(status);
CREATE INDEX idx_research_entries_timeline ON public.research_entries(research_timeline_id);
CREATE INDEX idx_research_versions_entry ON public.research_versions(research_entry_id);
CREATE INDEX idx_research_collaborators_user ON public.research_collaborators(user_id);
CREATE INDEX idx_research_artifacts_timeline ON public.research_artifacts(research_timeline_id);

-- Peer reviews
CREATE INDEX idx_peer_review_requests_requester ON public.peer_review_requests(requester_id);
CREATE INDEX idx_peer_review_requests_target ON public.peer_review_requests(target_type, target_id);
CREATE INDEX idx_peer_reviews_reviewer ON public.peer_reviews(reviewer_id);
CREATE INDEX idx_peer_review_sections_review ON public.peer_review_sections(peer_review_id);

-- Contributions
CREATE INDEX idx_contribution_records_contributor ON public.contribution_records(contributor_user_id);
CREATE INDEX idx_contribution_records_target ON public.contribution_records(target_type, target_id);
CREATE INDEX idx_contribution_validations_record ON public.contribution_validations(contribution_record_id);
CREATE INDEX idx_contribution_disputes_record ON public.contribution_disputes(contribution_record_id);

-- Disputes
CREATE INDEX idx_academic_disputes_raised_by ON public.academic_disputes(raised_by_user_id);
CREATE INDEX idx_academic_disputes_status ON public.academic_disputes(status);
CREATE INDEX idx_dispute_participants_user ON public.dispute_participants(user_id);
CREATE INDEX idx_dispute_evidence_dispute ON public.dispute_evidence(dispute_id);
CREATE INDEX idx_ombuds_assignments_dispute ON public.ombuds_assignments(dispute_id);

-- Scholar passports
CREATE INDEX idx_scholar_passports_user ON public.scholar_passports(user_id);
CREATE INDEX idx_scholar_passports_verification ON public.scholar_passports(verification_level);
CREATE INDEX idx_scholar_credentials_passport ON public.scholar_credentials(scholar_passport_id);
CREATE INDEX idx_scholar_identity_links_passport ON public.scholar_identity_links(scholar_passport_id);

-- Funding
CREATE INDEX idx_funding_programs_status ON public.funding_programs(status);
CREATE INDEX idx_funding_programs_sponsor ON public.funding_programs(sponsor_org_id);
CREATE INDEX idx_funding_applications_program ON public.funding_applications(funding_program_id);
CREATE INDEX idx_funding_applications_applicant ON public.funding_applications(applicant_user_id);
CREATE INDEX idx_funding_reviews_application ON public.funding_reviews(funding_application_id);
CREATE INDEX idx_funding_allocations_application ON public.funding_allocations(funding_application_id);
CREATE INDEX idx_funding_milestones_allocation ON public.funding_milestones(funding_allocation_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.research_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_ai_assists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_graph_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ombuds_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_identity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_milestones ENABLE ROW LEVEL SECURITY;

-- Research Timelines RLS
CREATE POLICY "Users can view own timelines" ON public.research_timelines
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Users can view public timelines" ON public.research_timelines
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Collaborators can view timelines" ON public.research_timelines
  FOR SELECT USING (
    visibility = 'collaborators' AND 
    EXISTS (SELECT 1 FROM public.research_collaborators WHERE research_timeline_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create own timelines" ON public.research_timelines
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update timelines" ON public.research_timelines
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can view all timelines" ON public.research_timelines
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Research Entries RLS
CREATE POLICY "View entries based on timeline access" ON public.research_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_timelines rt
      WHERE rt.id = research_timeline_id
      AND (
        rt.owner_user_id = auth.uid()
        OR rt.visibility = 'public'
        OR (rt.visibility = 'collaborators' AND EXISTS (
          SELECT 1 FROM public.research_collaborators rc 
          WHERE rc.research_timeline_id = rt.id AND rc.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Contributors can add entries" ON public.research_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_timelines rt
      WHERE rt.id = research_timeline_id
      AND (
        rt.owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.research_collaborators rc 
          WHERE rc.research_timeline_id = rt.id AND rc.user_id = auth.uid() AND rc.role IN ('contributor', 'editor')
        )
      )
    )
  );

-- Research Collaborators RLS
CREATE POLICY "View collaborators of accessible timelines" ON public.research_collaborators
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.research_timelines rt
      WHERE rt.id = research_timeline_id AND rt.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage collaborators" ON public.research_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.research_timelines rt
      WHERE rt.id = research_timeline_id AND rt.owner_user_id = auth.uid()
    )
  );

-- Peer Review Requests RLS
CREATE POLICY "View own review requests" ON public.peer_review_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "View open review requests" ON public.peer_review_requests
  FOR SELECT USING (review_type = 'open' AND status = 'open');

CREATE POLICY "Create own review requests" ON public.peer_review_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Update own review requests" ON public.peer_review_requests
  FOR UPDATE USING (requester_id = auth.uid());

-- Peer Reviews RLS
CREATE POLICY "Reviewers can view own reviews" ON public.peer_reviews
  FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Authors can view reviews of their requests" ON public.peer_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peer_review_requests prr
      WHERE prr.id = review_request_id AND prr.requester_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can create reviews" ON public.peer_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update own reviews" ON public.peer_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Contribution Records RLS
CREATE POLICY "View own contributions" ON public.contribution_records
  FOR SELECT USING (contributor_user_id = auth.uid());

CREATE POLICY "View contributions on accessible targets" ON public.contribution_records
  FOR SELECT USING (
    target_type = 'publication' OR
    (target_type = 'research_timeline' AND EXISTS (
      SELECT 1 FROM public.research_timelines rt
      WHERE rt.id = target_id AND (rt.visibility = 'public' OR rt.owner_user_id = auth.uid())
    ))
  );

CREATE POLICY "Create own contributions" ON public.contribution_records
  FOR INSERT WITH CHECK (contributor_user_id = auth.uid());

-- Contribution Validations RLS
CREATE POLICY "View validations for accessible contributions" ON public.contribution_validations
  FOR SELECT USING (
    validator_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.contribution_records cr
      WHERE cr.id = contribution_record_id AND cr.contributor_user_id = auth.uid()
    )
  );

CREATE POLICY "Create validations" ON public.contribution_validations
  FOR INSERT WITH CHECK (validator_user_id = auth.uid());

-- Academic Disputes RLS (confidential)
CREATE POLICY "View own disputes" ON public.academic_disputes
  FOR SELECT USING (raised_by_user_id = auth.uid());

CREATE POLICY "Participants can view disputes" ON public.academic_disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dispute_participants dp
      WHERE dp.dispute_id = id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Ombuds can view assigned disputes" ON public.academic_disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ombuds_assignments oa
      WHERE oa.dispute_id = id AND oa.ombuds_user_id = auth.uid()
    )
  );

CREATE POLICY "Create disputes" ON public.academic_disputes
  FOR INSERT WITH CHECK (raised_by_user_id = auth.uid());

CREATE POLICY "Admins can view all disputes" ON public.academic_disputes
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update disputes" ON public.academic_disputes
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Scholar Passports RLS
CREATE POLICY "View own passport" ON public.scholar_passports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "View active passports" ON public.scholar_passports
  FOR SELECT USING (passport_status = 'active');

CREATE POLICY "Create own passport" ON public.scholar_passports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own passport" ON public.scholar_passports
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage passports" ON public.scholar_passports
  FOR ALL USING (public.is_admin(auth.uid()));

-- Scholar Credentials RLS
CREATE POLICY "View own credentials" ON public.scholar_credentials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp
      WHERE sp.id = scholar_passport_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "View verified credentials" ON public.scholar_credentials
  FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Create own credentials" ON public.scholar_credentials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp
      WHERE sp.id = scholar_passport_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage credentials" ON public.scholar_credentials
  FOR ALL USING (public.is_admin(auth.uid()));

-- Funding Programs RLS
CREATE POLICY "View open funding programs" ON public.funding_programs
  FOR SELECT USING (status IN ('open', 'closed'));

CREATE POLICY "Creators can view own programs" ON public.funding_programs
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Admins can manage programs" ON public.funding_programs
  FOR ALL USING (public.is_admin(auth.uid()));

-- Funding Applications RLS
CREATE POLICY "View own applications" ON public.funding_applications
  FOR SELECT USING (applicant_user_id = auth.uid());

CREATE POLICY "Create own applications" ON public.funding_applications
  FOR INSERT WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "Update own applications" ON public.funding_applications
  FOR UPDATE USING (applicant_user_id = auth.uid() AND status IN ('draft', 'submitted'));

CREATE POLICY "Admins can view all applications" ON public.funding_applications
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Funding Reviews RLS
CREATE POLICY "Reviewers can view own reviews" ON public.funding_reviews
  FOR SELECT USING (reviewer_user_id = auth.uid());

CREATE POLICY "Reviewers can create reviews" ON public.funding_reviews
  FOR INSERT WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "Admins can view all reviews" ON public.funding_reviews
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Funding Allocations RLS
CREATE POLICY "Applicants can view own allocations" ON public.funding_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.funding_applications fa
      WHERE fa.id = funding_application_id AND fa.applicant_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage allocations" ON public.funding_allocations
  FOR ALL USING (public.is_admin(auth.uid()));

-- Funding Milestones RLS
CREATE POLICY "View milestones for own allocations" ON public.funding_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.funding_allocations fa
      JOIN public.funding_applications app ON app.id = fa.funding_application_id
      WHERE fa.id = funding_allocation_id AND app.applicant_user_id = auth.uid()
    )
  );

CREATE POLICY "Submit milestones for own allocations" ON public.funding_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.funding_allocations fa
      JOIN public.funding_applications app ON app.id = fa.funding_application_id
      WHERE fa.id = funding_allocation_id AND app.applicant_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage milestones" ON public.funding_milestones
  FOR ALL USING (public.is_admin(auth.uid()));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate public scholar ID
CREATE OR REPLACE FUNCTION public.generate_scholar_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id TEXT;
BEGIN
  v_id := 'SCH-' || upper(substring(md5(random()::text || now()::text) from 1 for 8));
  RETURN v_id;
END;
$$;

-- Auto-create scholar passport on profile creation
CREATE OR REPLACE FUNCTION public.create_scholar_passport()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.scholar_passports (user_id, public_scholar_id)
  VALUES (NEW.id, generate_scholar_id())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating passport
DROP TRIGGER IF EXISTS create_passport_on_profile ON public.profiles;
CREATE TRIGGER create_passport_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_scholar_passport();

-- Update contribution graph snapshot
CREATE OR REPLACE FUNCTION public.update_contribution_snapshot(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_validated INTEGER;
  v_types TEXT[];
  v_diversity NUMERIC;
  v_collaborators INTEGER;
  v_depth NUMERIC;
BEGIN
  -- Count total contributions
  SELECT COUNT(*) INTO v_total FROM contribution_records WHERE contributor_user_id = p_user_id;
  
  -- Count validated contributions
  SELECT COUNT(DISTINCT cr.id) INTO v_validated
  FROM contribution_records cr
  JOIN contribution_validations cv ON cv.contribution_record_id = cr.id
  WHERE cr.contributor_user_id = p_user_id AND cv.validation_type = 'approved';
  
  -- Calculate diversity (number of different contribution types / total possible)
  SELECT array_agg(DISTINCT contribution_type) INTO v_types
  FROM contribution_records WHERE contributor_user_id = p_user_id;
  v_diversity := COALESCE(array_length(v_types, 1)::NUMERIC / 9, 0);
  
  -- Calculate collaboration depth (unique collaborators)
  SELECT COUNT(DISTINCT rc.user_id) INTO v_collaborators
  FROM research_timelines rt
  JOIN research_collaborators rc ON rc.research_timeline_id = rt.id
  WHERE rt.owner_user_id = p_user_id;
  v_depth := LEAST(v_collaborators::NUMERIC / 10, 1);
  
  -- Upsert snapshot
  INSERT INTO contribution_graph_snapshots (user_id, total_contributions, validated_contributions, contribution_diversity_score, collaboration_depth_score, last_updated_at)
  VALUES (p_user_id, v_total, v_validated, v_diversity, v_depth, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_contributions = EXCLUDED.total_contributions,
    validated_contributions = EXCLUDED.validated_contributions,
    contribution_diversity_score = EXCLUDED.contribution_diversity_score,
    collaboration_depth_score = EXCLUDED.collaboration_depth_score,
    last_updated_at = now();
END;
$$;

-- Update reviewer profile stats
CREATE OR REPLACE FUNCTION public.update_reviewer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO reviewer_profiles (user_id, reviews_given, total_review_words, last_review_at)
  VALUES (
    NEW.reviewer_id,
    1,
    COALESCE(length(NEW.summary_feedback), 0),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    reviews_given = reviewer_profiles.reviews_given + 1,
    total_review_words = reviewer_profiles.total_review_words + COALESCE(length(NEW.summary_feedback), 0),
    last_review_at = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reviewer_profile_on_review
  AFTER INSERT ON public.peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reviewer_stats();

-- Auto-create version on entry update
CREATE OR REPLACE FUNCTION public.create_research_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_version INTEGER;
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM research_versions WHERE research_entry_id = NEW.id;
    
    INSERT INTO research_versions (research_entry_id, version_number, content_snapshot, change_summary, created_by)
    VALUES (NEW.id, v_next_version, OLD.content, 'Auto-saved version', auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_version_research_entry
  BEFORE UPDATE ON public.research_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.create_research_version();
