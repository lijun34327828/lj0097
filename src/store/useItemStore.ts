import { create } from 'zustand';
import { items as initialItems } from '@/data/items';
import type { Item } from '@/types';

interface ItemStore {
  items: Item[];
  getItem: (id: string) => Item | undefined;
  addItem: (id: string, count?: number) => void;
  useItem: (id: string) => boolean;
  hasItem: (id: string) => boolean;
  setItemRemaining: (id: string, remaining: number) => void;
  restoreFromPersisted: (itemRemaining: Record<string, number>) => void;
  resetAll: () => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: initialItems,

  getItem: (id) => {
    return get().items.find((i) => i.id === id);
  },

  addItem: (id, count = 1) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, remaining: item.remaining + count } : item
      ),
    })),

  useItem: (id) => {
    const state = get();
    const item = state.items.find((i) => i.id === id);
    if (!item || item.remaining <= 0) return false;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, remaining: i.remaining - 1 } : i
      ),
    }));
    return true;
  },

  hasItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    return item ? item.remaining > 0 : false;
  },

  setItemRemaining: (id, remaining) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, remaining: Math.max(0, remaining) } : item
      ),
    })),

  restoreFromPersisted: (itemRemaining) =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        remaining: itemRemaining[item.id] ?? item.remaining,
      })),
    })),

  resetAll: () => set({ items: initialItems }),
}));
