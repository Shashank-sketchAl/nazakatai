export type Category = 'Kurta Set' | 'Saree' | 'Lehenga' | 'Suit' | 'Anarkali' | 'Coord';

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  category: Category;
  fabric_type: string;
  craft_type: string;
  occasions: string[];
  colors: string[];
  sizes_available: string[];
  images: string[];
  inventory_count: number;
  is_active: boolean;
}

export interface ProfileState {
  occasion?: string;
  budget?: string;
  style?: string;
  size?: string;
  skinTone?: string;
}

export interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp?: number;
  fabric: string;
  color: string;
  imageUrl: string;
  pdpUrl: string;
  reason: string;
}
