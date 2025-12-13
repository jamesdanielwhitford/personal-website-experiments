import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import type { NoteFolderNode, AssetContent } from '../types/directoryTree';

interface NoteViewerProps {
  note: NoteFolderNode | null;
  asset: AssetContent | null;
  isLoading: boolean;
}

export default function NoteViewer({ note, asset, isLoading }: NoteViewerProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);

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

  return (
    <div>
      {/* Metadata Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: c.text }}>{metadata.title}</h4>
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
