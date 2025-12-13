import { useState, useEffect } from 'react';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import type { NoteFolderNode, AssetContent, NoteMetadata } from '../types/directoryTree';

interface NoteViewerProps {
  note: NoteFolderNode | null;
  asset: AssetContent | null;
  isLoading: boolean;
  onUpdateMetadata?: (note: NoteFolderNode, updates: Partial<Pick<NoteMetadata, 'title' | 'tags'>>) => Promise<void>;
}

export default function NoteViewer({ note, asset, isLoading, onUpdateMetadata }: NoteViewerProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset edit state when note changes
  useEffect(() => {
    if (note) {
      setEditTitle(note.metadata.title);
      setEditTags(note.metadata.tags.join(', '));
    }
    setIsEditing(false);
    setSaveError(null);
  }, [note?.metadata.id]);

  if (!note) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: c.textSecondary,
      }}>
        Select a note to view its contents
      </div>
    );
  }

  const { metadata } = note;

  const handleSave = async () => {
    if (!onUpdateMetadata) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const tags = editTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onUpdateMetadata(note, {
        title: editTitle.trim(),
        tags,
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(metadata.title);
    setEditTags(metadata.tags.join(', '));
    setIsEditing(false);
    setSaveError(null);
  };

  return (
    <div>
      {/* Metadata Header */}
      <div style={{ marginBottom: '1rem' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: c.textSecondary, fontSize: '0.85em' }}>
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
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
              <label style={{ display: 'block', marginBottom: '0.25rem', color: c.textSecondary, fontSize: '0.85em' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: c.background,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  borderRadius: '4px',
                  fontSize: '0.9em',
                }}
              />
            </div>
            {saveError && (
              <div style={{ color: c.error, fontSize: '0.85em' }}>{saveError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: c.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.85em',
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'transparent',
                  color: c.textSecondary,
                  border: `1px solid ${c.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, color: c.text }}>{metadata.title}</h4>
              {onUpdateMetadata && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'transparent',
                    color: c.textSecondary,
                    border: `1px solid ${c.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75em',
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.85em', color: c.textSecondary }}>
              <div>Type: {metadata.assetType} ({metadata.mimeType})</div>
              <div>File: {metadata.filename}</div>
              <div>Created: {new Date(metadata.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(metadata.updatedAt).toLocaleString()}</div>
              {metadata.tags.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {metadata.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: c.primary,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: `1px solid ${c.border}`, margin: '1rem 0' }} />

      {/* Asset Content */}
      {isLoading ? (
        <div style={{ color: c.textSecondary, textAlign: 'center', padding: '2rem' }}>
          Loading...
        </div>
      ) : asset ? (
        <AssetRenderer asset={asset} />
      ) : (
        <div style={{ color: c.textSecondary, textAlign: 'center', padding: '2rem' }}>
          Unable to load asset
        </div>
      )}
    </div>
  );
}

function AssetRenderer({ asset }: { asset: AssetContent }) {
  const theme = useSystemTheme();
  const c = getColors(theme);

  switch (asset.assetType) {
    case 'text':
      return (
        <pre
          style={{
            margin: 0,
            padding: '1rem',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8',
            borderRadius: '4px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: '0.9em',
            lineHeight: 1.5,
            color: c.text,
            maxHeight: '300px',
          }}
        >
          {asset.content as string}
        </pre>
      );

    case 'image':
      return (
        <div style={{ textAlign: 'center' }}>
          <img
            src={asset.objectUrl}
            alt={asset.filename}
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: '4px',
            }}
          />
        </div>
      );

    case 'video':
      return (
        <div style={{ textAlign: 'center' }}>
          <video
            src={asset.objectUrl}
            controls
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '4px',
            }}
          />
        </div>
      );

    default:
      return (
        <div style={{ color: c.textSecondary, textAlign: 'center' }}>
          Unsupported asset type: {asset.assetType}
        </div>
      );
  }
}
