import { useState } from 'react';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';

interface TextNoteCreatorProps {
  onSave: (title: string, content: string, filename: string) => Promise<void>;
  onCancel: () => void;
}

export default function TextNoteCreator({ onSave, onCancel }: TextNoteCreatorProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<'md' | 'txt'>('md');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const filename = `content.${fileType}`;
      await onSave(title.trim(), content, filename);
    } catch (err) {
      setError((err as Error).message);
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h4 style={{ margin: 0, color: c.text }}>Create Text Note</h4>

      {error && (
        <div
          style={{
            padding: '0.5rem',
            backgroundColor: c.errorBg,
            border: `1px solid ${c.errorBorder}`,
            borderRadius: '4px',
            color: c.error,
            fontSize: '0.9em',
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', color: c.textSecondary, fontSize: '0.9em' }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: c.background,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '4px',
            fontSize: '1em',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', color: c.textSecondary, fontSize: '0.9em' }}>
          File Type
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value as 'md' | 'txt')}
          style={{
            padding: '0.5rem',
            backgroundColor: c.background,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '4px',
          }}
        >
          <option value="md">Markdown (.md)</option>
          <option value="txt">Plain Text (.txt)</option>
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', color: c.textSecondary, fontSize: '0.9em' }}>
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={10}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: c.background,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '4px',
            fontSize: '0.95em',
            fontFamily: fileType === 'md' ? 'monospace' : 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={isSaving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: c.surface,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: c.primary,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Saving...' : 'Create Note'}
        </button>
      </div>
    </div>
  );
}
