import type { PersistedGameState } from '@/types';

const STORAGE_KEY = 'shelf_training_game_state';

export const saveGameState = (state: PersistedGameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
};

export const loadGameState = (): PersistedGameState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGameState;
  } catch (e) {
    console.error('Failed to load game state:', e);
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear game state:', e);
  }
};

export const hasPersistedState = (levelId: string): boolean => {
  const state = loadGameState();
  return state !== null && state.levelId === levelId;
};
