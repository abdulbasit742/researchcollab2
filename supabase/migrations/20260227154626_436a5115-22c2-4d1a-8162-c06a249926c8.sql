-- MPBSB: Master Product Build Sequencing Blueprint

CREATE TABLE IF NOT EXISTS mpbsb_phase_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id INTEGER NOT NULL UNIQUE,
  phase_code TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',
  completed_deliverables INTEGER DEFAULT 0,
  total_deliverables INTEGER NOT NULL,
  stability_gate_passed BOOLEAN DEFAULT false,
  stability_gate_notes TEXT,
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mpbsb_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id INTEGER NOT NULL,
  deliverable_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  evidence TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mpbsb_phase_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_phase INTEGER NOT NULL,
  to_phase INTEGER NOT NULL,
  transition_type TEXT NOT NULL DEFAULT 'advance',
  blockers_resolved JSONB DEFAULT '[]',
  approved_by TEXT,
  notes TEXT,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mpbsb_route_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path TEXT NOT NULL UNIQUE,
  pillar TEXT NOT NULL,
  phase_required INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE mpbsb_phase_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpbsb_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpbsb_phase_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpbsb_route_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth view phase status" ON mpbsb_phase_status FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage phase status" ON mpbsb_phase_status FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update phase status" ON mpbsb_phase_status FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view deliverables" ON mpbsb_deliverables FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage deliverables" ON mpbsb_deliverables FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update deliverables" ON mpbsb_deliverables FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view transitions" ON mpbsb_phase_transitions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage transitions" ON mpbsb_phase_transitions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view route mapping" ON mpbsb_route_mapping FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage route mapping" ON mpbsb_route_mapping FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update route mapping" ON mpbsb_route_mapping FOR UPDATE USING (auth.uid() IS NOT NULL);