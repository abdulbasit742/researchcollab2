
-- Add missing RLS policies for tables flagged by linter

-- Mobility Agreements
CREATE POLICY "View agreements for own mobility requests" ON public.mobility_agreements
  FOR SELECT USING (
    mobility_request_id IN (
      SELECT id FROM public.research_mobility_requests 
      WHERE applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Create agreements" ON public.mobility_agreements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Mobility Approvals
CREATE POLICY "View approvals for own requests" ON public.mobility_approvals
  FOR SELECT USING (
    mobility_request_id IN (
      SELECT id FROM public.research_mobility_requests 
      WHERE applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    )
    OR approver_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Approvers can update decisions" ON public.mobility_approvals
  FOR UPDATE USING (approver_user_id = auth.uid());

-- Mobility Compliance Flags
CREATE POLICY "View compliance flags for own requests" ON public.mobility_compliance_flags
  FOR SELECT USING (
    mobility_request_id IN (
      SELECT id FROM public.research_mobility_requests 
      WHERE applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Visiting Scholar Records
CREATE POLICY "View own visiting records" ON public.visiting_scholar_records
  FOR SELECT USING (
    scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- IP Licenses
CREATE POLICY "View licenses for involved IP" ON public.ip_licenses
  FOR SELECT USING (
    ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
    OR ip_record_id IN (
      SELECT ip_record_id FROM public.ip_contributors 
      WHERE scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners can create licenses" ON public.ip_licenses
  FOR INSERT WITH CHECK (
    ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
  );

-- Commercialization Requests
CREATE POLICY "View commercialization for own IP" ON public.commercialization_requests
  FOR SELECT USING (
    requester_user_id = auth.uid()
    OR ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create commercialization requests" ON public.commercialization_requests
  FOR INSERT WITH CHECK (requester_user_id = auth.uid());

-- IP Disputes
CREATE POLICY "View disputes for involved IP" ON public.ip_disputes
  FOR SELECT USING (
    raised_by = auth.uid()
    OR ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
    OR ip_record_id IN (
      SELECT ip_record_id FROM public.ip_contributors 
      WHERE scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can raise disputes" ON public.ip_disputes
  FOR INSERT WITH CHECK (raised_by = auth.uid());

-- Workspace Members
CREATE POLICY "Members can view membership" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can remove members" ON public.workspace_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
  );

-- Block Versions
CREATE POLICY "Members can view block versions" ON public.workspace_block_versions
  FOR SELECT USING (
    block_id IN (
      SELECT id FROM public.workspace_blocks 
      WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    )
  );

-- Workspace Discussions
CREATE POLICY "Members can view discussions" ON public.workspace_discussions
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
  );

CREATE POLICY "Members can create discussions" ON public.workspace_discussions
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
      workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
      OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
    )
  );

-- IP Contributors insert policy
CREATE POLICY "IP owners can add contributors" ON public.ip_contributors
  FOR INSERT WITH CHECK (
    ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
  );
