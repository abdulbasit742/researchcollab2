-- Helper function with correct syntax
CREATE OR REPLACE FUNCTION public.log_platform_event(
  _event_type TEXT, _severity TEXT DEFAULT 'info', _user_id UUID DEFAULT NULL,
  _entity_type TEXT DEFAULT NULL, _entity_id UUID DEFAULT NULL, _context JSONB DEFAULT '{}'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id UUID;
BEGIN
  INSERT INTO platform_events (event_type, severity, user_id, entity_type, entity_id, context)
  VALUES (_event_type, _severity, _user_id, _entity_type, _entity_id, _context)
  RETURNING id INTO _id;
  RETURN _id;
END; $$;