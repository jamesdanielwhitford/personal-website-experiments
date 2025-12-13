import { create } from 'zustand';
import type { DirectoryModel, NoteFolderNode, AssetContent } from '../types/directoryTree';

interface BeautifulMindState {
  // UI State
  isSettingsOpen: boolean;
  currentTab: 'home' | 'explore' | 'settings';
  searchQuery: string;

  // Directory Tree State
  directoryModel: DirectoryModel | null;
  isScanning: boolean;
  scanError: string | null;
  selectedNote: NoteFolderNode | null;
  loadedAsset: AssetContent | null;
  isLoadingAsset: boolean;
  expandedPaths: string[]; // Track expanded folder paths as "path/to/folder"

  // UI Actions
  toggleSettings: () => void;
  setCurrentTab: (tab: 'home' | 'explore' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  resetState: () => void;

  // Directory Tree Actions
  setDirectoryModel: (model: DirectoryModel | null) => void;
  setScanning: (isScanning: boolean) => void;
  setScanError: (error: string | null) => void;
  selectNote: (note: NoteFolderNode | null) => void;
  setLoadedAsset: (asset: AssetContent | null) => void;
  setLoadingAsset: (isLoading: boolean) => void;
  toggleFolderExpanded: (path: string[]) => void;
  isPathExpanded: (path: string[]) => boolean;
  expandAll: () => void;
  collapseAll: () => void;
}

// Helper to convert path array to string key
const pathToKey = (path: string[]): string => path.join('/');

// Helper to collect all folder paths from tree
const collectAllFolderPaths = (model: DirectoryModel | null): string[] => {
  const paths: string[] = [''];
  if (!model) return paths;

  const traverse = (nodes: typeof model.root.children) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        paths.push(pathToKey(node.path));
        traverse(node.children);
      }
    }
  };

  traverse(model.root.children);
  return paths;
};

export const useBeautifulMindStore = create<BeautifulMindState>((set, get) => ({
  // Initial state
  isSettingsOpen: false,
  currentTab: 'home' as const,
  searchQuery: '',
  directoryModel: null,
  isScanning: false,
  scanError: null,
  selectedNote: null,
  loadedAsset: null,
  isLoadingAsset: false,
  expandedPaths: [''],

  // UI Actions
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetState: () => set({
    isSettingsOpen: false,
    currentTab: 'home' as const,
    searchQuery: '',
    directoryModel: null,
    isScanning: false,
    scanError: null,
    selectedNote: null,
    loadedAsset: null,
    isLoadingAsset: false,
    expandedPaths: [''],
  }),

  // Directory Tree Actions
  setDirectoryModel: (model) => set({
    directoryModel: model,
    expandedPaths: [''], // Start with root expanded
  }),

  setScanning: (isScanning) => set({ isScanning }),
  setScanError: (error) => set({ scanError: error }),

  selectNote: (note) => set({ selectedNote: note }),
  setLoadedAsset: (asset) => set({ loadedAsset: asset }),
  setLoadingAsset: (isLoading) => set({ isLoadingAsset: isLoading }),

  toggleFolderExpanded: (path) => set((state) => {
    const key = pathToKey(path);
    const isExpanded = state.expandedPaths.includes(key);
    if (isExpanded) {
      return { expandedPaths: state.expandedPaths.filter(p => p !== key) };
    } else {
      return { expandedPaths: [...state.expandedPaths, key] };
    }
  }),

  isPathExpanded: (path) => {
    const key = pathToKey(path);
    return get().expandedPaths.includes(key);
  },

  expandAll: () => set((state) => ({
    expandedPaths: collectAllFolderPaths(state.directoryModel),
  })),

  collapseAll: () => set({ expandedPaths: [''] }),
}));
