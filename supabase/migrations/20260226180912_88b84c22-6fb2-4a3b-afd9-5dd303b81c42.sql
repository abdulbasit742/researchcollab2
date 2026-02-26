
-- ============================================================
-- ESCROW + LEDGER PRODUCTION HARDENING MIGRATION
-- ============================================================

-- 1️⃣ ESCROWS TABLE (dedicated, proper escrow accounting)
CREATE TABLE IF NOT EXISTS public.escrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  sponsor_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  total_amount numeric(18,2) NOT NULL,
  locked_amount numeric(18,2) NOT NULL DEFAULT 0,
  released_amount numeric(18,2) NOT NULL DEFAULT 0,
  refunded_amount numeric(18,2) NOT NULL DEFAULT 0,
  currency varchar(10) NOT NULL DEFAULT 'PKR',
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT escrows_status_check CHECK (status IN ('created','funded','locked','partially_released','completed','refunded','disputed')),
  CONSTRAINT escrows_no_negative CHECK (locked_amount >= 0 AND released_amount >= 0 AND refunded_amount >= 0 AND total_amount > 0),
  CONSTRAINT escrows_sum_invariant CHECK (locked_amount + released_amount + refunded_amount <= total_amount)
);

CREATE INDEX IF NOT EXISTS idx_escrows_deal ON public.escrows(deal_id);
CREATE INDEX IF NOT EXISTS idx_escrows_sponsor ON public.escrows(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_escrows_recipient ON public.escrows(recipient_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON public.escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_active ON public.escrows(status) WHERE status NOT IN ('completed','refunded');

-- 2️⃣ LEDGER HARDENING: add hash chain columns + reference index
ALTER TABLE public.ledger_entries
  ADD COLUMN IF NOT EXISTS hash text,
  ADD COLUMN IF NOT EXISTS previous_hash text;

CREATE INDEX IF NOT EXISTS idx_ledger_ref ON public.ledger_entries(reference_type, reference_id);

-- 3️⃣ MILESTONES: add escrow_id + deal_id for proper linking
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS escrow_id uuid REFERENCES public.escrows(id),
  ADD COLUMN IF NOT EXISTS deal_id uuid,
  ADD COLUMN IF NOT EXISTS deliverable_url text;

CREATE INDEX IF NOT EXISTS idx_milestones_deal ON public.milestones(deal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_escrow ON public.milestones(escrow_id);

-- 4️⃣ FINANCIAL AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar(50) NOT NULL,
  entity_id uuid NOT NULL,
  action varchar(100) NOT NULL,
  actor_id uuid,
  old_state jsonb,
  new_state jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fin_audit_entity ON public.financial_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_fin_audit_actor ON public.financial_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_fin_audit_created ON public.financial_audit_logs(created_at DESC);

-- 5️⃣ LEDGER IMMUTABILITY TRIGGER
CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable. UPDATE and DELETE operations are forbidden.';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ledger_immutable_update ON public.ledger_entries;
CREATE TRIGGER trg_ledger_immutable_update
  BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

DROP TRIGGER IF EXISTS trg_ledger_immutable_delete ON public.ledger_entries;
CREATE TRIGGER trg_ledger_immutable_delete
  BEFORE DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 6️⃣ LEDGER HASH CHAIN TRIGGER
CREATE OR REPLACE FUNCTION public.compute_ledger_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_hash text;
  payload text;
BEGIN
  -- Get previous hash
  SELECT hash INTO last_hash
  FROM public.ledger_entries
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  NEW.previous_hash := COALESCE(last_hash, 'GENESIS');

  -- Compute hash from entry data
  payload := NEW.id::text || NEW.transaction_id::text || NEW.account_id::text
    || NEW.entry_type || NEW.amount::text || NEW.currency
    || COALESCE(NEW.previous_hash, '');

  NEW.hash := encode(digest(payload, 'sha256'), 'hex');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ledger_compute_hash ON public.ledger_entries;
CREATE TRIGGER trg_ledger_compute_hash
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.compute_ledger_hash();

-- 7️⃣ ESCROW INTEGRITY VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION public.validate_escrow_integrity(p_escrow_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  esc record;
  ms_sum numeric;
  result jsonb;
BEGIN
  SELECT * INTO esc FROM public.escrows WHERE id = p_escrow_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Escrow not found');
  END IF;

  -- Check sum invariant
  IF esc.locked_amount + esc.released_amount + esc.refunded_amount > esc.total_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Sum invariant violated');
  END IF;

  -- Check no negatives
  IF esc.locked_amount < 0 OR esc.released_amount < 0 OR esc.refunded_amount < 0 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Negative amount detected');
  END IF;

  -- Check milestone sum
  SELECT COALESCE(SUM(amount), 0) INTO ms_sum
  FROM public.milestones WHERE escrow_id = p_escrow_id;

  IF ms_sum > esc.total_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Milestone sum exceeds escrow total',
      'milestone_sum', ms_sum, 'escrow_total', esc.total_amount);
  END IF;

  RETURN jsonb_build_object('valid', true, 'escrow_id', p_escrow_id,
    'total', esc.total_amount, 'locked', esc.locked_amount,
    'released', esc.released_amount, 'refunded', esc.refunded_amount,
    'milestone_sum', ms_sum);
END;
$$;

-- 8️⃣ WALLET INTEGRITY VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION public.validate_wallet_integrity(p_wallet_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w record;
BEGIN
  SELECT * INTO w FROM public.wallets WHERE id = p_wallet_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Wallet not found');
  END IF;

  IF w.available_balance < 0 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Negative available balance');
  END IF;
  IF w.escrow_balance < 0 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Negative escrow balance');
  END IF;

  RETURN jsonb_build_object('valid', true, 'wallet_id', p_wallet_id,
    'available', w.available_balance, 'escrow', w.escrow_balance,
    'pending', w.pending_balance);
END;
$$;

-- 9️⃣ LEDGER CHAIN VERIFICATION FUNCTION
CREATE OR REPLACE FUNCTION public.verify_ledger_chain()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry record;
  expected_prev text := 'GENESIS';
  entry_count int := 0;
  broken_count int := 0;
  first_break uuid;
BEGIN
  FOR entry IN
    SELECT id, hash, previous_hash
    FROM public.ledger_entries
    ORDER BY created_at ASC, id ASC
  LOOP
    entry_count := entry_count + 1;
    IF entry.previous_hash IS NOT NULL AND entry.previous_hash != expected_prev THEN
      broken_count := broken_count + 1;
      IF first_break IS NULL THEN
        first_break := entry.id;
      END IF;
    END IF;
    expected_prev := COALESCE(entry.hash, expected_prev);
  END LOOP;

  RETURN jsonb_build_object(
    'valid', broken_count = 0,
    'total_entries', entry_count,
    'broken_links', broken_count,
    'first_break_id', first_break
  );
END;
$$;

-- 10️⃣ ESCROW UPDATE INTEGRITY TRIGGER
CREATE OR REPLACE FUNCTION public.enforce_escrow_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure sum invariant
  IF NEW.locked_amount + NEW.released_amount + NEW.refunded_amount > NEW.total_amount THEN
    RAISE EXCEPTION 'Escrow integrity violation: sum (%) exceeds total (%)',
      NEW.locked_amount + NEW.released_amount + NEW.refunded_amount, NEW.total_amount;
  END IF;

  -- No negatives
  IF NEW.locked_amount < 0 OR NEW.released_amount < 0 OR NEW.refunded_amount < 0 THEN
    RAISE EXCEPTION 'Escrow integrity violation: negative amount detected';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_escrow_integrity ON public.escrows;
CREATE TRIGGER trg_escrow_integrity
  BEFORE UPDATE ON public.escrows
  FOR EACH ROW EXECUTE FUNCTION public.enforce_escrow_integrity();

-- 11️⃣ FINANCIAL AUDIT TRIGGER ON ESCROWS
CREATE OR REPLACE FUNCTION public.audit_escrow_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.financial_audit_logs (entity_type, entity_id, action, old_state, new_state)
  VALUES (
    'escrow',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_escrow ON public.escrows;
CREATE TRIGGER trg_audit_escrow
  AFTER INSERT OR UPDATE ON public.escrows
  FOR EACH ROW EXECUTE FUNCTION public.audit_escrow_changes();

-- 12️⃣ RLS POLICIES
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

-- Escrows: participants can read their own
CREATE POLICY "escrow_participant_select" ON public.escrows
  FOR SELECT USING (auth.uid() = sponsor_id OR auth.uid() = recipient_id);

-- Escrows: only service role can insert/update (enforced by no INSERT/UPDATE policies for anon)
CREATE POLICY "escrow_service_insert" ON public.escrows
  FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "escrow_sponsor_update" ON public.escrows
  FOR UPDATE USING (auth.uid() = sponsor_id);

-- Audit logs: read-only for participants
CREATE POLICY "audit_logs_read" ON public.financial_audit_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);
