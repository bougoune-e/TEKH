export interface DealPost {
  id: string;
  title: string;
  brand: string;
  model: string;
  condition: string;
  description: string;
  price?: number;
  images: string[];
}

export const initialDeals: DealPost[] = [
  {
    id: "1",
    title: "Échange iPhone 12 contre Samsung S21 + 50k",
    brand: "Apple",
    model: "iPhone 12",
    condition: "Bon",
    description: "Écran OK, batterie 84%, quelques micro-rayures.",
    price: 50000,
    images: [],
  },
  {
    id: "2",
    title: "Samsung A54 contre Xiaomi Redmi Note 12",
    brand: "Samsung",
    model: "A54",
    condition: "Très bon",
    description: "Toujours avec coque, très propre.",
    price: 0,
    images: [],
  },
];
