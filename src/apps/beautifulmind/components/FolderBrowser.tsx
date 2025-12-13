import { useState, useEffect, useCallback } from 'react';
import { useBeautifulMindStore } from '../stores/useBeautifulMindStore';
import { buildDirectoryModel, loadAsset, revokeAssetUrl } from '../../../fs/directoryScanner';
import { getDirectoryHandle } from '../../../fs/fileSystem';
import StoragePicker from '../../../components/shared/StoragePicker';
import FolderTree from './FolderTree';
import NoteViewer from './NoteViewer';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import type { NoteFolderNode } from '../types/directoryTree';

export default function FolderBrowser() {
  const theme = useSystemTheme();
  const c = getColors(theme);
  const [isConnected, setIsConnected] = useState(false);

  const {
    directoryModel,
    isScanning,
    scanError,
    selectedNote,
    loadedAsset,
    isLoadingAsset,
    setDirectoryModel,
    setScanning,
    setScanError,
    selectNote,
    setLoadedAsset,
    setLoadingAsset,
    expandAll,
    collapseAll,
  } = useBeautifulMindStore();

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const handle = await getDirectoryHandle();
      setIsConnected(!!handle);
    };
    checkConnection();
  }, []);

  // Scan the directory
  const handleScan = useCallback(async () => {
    const handle = await getDirectoryHandle();
    if (!handle) return;

    setScanning(true);
    setScanError(null);

    try {
      const model = await buildDirectoryModel(handle);
      setDirectoryModel(model);
    } catch (error) {
      console.error('Scan failed:', error);
      setScanError((error as Error).message);
    } finally {
      setScanning(false);
    }
  }, [setScanning, setScanError, setDirectoryModel]);

  // Load asset when note is selected
  const handleSelectNote = useCallback(async (note: NoteFolderNode) => {
    // Revoke previous asset URL
    if (loadedAsset) {
      revokeAssetUrl(loadedAsset);
    }

    selectNote(note);
    setLoadingAsset(true);

    try {
      const asset = await loadAsset(note);
      setLoadedAsset(asset);
    } catch (error) {
      console.error('Failed to load asset:', error);
      setLoadedAsset(null);
    } finally {
      setLoadingAsset(false);
    }
  }, [loadedAsset, selectNote, setLoadedAsset, setLoadingAsset]);

  const handleConnected = () => {
    setIsConnected(true);
    // Auto-scan on connect
    setTimeout(handleScan, 100);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setDirectoryModel(null);
    selectNote(null);
    setLoadedAsset(null);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Folder Browser</h3>
      <p style={{ fontSize: '0.9em', color: c.textSecondary, marginBottom: '1rem' }}>
        Browse your local folder structure. Notes are folders containing a metadata.json and a primary asset file.
      </p>

      <StoragePicker onConnected={handleConnected} onDisconnected={handleDisconnected} />

      {isConnected && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleScan}
              disabled={isScanning}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: c.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                opacity: isScanning ? 0.7 : 1,
              }}
            >
              {isScanning ? 'Scanning...' : 'Rescan Folder'}
            </button>
            {directoryModel && (
              <>
                <button
                  onClick={expandAll}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: c.surface,
                    color: c.text,
                    border: `1px solid ${c.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: c.surface,
                    color: c.text,
                    border: `1px solid ${c.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Collapse All
                </button>
              </>
            )}
          </div>

          {scanError && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: c.errorBg,
                border: `1px solid ${c.errorBorder}`,
                borderRadius: '4px',
                color: c.error,
                marginBottom: '1rem',
              }}
            >
              Error: {scanError}
            </div>
          )}

          {directoryModel && (
            <div style={{ fontSize: '0.85em', color: c.textSecondary, marginBottom: '1rem' }}>
              {directoryModel.folderCount} folders, {directoryModel.noteCount} notes
            </div>
          )}

          {directoryModel && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '1rem',
                minHeight: '400px',
              }}
            >
              {/* Tree View */}
              <div
                style={{
                  backgroundColor: c.surface,
                  border: `1px solid ${c.border}`,
                  borderRadius: '4px',
                  padding: '0.5rem',
                  overflowY: 'auto',
                  maxHeight: '500px',
                }}
              >
                <FolderTree
                  root={directoryModel.root}
                  onSelectNote={handleSelectNote}
                  selectedNoteId={selectedNote?.metadata.id ?? null}
                />
              </div>

              {/* Note Viewer */}
              <div
                style={{
                  backgroundColor: c.surface,
                  border: `1px solid ${c.border}`,
                  borderRadius: '4px',
                  padding: '1rem',
                  overflowY: 'auto',
                  maxHeight: '500px',
                }}
              >
                <NoteViewer
                  note={selectedNote}
                  asset={loadedAsset}
                  isLoading={isLoadingAsset}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
