import { IconButton } from '@afk/component';
import { getUserDocsQuery } from '@afk/graphql';
import type { Store } from '@blocksuite/affine/store';
import { CloseIcon, PresentationIcon } from '@blocksuite/icons/rc';
import { useEffect, useState } from 'react';

import { DocEditor } from '@/components/doc-composer/doc-editor';
import { snapshotHelper } from '@/components/doc-composer/snapshot-helper';
import { ChatIcon } from '@/icons/chat';
import { gql } from '@/lib/gql';

import { PresentationMode } from './presentation-mode';

interface DocPanelProps {
  onOpenChat?: () => void;
  onClose?: () => void;
  doc: Store;
}

interface DocPanelByIdProps {
  docId: string;
  onOpenChat?: () => void;
  onClose?: () => void;
}

type DocLoadState =
  | {
      status: 'loading';
    }
  | {
      status: 'success';
      doc: Store;
    }
  | {
      status: 'error';
      error: string;
    };

/**
 * Document panel component that loads document by ID
 */
export function DocPanelById({
  docId,
  onOpenChat,
  onClose,
}: DocPanelByIdProps) {
  const [state, setState] = useState<DocLoadState>({ status: 'loading' });

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setState({ status: 'loading' });

        // Fetch documents using GraphQL
        const response = await gql({
          query: getUserDocsQuery,
          variables: {
            pagination: {
              first: 1000,
            },
          },
        });

        // Find the document with the matching docId
        const docs = response.currentUser?.embedding.docs.edges || [];
        const targetDoc = docs.find(edge => edge.node.docId === docId);

        if (!targetDoc) {
          setState({
            status: 'error',
            error: `Document with ID ${docId} not found`,
          });
          return;
        }

        // Create store from the document content
        const docContent =
          targetDoc.node.content ||
          `# ${targetDoc.node.title}\n\nEmpty document`;
        const store = await snapshotHelper.createStore(docContent);

        if (store) {
          setState({ status: 'success', doc: store });
        } else {
          setState({
            status: 'error',
            error: 'Failed to create document',
          });
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setState({
          status: 'error',
          error: 'Failed to load document',
        });
      }
    };

    loadDocument();
  }, [docId]);

  if (state.status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  if (!state.doc) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No document available</div>
      </div>
    );
  }

  return <DocPanel doc={state.doc} onOpenChat={onOpenChat} onClose={onClose} />;
}

/**
 * Document panel component, displayed next to the chat panel
 */
export function DocPanel({ doc, onOpenChat, onClose }: DocPanelProps) {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const handleStartPresentation = () => {
    setIsPresentationMode(true);
  };

  const handleClosePresentation = () => {
    setIsPresentationMode(false);
  };

  const docTitle = doc?.meta?.title;
  // If in presentation mode, show presentation component
  if (isPresentationMode) {
    return <PresentationMode doc={doc} onClose={handleClosePresentation} />;
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] h-15">
        <h2 className="text-xl font-semibold text-gray-900 truncate">
          {docTitle}
        </h2>
        <div className="flex items-center gap-3">
          {/* Chat button - only show when not opened from chat */}
          {onOpenChat && (
            <IconButton
              size="24"
              icon={<ChatIcon />}
              onClick={onOpenChat}
              title="Open chat panel"
            />
          )}
          <IconButton
            size="24"
            icon={<PresentationIcon />}
            onClick={handleStartPresentation}
            title="Enter presentation mode"
          />
          <IconButton
            size="24"
            icon={<CloseIcon />}
            onClick={onClose}
            title="Close document"
          />
        </div>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-auto rounded py-2 px-6">
        <DocEditor doc={doc} readonly={true} />
      </div>
    </div>
  );
}
