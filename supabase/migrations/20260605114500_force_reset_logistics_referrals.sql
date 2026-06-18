-- 🚀 FINAL REPAIR SCRIPT (LINEAR VERSION)
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. DROP BROKEN TABLES
DROP TABLE IF EXISTS public.device_transactions CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;

-- 2. CREATE CLEAN TABLES
CREATE TABLE public.device_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    price_fcfa INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Estimé' CHECK (status IN ('Estimé', 'Déposé', 'Transit', 'Arrivé', 'Expertise', 'Prêt', 'Terminé')),
    tracking_number TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    device_fingerprint TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'flagged', 'converted')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RESET PROFILES COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_co2_saved DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reward_status TEXT DEFAULT 'none';

-- 4. ENABLE REALTIME (OUTSIDE DO BLOCKS)
-- If this fails because it's already there, it's fine.
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_transactions;

-- 5. ENABLE SECURITY (RLS)
ALTER TABLE public.device_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own tx" ON public.device_transactions;
CREATE POLICY "Users view own tx" ON public.device_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all tx" ON public.device_transactions;
CREATE POLICY "Admins manage all tx" ON public.device_transactions FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 6. ANALYZE
ANALYZE public.device_transactions;
ANALYZE public.profiles;
