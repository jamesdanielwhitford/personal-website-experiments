import { useBeautifulMindStore } from '../stores/useBeautifulMindStore';
import { useSystemTheme } from '../../../hooks/useSystemTheme';
import { getColors } from '../../../theme/colors';
import type { FolderNode, NoteFolderNode, TreeNode } from '../types/directoryTree';

interface FolderTreeProps {
  root: FolderNode;
  onSelectNote: (note: NoteFolderNode) => void;
  selectedNoteId: string | null;
}

export default function FolderTree({ root, onSelectNote, selectedNoteId }: FolderTreeProps) {
  const theme = useSystemTheme();
  const c = getColors(theme);
  const { expandedPaths, toggleFolderExpanded } = useBeautifulMindStore();

  const pathToKey = (path: string[]): string => path.join('/');

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const indent = depth * 16;

    if (node.type === 'note') {
      const isSelected = node.metadata.id === selectedNoteId;
      return (
        <div
          key={pathToKey(node.path)}
          onClick={() => onSelectNote(node)}
          style={{
            paddingLeft: indent + 20,
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingRight: '8px',
            cursor: 'pointer',
            backgroundColor: isSelected ? c.primary : 'transparent',
            color: isSelected ? '#fff' : c.text,
            borderRadius: '4px',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ opacity: 0.7 }}>{getAssetIcon(node.metadata.assetType)}</span>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.9em',
          }}>
            {node.metadata.title}
          </span>
        </div>
      );
    }

    // Folder node
    const key = pathToKey(node.path);
    const isExpanded = expandedPaths.has(key);
    const hasChildren = node.children.length > 0;

    return (
      <div key={key || 'root'}>
        <div
          onClick={() => toggleFolderExpanded(node.path)}
          style={{
            paddingLeft: indent,
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingRight: '8px',
            cursor: hasChildren ? 'pointer' : 'default',
            color: c.text,
            borderRadius: '4px',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{
            width: '16px',
            textAlign: 'center',
            color: c.textSecondary,
            fontSize: '0.8em',
          }}>
            {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
          </span>
          <span style={{ opacity: 0.7 }}>📁</span>
          <span style={{
            fontWeight: depth === 0 ? 600 : 400,
            fontSize: '0.9em',
          }}>
            {node.name}
          </span>
          {hasChildren && (
            <span style={{
              fontSize: '0.75em',
              color: c.textSecondary,
              marginLeft: 'auto',
            }}>
              {node.children.length}
            </span>
          )}
        </div>
        {isExpanded && node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return <div>{renderNode(root, 0)}</div>;
}

function getAssetIcon(assetType: string): string {
  switch (assetType) {
    case 'text':
      return '📄';
    case 'image':
      return '🖼️';
    case 'video':
      return '🎬';
    default:
      return '📎';
  }
}
