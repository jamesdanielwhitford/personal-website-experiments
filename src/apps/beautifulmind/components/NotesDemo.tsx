import { useState, useEffect, useCallback } from 'react';
import { beautifulMindFS, type Note } from '../../../fs/beautifulMindFS';
import StoragePicker from '../../../components/shared/StoragePicker';

export default function NotesDemo() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!isConnected) return;
    setIsLoading(true);
    try {
      const loadedNotes = await beautifulMindFS.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Load notes when connected
  useEffect(() => {
    if (isConnected) {
      loadNotes();
    }
  }, [isConnected, loadNotes]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await beautifulMindFS.isConnected();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingId) {
        await beautifulMindFS.updateNote(editingId, { title, content });
        setEditingId(null);
      } else {
        await beautifulMindFS.addNote({ title, content });
      }

      setTitle('');
      setContent('');
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await beautifulMindFS.deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleConnected = () => {
    setIsConnected(true);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setNotes([]);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Notes (Local File Storage)</h3>
      <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
        Notes are saved as JSON files in your selected folder. Your data stays on your device.
      </p>

      <StoragePicker onConnected={handleConnected} onDisconnected={handleDisconnected} />

      {isConnected && (
        <>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div>
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
              />
            </div>
            <div>
              <textarea
                placeholder="Note content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
              />
            </div>
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>
              {editingId ? 'Update Note' : 'Add Note'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                }}
                style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            )}
          </form>

          <div style={{ marginTop: '2rem' }}>
            {isLoading ? (
              <p style={{ opacity: 0.6 }}>Loading notes...</p>
            ) : notes.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No notes yet. Create your first note!</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '4px',
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{note.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                  <div style={{ fontSize: '0.8em', opacity: 0.6, marginBottom: '0.5rem' }}>
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <button onClick={() => handleEdit(note)} style={{ marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(note.id)}>Delete</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
