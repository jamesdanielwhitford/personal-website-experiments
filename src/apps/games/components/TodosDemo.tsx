import { useState, useEffect } from 'react';
import { todosService } from '../../../db/todosService';
import type { Todo } from '../../../db/database';

export default function TodosDemo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const loadedTodos = await todosService.getTodosByApp('games');
    setTodos(loadedTodos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    await todosService.addTodo({
      text,
      completed: false,
      appScope: 'games',
    });

    setText('');
    loadTodos();
  };

  const handleToggle = async (id: number) => {
    await todosService.toggleTodo(id);
    loadTodos();
  };

  const handleDelete = async (id: number) => {
    await todosService.deleteTodo(id);
    loadTodos();
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Game Tasks (Persistent Storage Demo)</h3>
      <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
        These todos are saved to IndexedDB and will persist after page refresh!
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Add a game task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Add Task
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        {todos.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No tasks yet. Add your first task!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: todo.completed ? '#f0f0f0' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id!)}
                  style={{ marginRight: '1rem' }}
                />
                <span
                  style={{
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  {todo.text}
                </span>
                <button onClick={() => handleDelete(todo.id!)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8em', opacity: 0.6 }}>
        Total: {todos.length} tasks ({todos.filter((t) => t.completed).length} completed)
      </div>
    </div>
  );
}
