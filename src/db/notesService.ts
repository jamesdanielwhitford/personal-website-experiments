import { db, type Note } from './database';

export const notesService = {
  // Create
  async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.notes.add({
      ...note,
      createdAt: now,
      updatedAt: now,
    });
  },

  // Read all notes for a specific app
  async getNotesByApp(appScope: Note['appScope']): Promise<Note[]> {
    return await db.notes
      .where('appScope')
      .equals(appScope)
      .reverse()
      .sortBy('createdAt');
  },

  // Read single note
  async getNote(id: number): Promise<Note | undefined> {
    return await db.notes.get(id);
  },

  // Update
  async updateNote(id: number, updates: Partial<Note>): Promise<number> {
    return await db.notes.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  // Delete
  async deleteNote(id: number): Promise<void> {
    await db.notes.delete(id);
  },

  // Delete all notes for an app
  async deleteAllNotesByApp(appScope: Note['appScope']): Promise<number> {
    return await db.notes.where('appScope').equals(appScope).delete();
  },
};
