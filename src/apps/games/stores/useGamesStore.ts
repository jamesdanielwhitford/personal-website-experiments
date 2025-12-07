import { create } from 'zustand';

interface GamesState {
  // UI State Examples
  selectedGame: string | null;
  isMenuOpen: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;

  // Actions
  setSelectedGame: (game: string | null) => void;
  toggleMenu: () => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  toggleSound: () => void;
  resetState: () => void;
}

const initialState = {
  selectedGame: null,
  isMenuOpen: false,
  difficulty: 'medium' as const,
  soundEnabled: true,
};

export const useGamesStore = create<GamesState>((set) => ({
  ...initialState,

  setSelectedGame: (game) => set({ selectedGame: game }),

  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  setDifficulty: (difficulty) => set({ difficulty }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  resetState: () => set(initialState),
}));
