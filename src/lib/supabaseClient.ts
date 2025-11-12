import { createClient } from '@supabase/supabase-js'

// Prefer environment variables. Create a .env.local file with:
// VITE_SUPABASE_URL=your-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
// In Vite/React, env vars must be prefixed with VITE_

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Fallback to provided demo credentials if env not set (for quick local testing)
const fallbackUrl = 'https://hsoznocutyketetvlouk.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb3pub2N1dHlrZXRldHZsb3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzg2MDUsImV4cCI6MjA3ODAxNDYwNX0.nhJP2aqF3GkPBYWfHQI2ozPgoq98edOMheYbfgNPKqk'

export const supabase = createClient(
  SUPABASE_URL ?? fallbackUrl,
  SUPABASE_ANON_KEY ?? fallbackKey
)
