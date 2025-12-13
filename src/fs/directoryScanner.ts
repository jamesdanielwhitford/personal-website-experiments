// Directory Scanner Service
// Recursively scans directories and builds an in-memory tree model

import { readJsonFile } from './fileSystem';
import {
  type TreeNode,
  type FolderNode,
  type NoteFolderNode,
  type NoteMetadata,
  type DirectoryModel,
  type AssetContent,
  getAssetTypeFromFilename,
  getMimeTypeFromFilename,
} from '../apps/beautifulmind/types/directoryTree';

// Check if a file is a potential primary asset
function isPrimaryAsset(filename: string): boolean {
  return getAssetTypeFromFilename(filename) !== null;
}

// Find all potential asset files in a directory
async function findAssetFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<string[]> {
  const assets: string[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && isPrimaryAsset(entry.name)) {
      assets.push(entry.name);
    }
  }
  return assets;
}

// Check if directory contains metadata.json
async function hasMetadataFile(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    await dirHandle.getFileHandle('metadata.json');
    return true;
  } catch {
    return false;
  }
}

// Check if a directory is a note folder (has metadata.json + exactly one primary asset)
export async function isNoteFolder(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  const hasMetadata = await hasMetadataFile(dirHandle);
  if (!hasMetadata) return false;

  const assets = await findAssetFiles(dirHandle);
  return assets.length === 1;
}

// Read and validate metadata from a note folder
async function readNoteMetadata(
  dirHandle: FileSystemDirectoryHandle
): Promise<NoteMetadata | null> {
  try {
    const metadata = await readJsonFile<NoteMetadata>(dirHandle, 'metadata.json');
    if (!metadata) return null;

    // Validate required fields
    if (!metadata.id || !metadata.title || !metadata.filename) {
      console.warn('Invalid metadata: missing required fields');
      return null;
    }

    return metadata;
  } catch (error) {
    console.warn('Failed to read metadata:', error);
    return null;
  }
}

// Recursively scan a directory and build tree nodes
async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  path: string[]
): Promise<TreeNode[]> {
  const children: TreeNode[] = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind !== 'directory') continue;

    const childHandle = await dirHandle.getDirectoryHandle(entry.name);
    const childPath = [...path, entry.name];

    // Check if this is a note folder
    if (await isNoteFolder(childHandle)) {
      const metadata = await readNoteMetadata(childHandle);
      if (metadata) {
        const noteNode: NoteFolderNode = {
          type: 'note',
          name: entry.name,
          path: childPath,
          handle: childHandle,
          metadata,
        };
        children.push(noteNode);
      }
    } else {
      // Regular folder - recursively scan children
      const subChildren = await scanDirectory(childHandle, childPath);
      const folderNode: FolderNode = {
        type: 'folder',
        name: entry.name,
        path: childPath,
        handle: childHandle,
        children: subChildren,
      };
      children.push(folderNode);
    }
  }

  // Sort: folders first, then notes, alphabetically within each group
  children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return children;
}

// Count nodes in tree
function countNodes(nodes: TreeNode[]): { folders: number; notes: number } {
  let folders = 0;
  let notes = 0;

  for (const node of nodes) {
    if (node.type === 'folder') {
      folders++;
      const subCounts = countNodes(node.children);
      folders += subCounts.folders;
      notes += subCounts.notes;
    } else {
      notes++;
    }
  }

  return { folders, notes };
}

// Main entry point: build complete directory model from root handle
export async function buildDirectoryModel(
  rootHandle: FileSystemDirectoryHandle
): Promise<DirectoryModel> {
  const children = await scanDirectory(rootHandle, []);

  const root: FolderNode = {
    type: 'folder',
    name: rootHandle.name,
    path: [],
    handle: rootHandle,
    children,
  };

  const counts = countNodes(children);

  return {
    root,
    noteCount: counts.notes,
    folderCount: counts.folders,
    lastScanned: new Date().toISOString(),
  };
}

// Load asset content from a note folder
export async function loadAsset(noteNode: NoteFolderNode): Promise<AssetContent> {
  const { metadata, handle } = noteNode;

  try {
    const fileHandle = await handle.getFileHandle(metadata.filename);
    const file = await fileHandle.getFile();

    const assetType = metadata.assetType;

    if (assetType === 'text') {
      // Read text content directly
      const content = await file.text();
      return {
        noteId: metadata.id,
        filename: metadata.filename,
        assetType,
        mimeType: metadata.mimeType,
        content,
      };
    } else {
      // Binary content (image/video) - create object URL
      const blob = new Blob([await file.arrayBuffer()], { type: metadata.mimeType });
      const objectUrl = URL.createObjectURL(blob);
      return {
        noteId: metadata.id,
        filename: metadata.filename,
        assetType,
        mimeType: metadata.mimeType,
        content: blob,
        objectUrl,
      };
    }
  } catch (error) {
    console.error('Failed to load asset:', error);
    throw error;
  }
}

// Cleanup object URL when done
export function revokeAssetUrl(asset: AssetContent): void {
  if (asset.objectUrl) {
    URL.revokeObjectURL(asset.objectUrl);
  }
}

// Helper to create a new note folder with metadata
export async function createNoteFolder(
  parentHandle: FileSystemDirectoryHandle,
  folderName: string,
  title: string,
  filename: string,
  content: string | Blob
): Promise<NoteFolderNode> {
  // Create the folder
  const noteHandle = await parentHandle.getDirectoryHandle(folderName, { create: true });

  // Determine asset type and MIME
  const assetType = getAssetTypeFromFilename(filename);
  if (!assetType) {
    throw new Error(`Unsupported file type: ${filename}`);
  }
  const mimeType = getMimeTypeFromFilename(filename);

  // Create metadata
  const metadata: NoteMetadata = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title,
    filename,
    assetType,
    mimeType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  };

  // Write metadata.json
  const metadataHandle = await noteHandle.getFileHandle('metadata.json', { create: true });
  const metadataWritable = await metadataHandle.createWritable();
  await metadataWritable.write(JSON.stringify(metadata, null, 2));
  await metadataWritable.close();

  // Write the asset file
  const assetHandle = await noteHandle.getFileHandle(filename, { create: true });
  const assetWritable = await assetHandle.createWritable();
  await assetWritable.write(content);
  await assetWritable.close();

  return {
    type: 'note',
    name: folderName,
    path: [folderName],
    handle: noteHandle,
    metadata,
  };
}
