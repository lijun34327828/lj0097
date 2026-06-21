import { create } from 'zustand';
import type { GameState, PlacedProduct, ValidationResult } from '@/types';

interface GameStore extends GameState {
  setCurrentLevel: (levelId: string | null) => void;
  addPlacedProduct: (product: PlacedProduct) => void;
  removePlacedProduct: (placedId: string) => void;
  movePlacedProduct: (placedId: string, newLayerId: string, newPosition: number) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  setSubmitted: (submitted: boolean) => void;
  resetLevel: () => void;
  clearAll: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentLevelId: null,
  placedProducts: [],
  validationResult: null,
  isSubmitted: false,

  setCurrentLevel: (levelId) => set({ currentLevelId: levelId }),

  addPlacedProduct: (product) =>
    set((state) => {
      const layerCount = state.placedProducts.filter(
        (p) => p.shelfLayerId === product.shelfLayerId
      ).length;
      const safeProduct = { ...product, position: layerCount };
      return {
        placedProducts: [...state.placedProducts, safeProduct],
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

      return { placedProducts: newProducts };
    }),

  movePlacedProduct: (placedId, newLayerId, newPosition) =>
    set((state) => ({
      placedProducts: state.placedProducts.map((p) =>
        p.id === placedId
          ? { ...p, shelfLayerId: newLayerId, position: newPosition }
          : p
      ),
    })),

  setValidationResult: (result) => set({ validationResult: result }),

  setSubmitted: (submitted) => set({ isSubmitted: submitted }),

  resetLevel: () =>
    set({
      placedProducts: [],
      validationResult: null,
      isSubmitted: false,
    }),

  clearAll: () =>
    set({
      currentLevelId: null,
      placedProducts: [],
      validationResult: null,
      isSubmitted: false,
    }),
}));
