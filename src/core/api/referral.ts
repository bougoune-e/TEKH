import { supabase } from "@/core/api/supabaseClient";
import { generateDeviceFingerprint } from "@/core/utils/fingerprint";

const REF_SESSION_KEY = 'tekh:referral-code';

/**
 * Capture referral code from URL query string and store in session.
 */
export function captureReferralCode() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        sessionStorage.setItem(REF_SESSION_KEY, ref);
    }
}

/**
 * Retrieve the captured referral code from session.
 */
export function getStoredReferralCode(): string | null {
    return sessionStorage.getItem(REF_SESSION_KEY);
}

/**
 * Register a new user as a referee.
 */
export async function registerReferee(userId: string, referrerCode: string) {
    try {
        // 1. Get the referrer's actual ID from their code
        const { data: referrer, error: refError } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referrerCode)
            .single();

        if (refError || !referrer) throw new Error("Parrain non trouvé");
        if (referrer.id === userId) throw new Error("Auto-parrainage non autorisé");

        const fingerprint = await generateDeviceFingerprint();

        // 2. Anti-fraud: Check if this device has already been used for a referral
        const { data: existingRef } = await supabase
            .from('referrals')
            .select('id')
            .eq('device_fingerprint', fingerprint);

        const isSuspicion = existingRef && existingRef.length > 0;

        // 3. Insert the referral link
        const { data, error } = await supabase
            .from('referrals')
            .insert([
                {
                    referrer_id: referrer.id,
                    referee_id: userId,
                    device_fingerprint: fingerprint,
                    status: isSuspicion ? 'flagged' : 'pending'
                }
            ]);

        if (error) throw error;

        // Clear the session storage after successful registration
        sessionStorage.removeItem(REF_SESSION_KEY);

        return { success: true, data, flagged: isSuspicion };
    } catch (err: any) {
        console.error("Erreur parrainage :", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Get the current user's referral code.
 */
export async function getUserReferralCode(userId: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data.referral_code;
}

/**
 * Get ESG impact stats for the user.
 */
export async function getUserImpactStats(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('reward_status, total_co2_saved')
        .eq('id', userId)
        .single();

    if (error) return null;

    // Count converted referrals
    const { count, error: countError } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', userId)
        .eq('status', 'converted');

    const convertedCount = count || 0;
    const remainingForReward = Math.max(0, 5 - convertedCount);

    return {
        rewardStatus: data.reward_status as 'none' | 'eligible' | 'claimed',
        co2Saved: Number(data.total_co2_saved),
        convertedCount,
        remainingToGoal: remainingForReward
    };
}
