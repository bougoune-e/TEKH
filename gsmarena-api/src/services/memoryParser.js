/**
 * Parses GSMArena memory specifications string into a structured JSON object.
 * 
 * Example input: "128GB 8GB RAM, 256GB 12GB RAM, 512GB 12GB RAM"
 * Example output:
 * {
 *   "variants": [
 *     { "storage_gb": 128, "ram_gb": 8 },
 *     { "storage_gb": 256, "ram_gb": 12 },
 *     { "storage_gb": 512, "ram_gb": 12 }
 *   ],
 *   "ram_options": [8, 12],
 *   "storage_options": [128, 256, 512]
 * }
 * 
 * @param {string} rawSpec The raw memory string from GSMArena
 * @returns {Object} Structured memory spec
 */
exports.parseMemorySpec = (rawSpec) => {
    if (!rawSpec || typeof rawSpec !== 'string') {
        return {
            variants: [],
            ram_options: [],
            storage_options: []
        };
    }

    // Split by comma for multiple variants
    const parts = rawSpec.split(',').map(p => p.trim());
    const variants = [];
    const ramSet = new Set();
    const storageSet = new Set();

    // Regex explanation:
    // (\d+)\s*GB\s+  -> Matches digits (storage) followed by optional space and "GB"
    // (\d+)\s*GB\s+RAM -> Matches digits (RAM) followed by optional space and "GB RAM"
    // This handles variants like "128GB 8GB RAM" or "128 GB 8 GB RAM"
    const specRegex = /(\d+)\s*GB\s+(\d+)\s*GB\s*RAM/i;

    for (const part of parts) {
        const match = part.match(specRegex);
        if (match) {
            const storage_gb = parseInt(match[1], 10);
            const ram_gb = parseInt(match[2], 10);

            variants.push({ storage_gb, ram_gb });
            ramSet.add(ram_gb);
            storageSet.add(storage_gb);
        }
    }

    return {
        variants,
        ram_options: Array.from(ramSet).sort((a, b) => a - b),
        storage_options: Array.from(storageSet).sort((a, b) => a - b)
    };
};
