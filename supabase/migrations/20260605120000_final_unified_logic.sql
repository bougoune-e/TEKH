-- 🚀 FINAL UNIFIED SYSTEM SCHEMA (RECOVERY V3)
-- DROPS AND RECREATES TABLES TO ENSURE ABSOLUTE SYNC WITH FRONTEND LOGIC

-- 1. CLEANUP
DROP TABLE IF EXISTS public.device_transactions CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;

-- 2. PROFILES ENRICHMENT
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT public.generate_referral_code();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_co2_saved DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reward_status TEXT DEFAULT 'none' CHECK (reward_status IN ('none', 'eligible_reward', 'reward_claimed'));

-- 3. DEVICE TRANSACTIONS (LOGISTICS)
CREATE TABLE public.device_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    price_fcfa INTEGER NOT NULL,
    -- Unified Statuses: Estimé -> Déposé -> Transit -> Arrivé -> Expertise -> Prêt -> Terminé
    status TEXT NOT NULL DEFAULT 'Estimé' CHECK (status IN ('Estimé', 'Déposé', 'Transit', 'Arrivé', 'Expertise', 'Prêt', 'Terminé')),
    tracking_number TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. REFERRALS (ENGAGEMENT)
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    device_fingerprint TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'flagged')),
    created_at TIMESTAMPTZ DEFAULT now(),
    converted_at TIMESTAMPTZ
);

-- 5. AUTOMATION TRIGGERS

-- Trigger A: When a transaction is 'Terminé', convert the referral if exists
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_transaction_completed
    AFTER UPDATE ON public.device_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_transaction_completion();

-- Trigger B: When a referral is converted, update CO2 and check reward eligibility
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
        SELECT count(*) INTO conv_count FROM public.referrals WHERE referrer_id = NEW.referrer_id AND status = 'converted';

        -- If reaches 5, set reward_status to 'eligible_reward'
        IF (conv_count >= 5) THEN
            UPDATE public.profiles
            SET reward_status = 'eligible_reward'
            WHERE id = NEW.referrer_id AND reward_status = 'none';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_referral_converted
    AFTER UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_referral_conversion();

-- 6. REALTIME & RLS
ALTER TABLE public.device_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.device_transactions;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Realtime already set';
END;

CREATE POLICY "Users view own tx" ON public.device_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all tx" ON public.device_transactions FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE POLICY "Public referral insertion" ON public.referrals FOR INSERT TO authenticated WITH CHECK (true);

-- 7. SET TEST ADMIN
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
