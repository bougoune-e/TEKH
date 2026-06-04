/**
 * Utility to generate a unique device fingerprint without native plugins.
 * Used for anti-fraud in the referral system.
 */

const FP_CACHE_KEY = 'tekh:device-fingerprint';

/**
 * Generates a SHA-256 hash of browser/hardware specifications.
 */
export async function generateDeviceFingerprint(): Promise<string> {
    // 1. Check cache first to avoid re-calculating (heavy operation)
    const cached = localStorage.getItem(FP_CACHE_KEY);
    if (cached) return cached;

    try {
        const navigatorInfo =
            window.navigator.userAgent +
            window.navigator.language +
            (window.navigator.hardwareConcurrency || '0') +
            ((window.navigator as any).deviceMemory || '0');

        const screenInfo =
            window.screen.width + 'x' +
            window.screen.height + 'x' +
            window.screen.colorDepth;

        // 2. Canvas Rendering Variation (GPU/Driver fingerprinting)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let canvasData = '';

        if (ctx) {
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.fillText("TEKH-AntiFraude-2026", 2, 2);
            canvasData = canvas.toDataURL();
        }

        const rawString = navigatorInfo + screenInfo + canvasData;

        // 3. SHA-256 Hashing via Web Crypto API
        const msgBuffer = new TextEncoder().encode(rawString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 4. Cache the result for next time
        localStorage.setItem(FP_CACHE_KEY, hashHex);

        return hashHex;
    } catch (error) {
        console.error("Fingerprint generation error:", error);
        // Fallback to a random ID if crypto fails
        const fallback = 'fb-' + Math.random().toString(36).substring(2, 15);
        return fallback;
    }
}
