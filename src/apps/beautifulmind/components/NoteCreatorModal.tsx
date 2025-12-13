import { useState } from 'react';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import TextNoteCreator from './TextNoteCreator';
import ImageNoteCreator from './ImageNoteCreator';

type NoteType = 'text' | 'image' | null;

interface NoteCreatorModalProps {
  onSaveText: (title: string, content: string, filename: string) => Promise<void>;
  onSaveImage: (title: string, file: File) => Promise<void>;
  onClose: () => void;
}

export default function NoteCreatorModal({ onSaveText, onSaveImage, onClose }: NoteCreatorModalProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);
  const [selectedType, setSelectedType] = useState<NoteType>(null);

  const handleBack = () => {
    setSelectedType(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: c.surface,
          borderRadius: '8px',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {selectedType === null ? (
          <NoteTypePicker
            onSelect={setSelectedType}
            onCancel={onClose}
          />
        ) : selectedType === 'text' ? (
          <TextNoteCreator
            onSave={async (title, content, filename) => {
              await onSaveText(title, content, filename);
              onClose();
            }}
            onCancel={handleBack}
          />
        ) : (
          <ImageNoteCreator
            onSave={async (title, file) => {
              await onSaveImage(title, file);
              onClose();
            }}
            onCancel={handleBack}
          />
        )}
      </div>
    </div>
  );
}

interface NoteTypePickerProps {
  onSelect: (type: NoteType) => void;
  onCancel: () => void;
}

function NoteTypePicker({ onSelect, onCancel }: NoteTypePickerProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);

  const noteTypes = [
    {
      type: 'text' as const,
      icon: '📄',
      label: 'Text Note',
      description: 'Create a markdown or plain text note',
    },
    {
      type: 'image' as const,
      icon: '🖼️',
      label: 'Image Note',
      description: 'Upload an image (PNG, JPEG, GIF, etc.)',
    },
  ];

  return (
    <div>
      <h4 style={{ margin: '0 0 1rem 0', color: c.text }}>Create New Note</h4>
      <p style={{ color: c.textSecondary, fontSize: '0.9em', marginBottom: '1rem' }}>
        Select the type of note you want to create:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {noteTypes.map(({ type, icon, label, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: c.background,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            <span style={{ fontSize: '2rem' }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: c.text }}>{label}</div>
              <div style={{ fontSize: '0.85em', color: c.textSecondary }}>{description}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: c.textSecondary,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
