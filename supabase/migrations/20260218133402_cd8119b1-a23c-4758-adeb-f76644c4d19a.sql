
-- ============================================================
-- FIX PERMISSIVE RLS WRITE POLICIES
-- Replace USING(true)/WITH CHECK(true) on write operations
-- with proper authorization checks
-- ============================================================

-- 1. abuse_detections: "Service role full access" → admin-only
DROP POLICY IF EXISTS "Service role full access to abuse_detections" ON public.abuse_detections;
CREATE POLICY "Admin manage abuse_detections"
  ON public.abuse_detections FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. ai_data_depth_index: "Admins can manage" → actual admin check
DROP POLICY IF EXISTS "Admins can manage ai_data_depth" ON public.ai_data_depth_index;
CREATE POLICY "Admin manage ai_data_depth"
  ON public.ai_data_depth_index FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. ai_decision_audit_logs: same fix
DROP POLICY IF EXISTS "Admins can manage ai_decision_audit" ON public.ai_decision_audit_logs;
CREATE POLICY "Admin manage ai_decision_audit"
  ON public.ai_decision_audit_logs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. competitor_threat_index
DROP POLICY IF EXISTS "Admins can manage competitor_threat" ON public.competitor_threat_index;
CREATE POLICY "Admin manage competitor_threat"
  ON public.competitor_threat_index FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. data_moat_growth_index
DROP POLICY IF EXISTS "Admins can manage data_moat_growth" ON public.data_moat_growth_index;
CREATE POLICY "Admin manage data_moat_growth"
  ON public.data_moat_growth_index FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. displacement_pillars
DROP POLICY IF EXISTS "Admins can manage displacement_pillars" ON public.displacement_pillars;
CREATE POLICY "Admin manage displacement_pillars"
  ON public.displacement_pillars FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. economic_velocity_tracking: "Service role full access" → admin-only
DROP POLICY IF EXISTS "Service role full access to economic_velocity_tracking" ON public.economic_velocity_tracking;
CREATE POLICY "Admin manage economic_velocity_tracking"
  ON public.economic_velocity_tracking FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. reciprocal_relationships: "Service role full access" → admin-only
DROP POLICY IF EXISTS "Service role full access to reciprocal_relationships" ON public.reciprocal_relationships;
CREATE POLICY "Admin manage reciprocal_relationships"
  ON public.reciprocal_relationships FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. switching_cost_index
DROP POLICY IF EXISTS "Admins can manage switching_cost_index" ON public.switching_cost_index;
CREATE POLICY "Admin manage switching_cost_index"
  ON public.switching_cost_index FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 10. trust_velocity_tracking: "Service role full access" → admin-only
DROP POLICY IF EXISTS "Service role full access to trust_velocity_tracking" ON public.trust_velocity_tracking;
CREATE POLICY "Admin manage trust_velocity_tracking"
  ON public.trust_velocity_tracking FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. user_rate_limits: "Service role full access" → admin-only
DROP POLICY IF EXISTS "Service role full access to user_rate_limits" ON public.user_rate_limits;
CREATE POLICY "Admin manage user_rate_limits"
  ON public.user_rate_limits FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- contact_submissions INSERT with WITH CHECK(true) is intentionally kept
-- as it's a public contact form that should accept anonymous submissions
