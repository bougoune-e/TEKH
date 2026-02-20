-- SCHEMA V2 for TEKH+
-- This schema handles brands, models, and variants (RAM/Storage) for precise pricing.

-- Cleanup (Rebuild everything)
DROP TABLE IF EXISTS variants CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- 1. Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Full access for service_role" ON brands FOR ALL USING (auth.role() = 'service_role');

-- 2. Models Table
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    release_year INT,
    equivalence_class CHAR(1) CHECK (equivalence_class IN ('A', 'B', 'C', 'D', 'E', 'F')),
    gsmarena_slug TEXT UNIQUE,
    image_url TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

-- Enable RLS for Models
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for models" ON models FOR SELECT USING (true);
CREATE POLICY "Full access for service_role" ON models FOR ALL USING (auth.role() = 'service_role');

-- 3. Variants Table (RAM/Storage configurations)
CREATE TABLE IF NOT EXISTS variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    ram_gb INT,
    storage_gb INT NOT NULL,
    base_price_fcfa INT, -- Pricing from tab_cleaned.csv or reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_id, ram_gb, storage_gb)
);

-- Enable RLS for Variants
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for variants" ON variants FOR SELECT USING (true);
CREATE POLICY "Full access for service_role" ON variants FOR ALL USING (auth.role() = 'service_role');
