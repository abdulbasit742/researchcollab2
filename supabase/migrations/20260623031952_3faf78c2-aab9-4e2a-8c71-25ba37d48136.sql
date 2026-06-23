
ALTER TABLE public.grants
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS grant_type TEXT NOT NULL DEFAULT 'research';

GRANT SELECT ON public.grants TO anon;

CREATE TABLE IF NOT EXISTS public.saved_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  notes TEXT,
  reminder_date DATE,
  status TEXT NOT NULL DEFAULT 'saved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, grant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_grants TO authenticated;
GRANT ALL ON public.saved_grants TO service_role;
ALTER TABLE public.saved_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved grants" ON public.saved_grants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.grants (title, funder, description, amount_min, amount_max, currency, deadline, eligibility, fields, application_url, country, region, grant_type, is_active) VALUES
('NSF Graduate Research Fellowship', 'National Science Foundation', 'Three-year fellowship supporting outstanding graduate students pursuing research-based degrees in NSF-supported STEM fields.', 37000, 37000, 'USD', '2026-10-21', 'US citizens or permanent residents pursuing research-based MS or PhD', ARRAY['STEM','Engineering','Computer Science'], 'https://www.nsfgrfp.org', 'United States', 'North America', 'fellowship', true),
('Marie Skłodowska-Curie Postdoctoral Fellowships', 'European Commission', 'Funds excellent postdoctoral researchers worldwide for international and intersectoral mobility.', 100000, 250000, 'EUR', '2026-09-10', 'PhD holders with up to 8 years of research experience; mobility required', ARRAY['All Fields','Mobility'], 'https://marie-sklodowska-curie-actions.ec.europa.eu', 'European Union', 'Europe', 'fellowship', true),
('Fulbright Foreign Student Program', 'US Department of State', 'Grants for graduate study, advanced research, and teaching assistantships in the United States.', 25000, 75000, 'USD', '2026-05-15', 'International students with a bachelors degree and English proficiency', ARRAY['All Fields'], 'https://foreign.fulbrightonline.org', 'United States', 'Global', 'scholarship', true),
('Wellcome Trust Discovery Award', 'Wellcome Trust', 'Funds bold, creative research with potential for major impact on human and animal health.', 500000, 3000000, 'GBP', '2026-04-28', 'Researchers with a track record in health or life sciences at an eligible host org', ARRAY['Life Sciences','Health','Biomedical'], 'https://wellcome.org/grant-funding/schemes/discovery-awards', 'United Kingdom', 'Global', 'research', true),
('ERC Starting Grant', 'European Research Council', 'Supports early-career researchers to build their own team and pursue ground-breaking research.', 1500000, 1500000, 'EUR', '2026-10-15', '2-7 years post-PhD; host institution in EU or associated country', ARRAY['All Fields','Frontier Research'], 'https://erc.europa.eu/apply-grant/starting-grant', 'European Union', 'Europe', 'research', true),
('Gates Cambridge Scholarship', 'Bill & Melinda Gates Foundation', 'Full-cost postgraduate scholarships at the University of Cambridge.', 40000, 60000, 'GBP', '2026-12-03', 'Non-UK citizens with outstanding academic record and leadership potential', ARRAY['All Fields'], 'https://www.gatescambridge.org', 'United Kingdom', 'Global', 'scholarship', true),
('Grand Challenges Explorations', 'Gates Foundation', 'Funds bold ideas tackling critical health and development problems in low-income countries.', 100000, 1000000, 'USD', '2026-07-30', 'Open to researchers worldwide working on global health and development', ARRAY['Global Health','Development'], 'https://gcgh.grandchallenges.org', 'Global', 'Global', 'research', true),
('HEC Indigenous PhD Fellowship', 'Higher Education Commission Pakistan', 'Monthly stipend and research support for PhD scholars in Pakistani universities.', 60000, 60000, 'PKR', '2026-08-31', 'Pakistani citizens enrolled in PhD at HEC-recognized universities', ARRAY['All Fields'], 'https://www.hec.gov.pk', 'Pakistan', 'Asia', 'fellowship', true),
('DAAD Research Grants', 'German Academic Exchange Service', 'Funds research stays in Germany for doctoral candidates and young researchers.', 12000, 30000, 'EUR', '2026-11-15', 'International graduates, doctoral candidates, and postdocs', ARRAY['All Fields'], 'https://www.daad.de', 'Germany', 'Global', 'scholarship', true),
('Chevening Scholarships', 'UK Government / FCDO', 'Fully-funded one-year masters degrees in the UK for emerging leaders.', 30000, 50000, 'GBP', '2026-11-05', '2+ years work experience; leadership potential; return home after study', ARRAY['All Fields','Leadership'], 'https://www.chevening.org', 'United Kingdom', 'Global', 'scholarship', true),
('Schmidt Science Fellows', 'Schmidt Futures', 'Postdoctoral fellowship for scientists to expand into new disciplines.', 100000, 100000, 'USD', '2026-07-15', 'Recent or soon-to-graduate PhDs pivoting to interdisciplinary science', ARRAY['Natural Sciences','Interdisciplinary'], 'https://schmidtsciencefellows.org', 'Global', 'Global', 'fellowship', true),
('Open Philanthropy Early-Career Funding', 'Open Philanthropy', 'Rolling-deadline funding for promising early-career researchers in high-impact fields.', 50000, 300000, 'USD', '2026-12-31', 'Early-career researchers in AI safety, biosecurity, or global priorities', ARRAY['AI Safety','Biosecurity'], 'https://www.openphilanthropy.org', 'Global', 'Global', 'research', true);
