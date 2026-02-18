
-- ============================================================
-- SPRINT 1: ZERO-TRUST RLS HARDENING (CORRECTED)
-- Eliminate remaining WITH CHECK (true) INSERT policies
-- ============================================================

-- 1. ai_governance_logs: system logging, authenticated only
DROP POLICY IF EXISTS "Authenticated insert ai gov logs" ON public.ai_governance_logs;
CREATE POLICY "Authenticated insert ai gov logs"
  ON public.ai_governance_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. ai_usage_logs: restrict insert to own records
DROP POLICY IF EXISTS "Authenticated insert ai_usage_logs" ON public.ai_usage_logs;
CREATE POLICY "Users insert own ai_usage_logs"
  ON public.ai_usage_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. contact_submissions: intentionally public for contact form - KEEP

-- 4. credential_verifications: no user_id, system table
DROP POLICY IF EXISTS "Authenticated create verification requests" ON public.credential_verifications;
CREATE POLICY "Authenticated create verification requests"
  ON public.credential_verifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. dashboard_audit_logs: admin-only insert
DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.dashboard_audit_logs;
CREATE POLICY "Admin insert audit logs"
  ON public.dashboard_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. dispute_prediction_logs: admin/system only
DROP POLICY IF EXISTS "Authenticated insert dispute predictions" ON public.dispute_prediction_logs;
CREATE POLICY "Admin insert dispute predictions"
  ON public.dispute_prediction_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. external_verification_logs: admin only
DROP POLICY IF EXISTS "Authenticated insert ext verification logs" ON public.external_verification_logs;
CREATE POLICY "Admin insert ext verification logs"
  ON public.external_verification_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. fee_evasion_logs: admin only
DROP POLICY IF EXISTS "Authenticated insert evasion logs" ON public.fee_evasion_logs;
CREATE POLICY "Admin insert evasion logs"
  ON public.fee_evasion_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. fyp_escrow_links: no user column, authenticated only
DROP POLICY IF EXISTS "Authenticated insert fyp escrow" ON public.fyp_escrow_links;
CREATE POLICY "Authenticated insert fyp escrow"
  ON public.fyp_escrow_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 10. fyp_execution_tracks: no created_by, authenticated only
DROP POLICY IF EXISTS "Authenticated insert execution tracks" ON public.fyp_execution_tracks;
CREATE POLICY "Authenticated insert execution tracks"
  ON public.fyp_execution_tracks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 11. fyp_impact_metrics: admin only
DROP POLICY IF EXISTS "Authenticated insert impact metrics" ON public.fyp_impact_metrics;
CREATE POLICY "Admin insert impact metrics"
  ON public.fyp_impact_metrics FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 12. fyp_problem_briefs: no user column, authenticated only
DROP POLICY IF EXISTS "Authenticated submit problem brief" ON public.fyp_problem_briefs;
CREATE POLICY "Authenticated submit problem brief"
  ON public.fyp_problem_briefs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 13. fyp_teams: no leader_id, authenticated only
DROP POLICY IF EXISTS "Authenticated create teams" ON public.fyp_teams;
CREATE POLICY "Authenticated create teams"
  ON public.fyp_teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 14. passport_verifications: admin only
DROP POLICY IF EXISTS "Authenticated insert passport verifications" ON public.passport_verifications;
CREATE POLICY "Admin insert passport verifications"
  ON public.passport_verifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 15. platform_fees: admin only (financial table)
DROP POLICY IF EXISTS "Authenticated insert platform fees" ON public.platform_fees;
CREATE POLICY "Admin insert platform fees"
  ON public.platform_fees FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 16. pod_execution_metrics: admin only
DROP POLICY IF EXISTS "Authenticated insert pod metrics" ON public.pod_execution_metrics;
CREATE POLICY "Admin insert pod metrics"
  ON public.pod_execution_metrics FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 17. research_ethics_audit: users can audit own (performed_by)
DROP POLICY IF EXISTS "Authenticated insert ethics audit" ON public.research_ethics_audit;
CREATE POLICY "Users insert own ethics audits"
  ON public.research_ethics_audit FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = performed_by);

-- 18. revenue_split_simulations: authenticated only
DROP POLICY IF EXISTS "Authenticated insert revenue simulations" ON public.revenue_split_simulations;
CREATE POLICY "Authenticated insert revenue simulations"
  ON public.revenue_split_simulations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 19. state_transition_logs: authenticated, own or null trigger
DROP POLICY IF EXISTS "Authenticated insert transition logs" ON public.state_transition_logs;
CREATE POLICY "Authenticated insert transition logs"
  ON public.state_transition_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = triggered_by OR triggered_by IS NULL);

-- 20. system_recommendations: admin only
DROP POLICY IF EXISTS "Authenticated insert recommendations" ON public.system_recommendations;
CREATE POLICY "Admin insert recommendations"
  ON public.system_recommendations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 21. system_signals: admin only
DROP POLICY IF EXISTS "Authenticated insert signals" ON public.system_signals;
CREATE POLICY "Admin insert signals"
  ON public.system_signals FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 22. trust_calculation_audit: admin only
DROP POLICY IF EXISTS "Authenticated insert trust audit" ON public.trust_calculation_audit;
CREATE POLICY "Admin insert trust audit"
  ON public.trust_calculation_audit FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- IMMUTABILITY: Prevent UPDATE/DELETE on critical audit tables
-- ============================================================

DROP POLICY IF EXISTS "No updates to transition logs" ON public.state_transition_logs;
CREATE POLICY "No updates to transition logs"
  ON public.state_transition_logs FOR UPDATE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No deletes on transition logs" ON public.state_transition_logs;
CREATE POLICY "No deletes on transition logs"
  ON public.state_transition_logs FOR DELETE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No updates to admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "No updates to admin audit logs"
  ON public.admin_audit_logs FOR UPDATE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No deletes on admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "No deletes on admin audit logs"
  ON public.admin_audit_logs FOR DELETE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No updates to trust events" ON public.trust_events;
CREATE POLICY "No updates to trust events"
  ON public.trust_events FOR UPDATE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No deletes on trust events" ON public.trust_events;
CREATE POLICY "No deletes on trust events"
  ON public.trust_events FOR DELETE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No updates to ledger entries" ON public.ledger_entries;
CREATE POLICY "No updates to ledger entries"
  ON public.ledger_entries FOR UPDATE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "No deletes on ledger entries" ON public.ledger_entries;
CREATE POLICY "No deletes on ledger entries"
  ON public.ledger_entries FOR DELETE TO authenticated
  USING (false);
