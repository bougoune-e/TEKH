import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SECRET_KEY, PRICE_TABLE, PRODUCTS_TABLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error('[API] Missing required server configuration: SUPABASE_URL and SUPABASE_SECRET_KEY.');
}

// This client bypasses RLS and must remain server-only.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

export const TABLE_PRICES = PRICE_TABLE || 'prix_telephones';
// Table d'import CSV. Doit exister dans Supabase (public). Sinon utiliser 'produits' ou créer la table.
export const TABLE_PRODUCTS = PRODUCTS_TABLE || 'produits';
