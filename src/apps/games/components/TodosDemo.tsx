import { useState, useEffect, useCallback } from 'react';
import { gamesFS, type Todo } from '../../../fs/gamesFS';
import StoragePicker from '../../../components/shared/StoragePicker';

export default function TodosDemo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadTodos = useCallback(async () => {
    if (!isConnected) return;
    setIsLoading(true);
    try {
      const loadedTodos = await gamesFS.getAllTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Load todos when connected
  useEffect(() => {
    if (isConnected) {
      loadTodos();
    }
  }, [isConnected, loadTodos]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await gamesFS.isConnected();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await gamesFS.addTodo({
        text,
        completed: false,
      });

      setText('');
      loadTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await gamesFS.toggleTodo(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await gamesFS.deleteTodo(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleConnected = () => {
    setIsConnected(true);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setTodos([]);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Game Tasks (Local File Storage)</h3>
      <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
        Tasks are saved as JSON files in your selected folder. Your data stays on your device.
      </p>

      <StoragePicker onConnected={handleConnected} onDisconnected={handleDisconnected} />

      {isConnected && (
        <>
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
            {isLoading ? (
              <p style={{ opacity: 0.6 }}>Loading tasks...</p>
            ) : todos.length === 0 ? (
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
                      onChange={() => handleToggle(todo.id)}
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
                    <button onClick={() => handleDelete(todo.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.8em', opacity: 0.6 }}>
            Total: {todos.length} tasks ({todos.filter((t) => t.completed).length} completed)
          </div>
        </>
      )}
    </div>
  );
}
