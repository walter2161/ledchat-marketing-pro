export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
}