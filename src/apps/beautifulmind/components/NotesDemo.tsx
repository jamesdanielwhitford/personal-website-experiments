import { useState, useEffect } from 'react';
import { notesService } from '../../../db/notesService';
import type { Note } from '../../../db/database';

export default function NotesDemo() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const loadedNotes = await notesService.getNotesByApp('beautifulmind');
    setNotes(loadedNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      // Update existing note
      await notesService.updateNote(editingId, { title, content });
      setEditingId(null);
    } else {
      // Create new note
      await notesService.addNote({
        title,
        content,
        appScope: 'beautifulmind',
      });
    }

    setTitle('');
    setContent('');
    loadNotes();
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id!);
  };

  const handleDelete = async (id: number) => {
    await notesService.deleteNote(id);
    loadNotes();
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Notes (Persistent Storage Demo)</h3>
      <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
        These notes are saved to IndexedDB and will persist after page refresh!
      </p>

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
        {notes.length === 0 ? (
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
              <button onClick={() => handleDelete(note.id!)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
