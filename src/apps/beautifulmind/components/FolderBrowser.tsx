import { useState, useEffect, useRef } from 'react';
import { useBeautifulMindStore } from '../stores/useBeautifulMindStore';
import { buildDirectoryModel, loadAsset, revokeAssetUrl, createNoteFolder, updateNoteMetadata } from '../../../fs/directoryScanner';
import { getDirectoryHandle } from '../../../fs/fileSystem';
import StoragePicker from '../../../components/shared/StoragePicker';
import FolderTree from './FolderTree';
import NoteViewer from './NoteViewer';
import NoteCreatorModal from './NoteCreatorModal';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import type { NoteFolderNode, AssetContent, NoteMetadata } from '../types/directoryTree';

export default function FolderBrowser() {
  const theme = useSystemTheme();
  const c = getColors(theme);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const loadedAssetRef = useRef<AssetContent | null>(null);

  // Use selectors for stable references
  const directoryModel = useBeautifulMindStore((s) => s.directoryModel);
  const isScanning = useBeautifulMindStore((s) => s.isScanning);
  const scanError = useBeautifulMindStore((s) => s.scanError);
  const selectedNote = useBeautifulMindStore((s) => s.selectedNote);
  const loadedAsset = useBeautifulMindStore((s) => s.loadedAsset);
  const isLoadingAsset = useBeautifulMindStore((s) => s.isLoadingAsset);

  // Get actions (these are stable)
  const setDirectoryModel = useBeautifulMindStore((s) => s.setDirectoryModel);
  const setScanning = useBeautifulMindStore((s) => s.setScanning);
  const setScanError = useBeautifulMindStore((s) => s.setScanError);
  const selectNote = useBeautifulMindStore((s) => s.selectNote);
  const setLoadedAsset = useBeautifulMindStore((s) => s.setLoadedAsset);
  const setLoadingAsset = useBeautifulMindStore((s) => s.setLoadingAsset);
  const expandAll = useBeautifulMindStore((s) => s.expandAll);
  const collapseAll = useBeautifulMindStore((s) => s.collapseAll);

  // Keep ref in sync with state
  useEffect(() => {
    loadedAssetRef.current = loadedAsset;
  }, [loadedAsset]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const handle = await getDirectoryHandle();
      setIsConnected(!!handle);
    };
    checkConnection();
  }, []);

  // Scan the directory
  const handleScan = async () => {
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
  };

  // Load asset when note is selected
  const handleSelectNote = async (note: NoteFolderNode) => {
    // Revoke previous asset URL
    if (loadedAssetRef.current) {
      revokeAssetUrl(loadedAssetRef.current);
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
  };

  const handleConnected = () => {
    setIsConnected(true);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setDirectoryModel(null);
    selectNote(null);
    setLoadedAsset(null);
  };

  // Create a text note
  const handleSaveTextNote = async (title: string, content: string, filename: string) => {
    const handle = await getDirectoryHandle();
    if (!handle) throw new Error('No directory connected');

    // Generate folder name from title (sanitize for filesystem)
    const folderName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    await createNoteFolder(handle, folderName, title, filename, content);

    // Rescan to pick up the new note
    await handleScan();
  };

  // Create an image note
  const handleSaveImageNote = async (title: string, file: File) => {
    const handle = await getDirectoryHandle();
    if (!handle) throw new Error('No directory connected');

    // Generate folder name from title
    const folderName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Read file as blob
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    await createNoteFolder(handle, folderName, title, file.name, blob);

    // Rescan to pick up the new note
    await handleScan();
  };

  // Update note metadata
  const handleUpdateMetadata = async (
    note: NoteFolderNode,
    updates: Partial<Pick<NoteMetadata, 'title' | 'tags'>>
  ) => {
    const updatedMetadata = await updateNoteMetadata(note, updates);

    // Update the selected note in place
    if (selectedNote && selectedNote.metadata.id === note.metadata.id) {
      selectNote({
        ...note,
        metadata: updatedMetadata,
      });
    }
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
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
              {isScanning ? 'Scanning...' : (directoryModel ? 'Rescan' : 'Scan Folder')}
            </button>
            <button
              onClick={() => setShowCreator(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: c.success,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + Create Note
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
                  onUpdateMetadata={handleUpdateMetadata}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Creator Modal */}
      {showCreator && (
        <NoteCreatorModal
          onSaveText={handleSaveTextNote}
          onSaveImage={handleSaveImageNote}
          onClose={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}
