-- Phase 2: Rating & Review System

-- Create project_reviews table
CREATE TABLE public.project_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER NOT NULL CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  comment TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  visibility_unlocked_at TIMESTAMP WITH TIME ZONE,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(offer_id, reviewer_id)
);

-- Create review_unlock_queue table for double-blind review logic
CREATE TABLE public.review_unlock_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE UNIQUE,
  reviewer_a_id UUID NOT NULL,
  reviewer_b_id UUID NOT NULL,
  review_a_submitted BOOLEAN NOT NULL DEFAULT false,
  review_b_submitted BOOLEAN NOT NULL DEFAULT false,
  unlock_deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_unlock_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_reviews
CREATE POLICY "Users can view visible reviews for their profile"
ON public.project_reviews FOR SELECT
USING (
  is_visible = true OR 
  reviewer_id = auth.uid() OR 
  is_admin(auth.uid())
);

CREATE POLICY "Users can create reviews for their completed offers"
ON public.project_reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM offers o 
    WHERE o.id = offer_id 
    AND o.status = 'completed'
    AND (o.sender_id = auth.uid() OR o.recipient_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own pending reviews"
ON public.project_reviews FOR UPDATE
USING (reviewer_id = auth.uid() AND is_visible = false);

CREATE POLICY "Admins can manage all reviews"
ON public.project_reviews FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for review_unlock_queue
CREATE POLICY "Participants can view their unlock queue"
ON public.review_unlock_queue FOR SELECT
USING (
  reviewer_a_id = auth.uid() OR 
  reviewer_b_id = auth.uid() OR 
  is_admin(auth.uid())
);

CREATE POLICY "System can insert unlock queue entries"
ON public.review_unlock_queue FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "System can update unlock queue"
ON public.review_unlock_queue FOR UPDATE
USING (
  reviewer_a_id = auth.uid() OR 
  reviewer_b_id = auth.uid() OR 
  is_admin(auth.uid())
);

-- Function to create review unlock queue when offer is completed
CREATE OR REPLACE FUNCTION public.create_review_unlock_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO review_unlock_queue (offer_id, reviewer_a_id, reviewer_b_id)
    VALUES (NEW.id, NEW.sender_id, NEW.recipient_id)
    ON CONFLICT (offer_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for offer completion
DROP TRIGGER IF EXISTS trigger_create_review_queue ON offers;
CREATE TRIGGER trigger_create_review_queue
AFTER UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION create_review_unlock_queue();

-- Function to check and unlock reviews
CREATE OR REPLACE FUNCTION public.check_and_unlock_reviews(p_offer_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue review_unlock_queue%ROWTYPE;
  v_both_submitted BOOLEAN;
  v_deadline_passed BOOLEAN;
BEGIN
  SELECT * INTO v_queue FROM review_unlock_queue WHERE offer_id = p_offer_id;
  
  IF v_queue.unlocked_at IS NOT NULL THEN
    RETURN true; -- Already unlocked
  END IF;
  
  v_both_submitted := v_queue.review_a_submitted AND v_queue.review_b_submitted;
  v_deadline_passed := now() >= v_queue.unlock_deadline;
  
  IF v_both_submitted OR v_deadline_passed THEN
    -- Unlock all reviews for this offer
    UPDATE project_reviews
    SET is_visible = true,
        visibility_unlocked_at = now(),
        updated_at = now()
    WHERE offer_id = p_offer_id;
    
    -- Mark queue as unlocked
    UPDATE review_unlock_queue
    SET unlocked_at = now()
    WHERE offer_id = p_offer_id;
    
    -- Recalculate trust scores for both parties
    PERFORM calculate_dynamic_trust_score(v_queue.reviewer_a_id);
    PERFORM calculate_dynamic_trust_score(v_queue.reviewer_b_id);
    
    -- Send notifications
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES 
      (v_queue.reviewer_a_id, 'review_unlocked', 'Reviews Unlocked', 'The reviews for your completed project are now visible.', jsonb_build_object('offer_id', p_offer_id)),
      (v_queue.reviewer_b_id, 'review_unlocked', 'Reviews Unlocked', 'The reviews for your completed project are now visible.', jsonb_build_object('offer_id', p_offer_id));
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to submit a review and check for unlock
CREATE OR REPLACE FUNCTION public.submit_review(
  p_offer_id UUID,
  p_overall_rating INTEGER,
  p_communication_rating INTEGER,
  p_quality_rating INTEGER,
  p_timeliness_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer offers%ROWTYPE;
  v_reviewer_id UUID := auth.uid();
  v_reviewee_id UUID;
  v_review_id UUID;
  v_queue review_unlock_queue%ROWTYPE;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id;
  
  IF v_offer.status != 'completed' THEN
    RAISE EXCEPTION 'Can only review completed offers';
  END IF;
  
  -- Determine reviewee
  IF v_reviewer_id = v_offer.sender_id THEN
    v_reviewee_id := v_offer.recipient_id;
  ELSIF v_reviewer_id = v_offer.recipient_id THEN
    v_reviewee_id := v_offer.sender_id;
  ELSE
    RAISE EXCEPTION 'You are not a participant in this offer';
  END IF;
  
  -- Insert review
  INSERT INTO project_reviews (
    offer_id, reviewer_id, reviewee_id, 
    overall_rating, communication_rating, quality_rating, timeliness_rating, comment
  )
  VALUES (
    p_offer_id, v_reviewer_id, v_reviewee_id,
    p_overall_rating, p_communication_rating, p_quality_rating, p_timeliness_rating, p_comment
  )
  RETURNING id INTO v_review_id;
  
  -- Update unlock queue
  SELECT * INTO v_queue FROM review_unlock_queue WHERE offer_id = p_offer_id;
  
  IF v_reviewer_id = v_queue.reviewer_a_id THEN
    UPDATE review_unlock_queue SET review_a_submitted = true WHERE offer_id = p_offer_id;
  ELSIF v_reviewer_id = v_queue.reviewer_b_id THEN
    UPDATE review_unlock_queue SET review_b_submitted = true WHERE offer_id = p_offer_id;
  END IF;
  
  -- Check if reviews should be unlocked
  PERFORM check_and_unlock_reviews(p_offer_id);
  
  RETURN v_review_id;
END;
$$;

-- Function to get user's average ratings
CREATE OR REPLACE FUNCTION public.get_user_review_stats(p_user_id UUID)
RETURNS TABLE (
  total_reviews BIGINT,
  avg_overall NUMERIC,
  avg_communication NUMERIC,
  avg_quality NUMERIC,
  avg_timeliness NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*),
    ROUND(AVG(overall_rating)::NUMERIC, 1),
    ROUND(AVG(communication_rating)::NUMERIC, 1),
    ROUND(AVG(quality_rating)::NUMERIC, 1),
    ROUND(AVG(timeliness_rating)::NUMERIC, 1)
  FROM project_reviews
  WHERE reviewee_id = p_user_id
  AND is_visible = true
  AND moderation_status = 'approved';
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_reviews_reviewee_visible 
ON project_reviews(reviewee_id) WHERE is_visible = true;

CREATE INDEX IF NOT EXISTS idx_project_reviews_offer 
ON project_reviews(offer_id);

CREATE INDEX IF NOT EXISTS idx_review_unlock_queue_deadline 
ON review_unlock_queue(unlock_deadline) WHERE unlocked_at IS NULL;

-- Enable realtime for review notifications
ALTER PUBLICATION supabase_realtime ADD TABLE project_reviews;