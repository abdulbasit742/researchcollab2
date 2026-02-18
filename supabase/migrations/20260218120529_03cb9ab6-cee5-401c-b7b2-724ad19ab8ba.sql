
-- =====================================================
-- FIX 1: Replace permissive UPDATE policies on financial tables
-- =====================================================

DROP POLICY IF EXISTS "Authenticated can update allocations" ON public.equity_allocations;
CREATE POLICY "Holders or admins can update allocations"
ON public.equity_allocations FOR UPDATE TO authenticated
USING (holder_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can update rounds" ON public.funding_rounds;
CREATE POLICY "Lead investor or admin can update rounds"
ON public.funding_rounds FOR UPDATE TO authenticated
USING (lead_investor_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can update vesting" ON public.vesting_schedules;
CREATE POLICY "Holder or admin can update vesting"
ON public.vesting_schedules FOR UPDATE TO authenticated
USING (holder_id = auth.uid() OR public.is_admin(auth.uid()));

-- =====================================================
-- FIX 2: Add RLS policies to 14 tables with zero policies
-- =====================================================

-- 1. contribution_disputes
CREATE POLICY "Users can view own disputes" ON public.contribution_disputes
FOR SELECT TO authenticated USING (raised_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can create disputes" ON public.contribution_disputes
FOR INSERT TO authenticated WITH CHECK (raised_by = auth.uid());

-- 2. contribution_graph_snapshots
CREATE POLICY "Users can view own snapshots" ON public.contribution_graph_snapshots
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "System can insert snapshots" ON public.contribution_graph_snapshots
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 3. dispute_actions
CREATE POLICY "Participants can view dispute actions" ON public.dispute_actions
FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR public.is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.dispute_participants dp WHERE dp.dispute_id = dispute_actions.dispute_id AND dp.user_id = auth.uid())
);
CREATE POLICY "Participants can create dispute actions" ON public.dispute_actions
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- 4. dispute_evidence
CREATE POLICY "Participants can view evidence" ON public.dispute_evidence
FOR SELECT TO authenticated USING (
  submitted_by = auth.uid() OR public.is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.dispute_participants dp WHERE dp.dispute_id = dispute_evidence.dispute_id AND dp.user_id = auth.uid())
);
CREATE POLICY "Users can submit evidence" ON public.dispute_evidence
FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());

-- 5. dispute_participants
CREATE POLICY "Participants can view own participation" ON public.dispute_participants
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can add participants" ON public.dispute_participants
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 6. ombuds_assignments
CREATE POLICY "Assigned ombuds can view" ON public.ombuds_assignments
FOR SELECT TO authenticated USING (ombuds_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can create assignments" ON public.ombuds_assignments
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update assignments" ON public.ombuds_assignments
FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- 7. peer_review_ai_assists (system-generated)
CREATE POLICY "Authenticated can view ai assists" ON public.peer_review_ai_assists
FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert ai assists" ON public.peer_review_ai_assists
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 8. peer_review_sections
CREATE POLICY "Authenticated can view review sections" ON public.peer_review_sections
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert review sections" ON public.peer_review_sections
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 9. research_artifacts
CREATE POLICY "Uploaders can view own artifacts" ON public.research_artifacts
FOR SELECT TO authenticated USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can upload artifacts" ON public.research_artifacts
FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Uploaders can delete own artifacts" ON public.research_artifacts
FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

-- 10. research_versions
CREATE POLICY "Users can view own versions" ON public.research_versions
FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can create versions" ON public.research_versions
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- 11. reviewer_profiles
CREATE POLICY "Anyone can view reviewer profiles" ON public.reviewer_profiles
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own reviewer profile" ON public.reviewer_profiles
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviewer profile" ON public.reviewer_profiles
FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 12. scholar_identity_links
CREATE POLICY "Authenticated can view identity links" ON public.scholar_identity_links
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage identity links" ON public.scholar_identity_links
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update identity links" ON public.scholar_identity_links
FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- 13. scholar_verification_events
CREATE POLICY "Authenticated can view verification events" ON public.scholar_verification_events
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create verification events" ON public.scholar_verification_events
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- 14. stewardship_transfers
CREATE POLICY "Admins can view transfers" ON public.stewardship_transfers
FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can create transfers" ON public.stewardship_transfers
FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update transfers" ON public.stewardship_transfers
FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- =====================================================
-- FIX 3: Restrict materialized views from API
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public') THEN
    EXECUTE (
      SELECT string_agg('REVOKE SELECT ON public.' || quote_ident(matviewname) || ' FROM anon, authenticated;', E'\n')
      FROM pg_matviews WHERE schemaname = 'public'
    );
  END IF;
END $$;
