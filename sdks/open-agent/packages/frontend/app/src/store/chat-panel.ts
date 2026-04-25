import { create } from 'zustand';

export interface ChatPanelState {
  isOpen: boolean;
  docId?: string; // The document ID that triggered the chat panel
  docTitle?: string; // The document title for context
}

export interface ChatPanelActions {
  openChatPanel: (docId: string, docTitle: string) => void;
  closeChatPanel: () => void;
}

export type ChatPanelStore = ChatPanelState & ChatPanelActions;

export const useChatPanelStore = create<ChatPanelStore>(set => ({
  isOpen: false,
  docId: undefined,
  docTitle: undefined,

  openChatPanel: (docId: string, docTitle: string) => {
    set({ isOpen: true, docId, docTitle });
  },

  closeChatPanel: () => {
    set({ isOpen: false, docId: undefined, docTitle: undefined });
  },
}));
