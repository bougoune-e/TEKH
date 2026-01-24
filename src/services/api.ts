const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type Produit = Record<string, any>;

export async function getProduits(): Promise<Produit[]> {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error(`Erreur API /api/products: ${res.status}`);
  return res.json();
}

export async function getProduit(id: string | number): Promise<Produit> {
  const res = await fetch(`${API_URL}/produits/${id}`);
  if (!res.ok) throw new Error(`Produit introuvable`);
  return res.json();
}

export async function updateStock(id: string | number, stock: number) {
  const res = await fetch(`${API_URL}/produits/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock })
  });
  if (!res.ok) throw new Error(`Erreur mise à jour stock`);
  return res.json();
}
