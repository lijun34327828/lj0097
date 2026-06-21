export interface Product {
  id: string;
  name: string;
  emoji: string;
  weight: number;
  isHot: boolean;
  isHeavy: boolean;
  category: string;
  maxStock: number;
}

export interface ShelfLayer {
  id: string;
  level: number;
  name: string;
  maxWeight: number;
  maxSlots: number;
  isVisual: boolean;
  isBottom: boolean;
}

export interface PlacedProduct {
  id: string;
  productId: string;
  shelfLayerId: string;
  position: number;
}

export interface ValidationViolation {
  type: 'weight' | 'position' | 'stock';
  message: string;
  details?: string;
}

export interface ValidationResult {
  passed: boolean;
  violations: ValidationViolation[];
  weightCheck: {
    passed: boolean;
    details: { layerId: string; currentWeight: number; maxWeight: number }[];
  };
  positionCheck: {
    passed: boolean;
    details: { productId: string; reason: string }[];
  };
  stockCheck: {
    passed: boolean;
    details: { productId: string; currentCount: number; maxStock: number }[];
  };
}

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  unlocked: boolean;
  completed: boolean;
  products: Product[];
  shelfLayers: ShelfLayer[];
  rewardItemId?: string;
  rules: {
    weightCheck: boolean;
    positionCheck: boolean;
    stockCheck: boolean;
  };
}

export interface Item {
  id: string;
  name: string;
  description: string;
  emoji: string;
  effect: string;
  remaining: number;
}

export interface GameState {
  currentLevelId: string | null;
  placedProducts: PlacedProduct[];
  validationResult: ValidationResult | null;
  isSubmitted: boolean;
}
