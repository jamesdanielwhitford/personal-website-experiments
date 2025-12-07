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

// Define the database
export class AppDatabase extends Dexie {
  notes!: Dexie.Table<Note, number>;
  todos!: Dexie.Table<Todo, number>;

  constructor() {
    super('OfflineAppDB');

    // Define schema
    this.version(1).stores({
      notes: '++id, title, appScope, createdAt',
      todos: '++id, completed, appScope, createdAt',
    });
  }
}

// Create and export a single instance
export const db = new AppDatabase();
