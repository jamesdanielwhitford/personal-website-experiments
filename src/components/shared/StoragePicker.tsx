import { useState, useEffect } from 'react';
import {
  isFileSystemAccessSupported,
  pickDirectory,
  getDirectoryHandle,
  disconnectDirectory,
  hasStoredDirectory,
} from '../../fs/fileSystem';

interface StoragePickerProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export default function StoragePicker({ onConnected, onDisconnected }: StoragePickerProps) {
  const [isSupported] = useState(isFileSystemAccessSupported());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have a stored directory on mount
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const hasStored = await hasStoredDirectory();
        if (hasStored) {
          // Try to get permission for the stored handle
          const handle = await getDirectoryHandle();
          if (handle) {
            setIsConnected(true);
            onConnected?.();
          }
        }
      } catch (err) {
        console.error('Failed to check stored directory:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [onConnected]);

  const handlePickFolder = async () => {
    setError(null);
    try {
      const handle = await pickDirectory();
      if (handle) {
        setIsConnected(true);
        onConnected?.();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDisconnect = async () => {
    await disconnectDirectory();
    setIsConnected(false);
    onDisconnected?.();
  };

  if (!isSupported) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Browser Not Supported</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
          The File System Access API is not supported in this browser. Please use Chrome, Edge, or
          another Chromium-based browser for full functionality.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b6d4fe',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <p style={{ margin: 0, color: '#084298' }}>Checking storage connection...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: isConnected ? '#d1e7dd' : '#f8f9fa',
        border: `1px solid ${isConnected ? '#badbcc' : '#dee2e6'}`,
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
      {isConnected ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, color: '#0f5132', fontWeight: 500 }}>Storage Connected</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#0f5132', opacity: 0.8 }}>
              Your data is being saved to your selected folder
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Choose Storage Folder</h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
            Select a folder on your device where app data will be stored. Your data stays completely
            local and is never uploaded anywhere.
          </p>
          <button
            onClick={handlePickFolder}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Select Folder
          </button>
          {error && (
            <p style={{ margin: '0.5rem 0 0 0', color: '#dc3545', fontSize: '0.9rem' }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
