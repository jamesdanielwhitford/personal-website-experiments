import { useState, useRef } from 'react';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';

interface ImageNoteCreatorProps {
  onSave: (title: string, file: File) => Promise<void>;
  onCancel: () => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function ImageNoteCreator({ onSave, onCancel }: ImageNoteCreatorProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please select a valid image file (PNG, JPEG, GIF, WebP, or SVG)');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));

    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(title.trim(), selectedFile);
    } catch (err) {
      setError((err as Error).message);
      setIsSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h4 style={{ margin: 0, color: c.text }}>Create Image Note</h4>

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
          Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            padding: '2rem',
            border: `2px dashed ${c.border}`,
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: c.background,
            color: c.textSecondary,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
              <div>Click or drag to upload an image</div>
              <div style={{ fontSize: '0.85em', marginTop: '0.5rem' }}>
                PNG, JPEG, GIF, WebP, SVG
              </div>
            </div>
          )}
        </div>
        {selectedFile && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: c.textSecondary }}>
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
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
          disabled={isSaving || !selectedFile}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: c.primary,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving || !selectedFile ? 'not-allowed' : 'pointer',
            opacity: isSaving || !selectedFile ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Saving...' : 'Create Note'}
        </button>
      </div>
    </div>
  );
}
