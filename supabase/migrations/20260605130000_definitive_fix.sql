-- ============================================================================
-- 🚀 DEFINITIVE FIX: Additive & Idempotent Corrective Migration
-- Fixes all critical issues in the parrainage→estimation→QR→reward pipeline
-- DATE: 2026-06-05
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #1: reward_status CHECK constraint
-- The original migration used 'eligible'/'claimed' but frontend expects
-- 'eligible_reward'/'reward_claimed'. We need to drop the old constraint
-- and create a new one that accepts BOTH old and new values.
-- ──────────────────────────────────────────────────────────────────────────────

-- First, migrate any existing rows with old values to new values
UPDATE public.profiles SET reward_status = 'eligible_reward' WHERE reward_status = 'eligible';
UPDATE public.profiles SET reward_status = 'reward_claimed' WHERE reward_status = 'claimed';
UPDATE public.profiles SET reward_status = 'none' WHERE reward_status = 'not_eligible';
UPDATE public.profiles SET reward_status = 'none' WHERE reward_status IS NULL OR reward_status NOT IN ('none', 'eligible_reward', 'reward_claimed');

-- Drop all existing CHECK constraints on reward_status
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
        WHERE con.conrelid = 'public.profiles'::regclass
          AND att.attname = 'reward_status'
          AND con.contype = 'c'
    ) LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', r.conname);
    END LOOP;
END $$;

-- Add the correct CHECK constraint
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_reward_status_check
    CHECK (reward_status IN ('none', 'eligible_reward', 'reward_claimed'));

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #2: Comprehensive RLS for device_transactions
-- ──────────────────────────────────────────────────────────────────────────────

-- Ensure RLS is enabled
ALTER TABLE public.device_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Users can INSERT their own transactions
DROP POLICY IF EXISTS "Users insert own tx" ON public.device_transactions;
CREATE POLICY "Users insert own tx"
    ON public.device_transactions FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Users can SELECT their own transactions
DROP POLICY IF EXISTS "Users view own tx" ON public.device_transactions;
CREATE POLICY "Users view own tx"
    ON public.device_transactions FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 3. Users can UPDATE their own transactions (metadata/tracking info they might provide)
DROP POLICY IF EXISTS "Users update own tx" ON public.device_transactions;
CREATE POLICY "Users update own tx"
    ON public.device_transactions FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Admins can do EVERYTHING
DROP POLICY IF EXISTS "Admins manage all tx" ON public.device_transactions;
CREATE POLICY "Admins manage all tx"
    ON public.device_transactions FOR ALL TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #2.5: Ensure Profiles are accessible
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR ALL TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #3: Add missing converted_at column to referrals
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #4: Recreate triggers with correct 'eligible_reward' value
-- Using CREATE OR REPLACE to be idempotent.
-- ──────────────────────────────────────────────────────────────────────────────

-- Trigger A: Transaction → Referral conversion
CREATE OR REPLACE FUNCTION public.handle_transaction_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'Terminé' AND (OLD.status IS NULL OR OLD.status <> 'Terminé')) THEN
        -- Mark associated referral as converted
        UPDATE public.referrals
        SET status = 'converted',
            converted_at = now()
        WHERE referee_id = NEW.user_id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists (drop + create to handle BEFORE/AFTER mismatch)
DROP TRIGGER IF EXISTS trg_on_transaction_completed ON public.device_transactions;
CREATE TRIGGER trg_on_transaction_completed
    AFTER UPDATE ON public.device_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_transaction_completion();

-- Trigger B: Referral conversion → CO2 update + reward check
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS TRIGGER AS $$
DECLARE
    conv_count INTEGER;
BEGIN
    IF (NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status <> 'converted')) THEN
        -- Add CO2 to referrer
        UPDATE public.profiles
        SET total_co2_saved = total_co2_saved + 5.4,
            updated_at = now()
        WHERE id = NEW.referrer_id;

        -- Count converted referrals for this referrer
        SELECT count(*) INTO conv_count
        FROM public.referrals
        WHERE referrer_id = NEW.referrer_id AND status = 'converted';

        -- If reaches 5, set reward_status to 'eligible_reward' (NOT 'eligible')
        IF (conv_count >= 5) THEN
            UPDATE public.profiles
            SET reward_status = 'eligible_reward'
            WHERE id = NEW.referrer_id AND reward_status = 'none';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists (drop + create to handle BEFORE/AFTER mismatch from original)
DROP TRIGGER IF EXISTS trg_on_referral_converted ON public.referrals;
CREATE TRIGGER trg_on_referral_converted
    AFTER UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_referral_conversion();

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #5: Ensure referrals INSERT policy exists
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public referral insertion" ON public.referrals;
DROP POLICY IF EXISTS "Utilisateurs peuvent insérer un parrainage" ON public.referrals;
DROP POLICY IF EXISTS "Users insert referrals" ON public.referrals;
CREATE POLICY "Users insert referrals"
    ON public.referrals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = referee_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX #6: Ensure Realtime is enabled for device_transactions
-- ──────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'device_transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.device_transactions;
    END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- DONE: ANALYZE for query planner
-- ──────────────────────────────────────────────────────────────────────────────

ANALYZE public.profiles;
ANALYZE public.device_transactions;
ANALYZE public.referrals;
