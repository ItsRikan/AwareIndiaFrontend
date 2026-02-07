
// Scan result types
export interface Ingredient {
  name: string;
  Itype: string;
  description: string;
  health_score: number;
}

export interface NutritionEstimate {
  calory: number;
  energy: number;
  protein: number;
  sugar?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface ScanResult {
  is_safe: boolean;
  product_name: string;
  url: string;
  description: string;
  ingredients: Ingredient[];
  nutrition_estimate: NutritionEstimate;
  health_score: number;
}

// History types
export interface HistoryItem {
  id: number;
  created_at: string;
  user: string;
  name: string;
  health_score: number;
  calory: number;
  energy: number;
  protein: number;
  sugar: number;
  fat: number;
  fiber: number;
  image_url: string;
}

// Auth types
export interface User {
  id: string;
  username: string; // Will store email or extracted username
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth API payloads
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds until token expires
  user_id: string;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// API types
export interface ImageKitAuthResponse {
  mock_mode?: boolean;
  publicKey?: string;
  urlEndpoint?: string;
  signature?: string;
  token?: string;
  expire?: number;
}

export interface MockUploadResponse {
  image_url: string;
  success: boolean;
}

export interface ScanRequest {
  url: string;
  category: string;
  allergy: string;
}

export interface CompareRequest {
  url1: string;
  url2: string;
  category: string;
  allergy: string;
  usecase: string;
}

export interface CompareResult {
  status?: boolean;
  best_product: string;
  is_safe1: boolean;
  is_safe2: boolean;
  health_score1: number;
  health_score2: number;
  description1: string;
  description2: string;
  preferred_for_you: string;
  url1: string;
  url2: string;
}

// Category options
export type ScanCategory = 'Food' | 'Cosmetics' | 'Pet Food' | 'Pet Cosmetics' | 'General';

export const SCAN_CATEGORIES: ScanCategory[] = [
  'General',
  'Food',
  'Cosmetics',
  'Pet Food',
  'Pet Cosmetics',
];

// Mock data for UI development
export const MOCK_SCAN_RESULT: ScanResult = {
  is_safe: false,
  product_name: "Mock Snack X",
  url: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",
  description: "Contains Tartrazine (E102) and Sodium Benzoate; may aggravate allergies and is high in sugar. Based on your allergy profile, this product may cause adverse reactions.",
  ingredients: [
    {
      name: "Wheat Flour",
      Itype: "natural",
      description: "Common base ingredient derived from wheat. Generally safe for consumption unless you have gluten intolerance or celiac disease.",
      health_score: 7
    },
    {
      name: "Sodium Benzoate (E211)",
      Itype: "preservative",
      description: "Common food preservative used to prevent bacterial and fungal growth. Can irritate susceptible individuals and may cause allergic reactions in some people.",
      health_score: 3
    },
    {
      name: "Tartrazine (E102)",
      Itype: "artificial_color",
      description: "Synthetic yellow dye commonly used in processed foods. May trigger hyperactivity in children and allergic responses in sensitive individuals. Banned in some countries.",
      health_score: 1
    },
    {
      name: "Sugar",
      Itype: "sweetener",
      description: "Added sugar provides calories without nutritional benefit. Excessive consumption linked to obesity, diabetes, and dental issues.",
      health_score: 4
    },
    {
      name: "Sunflower Oil",
      Itype: "natural",
      description: "Plant-based cooking oil rich in vitamin E. Generally considered a healthier fat option when consumed in moderation.",
      health_score: 6
    }
  ],
  nutrition_estimate: {
    calory: 210,
    energy: 880,
    protein: 5,
    sugar: 18,
    fat: 12,
    fiber: 2
  },
  health_score: 3
};

export const MOCK_SAFE_RESULT: ScanResult = {
  is_safe: true,
  product_name: "Organic Oat Bar",
  url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80",
  description: "This product contains wholesome organic ingredients with no artificial additives. Safe for your dietary requirements and provides good nutritional value.",
  ingredients: [
    {
      name: "Organic Oats",
      Itype: "natural",
      description: "Whole grain oats providing fiber, protein, and essential minerals. Heart-healthy and helps maintain stable blood sugar levels.",
      health_score: 9
    },
    {
      name: "Organic Honey",
      Itype: "natural",
      description: "Natural sweetener with antioxidant properties. Contains trace enzymes and minerals. Lower glycemic impact than refined sugar.",
      health_score: 7
    },
    {
      name: "Almonds",
      Itype: "natural",
      description: "Nutrient-dense nut rich in vitamin E, magnesium, and healthy fats. Supports heart health and provides sustained energy.",
      health_score: 9
    }
  ],
  nutrition_estimate: {
    calory: 180,
    energy: 752,
    protein: 6,
    sugar: 8,
    fat: 7,
    fiber: 4
  },
  health_score: 8
};
