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
    set((state) => ({
      placedProducts: [...state.placedProducts, product],
    })),

  removePlacedProduct: (placedId) =>
    set((state) => ({
      placedProducts: state.placedProducts.filter((p) => p.id !== placedId),
    })),

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
