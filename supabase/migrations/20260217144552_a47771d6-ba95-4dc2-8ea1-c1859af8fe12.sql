
-- Trigger function: notify bidder when their bid status changes
CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_project_title TEXT;
  v_bidder_name TEXT;
  v_project_owner_id UUID;
  v_notification_type TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT title, owner_id INTO v_project_title, v_project_owner_id
  FROM earning_projects WHERE id = NEW.project_id;

  SELECT COALESCE(full_name, 'Someone') INTO v_bidder_name
  FROM profiles WHERE id = NEW.bidder_id;

  CASE NEW.status
    WHEN 'viewed' THEN
      v_notification_type := 'bid_viewed';
      v_title := 'Your bid was viewed';
      v_message := 'The owner of "' || COALESCE(v_project_title, 'a project') || '" viewed your bid.';
    WHEN 'shortlisted' THEN
      v_notification_type := 'bid_shortlisted';
      v_title := 'You''ve been shortlisted! 🎉';
      v_message := 'Your bid on "' || COALESCE(v_project_title, 'a project') || '" has been shortlisted.';
    WHEN 'accepted' THEN
      v_notification_type := 'bid_accepted';
      v_title := 'Bid Accepted! 🏆';
      v_message := 'Congratulations! Your bid on "' || COALESCE(v_project_title, 'a project') || '" has been accepted.';
    WHEN 'rejected' THEN
      v_notification_type := 'bid_rejected';
      v_title := 'Bid not selected';
      v_message := 'Your bid on "' || COALESCE(v_project_title, 'a project') || '" was not selected this time.';
    ELSE
      RETURN NEW;
  END CASE;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.bidder_id,
    v_notification_type,
    v_title,
    v_message,
    jsonb_build_object(
      'bid_id', NEW.id,
      'project_id', NEW.project_id,
      'project_title', v_project_title,
      'old_status', OLD.status,
      'new_status', NEW.status
    )
  );

  IF NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
      eb.bidder_id,
      'bid_position_filled',
      'Position filled',
      'The project "' || COALESCE(v_project_title, 'a project') || '" has selected a bidder.',
      jsonb_build_object('project_id', NEW.project_id, 'project_title', v_project_title)
    FROM earning_bids eb
    WHERE eb.project_id = NEW.project_id
      AND eb.id != NEW.id
      AND eb.bidder_id != NEW.bidder_id
      AND eb.status NOT IN ('rejected', 'withdrawn');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bid_status_notification ON earning_bids;
CREATE TRIGGER trg_bid_status_notification
  AFTER UPDATE ON earning_bids
  FOR EACH ROW
  EXECUTE FUNCTION notify_bid_status_change();

-- Notify project owner on new bid
CREATE OR REPLACE FUNCTION public.notify_new_bid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_project_title TEXT;
  v_project_owner_id UUID;
  v_bidder_name TEXT;
BEGIN
  SELECT title, owner_id INTO v_project_title, v_project_owner_id
  FROM earning_projects WHERE id = NEW.project_id;

  SELECT COALESCE(full_name, 'Someone') INTO v_bidder_name
  FROM profiles WHERE id = NEW.bidder_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_project_owner_id,
    'new_bid_received',
    'New bid received',
    v_bidder_name || ' submitted a bid on "' || COALESCE(v_project_title, 'your project') || '".',
    jsonb_build_object(
      'bid_id', NEW.id,
      'project_id', NEW.project_id,
      'project_title', v_project_title,
      'bidder_id', NEW.bidder_id,
      'bidder_name', v_bidder_name,
      'amount', NEW.amount
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_bid_notification ON earning_bids;
CREATE TRIGGER trg_new_bid_notification
  AFTER INSERT ON earning_bids
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_bid();
