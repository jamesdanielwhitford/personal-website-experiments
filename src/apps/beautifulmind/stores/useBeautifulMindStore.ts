import { create } from 'zustand';

interface BeautifulMindState {
  // UI State Examples
  isDarkMode: boolean;
  isSettingsOpen: boolean;
  currentTab: 'home' | 'explore' | 'settings';
  searchQuery: string;

  // Actions
  toggleDarkMode: () => void;
  toggleSettings: () => void;
  setCurrentTab: (tab: 'home' | 'explore' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  resetState: () => void;
}

const initialState = {
  isDarkMode: false,
  isSettingsOpen: false,
  currentTab: 'home' as const,
  searchQuery: '',
};

export const useBeautifulMindStore = create<BeautifulMindState>((set) => ({
  ...initialState,

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  setCurrentTab: (tab) => set({ currentTab: tab }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  resetState: () => set(initialState),
}));
