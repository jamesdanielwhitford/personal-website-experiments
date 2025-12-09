// Core File System Access API helpers
// Handles directory picking, permission management, and file operations

const HANDLE_STORAGE_KEY = 'fs-directory-handle';

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

// Store directory handle reference in memory (handles can't be serialized to localStorage directly)
let currentDirectoryHandle: FileSystemDirectoryHandle | null = null;

// Get the stored handle from IndexedDB (handles must be stored in IndexedDB, not localStorage)
async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open('fs-handles-db', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('handles', 'readonly');
      const store = transaction.objectStore('handles');
      const getRequest = store.get(HANDLE_STORAGE_KEY);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}

// Store handle in IndexedDB
async function storeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fs-handles-db', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('handles', 'readwrite');
      const store = transaction.objectStore('handles');
      const putRequest = store.put(handle, HANDLE_STORAGE_KEY);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

// Clear stored handle
async function clearStoredHandle(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.open('fs-handles-db', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('handles', 'readwrite');
      const store = transaction.objectStore('handles');
      store.delete(HANDLE_STORAGE_KEY);
      resolve();
    };

    request.onerror = () => resolve();
  });
}

// Request permission to access the directory
export async function requestPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };

  // Check if we already have permission
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }

  // Request permission
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
}

// Pick a directory using the native file picker
export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser');
  }

  try {
    const handle = await window.showDirectoryPicker({
      id: 'app-data-folder',
      mode: 'readwrite',
      startIn: 'documents',
    });

    currentDirectoryHandle = handle;
    await storeHandle(handle);
    return handle;
  } catch (error) {
    // User cancelled the picker
    if ((error as Error).name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

// Get the current directory handle (from memory or storage)
export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (currentDirectoryHandle) {
    // Verify we still have permission
    if (await requestPermission(currentDirectoryHandle)) {
      return currentDirectoryHandle;
    }
  }

  // Try to restore from storage
  const storedHandle = await getStoredHandle();
  if (storedHandle) {
    if (await requestPermission(storedHandle)) {
      currentDirectoryHandle = storedHandle;
      return storedHandle;
    }
  }

  return null;
}

// Check if we have a stored directory
export async function hasStoredDirectory(): Promise<boolean> {
  const handle = await getStoredHandle();
  return handle !== null;
}

// Disconnect from the current directory
export async function disconnectDirectory(): Promise<void> {
  currentDirectoryHandle = null;
  await clearStoredHandle();
}

// Get or create a subdirectory
export async function getOrCreateDirectory(
  parent: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return await parent.getDirectoryHandle(name, { create: true });
}

// Get nested directory path (creates all intermediate directories)
export async function getNestedDirectory(
  root: FileSystemDirectoryHandle,
  path: string[]
): Promise<FileSystemDirectoryHandle> {
  let current = root;
  for (const segment of path) {
    current = await getOrCreateDirectory(current, segment);
  }
  return current;
}

// Read a JSON file
export async function readJsonFile<T>(
  directory: FileSystemDirectoryHandle,
  filename: string
): Promise<T | null> {
  try {
    const fileHandle = await directory.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as T;
  } catch (error) {
    // File doesn't exist
    if ((error as Error).name === 'NotFoundError') {
      return null;
    }
    throw error;
  }
}

// Write a JSON file
export async function writeJsonFile<T>(
  directory: FileSystemDirectoryHandle,
  filename: string,
  data: T
): Promise<void> {
  const fileHandle = await directory.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

// Delete a file
export async function deleteFile(
  directory: FileSystemDirectoryHandle,
  filename: string
): Promise<boolean> {
  try {
    await directory.removeEntry(filename);
    return true;
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      return false;
    }
    throw error;
  }
}

// List all files in a directory
export async function listFiles(
  directory: FileSystemDirectoryHandle,
  extension?: string
): Promise<string[]> {
  const files: string[] = [];

  for await (const entry of directory.values()) {
    if (entry.kind === 'file') {
      if (!extension || entry.name.endsWith(extension)) {
        files.push(entry.name);
      }
    }
  }

  return files;
}

// Read a binary file
export async function readBinaryFile(
  directory: FileSystemDirectoryHandle,
  filename: string
): Promise<ArrayBuffer | null> {
  try {
    const fileHandle = await directory.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return await file.arrayBuffer();
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      return null;
    }
    throw error;
  }
}

// Write a binary file
export async function writeBinaryFile(
  directory: FileSystemDirectoryHandle,
  filename: string,
  data: ArrayBuffer | Blob
): Promise<void> {
  const fileHandle = await directory.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(data);
  await writable.close();
}

// Check if a file exists
export async function fileExists(
  directory: FileSystemDirectoryHandle,
  filename: string
): Promise<boolean> {
  try {
    await directory.getFileHandle(filename);
    return true;
  } catch {
    return false;
  }
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
