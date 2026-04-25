import { FileIcon } from '@blocksuite/icons/rc';
import { useEffect, useState } from 'react';

import { snapshotHelper } from '@/components/doc-composer/snapshot-helper';
import { useOpenDocContext } from '@/contexts/doc-panel-context';

interface DocCardProps {
  /** Document content (markdown format) */
  content: string;
  /** Document title */
  title?: string;
  /** Card description */
  description?: string;
}

/**
 * Clickable document card component
 */
export function DocCard({
  content,
  title = 'Document',
  description,
}: DocCardProps) {
  const [docId, setDocId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const { openDoc } = useOpenDocContext();

  useEffect(() => {
    // Create document from markdown content
    snapshotHelper
      .createStore(content)
      .then(store => {
        if (store) {
          setDocId(store.id);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [content]);

  const handleClick = () => {
    if (docId) {
      openDoc(docId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20 hover:border-blue-300 dark:hover:border-blue-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50">
          <FileIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div className="rounded-md bg-white/70 dark:bg-gray-900/30 p-3 border border-blue-100 dark:border-blue-800/50">
        {isLoading ? (
          <div className="text-gray-500 text-xs">Loading preview...</div>
        ) : (
          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
            {content.slice(0, 150)}...
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="mt-3 text-xs text-blue-600/70 dark:text-blue-400/70">
        📄 Click to open in side panel
      </div>
    </div>
  );
}
