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
  expandedPaths: Set<string>; // Track expanded folder paths as "path/to/folder"

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
  expandAll: () => void;
  collapseAll: () => void;
}

const initialState = {
  isSettingsOpen: false,
  currentTab: 'home' as const,
  searchQuery: '',
  directoryModel: null,
  isScanning: false,
  scanError: null,
  selectedNote: null,
  loadedAsset: null,
  isLoadingAsset: false,
  expandedPaths: new Set<string>(),
};

// Helper to convert path array to string key
const pathToKey = (path: string[]): string => path.join('/');

// Helper to collect all folder paths from tree
const collectAllFolderPaths = (model: DirectoryModel | null): Set<string> => {
  const paths = new Set<string>();
  if (!model) return paths;

  const traverse = (nodes: typeof model.root.children) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        paths.add(pathToKey(node.path));
        traverse(node.children);
      }
    }
  };

  // Add root
  paths.add('');
  traverse(model.root.children);
  return paths;
};

export const useBeautifulMindStore = create<BeautifulMindState>((set) => ({
  ...initialState,

  // UI Actions
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetState: () => set({ ...initialState, expandedPaths: new Set<string>() }),

  // Directory Tree Actions
  setDirectoryModel: (model) => set({
    directoryModel: model,
    // Auto-expand root when model is set
    expandedPaths: model ? new Set(['']) : new Set<string>(),
  }),

  setScanning: (isScanning) => set({ isScanning }),
  setScanError: (error) => set({ scanError: error }),

  selectNote: (note) => set({ selectedNote: note }),
  setLoadedAsset: (asset) => set({ loadedAsset: asset }),
  setLoadingAsset: (isLoading) => set({ isLoadingAsset: isLoading }),

  toggleFolderExpanded: (path) => set((state) => {
    const key = pathToKey(path);
    const newExpanded = new Set(state.expandedPaths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    return { expandedPaths: newExpanded };
  }),

  expandAll: () => set((state) => ({
    expandedPaths: collectAllFolderPaths(state.directoryModel),
  })),

  collapseAll: () => set({ expandedPaths: new Set(['']) }), // Keep root expanded
}));
