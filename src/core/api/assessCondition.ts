/**
 * Frontend module — calls the Supabase Edge Function "assess-condition"
 * which uses Claude Haiku to analyze structured device condition + free text.
 *
 * The API key stays server-side (Supabase secret). Never in the browser bundle.
 * Results are cached in localStorage for 24h to minimize API calls.
 */

import { supabase } from "@/core/api/supabaseClient";
import type { ScreenCondition, ChassisCondition, BatteryCondition, FunctionalityIssue } from "@/features/simulator/components/ConditionStep";
import type { BooleanAnswers } from "@/features/simulator/components/BooleanQuestionsStep";

export interface AssessConditionInput {
    device: {
        brand: string;
        model: string;
        storage: number | null;
        ram: number | null;
    };
    condition: {
        screen: ScreenCondition | "";
        chassis: ChassisCondition | "";
        battery: BatteryCondition | "";
        functionalities: FunctionalityIssue[];
        booleans: BooleanAnswers;
    };
    user_description: string;
}

export interface AssessConditionResult {
    normalized: {
        ecran: string;
        chassis: string;
        batterie: string;
    };
    flags: string[];
    confidence_score: number; // 0..1
    adjustment: number;       // integer -10..+10
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_PREFIX = "tekh:ai-assess:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CacheEntry {
    result: AssessConditionResult;
    ts: number;
}

/** djb2-style 32-bit hash → base36 string */
function hashInput(input: AssessConditionInput): string {
    const str = JSON.stringify({
        brand: input.device.brand,
        model: input.device.model,
        storage: input.device.storage,
        screen: input.condition.screen,
        chassis: input.condition.chassis,
        battery: input.condition.battery,
        funcs: [...input.condition.functionalities].sort(),
        bools: input.condition.booleans,
        desc: input.user_description.toLowerCase().trim(),
    });
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
        h = h & 0xffffffff;
    }
    return (h >>> 0).toString(36);
}

function readCache(key: string): AssessConditionResult | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.ts > CACHE_TTL_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return entry.result;
    } catch {
        return null;
    }
}

function writeCache(key: string, result: AssessConditionResult): void {
    try {
        localStorage.setItem(key, JSON.stringify({ result, ts: Date.now() } satisfies CacheEntry));
    } catch {
        // localStorage quota — silently skip
    }
}

/** Light cache eviction: remove stale entries (max scan 20 keys) */
function evictStaleCache(): void {
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length && keys.length < 20; i++) {
            const k = localStorage.key(i);
            if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
        }
        for (const k of keys) {
            try {
                const raw = localStorage.getItem(k);
                if (raw) {
                    const entry: CacheEntry = JSON.parse(raw);
                    if (Date.now() - entry.ts > 72 * 60 * 60 * 1000) localStorage.removeItem(k);
                }
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function assessConditionWithCache(
    input: AssessConditionInput
): Promise<AssessConditionResult> {
    if (!supabase) throw new Error("Supabase non configuré");

    evictStaleCache();

    const cacheKey = CACHE_PREFIX + hashInput(input);
    const cached = readCache(cacheKey);
    if (cached) return cached;

    // Race against 8-second timeout
    const invokePromise = supabase.functions.invoke("assess-condition", { body: input });
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("assess-condition timeout")), 8000)
    );

    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
    if (error) throw error;

    const result = data as AssessConditionResult;
    writeCache(cacheKey, result);
    return result;
}
