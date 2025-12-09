import { create } from 'zustand';

interface BeautifulMindState {
  // UI State Examples
  isSettingsOpen: boolean;
  currentTab: 'home' | 'explore' | 'settings';
  searchQuery: string;

  // Actions
  toggleSettings: () => void;
  setCurrentTab: (tab: 'home' | 'explore' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  resetState: () => void;
}

const initialState = {
  isSettingsOpen: false,
  currentTab: 'home' as const,
  searchQuery: '',
};

export const useBeautifulMindStore = create<BeautifulMindState>((set) => ({
  ...initialState,

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  setCurrentTab: (tab) => set({ currentTab: tab }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  resetState: () => set(initialState),
}));
