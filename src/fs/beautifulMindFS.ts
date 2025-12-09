// Beautiful Mind file system service
// Handles notes, media, and embeddings storage

import {
  getDirectoryHandle,
  getNestedDirectory,
  readJsonFile,
  writeJsonFile,
  deleteFile,
  listFiles,
  writeBinaryFile,
  readBinaryFile,
  generateId,
  fileExists,
} from './fileSystem';

// Types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mediaFiles?: string[]; // List of media file names associated with this note
}

export interface NoteWithMedia extends Note {
  media?: MediaFile[];
}

export interface MediaFile {
  name: string;
  type: string;
  size: number;
}

// Get the beautifulmind notes directory
async function getNotesDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['beautifulmind', 'notes']);
}

// Get the media directory for a specific note
async function getMediaDirectory(noteId: string): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['beautifulmind', 'media', noteId]);
}

// Get the embeddings directory
async function getEmbeddingsDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['beautifulmind', 'embeddings']);
}

export const beautifulMindFS = {
  // Check if storage is connected
  async isConnected(): Promise<boolean> {
    const handle = await getDirectoryHandle();
    return handle !== null;
  },

  // Notes CRUD
  async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notesDir = await getNotesDirectory();
    if (!notesDir) throw new Error('Storage not connected');

    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await writeJsonFile(notesDir, `${newNote.id}.json`, newNote);
    return newNote;
  },

  async getAllNotes(): Promise<Note[]> {
    const notesDir = await getNotesDirectory();
    if (!notesDir) return [];

    const files = await listFiles(notesDir, '.json');
    const notes: Note[] = [];

    for (const file of files) {
      const note = await readJsonFile<Note>(notesDir, file);
      if (note) {
        notes.push(note);
      }
    }

    // Sort by createdAt descending (newest first)
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getNote(id: string): Promise<Note | null> {
    const notesDir = await getNotesDirectory();
    if (!notesDir) return null;
    return await readJsonFile<Note>(notesDir, `${id}.json`);
  },

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | null> {
    const notesDir = await getNotesDirectory();
    if (!notesDir) return null;

    const existing = await readJsonFile<Note>(notesDir, `${id}.json`);
    if (!existing) return null;

    const updated: Note = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(notesDir, `${id}.json`, updated);
    return updated;
  },

  async deleteNote(id: string): Promise<boolean> {
    const notesDir = await getNotesDirectory();
    if (!notesDir) return false;

    // Delete the note file
    const deleted = await deleteFile(notesDir, `${id}.json`);

    // Also try to delete associated media directory
    try {
      const root = await getDirectoryHandle();
      if (root) {
        const mediaDir = await getNestedDirectory(root, ['beautifulmind', 'media']);
        await mediaDir.removeEntry(id, { recursive: true });
      }
    } catch {
      // Media directory might not exist, that's ok
    }

    return deleted;
  },

  // Media operations
  async addMedia(noteId: string, file: File): Promise<string> {
    const mediaDir = await getMediaDirectory(noteId);
    if (!mediaDir) throw new Error('Storage not connected');

    const arrayBuffer = await file.arrayBuffer();
    const filename = `${generateId()}-${file.name}`;
    await writeBinaryFile(mediaDir, filename, arrayBuffer);

    // Update the note with the media reference
    const note = await this.getNote(noteId);
    if (note) {
      const mediaFiles = note.mediaFiles || [];
      mediaFiles.push(filename);
      await this.updateNote(noteId, { mediaFiles });
    }

    return filename;
  },

  async getMedia(noteId: string, filename: string): Promise<Blob | null> {
    const mediaDir = await getMediaDirectory(noteId);
    if (!mediaDir) return null;

    const buffer = await readBinaryFile(mediaDir, filename);
    if (!buffer) return null;

    return new Blob([buffer]);
  },

  async listMedia(noteId: string): Promise<MediaFile[]> {
    const mediaDir = await getMediaDirectory(noteId);
    if (!mediaDir) return [];

    const files: MediaFile[] = [];
    for await (const entry of mediaDir.values()) {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        files.push({
          name: entry.name,
          type: file.type,
          size: file.size,
        });
      }
    }
    return files;
  },

  async deleteMedia(noteId: string, filename: string): Promise<boolean> {
    const mediaDir = await getMediaDirectory(noteId);
    if (!mediaDir) return false;

    const deleted = await deleteFile(mediaDir, filename);

    // Update the note to remove the media reference
    if (deleted) {
      const note = await this.getNote(noteId);
      if (note && note.mediaFiles) {
        const mediaFiles = note.mediaFiles.filter((f) => f !== filename);
        await this.updateNote(noteId, { mediaFiles });
      }
    }

    return deleted;
  },

  // Embeddings operations (for future AI features)
  async saveEmbedding(noteId: string, embedding: Float32Array): Promise<void> {
    const embeddingsDir = await getEmbeddingsDirectory();
    if (!embeddingsDir) throw new Error('Storage not connected');

    // Convert to ArrayBuffer (Float32Array.buffer can be SharedArrayBuffer in some contexts)
    const buffer = new ArrayBuffer(embedding.byteLength);
    new Float32Array(buffer).set(embedding);
    await writeBinaryFile(embeddingsDir, `${noteId}.bin`, buffer);
  },

  async getEmbedding(noteId: string): Promise<Float32Array | null> {
    const embeddingsDir = await getEmbeddingsDirectory();
    if (!embeddingsDir) return null;

    const buffer = await readBinaryFile(embeddingsDir, `${noteId}.bin`);
    if (!buffer) return null;

    return new Float32Array(buffer);
  },

  async hasEmbedding(noteId: string): Promise<boolean> {
    const embeddingsDir = await getEmbeddingsDirectory();
    if (!embeddingsDir) return false;
    return await fileExists(embeddingsDir, `${noteId}.bin`);
  },

  // Search index operations
  async saveSearchIndex(index: object): Promise<void> {
    const root = await getDirectoryHandle();
    if (!root) throw new Error('Storage not connected');

    const bmDir = await getNestedDirectory(root, ['beautifulmind']);
    await writeJsonFile(bmDir, 'search-index.json', index);
  },

  async getSearchIndex<T>(): Promise<T | null> {
    const root = await getDirectoryHandle();
    if (!root) return null;

    const bmDir = await getNestedDirectory(root, ['beautifulmind']);
    return await readJsonFile<T>(bmDir, 'search-index.json');
  },
};
