
-- =====================================================
-- PHASE 8: COMPLETE PLATFORM EXPANSION
-- Academic Forge Flow - Full Production System
-- =====================================================

-- =====================================================
-- SECTION 1: ADVANCED PROFILE SYSTEM
-- =====================================================

-- Profile headers for professional branding
CREATE TABLE public.profile_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  headline TEXT,
  summary_bio TEXT,
  cover_image_url TEXT,
  location TEXT,
  open_to_collaboration BOOLEAN DEFAULT true,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  orcid_id TEXT,
  google_scholar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work & research experience timeline
CREATE TABLE public.profile_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  experience_type TEXT NOT NULL DEFAULT 'academic' CHECK (experience_type IN ('academic', 'industry', 'research', 'teaching', 'consulting')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Academic education background
CREATE TABLE public.profile_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  grade_or_gpa TEXT,
  description TEXT,
  activities TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Certifications & licenses
CREATE TABLE public.profile_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_body TEXT NOT NULL,
  issue_date DATE,
  expiration_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Language proficiency
CREATE TABLE public.profile_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('basic', 'conversational', 'fluent', 'native')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, language)
);

-- Volunteering & community work
CREATE TABLE public.profile_volunteering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  cause TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Interests & causes
CREATE TABLE public.profile_causes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cause_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cause_name)
);

-- =====================================================
-- SECTION 2: PUBLICATIONS SYSTEM
-- =====================================================

-- Core publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  publication_type TEXT NOT NULL CHECK (publication_type IN ('journal', 'conference', 'preprint', 'thesis', 'report', 'dataset', 'book', 'chapter')),
  publication_date DATE,
  journal_or_venue TEXT,
  doi TEXT UNIQUE,
  external_url TEXT,
  pdf_url TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Co-author linking
CREATE TABLE public.publication_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  author_order INTEGER NOT NULL DEFAULT 1,
  affiliation TEXT,
  is_corresponding_author BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Publication claim workflow
CREATE TABLE public.publication_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  claimant_user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Publication metrics
CREATE TABLE public.publication_metrics (
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE PRIMARY KEY,
  views_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Publication verifications
CREATE TABLE public.publication_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  verification_source TEXT NOT NULL CHECK (verification_source IN ('doi', 'organization', 'admin', 'peer')),
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SECTION 3: GROUPS & COMMUNITIES SYSTEM
-- =====================================================

-- Core groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  group_type TEXT NOT NULL CHECK (group_type IN ('research_topic', 'university', 'lab', 'interest', 'project', 'reading_group')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  rules TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group membership
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'blocked')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Group posts
CREATE TABLE public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'announcement', 'resource', 'question', 'poll')),
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group post comments
CREATE TABLE public.group_post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.group_post_comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group invitations
CREATE TABLE public.group_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id),
  invitee_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, invitee_id)
);

-- =====================================================
-- SECTION 4: EVENTS SYSTEM
-- =====================================================

-- Core events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('conference', 'webinar', 'workshop', 'meetup', 'call_for_papers', 'seminar', 'defense')),
  mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'offline', 'hybrid')),
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  timezone TEXT DEFAULT 'UTC',
  location_text TEXT,
  meeting_link TEXT,
  organizer_user_id UUID REFERENCES public.profiles(id),
  organizer_org_id UUID REFERENCES public.organizations(id),
  group_id UUID REFERENCES public.groups(id),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'group', 'organization')),
  cover_image_url TEXT,
  max_attendees INTEGER,
  registration_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event attendees
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going', 'attended')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event speakers
CREATE TABLE public.event_speakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  speaker_name TEXT NOT NULL,
  title_or_affiliation TEXT,
  bio TEXT,
  speaker_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event reminders
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  reminder_offset_minutes INTEGER DEFAULT 60,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event reports
CREATE TABLE public.event_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SECTION 5: ENHANCED NOTIFICATIONS SYSTEM
-- =====================================================

-- Notification types registry
CREATE TABLE public.notification_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('social', 'projects', 'messages', 'events', 'groups', 'publications', 'system', 'admin')),
  title_template TEXT NOT NULL,
  body_template TEXT,
  default_in_app BOOLEAN DEFAULT true,
  default_email BOOLEAN DEFAULT false,
  default_push BOOLEAN DEFAULT false,
  importance TEXT DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User notification preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type_id UUID NOT NULL REFERENCES public.notification_types(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_type_id)
);

-- Notification deliveries tracking
CREATE TABLE public.notification_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  attempted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Global notification settings
CREATE TABLE public.notification_global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  do_not_disturb BOOLEAN DEFAULT false,
  dnd_start_time TIME,
  dnd_end_time TIME,
  email_digest_frequency TEXT DEFAULT 'instant' CHECK (email_digest_frequency IN ('instant', 'daily', 'weekly', 'never')),
  muted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SECTION 6: MOCK DATA REPLACEMENT TABLES
-- =====================================================

-- Grants & funding opportunities
CREATE TABLE public.grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  funder TEXT NOT NULL,
  description TEXT,
  amount_min NUMERIC,
  amount_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  deadline DATE,
  eligibility TEXT,
  fields TEXT[],
  application_url TEXT,
  is_active BOOLEAN DEFAULT true,
  posted_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant bookmarks
CREATE TABLE public.grant_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(grant_id, user_id)
);

-- Blog posts (CMS)
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job postings
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  posted_by UUID REFERENCES public.profiles(id),
  job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'fellowship', 'postdoc', 'research_assistant')),
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  requirements TEXT,
  skills_required TEXT[],
  application_url TEXT,
  deadline DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Saved jobs
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Job applications
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- FYP Services marketplace
CREATE TABLE public.fyp_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT CHECK (service_type IN ('supervision', 'consultation', 'review', 'mentoring', 'writing_help', 'data_analysis')),
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  delivery_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FYP Requests
CREATE TABLE public.fyp_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id UUID REFERENCES public.fyp_services(id),
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC,
  deadline DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Match results storage
CREATE TABLE public.ai_match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  matched_user_id UUID NOT NULL REFERENCES public.profiles(id),
  match_score NUMERIC NOT NULL,
  match_reasons JSONB,
  algorithm_version TEXT DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '7 days',
  UNIQUE(user_id, matched_user_id)
);

-- Collaboration tracking (replacing mock)
CREATE TABLE public.collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  collaboration_type TEXT CHECK (collaboration_type IN ('research', 'project', 'publication', 'grant', 'teaching', 'consulting')),
  status TEXT DEFAULT 'active' CHECK (status IN ('proposed', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Collaboration members
CREATE TABLE public.collaboration_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collaboration_id, user_id)
);

-- =====================================================
-- SECTION 7: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profile_experiences_user ON profile_experiences(user_id);
CREATE INDEX idx_profile_education_user ON profile_education(user_id);
CREATE INDEX idx_profile_certifications_user ON profile_certifications(user_id);
CREATE INDEX idx_publications_date ON publications(publication_date DESC);
CREATE INDEX idx_publication_authors_pub ON publication_authors(publication_id);
CREATE INDEX idx_publication_authors_user ON publication_authors(user_id);
CREATE INDEX idx_groups_type ON groups(group_type);
CREATE INDEX idx_groups_visibility ON groups(visibility);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_posts_group ON group_posts(group_id);
CREATE INDEX idx_events_start ON events(start_datetime);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_grants_deadline ON grants(deadline);
CREATE INDEX idx_job_postings_active ON job_postings(is_active, created_at DESC);
CREATE INDEX idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX idx_collaborations_status ON collaborations(status);
CREATE INDEX idx_ai_match_results_user ON ai_match_results(user_id, match_score DESC);

-- =====================================================
-- SECTION 8: ROW LEVEL SECURITY
-- =====================================================

-- Profile headers
ALTER TABLE public.profile_headers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable" ON profile_headers FOR SELECT USING (true);
CREATE POLICY "Users manage own header" ON profile_headers FOR ALL USING (auth.uid() = user_id);

-- Profile experiences
ALTER TABLE public.profile_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public experiences viewable" ON profile_experiences FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users manage own experiences" ON profile_experiences FOR ALL USING (auth.uid() = user_id);

-- Profile education
ALTER TABLE public.profile_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public education viewable" ON profile_education FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users manage own education" ON profile_education FOR ALL USING (auth.uid() = user_id);

-- Profile certifications
ALTER TABLE public.profile_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public certs viewable" ON profile_certifications FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users manage own certs" ON profile_certifications FOR ALL USING (auth.uid() = user_id);

-- Profile languages
ALTER TABLE public.profile_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Languages viewable" ON profile_languages FOR SELECT USING (true);
CREATE POLICY "Users manage own languages" ON profile_languages FOR ALL USING (auth.uid() = user_id);

-- Profile volunteering
ALTER TABLE public.profile_volunteering ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public volunteering viewable" ON profile_volunteering FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users manage own volunteering" ON profile_volunteering FOR ALL USING (auth.uid() = user_id);

-- Profile causes
ALTER TABLE public.profile_causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Causes viewable" ON profile_causes FOR SELECT USING (true);
CREATE POLICY "Users manage own causes" ON profile_causes FOR ALL USING (auth.uid() = user_id);

-- Publications
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public publications viewable" ON publications FOR SELECT USING (visibility = 'public');
CREATE POLICY "Authors can manage" ON publications FOR ALL USING (
  EXISTS (SELECT 1 FROM publication_authors WHERE publication_id = publications.id AND user_id = auth.uid())
);

-- Publication authors
ALTER TABLE public.publication_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors viewable" ON publication_authors FOR SELECT USING (true);
CREATE POLICY "Authors can manage own entries" ON publication_authors FOR ALL USING (user_id = auth.uid());

-- Publication claims
ALTER TABLE public.publication_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Claims viewable by involved" ON publication_claims FOR SELECT USING (claimant_user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Users can create claims" ON publication_claims FOR INSERT WITH CHECK (claimant_user_id = auth.uid());

-- Publication metrics
ALTER TABLE public.publication_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Metrics viewable" ON publication_metrics FOR SELECT USING (true);

-- Publication verifications
ALTER TABLE public.publication_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verifications viewable" ON publication_verifications FOR SELECT USING (true);

-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public groups viewable" ON groups FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage groups" ON groups FOR UPDATE USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'admin')
);

-- Group members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable in public groups" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM groups WHERE id = group_id AND visibility = 'public') OR user_id = auth.uid()
);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (user_id = auth.uid());

-- Group posts
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group posts viewable by members" ON group_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "Members can post" ON group_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "Authors can edit own posts" ON group_posts FOR UPDATE USING (author_id = auth.uid());

-- Group post comments
ALTER TABLE public.group_post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable" ON group_post_comments FOR SELECT USING (true);
CREATE POLICY "Members can comment" ON group_post_comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Group invitations
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invitations viewable by involved" ON group_invitations FOR SELECT USING (inviter_id = auth.uid() OR invitee_id = auth.uid());
CREATE POLICY "Members can invite" ON group_invitations FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public events viewable" ON events FOR SELECT USING (visibility = 'public' OR organizer_user_id = auth.uid());
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (organizer_user_id = auth.uid());
CREATE POLICY "Organizers can manage" ON events FOR UPDATE USING (organizer_user_id = auth.uid());

-- Event attendees
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendees viewable" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON event_attendees FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update RSVP" ON event_attendees FOR UPDATE USING (user_id = auth.uid());

-- Event speakers
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Speakers viewable" ON event_speakers FOR SELECT USING (true);

-- Event reminders
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON event_reminders FOR ALL USING (user_id = auth.uid());

-- Event reports
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can report" ON event_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins view reports" ON event_reports FOR SELECT USING (is_admin(auth.uid()));

-- Notification types
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Types viewable" ON notification_types FOR SELECT USING (true);

-- Notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs" ON notification_preferences FOR ALL USING (user_id = auth.uid());

-- Notification deliveries
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own deliveries" ON notification_deliveries FOR SELECT USING (
  EXISTS (SELECT 1 FROM notifications WHERE id = notification_id AND user_id = auth.uid())
);

-- Global notification settings
ALTER TABLE public.notification_global_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON notification_global_settings FOR ALL USING (user_id = auth.uid());

-- Grants
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active grants viewable" ON grants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage grants" ON grants FOR ALL USING (is_admin(auth.uid()));

-- Grant bookmarks
ALTER TABLE public.grant_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON grant_bookmarks FOR ALL USING (user_id = auth.uid());

-- Blog posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts viewable" ON blog_posts FOR SELECT USING (status = 'published' OR author_id = auth.uid());
CREATE POLICY "Authors manage own posts" ON blog_posts FOR ALL USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- Job postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active jobs viewable" ON job_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Posters manage jobs" ON job_postings FOR ALL USING (posted_by = auth.uid() OR is_admin(auth.uid()));

-- Saved jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage saved jobs" ON saved_jobs FOR ALL USING (user_id = auth.uid());

-- Job applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own applications" ON job_applications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Posters view applications" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM job_postings WHERE id = job_id AND posted_by = auth.uid())
);

-- FYP Services
ALTER TABLE public.fyp_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active services viewable" ON fyp_services FOR SELECT USING (is_active = true);
CREATE POLICY "Providers manage services" ON fyp_services FOR ALL USING (provider_id = auth.uid());

-- FYP Requests
ALTER TABLE public.fyp_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open requests viewable" ON fyp_requests FOR SELECT USING (status = 'open' OR requester_id = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users manage own requests" ON fyp_requests FOR ALL USING (requester_id = auth.uid());

-- AI Match Results
ALTER TABLE public.ai_match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own matches" ON ai_match_results FOR SELECT USING (user_id = auth.uid());

-- Collaborations
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborations viewable by members" ON collaborations FOR SELECT USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM collaboration_members WHERE collaboration_id = collaborations.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create collaborations" ON collaborations FOR INSERT WITH CHECK (created_by = auth.uid());

-- Collaboration members
ALTER TABLE public.collaboration_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable" ON collaboration_members FOR SELECT USING (true);
CREATE POLICY "Collaboration admins can manage" ON collaboration_members FOR ALL USING (
  EXISTS (SELECT 1 FROM collaborations WHERE id = collaboration_id AND created_by = auth.uid())
);

-- =====================================================
-- SECTION 9: SEED NOTIFICATION TYPES
-- =====================================================

INSERT INTO notification_types (key, category, title_template, body_template, importance) VALUES
-- Social
('new_follower', 'social', 'New Follower', '{{actor}} started following you', 'normal'),
('connection_request', 'social', 'Connection Request', '{{actor}} wants to connect', 'normal'),
('connection_accepted', 'social', 'Connection Accepted', '{{actor}} accepted your connection request', 'normal'),
('post_liked', 'social', 'Post Liked', '{{actor}} liked your post', 'low'),
('post_commented', 'social', 'New Comment', '{{actor}} commented on your post', 'normal'),
('post_shared', 'social', 'Post Shared', '{{actor}} shared your post', 'normal'),
('mention', 'social', 'You were mentioned', '{{actor}} mentioned you in a post', 'normal'),
-- Professional
('skill_endorsed', 'social', 'Skill Endorsed', '{{actor}} endorsed your {{skill}} skill', 'normal'),
('recommendation_received', 'social', 'New Recommendation', '{{actor}} wrote you a recommendation', 'high'),
('recommendation_request', 'social', 'Recommendation Request', '{{actor}} requested a recommendation', 'normal'),
('publication_claimed', 'publications', 'Publication Claimed', '{{actor}} claimed authorship on {{publication}}', 'high'),
('publication_verified', 'publications', 'Publication Verified', 'Your publication has been verified', 'high'),
-- Projects
('new_bid', 'projects', 'New Bid', '{{actor}} placed a bid on your project', 'high'),
('offer_received', 'projects', 'Offer Received', '{{actor}} sent you an offer', 'high'),
('milestone_approved', 'projects', 'Milestone Approved', 'Your milestone was approved', 'high'),
('escrow_released', 'projects', 'Payment Released', 'Funds have been released to your wallet', 'critical'),
('dispute_update', 'projects', 'Dispute Update', 'There is an update on your dispute', 'high'),
-- Groups
('group_invitation', 'groups', 'Group Invitation', '{{actor}} invited you to join {{group}}', 'normal'),
('group_post', 'groups', 'New Group Post', '{{actor}} posted in {{group}}', 'low'),
('group_announcement', 'groups', 'Group Announcement', 'New announcement in {{group}}', 'normal'),
-- Events
('event_invitation', 'events', 'Event Invitation', '{{actor}} invited you to {{event}}', 'normal'),
('event_reminder', 'events', 'Event Reminder', '{{event}} is starting soon', 'high'),
('event_update', 'events', 'Event Updated', '{{event}} details have changed', 'normal'),
('event_cancelled', 'events', 'Event Cancelled', '{{event}} has been cancelled', 'high'),
-- Messages
('new_message', 'messages', 'New Message', '{{actor}} sent you a message', 'normal'),
('message_reaction', 'messages', 'Message Reaction', '{{actor}} reacted to your message', 'low'),
-- System
('verification_approved', 'system', 'Verification Approved', 'Your verification has been approved', 'high'),
('verification_rejected', 'system', 'Verification Rejected', 'Your verification was not approved', 'high'),
('profile_view', 'system', 'Profile Viewed', 'Someone viewed your profile', 'low'),
('security_alert', 'system', 'Security Alert', 'Unusual activity detected on your account', 'critical'),
-- Admin
('admin_notice', 'admin', 'Admin Notice', '{{message}}', 'high'),
('policy_update', 'admin', 'Policy Update', 'Platform policies have been updated', 'normal');

-- =====================================================
-- SECTION 10: HELPER FUNCTIONS
-- =====================================================

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.group_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = NEW.group_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_group_member_count
AFTER INSERT OR UPDATE OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('going', 'interested') THEN
    UPDATE events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('going', 'interested') THEN
    UPDATE events SET attendee_count = GREATEST(attendee_count - 1, 0) WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('going', 'interested') AND NEW.status IN ('going', 'interested') THEN
      UPDATE events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
    ELSIF OLD.status IN ('going', 'interested') AND NEW.status NOT IN ('going', 'interested') THEN
      UPDATE events SET attendee_count = GREATEST(attendee_count - 1, 0) WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_event_attendee_count
AFTER INSERT OR UPDATE OR DELETE ON event_attendees
FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_total INTEGER := 100;
BEGIN
  -- Basic profile (20 points)
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND full_name IS NOT NULL) THEN v_score := v_score + 10; END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND avatar_url IS NOT NULL) THEN v_score := v_score + 10; END IF;
  
  -- Profile header (15 points)
  IF EXISTS (SELECT 1 FROM profile_headers WHERE user_id = p_user_id AND headline IS NOT NULL) THEN v_score := v_score + 10; END IF;
  IF EXISTS (SELECT 1 FROM profile_headers WHERE user_id = p_user_id AND summary_bio IS NOT NULL) THEN v_score := v_score + 5; END IF;
  
  -- Experience (15 points)
  IF EXISTS (SELECT 1 FROM profile_experiences WHERE user_id = p_user_id) THEN v_score := v_score + 15; END IF;
  
  -- Education (15 points)
  IF EXISTS (SELECT 1 FROM profile_education WHERE user_id = p_user_id) THEN v_score := v_score + 15; END IF;
  
  -- Skills (15 points)
  IF EXISTS (SELECT 1 FROM user_skills WHERE user_id = p_user_id) THEN v_score := v_score + 15; END IF;
  
  -- Publications (10 points)
  IF EXISTS (SELECT 1 FROM publication_authors WHERE user_id = p_user_id) THEN v_score := v_score + 10; END IF;
  
  -- Languages (5 points)
  IF EXISTS (SELECT 1 FROM profile_languages WHERE user_id = p_user_id) THEN v_score := v_score + 5; END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE group_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE group_post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendees;
