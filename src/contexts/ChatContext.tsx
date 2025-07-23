import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Conversation, Message, ChatContextType } from "@/types/chat";
import { mistralService, MistralMessage } from "@/lib/mistral";
import { toast } from "sonner";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "ledchat_conversations";

const SYSTEM_PROMPT = `Você é o LedChat, um assistente de IA especializado em marketing digital. Você é expert em:

- Estratégias de marketing digital
- SEO e SEM
- Redes sociais e social media
- Email marketing
- Marketing de conteúdo
- Análise de dados e métricas
- Publicidade online (Google Ads, Facebook Ads, etc.)
- Growth hacking
- Marketing de influenciadores
- E-commerce e conversão
- Branding e posicionamento
- Marketing automation

Sempre forneça respostas práticas, acionáveis e baseadas em melhores práticas atuais do mercado. Seja direto, útil e mantenha um tom profissional mas acessível. Quando apropriado, sugira ferramentas específicas, métricas para acompanhar e exemplos práticos.

Se a pergunta não for relacionada a marketing digital, responda de forma educada mas redirecione para tópicos de marketing sempre que possível.`;

export function ChatProvider({ children }: ChatProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "Nova conversa",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
      )
    );
    
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => prev ? { ...prev, title } : null);
    }
  };

  const generateTitle = async (firstMessage: string): Promise<string> => {
    try {
      const titleMessages: MistralMessage[] = [
        {
          role: "system",
          content: "Gere um título curto e descritivo (máximo 4 palavras) para uma conversa que começou com a seguinte mensagem. Responda apenas com o título, sem aspas ou formatação adicional."
        },
        {
          role: "user",
          content: firstMessage
        }
      ];

      const title = await mistralService.sendMessage(titleMessages);
      return title.slice(0, 50); // Limit title length
    } catch (error) {
      console.error("Error generating title:", error);
      return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "");
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      createNewConversation();
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add user message and placeholder for assistant message
    const updatedMessages = [...currentConversation.messages, userMessage, assistantMessage];
    
    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev =>
      prev.map(conv => conv.id === currentConversation.id ? updatedConversation : conv)
    );

    setIsLoading(true);

    try {
      // Build message history for API
      const apiMessages: MistralMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...currentConversation.messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content },
      ];

      let assistantContent = "";

      // Stream the response
      await mistralService.sendStreamMessage(
        apiMessages,
        (chunk: string) => {
          assistantContent += chunk;
          
          const streamingMessage: Message = {
            ...assistantMessage,
            content: assistantContent,
            isStreaming: true,
          };

          const streamUpdatedMessages = [...currentConversation.messages, userMessage, streamingMessage];
          const streamUpdatedConversation = {
            ...currentConversation,
            messages: streamUpdatedMessages,
            updatedAt: new Date(),
          };

          setCurrentConversation(streamUpdatedConversation);
          setConversations(prev =>
            prev.map(conv => conv.id === currentConversation.id ? streamUpdatedConversation : conv)
          );
        }
      );

      // Finalize the message
      const finalMessage: Message = {
        ...assistantMessage,
        content: assistantContent,
        isStreaming: false,
      };

      const finalMessages = [...currentConversation.messages, userMessage, finalMessage];
      const finalConversation = {
        ...currentConversation,
        messages: finalMessages,
        updatedAt: new Date(),
      };

      setCurrentConversation(finalConversation);
      setConversations(prev =>
        prev.map(conv => conv.id === currentConversation.id ? finalConversation : conv)
      );

      // Generate title for new conversations
      if (currentConversation.messages.length === 0) {
        const title = await generateTitle(content);
        updateConversationTitle(currentConversation.id, title);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      
      // Remove the failed assistant message
      const failedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        updatedAt: new Date(),
      };

      setCurrentConversation(failedConversation);
      setConversations(prev =>
        prev.map(conv => conv.id === currentConversation.id ? failedConversation : conv)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        createNewConversation,
        selectConversation,
        sendMessage,
        deleteConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}