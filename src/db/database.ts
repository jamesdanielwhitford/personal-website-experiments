import Dexie from 'dexie';

// Define data types
export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  appScope: 'beautifulmind' | 'games' | 'root';
}

export interface Todo {
  id?: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  appScope: 'beautifulmind' | 'games' | 'root';
}

export interface UserSettings {
  id?: number;
  appScope: 'beautifulmind' | 'games' | 'root';
  apiKey: string;
  apiProvider: string; // e.g., 'openai', 'anthropic', 'custom'
  apiEndpoint?: string; // Optional custom endpoint
  createdAt: Date;
  updatedAt: Date;
}

// Define the database
export class AppDatabase extends Dexie {
  notes!: Dexie.Table<Note, number>;
  todos!: Dexie.Table<Todo, number>;
  settings!: Dexie.Table<UserSettings, number>;

  constructor() {
    super('OfflineAppDB');

    // Define schema
    this.version(1).stores({
      notes: '++id, title, appScope, createdAt',
      todos: '++id, completed, appScope, createdAt',
    });

    // Add settings table in version 2
    this.version(2).stores({
      notes: '++id, title, appScope, createdAt',
      todos: '++id, completed, appScope, createdAt',
      settings: '++id, appScope',
    });
  }
}

// Create and export a single instance
export const db = new AppDatabase();
