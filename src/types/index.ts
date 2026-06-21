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
  isExtra?: boolean;
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

export interface HighlightInfo {
  overweightLayers: string[];
  misplacedProducts: string[];
  overstockProducts: string[];
}

export interface ValidationResult {
  passed: boolean;
  violations: ValidationViolation[];
  highlights: HighlightInfo;
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
  timeLimit: number;
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

export interface ActiveItemEffect {
  itemId: string;
  effectType: 'weight_boost' | 'position_skip' | 'stock_boost' | 'extra_layer';
  targetLayerId?: string;
  targetProductId?: string;
  boostAmount?: number;
  extraLayer?: ShelfLayer;
}

export type HistoryActionType =
  | 'add'
  | 'remove'
  | 'move'
  | 'swap'
  | 'use_item'
  | 'reset';

export interface HistoryEntry {
  id: string;
  type: HistoryActionType;
  timestamp: number;
  beforeState: SnapshotState;
  afterState: SnapshotState;
  description: string;
}

export interface SnapshotState {
  placedProducts: PlacedProduct[];
  activeEffects: ActiveItemEffect[];
  itemRemaining: Record<string, number>;
  validationResult: ValidationResult | null;
}

export interface ScoreResult {
  totalScore: number;
  stars: 1 | 2 | 3;
  breakdown: {
    remainingItems: { score: number; maxScore: number; remaining: number; total: number };
    correctionCount: { score: number; maxScore: number; count: number };
    timeBonus: { score: number; maxScore: number; timeUsed: number; timeLimit: number };
  };
}

export interface GameState {
  currentLevelId: string | null;
  placedProducts: PlacedProduct[];
  activeEffects: ActiveItemEffect[];
  validationResult: ValidationResult | null;
  isSubmitted: boolean;
  isFailed: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  startTime: number | null;
  remainingTime: number | null;
  isPaused: boolean;
  correctionCount: number;
  scoreResult: ScoreResult | null;
  isDragging: boolean;
  dragPreview: {
    productId: string;
    targetLayerId: string | null;
    targetPosition: number | null;
    sourcePlacedId?: string;
  } | null;
}

export interface PersistedGameState {
  levelId: string;
  placedProducts: PlacedProduct[];
  activeEffects: ActiveItemEffect[];
  itemRemaining: Record<string, number>;
  remainingTime: number;
  history: HistoryEntry[];
  historyIndex: number;
  correctionCount: number;
  timestamp: number;
}

export type ItemEffectType = 'weight_boost' | 'position_skip' | 'stock_boost' | 'extra_layer';

export const ITEM_CONFIG: Record<string, { effect: ItemEffectType; boostAmount: number }> = {
  item1: { effect: 'position_skip', boostAmount: 1 },
  item2: { effect: 'weight_boost', boostAmount: 2000 },
  item3: { effect: 'stock_boost', boostAmount: 1 },
  item4: { effect: 'extra_layer', boostAmount: 1 },
};
