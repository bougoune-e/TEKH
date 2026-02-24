/**
 * TEKH+ Device Finder Service
 * Professional-grade UserAgent detection for PWA environments.
 * Maps hardware codes to marketing names and predicts variants.
 */

export interface DetectedDevice {
    brand: string;
    model: string;
    confidence: number;
    type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
}

const BRAND_MAPPING: Record<string, string> = {
    'apple': 'Apple',
    'samsung': 'Samsung',
    'huawei': 'Huawei',
    'xiaomi': 'Xiaomi',
    'redmi': 'Xiaomi',
    'poco': 'Xiaomi',
    'oppo': 'Oppo',
    'vivo': 'Vivo',
    'realme': 'Realme',
    'tecno': 'Tecno',
    'infinix': 'Infinix',
    'google': 'Google',
    'pixel': 'Google',
    'motorola': 'Motorola',
    'sony': 'Sony',
    'lg': 'LG',
    'oneplus': 'OnePlus',
    'nothing': 'Nothing',
    'honor': 'Honor',
    'nokia': 'Nokia',
    'asus': 'Asus',
    'lenovo': 'Lenovo',
};

const APPLE_MODELS: Record<string, string> = {
    'iPhone16,1': 'iPhone 15 Pro',
    'iPhone16,2': 'iPhone 15 Pro Max',
    'iPhone15,4': 'iPhone 15',
    'iPhone15,5': 'iPhone 15 Plus',
    'iPhone15,2': 'iPhone 14 Pro',
    'iPhone15,3': 'iPhone 14 Pro Max',
    'iPhone14,7': 'iPhone 14',
    'iPhone14,8': 'iPhone 14 Plus',
    'iPhone14,2': 'iPhone 13 Pro',
    'iPhone14,3': 'iPhone 13 Pro Max',
    'iPhone14,5': 'iPhone 13',
    'iPhone14,4': 'iPhone 13 mini',
    'iPhone13,3': 'iPhone 12 Pro',
    'iPhone13,4': 'iPhone 12 Pro Max',
    'iPhone13,2': 'iPhone 12',
    'iPhone12,1': 'iPhone 11',
    'iPhone12,3': 'iPhone 11 Pro',
    'iPhone12,5': 'iPhone 11 Pro Max',
};

const SAMSUNG_MODELS: Record<string, string> = {
    'SM-S928': 'Galaxy S24 Ultra',
    'SM-S926': 'Galaxy S24+',
    'SM-S921': 'Galaxy S24',
    'SM-S918': 'Galaxy S23 Ultra',
    'SM-S916': 'Galaxy S23+',
    'SM-S911': 'Galaxy S23',
    'SM-S908': 'Galaxy S22 Ultra',
    'SM-G998': 'Galaxy S21 Ultra',
    'SM-G991': 'Galaxy S21',
    'SM-A556': 'Galaxy A55 5G',
    'SM-A546': 'Galaxy A54 5G',
    'SM-A536': 'Galaxy A53 5G',
    'SM-A346': 'Galaxy A34 5G',
    'SM-A256': 'Galaxy A25 5G',
    'SM-A246': 'Galaxy A24',
    'SM-A156': 'Galaxy A15 5G',
    'SM-A145': 'Galaxy A14 5G',
    'SM-A136': 'Galaxy A13 5G',
    'SM-G780': 'Galaxy S20 FE',
};

/** Retourne true si le User-Agent indique un appareil mobile (Android, iPhone, etc.). */
export function isMobileUserAgent(): boolean {
    if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua);
}

/**
 * Détection appareil robuste pour PWA et web.
 * Règles strictes :
 * 1. Android TOUJOURS en premier (le UA Android contient "AppleWebKit" → ne jamais tester "Apple" avant Android).
 * 2. Détection Apple UNIQUEMENT via "iPhone" ou "iPad", jamais via "Apple".
 * 3. Samsung : détecter via "Samsung" ou "sm-" (insensible à la casse).
 */
export function detectDevice(): DetectedDevice {
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();
    if (import.meta.env.DEV) {
        console.debug('[deviceFinder] userAgent:', ua);
    }

    let type: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';

    // ——— 1. PRIORITÉ ANDROID (retours précoces : aucun code "apple" jamais exécuté ici) ———
    if (uaLower.includes('android')) {
        const typeMobile: 'mobile' | 'tablet' = uaLower.includes('mobile') ? 'mobile' : 'tablet';

        // Samsung : SM- ou SM_ dans le UA → retour immédiat (jamais Apple)
        const samsungMatch = ua.match(/SM[-_][A-Z0-9]+/i);
        if (samsungMatch) {
            const code = samsungMatch[0];
            const codeUpper = code.toUpperCase().replace('_', '-');
            let modelVal = 'Modèle inconnu';
            let conf = 0.9;
            for (const [key, val] of Object.entries(SAMSUNG_MODELS)) {
                if (codeUpper.startsWith(key)) {
                    modelVal = val;
                    conf = 0.95;
                    break;
                }
            }
            if (modelVal === 'Modèle inconnu') {
                modelVal = code;
                conf = 0.7;
            }
            if (import.meta.env.DEV) console.log('[deviceFinder] Brand before return (Android Samsung):', 'Samsung');
            return { brand: 'Samsung', model: modelVal, confidence: conf, type: typeMobile };
        }

        // Autres Android : marques sans "apple", puis extraction modèle
        let brandAndroid = 'Inconnu';
        let modelAndroid = 'Modèle inconnu';
        let confAndroid = 0.5;
        const brands = Object.keys(BRAND_MAPPING).filter(b => b !== 'apple');
        for (const b of brands) {
            if (uaLower.includes(b)) {
                brandAndroid = BRAND_MAPPING[b];
                confAndroid = 0.7;
                break;
            }
        }
        const parts = ua.split(';');
        if (parts.length > 2) {
            const raw = parts[2].replace(/\s+Build\/.*/i, '').split(')')[0].trim();
            if (raw && raw.length > 2 && raw.length < 50) {
                modelAndroid = raw;
                confAndroid = Math.max(confAndroid, 0.8);
            }
        }
        if (import.meta.env.DEV) console.log('[deviceFinder] Brand before return (Android other):', brandAndroid);
        return { brand: brandAndroid, model: modelAndroid, confidence: confAndroid, type: typeMobile };
    }

    // ——— 2. APPLE UNIQUEMENT VIA "iphone" / "ipad" (jamais "apple") ———
    if (uaLower.includes('iphone')) {
        if (import.meta.env.DEV) console.log('[deviceFinder] Brand before return (iPhone):', 'Apple');
        return { brand: 'Apple', model: 'iPhone', confidence: 0.8, type: 'mobile' };
    }
    if (uaLower.includes('ipad')) {
        if (import.meta.env.DEV) console.log('[deviceFinder] Brand before return (iPad):', 'Apple');
        return { brand: 'Apple', model: 'iPad', confidence: 0.8, type: 'tablet' };
    }

    // ——— 3. DEFAUT ———
    type = !uaLower.includes('mobile') && (uaLower.includes('windows') || uaLower.includes('macintosh') || uaLower.includes('linux'))
        ? 'desktop'
        : 'unknown';
    if (import.meta.env.DEV) console.log('[deviceFinder] Brand before return (default):', 'Inconnu');
    return { brand: 'Inconnu', model: 'Modèle inconnu', confidence: 0.5, type };
}

/** Si le navigateur expose le modèle via Client Hints (Chrome), le retourne. Sinon null. */
export function getDeviceModelFromClientHints(): Promise<string | null> {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const uaData = nav && (nav as any).userAgentData;
    if (!uaData || typeof uaData.getHighEntropyValues !== 'function') return Promise.resolve(null);
    return (uaData as any).getHighEntropyValues(['model'])
        .then((v: { model?: string }) => (v?.model && v.model.length > 0 ? v.model : null))
        .catch(() => null);
}

/**
 * Predicts the most likely RAM and Storage for a given model
 * in the African/Local market context.
 */
export function predictVariants(brand: string, model: string) {
    const b = brand.toLowerCase();
    const m = model.toLowerCase();

    // Defaults
    let storage = 128;
    let ram = 6;

    if (b === 'apple') {
        ram = m.includes('pro') ? 6 : 4;
        storage = 128;
    } else if (b === 'samsung') {
        if (m.includes('ultra')) { ram = 12; storage = 256; }
        else if (m.includes('s2') || m.includes('s1')) { ram = 8; storage = 128; }
        else { ram = 4; storage = 64; }
    } else if (b === 'infinix' || b === 'tecno') {
        ram = 8;
        storage = 128;
    }

    return { storage, ram };
}
