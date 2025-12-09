// Games file system service
// Handles todos and game save files storage

import {
  getDirectoryHandle,
  getNestedDirectory,
  readJsonFile,
  writeJsonFile,
  deleteFile,
  listFiles,
  generateId,
} from './fileSystem';

// Types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface GameSave {
  id: string;
  gameName: string;
  saveData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Get the games todos directory
async function getTodosDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['games', 'todos']);
}

// Get the games save files directory
async function getSaveFilesDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const root = await getDirectoryHandle();
  if (!root) return null;
  return await getNestedDirectory(root, ['games', 'savefiles']);
}

export const gamesFS = {
  // Check if storage is connected
  async isConnected(): Promise<boolean> {
    const handle = await getDirectoryHandle();
    return handle !== null;
  },

  // Todos CRUD
  async addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) throw new Error('Storage not connected');

    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    await writeJsonFile(todosDir, `${newTodo.id}.json`, newTodo);
    return newTodo;
  },

  async getAllTodos(): Promise<Todo[]> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) return [];

    const files = await listFiles(todosDir, '.json');
    const todos: Todo[] = [];

    for (const file of files) {
      const todo = await readJsonFile<Todo>(todosDir, file);
      if (todo) {
        todos.push(todo);
      }
    }

    // Sort by createdAt descending (newest first)
    return todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTodo(id: string): Promise<Todo | null> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) return null;
    return await readJsonFile<Todo>(todosDir, `${id}.json`);
  },

  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo | null> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) return null;

    const existing = await readJsonFile<Todo>(todosDir, `${id}.json`);
    if (!existing) return null;

    const updated: Todo = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    await writeJsonFile(todosDir, `${id}.json`, updated);
    return updated;
  },

  async toggleTodo(id: string): Promise<Todo | null> {
    const todo = await this.getTodo(id);
    if (!todo) return null;
    return await this.updateTodo(id, { completed: !todo.completed });
  },

  async deleteTodo(id: string): Promise<boolean> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) return false;
    return await deleteFile(todosDir, `${id}.json`);
  },

  async deleteAllTodos(): Promise<number> {
    const todosDir = await getTodosDirectory();
    if (!todosDir) return 0;

    const files = await listFiles(todosDir, '.json');
    let count = 0;

    for (const file of files) {
      if (await deleteFile(todosDir, file)) {
        count++;
      }
    }

    return count;
  },

  // Game Save Files CRUD
  async saveGame(gameName: string, saveData: Record<string, unknown>, existingId?: string): Promise<GameSave> {
    const savesDir = await getSaveFilesDirectory();
    if (!savesDir) throw new Error('Storage not connected');

    const now = new Date().toISOString();
    const id = existingId || generateId();

    const gameSave: GameSave = {
      id,
      gameName,
      saveData,
      createdAt: existingId ? (await this.getGameSave(id))?.createdAt || now : now,
      updatedAt: now,
    };

    await writeJsonFile(savesDir, `${id}.json`, gameSave);
    return gameSave;
  },

  async getGameSave(id: string): Promise<GameSave | null> {
    const savesDir = await getSaveFilesDirectory();
    if (!savesDir) return null;
    return await readJsonFile<GameSave>(savesDir, `${id}.json`);
  },

  async getAllGameSaves(): Promise<GameSave[]> {
    const savesDir = await getSaveFilesDirectory();
    if (!savesDir) return [];

    const files = await listFiles(savesDir, '.json');
    const saves: GameSave[] = [];

    for (const file of files) {
      const save = await readJsonFile<GameSave>(savesDir, file);
      if (save) {
        saves.push(save);
      }
    }

    // Sort by updatedAt descending (most recent first)
    return saves.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getGameSavesByGame(gameName: string): Promise<GameSave[]> {
    const allSaves = await this.getAllGameSaves();
    return allSaves.filter((save) => save.gameName === gameName);
  },

  async deleteGameSave(id: string): Promise<boolean> {
    const savesDir = await getSaveFilesDirectory();
    if (!savesDir) return false;
    return await deleteFile(savesDir, `${id}.json`);
  },

  async deleteAllGameSaves(gameName?: string): Promise<number> {
    const savesDir = await getSaveFilesDirectory();
    if (!savesDir) return 0;

    const files = await listFiles(savesDir, '.json');
    let count = 0;

    for (const file of files) {
      if (gameName) {
        const save = await readJsonFile<GameSave>(savesDir, file);
        if (save && save.gameName !== gameName) continue;
      }

      if (await deleteFile(savesDir, file)) {
        count++;
      }
    }

    return count;
  },
};
