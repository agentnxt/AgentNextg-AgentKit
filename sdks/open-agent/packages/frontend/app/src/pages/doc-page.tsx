import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ChatPanel } from '@/components/chat-panel/chat-panel';
import { DocPanelById } from '@/components/doc-panel/doc-panel';

/**
 * Document page component that handles document loading from route parameters
 */
export function DocPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showChatPanel, setShowChatPanel] = useState(false);

  const handleOpenChat = () => {
    setShowChatPanel(true);
  };

  if (!id) {
    navigate('/');
    return null;
  }

  return (
    <>
      <div className="flex-1 h-full panel">
        <DocPanelById docId={id} onOpenChat={handleOpenChat} />
      </div>
      {showChatPanel && (
        <div className="flex-1 h-full panel">
          <ChatPanel docId={id} />
        </div>
      )}
    </>
  );
}
