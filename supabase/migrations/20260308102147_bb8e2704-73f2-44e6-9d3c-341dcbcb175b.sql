
-- Scientific Infrastructure Marketplace (SIM) tables

-- 1. Facility/equipment listings
CREATE TABLE public.sim_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'equipment',
  resource_type TEXT NOT NULL DEFAULT 'lab_equipment',
  location_city TEXT,
  location_country TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available',
  hourly_rate NUMERIC DEFAULT 0,
  daily_rate NUMERIC DEFAULT 0,
  monthly_rate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  capacity_units INTEGER DEFAULT 1,
  min_booking_hours INTEGER DEFAULT 1,
  max_booking_days INTEGER DEFAULT 30,
  requires_training BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bookings
CREATE TABLE public.sim_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.sim_listings(id) ON DELETE CASCADE,
  booker_id UUID NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  purpose TEXT,
  project_reference TEXT,
  special_requirements TEXT,
  cancellation_reason TEXT,
  rating INTEGER,
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Reviews
CREATE TABLE public.sim_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.sim_listings(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.sim_bookings(id),
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  equipment_quality INTEGER,
  facility_cleanliness INTEGER,
  staff_helpfulness INTEGER,
  value_for_money INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Analytics
CREATE TABLE public.sim_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  dimension TEXT,
  dimension_value TEXT,
  period TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.sim_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sim_listings_read" ON public.sim_listings FOR SELECT USING (true);
CREATE POLICY "sim_listings_insert" ON public.sim_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "sim_listings_update" ON public.sim_listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "sim_bookings_read" ON public.sim_bookings FOR SELECT TO authenticated USING (auth.uid() = booker_id OR listing_id IN (SELECT id FROM public.sim_listings WHERE owner_id = auth.uid()));
CREATE POLICY "sim_bookings_insert" ON public.sim_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = booker_id);
CREATE POLICY "sim_bookings_update" ON public.sim_bookings FOR UPDATE TO authenticated USING (auth.uid() = booker_id OR listing_id IN (SELECT id FROM public.sim_listings WHERE owner_id = auth.uid()));

CREATE POLICY "sim_reviews_read" ON public.sim_reviews FOR SELECT USING (true);
CREATE POLICY "sim_reviews_insert" ON public.sim_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "sim_analytics_read" ON public.sim_analytics FOR SELECT USING (true);
