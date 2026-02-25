export type ConditionLabel = "Neuf" | "Très bon" | "Bon" | "Moyen";

export type DealStatus = "draft" | "published" | "archived";

export type DealPost = {
  id: string;
  title: string;
  brand: string;
  model: string;
  condition: ConditionLabel;
  description: string;
  price: number; // Valeur estimée/affichée du téléphone (FCFA)
  images: string[];
  storage?: number; // Go
  ram?: number; // Go
  color?: string;
  estimatedValue?: number; // si différent de price
  verified?: boolean;
  negotiable?: boolean;
  tags?: string[];
  createdAt?: string;
  location?: string;
  ownerId?: string; // propriétaire de l'annonce
  sellerName?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  /** Admin: draft | published | archived */
  status?: DealStatus;
  publishedAt?: string;
};

export const dealsData: DealPost[] = [
  {
    id: crypto.randomUUID(),
    title: "iPhone 12 128 Go",
    brand: "Apple",
    model: "iPhone 12",
    condition: "Très bon",
    description: "Toujours protégé, batterie 88%.",
    price: 240000,
    images: [],
    storage: 128,
    ram: 4,
    color: "Noir",
    verified: true,
    negotiable: true,
    tags: ["⭐ Confiance", "💬 Négociable"],
    location: "Abidjan, Cocody",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Samsung Galaxy S21 256 Go",
    brand: "Samsung",
    model: "Galaxy S21",
    condition: "Bon",
    description: "Micro rayures, coque offerte.",
    price: 210000,
    images: [],
    storage: 256,
    ram: 8,
    color: "Gris",
    verified: true,
    negotiable: false,
    tags: ["🔥 Bon plan"],
    location: "Lomé, Agoè",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "iPhone 13 128 Go",
    brand: "Apple",
    model: "iPhone 13",
    condition: "Très bon",
    description: "État proche du neuf.",
    price: 300000,
    images: [],
    storage: 128,
    ram: 4,
    color: "Vert",
    verified: true,
    negotiable: true,
    tags: ["⭐ Confiance", "Nouveau"],
    location: "Dakar, Plateau",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Xiaomi Redmi Note 12",
    brand: "Xiaomi",
    model: "Redmi Note 12",
    condition: "Bon",
    description: "Rapide et autonome.",
    price: 120000,
    images: [],
    storage: 128,
    ram: 6,
    color: "Bleu",
    verified: false,
    negotiable: true,
    tags: ["💬 Négociable"],
    location: "Cotonou, Ganhi",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Google Pixel 6",
    brand: "Google",
    model: "Pixel 6",
    condition: "Moyen",
    description: "Trace d’usure, fonctionne bien.",
    price: 180000,
    images: [],
    storage: 128,
    ram: 8,
    color: "Noir",
    verified: false,
    negotiable: true,
    location: "Abidjan, Yopougon",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Samsung Galaxy A54",
    brand: "Samsung",
    model: "Galaxy A54",
    condition: "Neuf",
    description: "Scellé, facture fournie.",
    price: 220000,
    images: [],
    storage: 128,
    ram: 6,
    color: "Blanc",
    verified: true,
    negotiable: false,
    tags: ["Nouveau"],
    location: "Dakar, Pikine",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Huawei P40 Pro",
    brand: "Huawei",
    model: "P40 Pro",
    condition: "Bon",
    description: "Très bonnes caméras.",
    price: 170000,
    images: [],
    storage: 256,
    ram: 8,
    color: "Argent",
    verified: false,
    negotiable: true,
  },
  {
    id: crypto.randomUUID(),
    title: "iPhone 11 64 Go",
    brand: "Apple",
    model: "iPhone 11",
    condition: "Bon",
    description: "Bon état général.",
    price: 180000,
    images: [],
    storage: 64,
    ram: 4,
    color: "Violet",
    verified: true,
    negotiable: true,
    location: "Abidjan, Treichville",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Tecno Spark 10",
    brand: "Tecno",
    model: "Spark 10",
    condition: "Très bon",
    description: "Récemment acquis.",
    price: 90000,
    images: [],
    storage: 128,
    ram: 4,
    color: "Noir",
    verified: false,
    negotiable: true,
  },
  {
    id: crypto.randomUUID(),
    title: "Infinix Note 12",
    brand: "Infinix",
    model: "Note 12",
    condition: "Très bon",
    description: "Batterie endurante.",
    price: 110000,
    images: [],
    storage: 128,
    ram: 6,
    verified: false,
    negotiable: true,
  },
  {
    id: crypto.randomUUID(),
    title: "Samsung Galaxy S20",
    brand: "Samsung",
    model: "Galaxy S20",
    condition: "Très bon",
    description: "Écran impeccable.",
    price: 190000,
    images: [],
    storage: 128,
    ram: 8,
    verified: true,
    negotiable: false,
    location: "Yaoundé, Bastos",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "iPhone SE (2022)",
    brand: "Apple",
    model: "iPhone SE (2022)",
    condition: "Très bon",
    description: "Compact et puissant.",
    price: 160000,
    images: [],
    storage: 128,
    ram: 4,
    verified: false,
    negotiable: true,
    location: "Lagos, Victoria Island",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export default dealsData;
