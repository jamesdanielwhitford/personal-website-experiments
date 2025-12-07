import { db, type Todo } from './database';

export const todosService = {
  // Create
  async addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<number> {
    return await db.todos.add({
      ...todo,
      createdAt: new Date(),
    });
  },

  // Read all todos for a specific app
  async getTodosByApp(appScope: Todo['appScope']): Promise<Todo[]> {
    return await db.todos
      .where('appScope')
      .equals(appScope)
      .reverse()
      .sortBy('createdAt');
  },

  // Read single todo
  async getTodo(id: number): Promise<Todo | undefined> {
    return await db.todos.get(id);
  },

  // Update
  async updateTodo(id: number, updates: Partial<Todo>): Promise<number> {
    return await db.todos.update(id, updates);
  },

  // Toggle completed status
  async toggleTodo(id: number): Promise<number> {
    const todo = await db.todos.get(id);
    if (todo) {
      return await db.todos.update(id, { completed: !todo.completed });
    }
    return 0;
  },

  // Delete
  async deleteTodo(id: number): Promise<void> {
    await db.todos.delete(id);
  },

  // Delete all todos for an app
  async deleteAllTodosByApp(appScope: Todo['appScope']): Promise<number> {
    return await db.todos.where('appScope').equals(appScope).delete();
  },
};
