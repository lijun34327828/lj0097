import { create } from 'zustand';
import { levels as initialLevels } from '@/data/levels';
import type { Level } from '@/types';

interface LevelStore {
  levels: Level[];
  getLevel: (id: string) => Level | undefined;
  unlockLevel: (id: string) => void;
  completeLevel: (id: string) => void;
  getNextLevelId: (currentId: string) => string | undefined;
}

export const useLevelStore = create<LevelStore>((set, get) => ({
  levels: initialLevels,

  getLevel: (id) => {
    return get().levels.find((l) => l.id === id);
  },

  unlockLevel: (id) =>
    set((state) => ({
      levels: state.levels.map((l) =>
        l.id === id ? { ...l, unlocked: true } : l
      ),
    })),

  completeLevel: (id) => {
    const state = get();
    const currentIndex = state.levels.findIndex((l) => l.id === id);
    const nextLevel = state.levels[currentIndex + 1];

    set((state) => ({
      levels: state.levels.map((l, index) => {
        if (l.id === id) {
          return { ...l, completed: true };
        }
        if (nextLevel && index === currentIndex + 1) {
          return { ...l, unlocked: true };
        }
        return l;
      }),
    }));
  },

  getNextLevelId: (currentId) => {
    const state = get();
    const currentIndex = state.levels.findIndex((l) => l.id === currentId);
    if (currentIndex < state.levels.length - 1) {
      return state.levels[currentIndex + 1].id;
    }
    return undefined;
  },
}));
