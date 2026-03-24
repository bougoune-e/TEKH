/**
 * TEKH+ Brand Configuration
 * 
 * Central brand registry defining:
 * - Allowed brands for the platform
 * - Parent group relationships (Xiaomi→Redmi/Poco, Transsion→Tecno/Infinix/Itel)
 * - Helper functions for brand validation and grouping
 */

/** The 17 approved brands for TEKH+ */
export const ALLOWED_BRANDS = [
    "Apple",
    "Google",
    "Honor",
    "Huawei",
    "Infinix",
    "Itel",
    "Motorola",
    "Nothing",
    "OnePlus",
    "Oppo",
    "Poco",
    "Realme",
    "Redmi",
    "Samsung",
    "Sony",
    "Tecno",
    "Vivo",
] as const;

export type AllowedBrand = (typeof ALLOWED_BRANDS)[number];

/**
 * Parent brand groups for ranking/pricing algorithms.
 * Sub-brands share the parent's tier when computing equivalence classes.
 */
export const BRAND_GROUPS: Record<string, string[]> = {
    Xiaomi: ["Redmi", "Poco"],
    Transsion: ["Tecno", "Infinix", "Itel"],
};

const _allowedSet = new Set(ALLOWED_BRANDS.map((b) => b.toLowerCase()));

/** Check if a brand is in the 15 allowed brands (case-insensitive). */
export function isAllowedBrand(brand: string): boolean {
    return _allowedSet.has(brand.trim().toLowerCase());
}

/**
 * Get the parent group name for a brand.
 * Returns the parent group (e.g. "Xiaomi" for "Redmi") or the brand itself if standalone.
 */
export function getParentGroup(brand: string): string {
    const lower = brand.trim().toLowerCase();
    for (const [parent, children] of Object.entries(BRAND_GROUPS)) {
        if (parent.toLowerCase() === lower) return parent;
        for (const child of children) {
            if (child.toLowerCase() === lower) return parent;
        }
    }
    return brand;
}

/**
 * Get all brands that belong to the same group.
 * E.g. getSiblingBrands("Redmi") → ["Redmi", "Poco"]
 */
export function getSiblingBrands(brand: string): string[] {
    const parent = getParentGroup(brand);
    return BRAND_GROUPS[parent] || [brand];
}
