-- 🔧 FIX: IDEMPOTENT LOGISTICS SETUP (V2)
-- Run this if the main migration fails due to missing columns or publication conflicts.

DO $$ 
BEGIN
    -- 0. Ensure profiles table has a role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    -- 1. Ensure device_transactions table exists with correct schema
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'device_transactions') THEN
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
    ELSE
        -- Ensure device_name column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='device_transactions' AND column_name='device_name') THEN
            ALTER TABLE public.device_transactions ADD COLUMN device_name TEXT NOT NULL DEFAULT 'Inconnu';
        END IF;
    END IF;

    -- 2. Realtime Enrollment (Idempotent)
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.device_transactions;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Table device_transactions is already in publication supabase_realtime';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding table to realtime: %', SQLERRM;
    END;

    -- 3. RLS (Idempotent)
    ALTER TABLE public.device_transactions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own transactions" ON public.device_transactions;
    CREATE POLICY "Users can view own transactions"
    ON public.device_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.device_transactions;
    CREATE POLICY "Admins can manage all transactions"
    ON public.device_transactions FOR ALL
    TO authenticated
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
END $$;
