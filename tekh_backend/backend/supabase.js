import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY, PRICE_TABLE, PRODUCTS_TABLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('[API] Missing required server configuration: SUPABASE_URL and SUPABASE_SECRET_KEY.');
}

// This client bypasses RLS and must remain server-only.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

// Public catalogue reads follow the same RLS policy as browser clients.
// This client is intentionally separate from the privileged administrative client.
export const supabasePublic = SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

export const TABLE_PRICES = PRICE_TABLE || 'prix_telephones';
// Table d'import CSV. Doit exister dans Supabase (public). Sinon utiliser 'produits' ou créer la table.
export const TABLE_PRODUCTS = PRODUCTS_TABLE || 'produits';
