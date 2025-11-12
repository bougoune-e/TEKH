import { supabase as client } from '@/lib/supabaseClient'
export const supabase = client

// --- Simulation de valeur ---
export async function simulateValue(specs: { battery: number; storage: number; cpu_score: number }) {
  console.log('[simulateValue] input specs:', specs)
  const { data, error } = await supabase.rpc('simulate_value', specs as any)
  if (error) {
    console.error('[simulateValue] RPC error:', error)
    throw new Error("Echec de l'estimation. Réessaie plus tard.")
  }
  console.log('[simulateValue] result:', data)
  return data as number
}

// --- Récupération des deals ---
export async function getMatchingDeals(userId: string, price: number, specs: object) {
  console.log('[getMatchingDeals] params:', { userId, price, specs })
  const { data, error } = await supabase.rpc('match_deals', { user_id: userId, price, specs } as any)
  if (error) {
    console.error('[getMatchingDeals] RPC error:', error)
    throw new Error('Impossible de récupérer les deals correspondants.')
  }
  console.log('[getMatchingDeals] result count:', Array.isArray(data) ? data.length : 0)
  return data as any[]
}

// --- Création d’un deal ---
export async function createDeal(userId: string, specs: object, proposedPrice: number) {
  console.log('[createDeal] params:', { userId, specs, proposedPrice })
  const { data, error } = await supabase.rpc('create_deal', {
    user_id: userId,
    specs,
    proposed_price: proposedPrice,
  } as any)
  if (error) {
    console.error('[createDeal] RPC error:', error)
    throw new Error("Impossible de créer le deal. Vérifie les informations fournies.")
  }
  console.log('[createDeal] new deal id:', data)
  return data as string
}

// --- Cache local pour le simulateur ---
const CACHE_KEY = 'swap_simulations_cache'

export function cacheSimulation(specs: object, result: number) {
  try {
    const cacheRaw = localStorage.getItem(CACHE_KEY)
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {}
    cache[JSON.stringify(specs)] = result
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    console.log('[cacheSimulation] cached')
  } catch (e) {
    console.warn('[cacheSimulation] failed to cache', e)
  }
}

export function getCachedSimulation(specs: object): number | null {
  try {
    const cacheRaw = localStorage.getItem(CACHE_KEY)
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {}
    const value = cache[JSON.stringify(specs)]
    console.log('[getCachedSimulation] value:', value)
    return value ?? null
  } catch (e) {
    console.warn('[getCachedSimulation] failed to read cache', e)
    return null
  }
}

// --- Realtime notifications ---
export function listenToDealNotifications(userId: string, callback: (data: any) => void) {
  console.log('[listenToDealNotifications] subscribe for user:', userId)
  return supabase
    .channel('deals')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
      console.log('[listenToDealNotifications] payload:', payload)
      callback((payload as any).new)
    })
    .subscribe()
}
