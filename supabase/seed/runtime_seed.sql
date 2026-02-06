-- Runtime Seed Data for Edge Function Testing
-- These UUIDs are canonical test fixtures

-- =============================================================================
-- CANONICAL TEST USERS (for auth.users reference)
-- Note: These must be created via auth API, not direct insert
-- =============================================================================

-- Admin User ID: 11111111-1111-1111-1111-111111111111
-- Researcher User ID: 22222222-2222-2222-2222-222222222222  
-- Student User ID: 33333333-3333-3333-3333-333333333333
-- Client User ID: 44444444-4444-4444-4444-444444444444

-- =============================================================================
-- PROFILES
-- =============================================================================

INSERT INTO public.profiles (id, full_name, university, department, education_level, interests, skills, hourly_rate, is_active, onboarding_complete)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'Platform University', 'Administration', 'doctorate', ARRAY['governance', 'platform-management'], ARRAY['administration', 'oversight'], 0, true, true),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Research Pro', 'MIT', 'Computer Science', 'doctorate', ARRAY['machine-learning', 'nlp', 'data-science'], ARRAY['python', 'tensorflow', 'research', 'data-analysis'], 5000, true, true),
  ('33333333-3333-3333-3333-333333333333', 'Student Learner', 'LUMS', 'Computer Science', 'bachelors', ARRAY['web-development', 'react', 'typescript'], ARRAY['react', 'typescript', 'nodejs', 'web-development'], 2000, true, true),
  ('44444444-4444-4444-4444-444444444444', 'Project Client', 'Industry Corp', 'Product', 'masters', ARRAY['product-management', 'research'], ARRAY['product', 'research', 'strategy'], 0, true, true)
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  skills = EXCLUDED.skills,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

INSERT INTO public.organizations (id, name, organization_type, description, is_verified)
VALUES 
  ('aaaa1111-1111-1111-1111-111111111111', 'MIT Research Lab', 'university', 'Leading research institution', true),
  ('aaaa2222-2222-2222-2222-222222222222', 'Industry Corp', 'company', 'Technology company seeking research', true),
  ('aaaa3333-3333-3333-3333-333333333333', 'LUMS', 'university', 'Lahore University of Management Sciences', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  is_verified = EXCLUDED.is_verified;

-- =============================================================================
-- USER TRUST PROFILES
-- =============================================================================

INSERT INTO public.user_trust_profiles (user_id, trust_score, trust_tier, is_verified_student, is_verified_researcher, is_frozen)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 100, 'platinum', false, false, false),
  ('22222222-2222-2222-2222-222222222222', 85, 'platinum', false, true, false),
  ('33333333-3333-3333-3333-333333333333', 45, 'silver', true, false, false),
  ('44444444-4444-4444-4444-444444444444', 60, 'gold', false, false, false)
ON CONFLICT (user_id) DO UPDATE SET 
  trust_score = EXCLUDED.trust_score,
  trust_tier = EXCLUDED.trust_tier;

-- =============================================================================
-- TRUST SCORE COMPONENTS
-- =============================================================================

INSERT INTO public.trust_score_components (user_id, projects_completed, projects_failed, on_time_rate, escrow_releases_successful, disputes_raised, disputes_lost, avg_peer_rating, verifications_count, active_months)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 15, 1, 92, 14, 0, 0, 4.8, 2, 24),
  ('33333333-3333-3333-3333-333333333333', 3, 0, 85, 3, 0, 0, 4.2, 1, 6),
  ('44444444-4444-4444-4444-444444444444', 5, 0, 90, 5, 1, 0, 4.5, 1, 12)
ON CONFLICT (user_id) DO UPDATE SET 
  projects_completed = EXCLUDED.projects_completed,
  on_time_rate = EXCLUDED.on_time_rate;

-- =============================================================================
-- CONSEQUENCE LEDGERS (for career-copilot)
-- =============================================================================

INSERT INTO public.consequence_ledgers (user_id, projects_completed, projects_failed, completion_rate, on_time_rate, total_escrow_released, disputes_won, disputes_lost, trust_trajectory)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 15, 1, 94, 92, 750000, 0, 0, 'rising'),
  ('33333333-3333-3333-3333-333333333333', 3, 0, 100, 85, 60000, 0, 0, 'rising'),
  ('44444444-4444-4444-4444-444444444444', 5, 0, 100, 90, 0, 1, 0, 'stable')
ON CONFLICT (user_id) DO UPDATE SET 
  projects_completed = EXCLUDED.projects_completed,
  trust_trajectory = EXCLUDED.trust_trajectory;

-- =============================================================================
-- WALLETS
-- =============================================================================

INSERT INTO public.wallets (id, user_id, available_balance, pending_balance, total_earned, total_withdrawn, currency)
VALUES 
  ('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 50000, 25000, 750000, 675000, 'PKR'),
  ('bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 15000, 5000, 60000, 40000, 'PKR'),
  ('bbbb3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 100000, 0, 0, 0, 'PKR')
ON CONFLICT (id) DO UPDATE SET 
  available_balance = EXCLUDED.available_balance;

-- =============================================================================
-- OFFERS (for deal-runtime and market-balancer)
-- =============================================================================

INSERT INTO public.offers (id, sender_id, recipient_id, title, description, amount, status, required_skills)
VALUES 
  ('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'React Dashboard Development', 'Build a data visualization dashboard using React and TypeScript', 50000, 'open', ARRAY['react', 'typescript', 'data-visualization']),
  ('cccc2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'ML Research Paper Analysis', 'Analyze and summarize 50 research papers on NLP', 75000, 'active', ARRAY['machine-learning', 'nlp', 'research']),
  ('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Node.js API Development', 'Build REST API for mobile application', 40000, 'proposed', ARRAY['nodejs', 'api', 'backend'])
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  required_skills = EXCLUDED.required_skills;

-- =============================================================================
-- MILESTONES (for deal-runtime)
-- =============================================================================

INSERT INTO public.milestones (id, offer_id, title, amount, status, due_date, order_index)
VALUES 
  ('dddd1111-1111-1111-1111-111111111111', 'cccc2222-2222-2222-2222-222222222222', 'Initial Analysis', 25000, 'in_progress', NOW() + INTERVAL '7 days', 0),
  ('dddd2222-2222-2222-2222-222222222222', 'cccc2222-2222-2222-2222-222222222222', 'Summary Report', 25000, 'pending', NOW() + INTERVAL '14 days', 1),
  ('dddd3333-3333-3333-3333-333333333333', 'cccc2222-2222-2222-2222-222222222222', 'Final Presentation', 25000, 'pending', NOW() + INTERVAL '21 days', 2),
  ('dddd4444-4444-4444-4444-444444444444', 'cccc3333-3333-3333-3333-333333333333', 'API Design', 15000, 'pending', NOW() + INTERVAL '5 days', 0),
  ('dddd5555-5555-5555-5555-555555555555', 'cccc3333-3333-3333-3333-333333333333', 'Implementation', 25000, 'pending', NOW() + INTERVAL '15 days', 1)
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status;

-- =============================================================================
-- EARNING PROJECTS (for notify-new-bid, career-copilot)
-- =============================================================================

INSERT INTO public.earning_projects (id, owner_id, title, description, budget_min, budget_max, deadline_days, status, tags)
VALUES 
  ('eeee1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Website Redesign', 'Modernize company website with new branding', 30000, 50000, 30, 'open', ARRAY['web-design', 'frontend', 'ui-ux']),
  ('eeee2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Data Analysis Project', 'Analyze customer data for insights', 20000, 35000, 14, 'open', ARRAY['data-analysis', 'python', 'statistics']),
  ('eeee3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Research Collaboration', 'Joint research paper on AI ethics', 0, 0, 90, 'open', ARRAY['research', 'ai', 'ethics'])
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status;

-- =============================================================================
-- ACCOUNTABILITY RECORDS (for career-copilot)
-- =============================================================================

INSERT INTO public.accountability_records (id, initiator_id, executor_id, outcome_status, promised_deliverables, collaboration_type)
VALUES 
  ('ffff1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'completed', ARRAY['Research report', 'Data analysis', 'Presentation'], 'paid_project'),
  ('ffff2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'completed', ARRAY['Literature review', 'Summary document'], 'paid_project'),
  ('ffff3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'completed', ARRAY['React components', 'API integration'], 'paid_project')
ON CONFLICT (id) DO UPDATE SET 
  outcome_status = EXCLUDED.outcome_status;

-- =============================================================================
-- TRUST EVENTS (for compute-trust history)
-- =============================================================================

INSERT INTO public.trust_events (id, user_id, event_type, event_source, trust_delta, trust_before, trust_after, evidence_summary)
VALUES 
  ('1111aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'project_completed', 'deal_runtime', 5, 80, 85, 'Successfully completed ML analysis project'),
  ('2222aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'payment_received', 'deal_runtime', 3, 42, 45, 'Payment released for React components'),
  ('3333aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'deal_completed', 'deal_runtime', 3, 57, 60, 'Completed deal as client')
ON CONFLICT (id) DO UPDATE SET 
  trust_after = EXCLUDED.trust_after;

-- =============================================================================
-- MESSAGES (for ambient-analyzer relationship entropy)
-- =============================================================================

INSERT INTO public.messages (id, sender_id, recipient_id, content, created_at)
VALUES 
  ('gggg1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Project update: Initial analysis complete', NOW() - INTERVAL '2 days'),
  ('gggg2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Great work! Looking forward to the summary', NOW() - INTERVAL '1 day'),
  ('gggg3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Just submitted the components for review', NOW() - INTERVAL '3 days'),
  ('gggg4444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Welcome to the platform! Let me know if you need guidance', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content;

-- =============================================================================
-- VOICE NOTES (metadata only, for transcribe-voice-note)
-- =============================================================================

INSERT INTO public.voice_notes (id, user_id, storage_path, duration_seconds, created_at)
VALUES 
  ('hhhh1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'voice-notes/test-recording.webm', 30, NOW())
ON CONFLICT (id) DO UPDATE SET 
  storage_path = EXCLUDED.storage_path;

-- =============================================================================
-- DEAL ROOMS (for ambient-analyzer deal health)
-- =============================================================================

INSERT INTO public.deal_rooms (id, title, buyer_id, seller_id, status, created_at)
VALUES 
  ('iiii1111-1111-1111-1111-111111111111', 'ML Research Collaboration', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'active', NOW() - INTERVAL '10 days'),
  ('iiii2222-2222-2222-2222-222222222222', 'React Dashboard Project', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'negotiating', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status;

-- =============================================================================
-- CONNECTION REQUESTS (for generate-audio-briefing)
-- =============================================================================

INSERT INTO public.connection_requests (id, sender_id, receiver_id, status, created_at, updated_at)
VALUES 
  ('jjjj1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'accepted', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days'),
  ('jjjj2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'accepted', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
  ('jjjj3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status;

-- =============================================================================
-- OFFER INTEREST (for generate-audio-briefing)
-- =============================================================================

INSERT INTO public.offer_interest (id, offer_id, user_id, status, created_at)
VALUES 
  ('kkkk1111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'pending', NOW() - INTERVAL '1 day'),
  ('kkkk2222-2222-2222-2222-222222222222', 'cccc1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Runtime seed data inserted successfully!';
  RAISE NOTICE 'Test Users:';
  RAISE NOTICE '  Admin: 11111111-1111-1111-1111-111111111111';
  RAISE NOTICE '  Researcher: 22222222-2222-2222-2222-222222222222';
  RAISE NOTICE '  Student: 33333333-3333-3333-3333-333333333333';
  RAISE NOTICE '  Client: 44444444-4444-4444-4444-444444444444';
END $$;
