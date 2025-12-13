// Asset types supported by note folders
export type AssetType = 'text' | 'image' | 'video';

// File extensions mapped to asset types
export const ASSET_EXTENSIONS: Record<AssetType, string[]> = {
  text: ['.txt', '.md'],
  image: ['.png', '.svg', '.webp', '.jpeg', '.jpg', '.gif'],
  video: ['.mp4', '.mov', '.webm'],
};

// MIME types for assets
export const MIME_TYPES: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

// Metadata schema for a note folder (from metadata.json)
export interface NoteMetadata {
  id: string;
  title: string;
  filename: string;
  assetType: AssetType;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  tags: string[];
  checksum?: string;
}

// Regular folder node (contains subfolders or note folders)
export interface FolderNode {
  type: 'folder';
  name: string;
  path: string[];
  handle: FileSystemDirectoryHandle;
  children: TreeNode[];
}

// Note folder node (contains asset + metadata.json)
export interface NoteFolderNode {
  type: 'note';
  name: string;
  path: string[];
  handle: FileSystemDirectoryHandle;
  metadata: NoteMetadata;
}

// Union type for tree nodes
export type TreeNode = FolderNode | NoteFolderNode;

// Root directory model
export interface DirectoryModel {
  root: FolderNode;
  noteCount: number;
  folderCount: number;
  lastScanned: string;
}

// Asset content (loaded on demand)
export interface AssetContent {
  noteId: string;
  filename: string;
  assetType: AssetType;
  mimeType: string;
  content: string | Blob;
  objectUrl?: string; // For binary assets (images/videos)
}

// Helper to get asset type from filename
export function getAssetTypeFromFilename(filename: string): AssetType | null {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  for (const [assetType, extensions] of Object.entries(ASSET_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return assetType as AssetType;
    }
  }
  return null;
}

// Helper to get MIME type from filename
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return MIME_TYPES[ext] || 'application/octet-stream';
}
