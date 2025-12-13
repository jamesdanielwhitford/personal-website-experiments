The application is a client-only React web app that works with a user-selected top-level folder on the local file system. The folder represents a hierarchical knowledge structure: it contains subfolders, which may recursively contain other subfolders or "note" folders. Each note folder contains exactly one primary asset—either a text file (.txt, .md), an image (PNG, SVG, WebM, JPEG, GIF), or a video (MP4, MOV)—along with a `metadata.json` file that describes the note. Metadata includes fields like a stable `id`, `title`, `filename`, `assetType`, `mimeType`, timestamps (`createdAt`, `updatedAt`, `lastAccessedAt`), `tags`, and optionally a checksum for integrity.

On startup or folder selection, the app reads the directory tree using the browser File System Access API and constructs an in-memory directory model, which is cached in the browser. This directory cache stores only folder and note relationships, not full metadata or asset contents. Metadata is normalized into a separate cached table keyed by note ID, storing the parsed metadata from each note's `metadata.json`. Asset contents are cached separately in a size-limited, least-recently-used (LRU) cache, loaded on demand.

The application supports fast UI rendering, searching, and navigation using the cached directory structure and metadata. When a note is accessed, its asset is retrieved from the asset cache if available; otherwise, it is read from the file system and added to the cache. When metadata is edited, the cache is updated immediately, and the `metadata.json` file on disk is overwritten to persist changes. Directory moves or renames trigger a rebuild of the directory structure cache but do not clear the asset cache. Asset edits invalidate only the relevant cached asset, and the corresponding metadata checksum and timestamps are updated.

The architecture separates responsibilities clearly:

* **File system access layer:** handles reading/writing files, enumerating directories, and performing moves or renames. Exposes a promise-based API to the rest of the app.
* **Directory model/state management:** maintains the hierarchical folder and note tree, independent of metadata or asset content. Rebuilt frequently to stay in sync with the file system.
* **Metadata cache:** normalized table storing note metadata. Updated when metadata changes and rebuilt when scanning the directory. Small and fully resident for fast access.
* **Asset cache:** size-limited, LRU-evicted storage of note contents. Loaded lazily on demand.
* **React UI layer:** purely consumes cached data for rendering folder trees and note previews, triggers actions like moves, metadata edits, and asset access through the API, and updates caches accordingly.

Data flow summary:

* Reading: React → Directory model → Metadata table → Asset cache → File system if needed.
* Moving notes: React triggers file system operation → directory cache rebuild → metadata and asset caches remain.
* Editing metadata: update metadata cache → write to `metadata.json` → UI updates.
* Editing assets: update asset cache → update metadata checksum/timestamps → directory and metadata caches remain.

This structure ensures separation of concerns, fast UI responsiveness, reliable persistence, and the ability to scale for features like search, tagging, sync, or versioning. It allows the application to treat the file system as the source of truth, while caching directory structure, metadata, and assets independently for performance and convenience.

---

## Implementation Progress

### Completed

- [x] **Type definitions** (`src/apps/beautifulmind/types/directoryTree.ts`)
  - `AssetType`, `NoteMetadata`, `FolderNode`, `NoteFolderNode`, `TreeNode`, `DirectoryModel`, `AssetContent`
  - Helper functions: `getAssetTypeFromFilename()`, `getMimeTypeFromFilename()`

- [x] **Directory scanner service** (`src/fs/directoryScanner.ts`)
  - `isNoteFolder()` - detects note folders (metadata.json + primary asset)
  - `buildDirectoryModel()` - recursive directory scanning
  - `loadAsset()` - loads text/image/video assets on demand
  - `revokeAssetUrl()` - cleanup for object URLs
  - `createNoteFolder()` - helper for creating new notes

- [x] **Zustand store updates** (`src/apps/beautifulmind/stores/useBeautifulMindStore.ts`)
  - Tree state: `directoryModel`, `selectedNote`, `loadedAsset`, `expandedPaths`
  - Actions: `setDirectoryModel`, `selectNote`, `toggleFolderExpanded`, `expandAll`, `collapseAll`

- [x] **Folder browser UI** (`src/apps/beautifulmind/components/FolderBrowser.tsx`)
  - Split-pane layout: tree view (left) + note viewer (right)
  - Scan/rescan folder functionality
  - Expand all / collapse all controls

- [x] **Folder tree component** (`src/apps/beautifulmind/components/FolderTree.tsx`)
  - Recursive tree rendering
  - Collapsible folders with expand/collapse
  - Note selection with highlighting

- [x] **Note viewer component** (`src/apps/beautifulmind/components/NoteViewer.tsx`)
  - Metadata display (title, type, timestamps, tags)
  - Asset rendering: text (preformatted), images, videos

- [x] **Integration** - Replaced `NotesDemo` with `FolderBrowser` in Beautiful Mind page

- [x] **Note creators** - Modal system for creating notes:
  - `NoteCreatorModal.tsx` - Type picker modal
  - `TextNoteCreator.tsx` - Create text/markdown notes
  - `ImageNoteCreator.tsx` - Upload images with drag-and-drop

- [x] **Metadata editing** (`NoteViewer.tsx`)
  - Edit title and tags inline
  - `updateNoteMetadata()` function in directoryScanner.ts

### Next Steps (Proof of Concept)

- [ ] **Enhanced note type renderers** - Improve rendering for each asset type:
  - Text: markdown rendering (currently plain text)
  - Image: zoom/pan controls
  - Video: better player controls

- [ ] **Note creators** - Additional types:
  - [ ] *(Future)* SVG drawing tool
  - [ ] *(Future)* Voice recorder
  - [ ] *(Future)* Video upload

- [ ] **Folder operations** - Create new folders, move/rename notes

### Future Enhancements (Post-POC)

- [ ] LRU asset cache for performance
- [ ] Metadata cache layer
- [ ] Search functionality
- [ ] Drag-and-drop for moving notes
- [ ] Keyboard navigation
