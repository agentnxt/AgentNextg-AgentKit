import { IconButton } from '@afk/component';
import type { Store } from '@blocksuite/affine/store';
import { Text } from '@blocksuite/affine/store';
import type { NoteBlockModel } from '@blocksuite/affine-model';
import { replaceIdMiddleware } from '@blocksuite/affine-shared/adapters';
import {
  ArrowLeftBigIcon,
  ArrowRightBigIcon,
  CloseIcon,
} from '@blocksuite/icons/rc';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DocEditor } from '@/components/doc-composer/doc-editor';

interface PresentationModeProps {
  /** Document object */
  doc: Store;
  /** Callback to close presentation mode */
  onClose: () => void;
}

interface NoteBlockContentProps {
  /** Note block model */
  note: NoteBlockModel;
  /** Document object */
  doc: Store;
}

/**
 * Component for rendering individual note block content
 */
function NoteBlockContent({ note, doc }: NoteBlockContentProps) {
  const [noteDoc, setNoteDoc] = useState<Store | null>(null);

  useEffect(() => {
    // Create temporary document for current note block
    const createNoteDoc = () => {
      try {
        const _doc = doc.workspace.createDoc();
        const transformer = doc.getTransformer([
          replaceIdMiddleware(doc.workspace.idGenerator),
        ]);
        const blockSnapshot = transformer.blockToSnapshot(note);
        if (!blockSnapshot) {
          console.error('Failed to create snapshot from note');
          return;
        }

        const linkedDoc = _doc.getStore();
        linkedDoc.load(() => {
          const rootId = linkedDoc.addBlock('affine:page', {
            title: new Text(''),
          });
          transformer
            .snapshotToBlock(blockSnapshot, linkedDoc, rootId)
            .catch(console.error);
        });

        setNoteDoc(linkedDoc);
      } catch (error) {
        console.error('Error creating note doc:', error);
      }
    };

    createNoteDoc();
  }, [note, doc]);

  if (!noteDoc) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <DocEditor doc={noteDoc} readonly={true} />
    </div>
  );
}

/**
 * Presentation mode component
 * Paginated display by note block units, supports fullscreen and navigation
 */
export function PresentationMode({ doc, onClose }: PresentationModeProps) {
  const title = doc.meta?.title;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [noteBlocks, setNoteBlocks] = useState<NoteBlockModel[]>([]);
  const [showToolbars, setShowToolbars] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get all note blocks from the document
  const getNoteBlocks = useCallback(() => {
    if (!doc?.root) return [];

    const notes = doc.root.children.filter((child): child is NoteBlockModel => {
      return (
        child.flavour === 'affine:note' &&
        child.props?.displayMode !== 'EdgelessOnly'
      );
    });

    return notes as NoteBlockModel[];
  }, [doc]);

  // Initialize note blocks
  useEffect(() => {
    const blocks = getNoteBlocks();
    setNoteBlocks(blocks);
  }, [getNoteBlocks]);

  // Mouse movement listener and toolbar auto-hide
  useEffect(() => {
    const handleMouseMove = () => {
      setShowToolbars(true);

      // Clear previous timer
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Set new timer to hide toolbar after 2 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setShowToolbars(false);
      }, 2000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Initial timer setup
    hideTimeoutRef.current = setTimeout(() => {
      setShowToolbars(false);
    }, 2000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          }
          break;
        case 'ArrowRight':
        case ' ': // Space key
          e.preventDefault();
          if (currentSlide < noteBlocks.length - 1) {
            setCurrentSlide(currentSlide + 1);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          // Allow up/down arrow keys for page scrolling, don't prevent default behavior
          break;
        case 'Escape':
          e.preventDefault();
          exitPresentation();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(noteBlocks.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, noteBlocks.length]);

  // Enter fullscreen
  useEffect(() => {
    const enterFullscreen = async () => {
      if (containerRef.current && !document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
        } catch (error) {
          console.warn('Unable to enter fullscreen mode:', error);
        }
      }
    };

    enterFullscreen();

    // Listen for fullscreen state changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Close presentation mode when exiting fullscreen
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onClose]);

  const nextSlide = () => {
    if (currentSlide < noteBlocks.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const exitPresentation = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn('Failed to exit fullscreen:', error);
      }
    }
    onClose();
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < noteBlocks.length) {
      setCurrentSlide(index);
    }
  };

  if (noteBlocks.length === 0) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 bg-white text-gray-800 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <h2 className="text-2xl mb-4">No content to present</h2>
          <p className="text-gray-600 mb-6">
            No note blocks found in the document for presentation
          </p>
          <button
            onClick={exitPresentation}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close Presentation
          </button>
        </div>
      </div>
    );
  }

  const currentNote = noteBlocks[currentSlide];

  // Get the title that should be displayed for the current page
  const getCurrentTitle = () => {
    if (currentSlide === 0) {
      // First page displays document title
      return title;
    } else {
      // Other pages display note title, or document title if none
      return currentNote?.props?.title || title;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-white z-50 flex flex-col"
    >
      {/* Top toolbar */}
      <div
        className={`absolute top-4 left-4 right-4 z-10 flex items-center justify-between backdrop-blur-sm bg-white/30 rounded-lg px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-opacity duration-300 ${
          showToolbars ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {getCurrentTitle()}
          </h1>
          <div className="text-sm text-gray-600">
            {currentSlide + 1} / {noteBlocks.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation buttons */}
          <IconButton
            size="32"
            icon={<ArrowLeftBigIcon />}
            onClick={previousSlide}
            disabled={currentSlide === 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          />
          <IconButton
            size="32"
            icon={<ArrowRightBigIcon />}
            onClick={nextSlide}
            disabled={currentSlide === noteBlocks.length - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          />

          {/* Close button */}
          <IconButton
            size="32"
            icon={<CloseIcon />}
            onClick={exitPresentation}
            className="text-gray-600 hover:text-gray-900"
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="w-full h-full">
          {currentNote && (
            <div className="h-full w-full">
              {/* Display current note block content */}
              <div className="w-full h-full overflow-auto">
                <div className="p-16">
                  <NoteBlockContent note={currentNote} doc={doc} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom page indicator */}
      <div
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-300 ${
          showToolbars ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 bg-white bg-opacity-90 rounded-full px-4 py-2 shadow-lg border border-gray-200">
          {noteBlocks.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide
                  ? 'bg-blue-600'
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div
        className={`absolute bottom-4 right-4 text-xs text-gray-600 bg-white bg-opacity-90 rounded px-3 py-2 transition-opacity duration-300 shadow-lg border border-gray-200 ${
          showToolbars ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div>← → Navigate | ESC Exit | Space Next Page</div>
      </div>
    </div>
  );
}
