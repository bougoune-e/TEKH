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
    'SM-A546': 'Galaxy A54 5G',
    'SM-A536': 'Galaxy A53 5G',
    'SM-A346': 'Galaxy A34 5G',
    'SM-A136': 'Galaxy A13 5G',
    'SM-G780': 'Galaxy S20 FE',
};

/**
 * Détection appareil robuste pour PWA et web.
 * Règle critique : ne jamais utiliser ua.includes("Apple") — le UA Android
 * contient souvent "AppleWebKit". Toujours tester Android/Samsung avant iPhone/iPad.
 */
export function detectDevice(): DetectedDevice {
    const ua = navigator.userAgent;
    if (import.meta.env.DEV) {
        console.debug('[deviceFinder] userAgent:', ua);
    }
    let brand = 'Inconnu';
    let model = 'Modèle inconnu';
    let confidence = 0.5;
    let type: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';

    // 1. Android en premier (évite toute confusion avec "AppleWebKit" dans le UA)
    if (ua.includes('Android')) {
        type = 'mobile';
        // Samsung / SM- en priorité (ex: SAMSUNG SM-A136B → Galaxy A13 5G)
        if (ua.includes('Samsung') || ua.includes('SM-')) {
            brand = 'Samsung';
            const modelMatch = ua.match(/SM-[A-Z0-9]+/);
            if (modelMatch) {
                const code = modelMatch[0];
                for (const [key, val] of Object.entries(SAMSUNG_MODELS)) {
                    if (code.startsWith(key)) {
                        model = val;
                        confidence = 0.95;
                        break;
                    }
                }
                if (model === 'Modèle inconnu') {
                    model = code;
                    confidence = 0.7;
                }
            }
        } else {
            const brands = Object.keys(BRAND_MAPPING);
            for (const b of brands) {
                if (ua.toLowerCase().includes(b)) {
                    brand = BRAND_MAPPING[b];
                    confidence = 0.7;
                    break;
                }
            }
            const parts = ua.split(';');
            if (parts.length > 2) {
                const modelPart = parts[2].split(')')[0].trim();
                if (modelPart && !modelPart.includes('Build') && modelPart.length > 2 && modelPart.length < 30) {
                    model = modelPart;
                    confidence = 0.8;
                }
            }
        }
    }
    // 2. iPhone / iPad uniquement via chaînes explicites (jamais "Apple" seul)
    else if (ua.includes('iPhone')) {
        brand = 'Apple';
        type = 'mobile';
        if (ua.includes('iPhone 15')) model = 'iPhone 15';
        else if (ua.includes('iPhone 14')) model = 'iPhone 14';
        else if (ua.includes('iPhone 13')) model = 'iPhone 13';
        else if (ua.includes('iPhone 12')) model = 'iPhone 12';
        else if (ua.includes('iPhone 11')) model = 'iPhone 11';
        else model = 'iPhone';
        confidence = 0.8;
    }
    else if (ua.includes('iPad')) {
        brand = 'Apple';
        type = 'tablet';
        model = 'iPad';
        confidence = 0.8;
    }

    // Tablet / Desktop
    if (ua.includes('iPad') || (ua.includes('Android') && !ua.includes('Mobile'))) {
        type = 'tablet';
    } else if (!ua.includes('Mobile') && (ua.includes('Windows') || ua.includes('Macintosh') || ua.includes('Linux'))) {
        type = 'desktop';
    }

    return { brand, model, confidence, type };
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
