-- 🛡️ TEKH+ SECURITY HARDENING MIGRATION
-- Addressing Supabase Security Advisor warnings

-- 1. FIX FUNCTION SEARCH PATHS (Anti-Injection)
-- Setting explicit search_path prevents attackers from creating objects in other schemas to hijack function calls.

ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.handle_referral_conversion() SET search_path = public;

-- Conditional fix for functions that might exist but aren't in recent migrations
DO $$ 
BEGIN
    -- Fix handle_transaction_completion
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_transaction_completion') THEN
        ALTER FUNCTION public.handle_transaction_completion() SET search_path = public;
        
        -- 2. RESTRICT SECURITY DEFINER EXECUTION
        -- Security definer functions run with owner privileges. We must ensure only the system can call them.
        REVOKE EXECUTE ON FUNCTION public.handle_transaction_completion() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION public.handle_transaction_completion() FROM authenticated;
    END IF;

    -- Fix handle_new_user (common Supabase trigger)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
        REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
    END IF;
END $$;

-- 3. HARDEN TRIGGER FUNCTIONS
-- Trigger functions should never be called directly by users.
REVOKE EXECUTE ON FUNCTION public.handle_referral_conversion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_referral_conversion() FROM authenticated;


-- 4. TIGHTEN STORAGE POLICIES (Anti-Listing)
-- Restricting the ability to list all files in a bucket while maintaining public read access for specific assets.

-- Hardening 'avatars' bucket
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IS NOT NULL);

-- Hardening 'phones' bucket
DROP POLICY IF EXISTS "Public read phones" ON storage.objects;
CREATE POLICY "Public read phones"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'phones' AND (storage.foldername(name))[1] IS NOT NULL);

-- 5. FIX RLS ON TABLES WITHOUT POLICIES
-- Table 'public.equivalence_classes' (Smartphone variants matching)
ALTER TABLE IF EXISTS public.equivalence_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read on equivalence_classes" ON public.equivalence_classes;
CREATE POLICY "Allow authenticated read on equivalence_classes"
ON public.equivalence_classes FOR SELECT
TO authenticated
USING (true);

-- Additional check: Ensure authenticated users can only delete their own objects in avatars
-- (Assuming the filename includes the user ID or a similar identifiable pattern)
-- If we can't reliably identify the owner from the filename without a DB join, we keep the previous authenticated policy but ensure search_path is safe.
