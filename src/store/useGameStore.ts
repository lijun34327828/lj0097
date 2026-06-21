import { create } from 'zustand';
import type {
  GameState,
  PlacedProduct,
  ValidationResult,
  HistoryEntry,
  SnapshotState,
  ActiveItemEffect,
  ScoreResult,
  HistoryActionType,
  ShelfLayer,
  PersistedGameState,
} from '@/types';
import { ITEM_CONFIG } from '@/types';
import { validateShelf } from '@/utils/validator';
import { calculateScore } from '@/utils/scoring';
import { saveGameState, clearGameState } from '@/utils/persistence';
import type { Level, Product, Item } from '@/types';

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const reorderPositions = (
  products: PlacedProduct[],
  layerId: string
): PlacedProduct[] => {
  const layerProducts = products
    .filter((p) => p.shelfLayerId === layerId)
    .sort((a, b) => a.position - b.position);

  const reordered = layerProducts.map((p, idx) => ({ ...p, position: idx }));
  const others = products.filter((p) => p.shelfLayerId !== layerId);

  return [...others, ...reordered];
};

const validateAndUpdate = (
  placedProducts: PlacedProduct[],
  activeEffects: ActiveItemEffect[],
  shelfLayers: ShelfLayer[],
  products: Product[],
  rules: Level['rules']
): ValidationResult => {
  const effectiveLayers = shelfLayers.map((layer) => {
    const boostEffect = activeEffects.find(
      (e) => e.effectType === 'weight_boost' && e.targetLayerId === layer.id
    );
    if (boostEffect && boostEffect.boostAmount) {
      return { ...layer, maxWeight: layer.maxWeight + boostEffect.boostAmount };
    }
    return layer;
  });

  const extraLayers = activeEffects
    .filter((e) => e.effectType === 'extra_layer' && e.extraLayer)
    .map((e) => e.extraLayer!);

  const allLayers = [...effectiveLayers, ...extraLayers];

  const skippedProductIds = activeEffects
    .filter((e) => e.effectType === 'position_skip' && e.targetProductId)
    .map((e) => e.targetProductId!);

  const stockBoosts = activeEffects.filter((e) => e.effectType === 'stock_boost');

  const effectiveProducts = products.map((p) => {
    const boostCount = stockBoosts.filter((e) => e.targetProductId === p.id).length;
    if (boostCount > 0) {
      return { ...p, maxStock: p.maxStock + boostCount };
    }
    return p;
  });

  const result = validateShelf(
    placedProducts,
    allLayers,
    effectiveProducts,
    rules,
    skippedProductIds
  );

  return result;
};

interface GameStore extends GameState {
  initLevel: (levelId: string, persistedState?: PersistedGameState) => void;
  addPlacedProduct: (product: Omit<PlacedProduct, 'id' | 'position'>) => void;
  removePlacedProduct: (placedId: string) => void;
  movePlacedProduct: (
    placedId: string,
    newLayerId: string,
    newPosition: number
  ) => void;
  swapProducts: (placedId1: string, placedId2: string) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  setSubmitted: (submitted: boolean) => void;
  resetLevel: () => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  useItem: (
    itemId: string,
    targetLayerId?: string,
    targetProductId?: string
  ) => boolean;
  startTimer: () => void;
  tickTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setDragging: (isDragging: boolean) => void;
  setDragPreview: (preview: GameState['dragPreview']) => void;
  validateRealTime: (level: Level) => void;
  submitLevel: (level: Level, items: Item[]) => void;
  getEffectiveLayers: (baseLayers: ShelfLayer[]) => ShelfLayer[];
  getEffectiveMaxWeight: (baseLayer: ShelfLayer) => number;
  getEffectiveMaxStock: (product: Product) => number;
  isPositionSkipped: (productId: string) => boolean;
  pushHistory: (
    type: HistoryActionType,
    description: string,
    itemRemaining: Record<string, number>
  ) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentLevelId: null,
  placedProducts: [],
  activeEffects: [],
  validationResult: null,
  isSubmitted: false,
  isFailed: false,
  history: [],
  historyIndex: -1,
  startTime: null,
  remainingTime: null,
  isPaused: false,
  correctionCount: 0,
  scoreResult: null,
  isDragging: false,
  dragPreview: null,

  initLevel: (levelId, persistedState) => {
    if (persistedState) {
      set({
        currentLevelId: levelId,
        placedProducts: persistedState.placedProducts,
        activeEffects: persistedState.activeEffects,
        remainingTime: persistedState.remainingTime,
        history: persistedState.history,
        historyIndex: persistedState.historyIndex,
        correctionCount: persistedState.correctionCount,
        validationResult: null,
        isSubmitted: false,
        isFailed: false,
        scoreResult: null,
        startTime: null,
        isPaused: false,
        isDragging: false,
        dragPreview: null,
      });
    } else {
      set({
        currentLevelId: levelId,
        placedProducts: [],
        activeEffects: [],
        validationResult: null,
        isSubmitted: false,
        isFailed: false,
        history: [],
        historyIndex: -1,
        startTime: null,
        remainingTime: null,
        isPaused: false,
        correctionCount: 0,
        scoreResult: null,
        isDragging: false,
        dragPreview: null,
      });
    }
  },

  pushHistory: (type, description, itemRemaining) => {
    const state = get();
    const snapshot: SnapshotState = {
      placedProducts: JSON.parse(JSON.stringify(state.placedProducts)),
      activeEffects: JSON.parse(JSON.stringify(state.activeEffects)),
      itemRemaining: { ...itemRemaining },
      validationResult: state.validationResult
        ? JSON.parse(JSON.stringify(state.validationResult))
        : null,
    };

    const entry: HistoryEntry = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      beforeState: snapshot,
      afterState: snapshot,
      description,
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addPlacedProduct: (product) =>
    set((state) => {
      const layerCount = state.placedProducts.filter(
        (p) => p.shelfLayerId === product.shelfLayerId
      ).length;

      const newProduct: PlacedProduct = {
        ...product,
        id: `placed-${generateId()}`,
        position: layerCount,
      };

      const newProducts = [...state.placedProducts, newProduct];

      return {
        placedProducts: newProducts,
        isSubmitted: false,
      };
    }),

  removePlacedProduct: (placedId) =>
    set((state) => {
      const target = state.placedProducts.find((p) => p.id === placedId);
      if (!target) return state;

      const { shelfLayerId, position: removedPosition } = target;

      const newProducts = state.placedProducts
        .filter((p) => p.id !== placedId)
        .map((p) => {
          if (p.shelfLayerId === shelfLayerId && p.position > removedPosition) {
            return { ...p, position: p.position - 1 };
          }
          return p;
        });

      return {
        placedProducts: newProducts,
        isSubmitted: false,
        correctionCount: state.correctionCount + 1,
      };
    }),

  movePlacedProduct: (placedId, newLayerId, newPosition) =>
    set((state) => {
      const product = state.placedProducts.find((p) => p.id === placedId);
      if (!product) return state;

      const oldLayerId = product.shelfLayerId;
      const oldPosition = product.position;

      let newProducts = state.placedProducts.map((p) => {
        if (p.id === placedId) {
          return { ...p, shelfLayerId: newLayerId, position: newPosition };
        }
        return p;
      });

      if (oldLayerId !== newLayerId) {
        newProducts = reorderPositions(newProducts, oldLayerId);
      }
      newProducts = reorderPositions(newProducts, newLayerId);

      return {
        placedProducts: newProducts,
        isSubmitted: false,
      };
    }),

  swapProducts: (placedId1, placedId2) =>
    set((state) => {
      const p1 = state.placedProducts.find((p) => p.id === placedId1);
      const p2 = state.placedProducts.find((p) => p.id === placedId2);

      if (!p1 || !p2) return state;

      const layer1Id = p1.shelfLayerId;
      const layer2Id = p2.shelfLayerId;
      const pos1 = p1.position;
      const pos2 = p2.position;

      const newProducts = state.placedProducts.map((p) => {
        if (p.id === placedId1) {
          return { ...p, shelfLayerId: layer2Id, position: pos2 };
        }
        if (p.id === placedId2) {
          return { ...p, shelfLayerId: layer1Id, position: pos1 };
        }
        return p;
      });

      let finalProducts = newProducts;
      if (layer1Id !== layer2Id) {
        finalProducts = reorderPositions(finalProducts, layer1Id);
        finalProducts = reorderPositions(finalProducts, layer2Id);
      }

      return {
        placedProducts: finalProducts,
        isSubmitted: false,
      };
    }),

  setValidationResult: (result) => set({ validationResult: result }),

  setSubmitted: (submitted) => set({ isSubmitted: submitted }),

  resetLevel: () =>
    set({
      placedProducts: [],
      activeEffects: [],
      validationResult: null,
      isSubmitted: false,
      isFailed: false,
      history: [],
      historyIndex: -1,
      correctionCount: 0,
      scoreResult: null,
      remainingTime: null,
      startTime: null,
      isPaused: false,
    }),

  clearAll: () =>
    set({
      currentLevelId: null,
      placedProducts: [],
      activeEffects: [],
      validationResult: null,
      isSubmitted: false,
      isFailed: false,
      history: [],
      historyIndex: -1,
      startTime: null,
      remainingTime: null,
      isPaused: false,
      correctionCount: 0,
      scoreResult: null,
      isDragging: false,
      dragPreview: null,
    }),

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    const entry = state.history[state.historyIndex];
    const beforeState = entry.beforeState;

    set({
      placedProducts: beforeState.placedProducts,
      activeEffects: beforeState.activeEffects,
      validationResult: beforeState.validationResult,
      historyIndex: state.historyIndex - 1,
      isSubmitted: false,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const entry = state.history[state.historyIndex + 1];
    const afterState = entry.afterState;

    set({
      placedProducts: afterState.placedProducts,
      activeEffects: afterState.activeEffects,
      validationResult: afterState.validationResult,
      historyIndex: state.historyIndex + 1,
      isSubmitted: false,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  useItem: (itemId, targetLayerId, targetProductId) => {
    const config = ITEM_CONFIG[itemId];
    if (!config) return false;

    const effect: ActiveItemEffect = {
      itemId,
      effectType: config.effect,
      targetLayerId,
      targetProductId,
      boostAmount: config.boostAmount,
    };

    if (config.effect === 'extra_layer') {
      const state = get();
      const existingExtraLayers = state.activeEffects.filter(
        (e) => e.effectType === 'extra_layer'
      ).length;

      effect.extraLayer = {
        id: `extra-layer-${generateId()}`,
        level: existingExtraLayers,
        name: `万能层 ${existingExtraLayers + 1}`,
        maxWeight: 99999,
        maxSlots: 20,
        isVisual: false,
        isBottom: false,
        isExtra: true,
      };
    }

    set((state) => ({
      activeEffects: [...state.activeEffects, effect],
      isSubmitted: false,
    }));

    return true;
  },

  startTimer: () => {
    const state = get();
    if (state.remainingTime !== null) return;

    const level = (window as any).__currentLevel as Level | undefined;
    const timeLimit = level?.timeLimit || 180;

    set({
      startTime: Date.now(),
      remainingTime: timeLimit,
      isPaused: false,
    });
  },

  tickTimer: () => {
    const state = get();
    if (state.isPaused || state.remainingTime === null || state.isSubmitted) return;

    const newTime = state.remainingTime - 1;

    if (newTime <= 0) {
      set({
        remainingTime: 0,
        isFailed: true,
        isPaused: true,
      });
    } else {
      set({ remainingTime: newTime });
    }
  },

  pauseTimer: () => set({ isPaused: true }),
  resumeTimer: () => set({ isPaused: false }),

  setDragging: (isDragging) => set({ isDragging }),

  setDragPreview: (preview) => set({ dragPreview: preview }),

  validateRealTime: (level) => {
    const state = get();
    const result = validateAndUpdate(
      state.placedProducts,
      state.activeEffects,
      level.shelfLayers,
      level.products,
      level.rules
    );
    set({ validationResult: result });
  },

  submitLevel: (level, items) => {
    const state = get();
    const result = validateAndUpdate(
      state.placedProducts,
      state.activeEffects,
      level.shelfLayers,
      level.products,
      level.rules
    );

    let scoreResult: ScoreResult | null = null;
    if (result.passed) {
      const timeUsed = level.timeLimit - (state.remainingTime || level.timeLimit);
      scoreResult = calculateScore(items, state.correctionCount, timeUsed, level.timeLimit);
    }

    set({
      validationResult: result,
      isSubmitted: true,
      isFailed: !result.passed,
      isPaused: true,
      scoreResult,
    });

    clearGameState();
  },

  getEffectiveLayers: (baseLayers) => {
    const state = get();
    const boostedLayers = baseLayers.map((layer) => {
      const boostEffect = state.activeEffects.find(
        (e) => e.effectType === 'weight_boost' && e.targetLayerId === layer.id
      );
      if (boostEffect && boostEffect.boostAmount) {
        return { ...layer, maxWeight: layer.maxWeight + boostEffect.boostAmount };
      }
      return layer;
    });

    const extraLayers = state.activeEffects
      .filter((e) => e.effectType === 'extra_layer' && e.extraLayer)
      .map((e) => e.extraLayer!);

    return [...boostedLayers, ...extraLayers];
  },

  getEffectiveMaxWeight: (baseLayer) => {
    const state = get();
    const boostEffect = state.activeEffects.find(
      (e) => e.effectType === 'weight_boost' && e.targetLayerId === baseLayer.id
    );
    if (boostEffect && boostEffect.boostAmount) {
      return baseLayer.maxWeight + boostEffect.boostAmount;
    }
    if (baseLayer.isExtra) {
      return baseLayer.maxWeight;
    }
    return baseLayer.maxWeight;
  },

  getEffectiveMaxStock: (product) => {
    const state = get();
    const boosts = state.activeEffects.filter(
      (e) => e.effectType === 'stock_boost' && e.targetProductId === product.id
    );
    return product.maxStock + boosts.length;
  },

  isPositionSkipped: (productId) => {
    const state = get();
    return state.activeEffects.some(
      (e) => e.effectType === 'position_skip' && e.targetProductId === productId
    );
  },
}));

export const persistCurrentState = (items: Item[]) => {
  const state = useGameStore.getState();
  if (!state.currentLevelId) return;

  const itemRemaining: Record<string, number> = {};
  items.forEach((item) => {
    itemRemaining[item.id] = item.remaining;
  });

  const persisted: PersistedGameState = {
    levelId: state.currentLevelId,
    placedProducts: state.placedProducts,
    activeEffects: state.activeEffects,
    itemRemaining,
    remainingTime: state.remainingTime || 0,
    history: state.history,
    historyIndex: state.historyIndex,
    correctionCount: state.correctionCount,
    timestamp: Date.now(),
  };

  saveGameState(persisted);
};
