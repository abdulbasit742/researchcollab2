
-- Document audit logs
CREATE TABLE public.document_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document templates
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content JSONB NOT NULL,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document collaborators for access control
CREATE TABLE public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'suggest', 'edit', 'admin')),
  added_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Enable RLS
ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS: audit logs
CREATE POLICY "Document owners and admins can view audit logs" ON public.document_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.document_collaborators dc WHERE dc.document_id = document_audit_logs.document_id AND dc.user_id = auth.uid() AND dc.permission_level = 'admin')
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Authenticated users can insert audit logs" ON public.document_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: templates
CREATE POLICY "Anyone can view active templates" ON public.document_templates
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.document_templates
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: collaborators
CREATE POLICY "Users can see collaborators on their documents" ON public.document_collaborators
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
  );

CREATE POLICY "Document owners can manage collaborators" ON public.document_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
  );

CREATE POLICY "Document owners can delete collaborators" ON public.document_collaborators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
  );

-- Seed default templates
INSERT INTO public.document_templates (name, description, category, content, icon_name) VALUES
('FYP Proposal', 'Standard Final Year Project proposal template.', 'fyp', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Project Proposal"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Abstract"}]},{"type":"paragraph","content":[{"type":"text","text":"Provide a brief summary..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Problem Statement"}]},{"type":"paragraph","content":[{"type":"text","text":"Describe the problem..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Methodology"}]},{"type":"paragraph","content":[{"type":"text","text":"Outline your approach..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Timeline"}]},{"type":"paragraph","content":[{"type":"text","text":"List milestones..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Budget"}]},{"type":"paragraph","content":[{"type":"text","text":"Cost breakdown..."}]}]}', 'FileText'),
('Milestone Report', 'Project milestone completion report.', 'fyp', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Milestone Report"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Overview"}]},{"type":"paragraph","content":[{"type":"text","text":"Describe milestone..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Deliverables"}]},{"type":"paragraph","content":[{"type":"text","text":"List deliverables..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Outcomes"}]},{"type":"paragraph","content":[{"type":"text","text":"Summarize outcomes..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Next Steps"}]},{"type":"paragraph","content":[{"type":"text","text":"Next actions..."}]}]}', 'BookOpen'),
('Sponsor Agreement', 'Sponsor-university project agreement template.', 'contract', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Sponsor Agreement"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Parties"}]},{"type":"paragraph","content":[{"type":"text","text":"Agreement between..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Scope of Work"}]},{"type":"paragraph","content":[{"type":"text","text":"Deliverables..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Financial Terms"}]},{"type":"paragraph","content":[{"type":"text","text":"Funding amount..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"IP Terms"}]},{"type":"paragraph","content":[{"type":"text","text":"IP ownership..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Signatures"}]},{"type":"paragraph","content":[{"type":"text","text":"Authorized signatures..."}]}]}', 'FileText'),
('Innovation Challenge Brief', 'Corporate innovation challenge template.', 'corporate', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Innovation Challenge Brief"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Challenge Overview"}]},{"type":"paragraph","content":[{"type":"text","text":"Describe challenge..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Expected Outcomes"}]},{"type":"paragraph","content":[{"type":"text","text":"Desired outcomes..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Evaluation Criteria"}]},{"type":"paragraph","content":[{"type":"text","text":"Judging criteria..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Timeline & Rewards"}]},{"type":"paragraph","content":[{"type":"text","text":"Schedule and prizes..."}]}]}', 'Sparkles'),
('Capital Allocation Memo', 'Internal capital allocation decision memo.', 'capital', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Capital Allocation Memo"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Summary"}]},{"type":"paragraph","content":[{"type":"text","text":"Allocation overview..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Rationale"}]},{"type":"paragraph","content":[{"type":"text","text":"Justification..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Risk Assessment"}]},{"type":"paragraph","content":[{"type":"text","text":"Risks..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Expected ROI"}]},{"type":"paragraph","content":[{"type":"text","text":"Returns..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Approval"}]},{"type":"paragraph","content":[{"type":"text","text":"Approvals needed..."}]}]}', 'Wallet'),
('Startup Pitch Deck', 'Spin-off startup pitch document.', 'spinoff', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Startup Pitch Deck"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Problem"}]},{"type":"paragraph","content":[{"type":"text","text":"Problem we solve..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Solution"}]},{"type":"paragraph","content":[{"type":"text","text":"Our approach..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Market"}]},{"type":"paragraph","content":[{"type":"text","text":"Market size..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Traction"}]},{"type":"paragraph","content":[{"type":"text","text":"Key metrics..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Team"}]},{"type":"paragraph","content":[{"type":"text","text":"Founders..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Ask"}]},{"type":"paragraph","content":[{"type":"text","text":"Funding requirements..."}]}]}', 'Rocket'),
('Compliance Report', 'Regulatory compliance report for PPP.', 'compliance', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Compliance Report"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Executive Summary"}]},{"type":"paragraph","content":[{"type":"text","text":"Compliance status..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Findings"}]},{"type":"paragraph","content":[{"type":"text","text":"Detailed findings..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Risk Areas"}]},{"type":"paragraph","content":[{"type":"text","text":"Risks identified..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Recommendations"}]},{"type":"paragraph","content":[{"type":"text","text":"Actions recommended..."}]}]}', 'Shield');
