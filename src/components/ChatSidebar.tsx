import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/contexts/ChatContext";
import { UserProfile } from "@/components/UserProfile";
import { PlusIcon, MessageSquareIcon, TrashIcon, GraduationCapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatSidebar() {
  const {
    conversations,
    currentConversation,
    createNewConversation,
    selectConversation,
    deleteConversation,
  } = useChatContext();

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCapIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">LedChat</h1>
          </div>
          <UserProfile />
        </div>
        <Button
          onClick={createNewConversation}
          variant="gradient"
          className="w-full"
          size="sm"
        >
          <PlusIcon className="w-4 h-4" />
          Nova conversa
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquareIcon className="w-8 h-8 text-sidebar-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-sidebar-foreground/70">
                Nenhuma conversa ainda
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-sidebar-accent",
                  currentConversation?.id === conversation.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )}
                onClick={() => selectConversation(conversation.id)}
              >
                <MessageSquareIcon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs opacity-70 truncate">
                    {conversation.messages.length > 0
                      ? conversation.messages[conversation.messages.length - 1].content.slice(0, 50) + "..."
                      : "Conversa vazia"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-destructive/20 hover:text-destructive"
                  )}
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          <p>LedChat - Marketing Digital IA</p>
          <p className="mt-1">
            Powered by{" "}
            <a 
              href="https://ledmarketing.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Led MKT
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}