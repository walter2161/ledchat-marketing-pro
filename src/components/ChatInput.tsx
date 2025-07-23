import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, StopCircleIcon } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, currentConversation } = useChatContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const placeholderText = currentConversation 
    ? "Digite sua mensagem sobre marketing digital..."
    : "Comece uma nova conversa sobre marketing digital...";

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 bg-card border border-border rounded-lg p-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              className={cn(
                "min-h-[24px] max-h-32 resize-none border-0 p-0 shadow-none focus-visible:ring-0 text-base",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              )}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant={isLoading ? "destructive" : "gradient"}
              size="icon"
              disabled={!input.trim() && !isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <StopCircleIcon className="w-4 h-4" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Suggestions */}
          {!currentConversation && (
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Como criar uma estratégia de marketing digital?",
                "Melhores práticas para SEO em 2024",
                "Como aumentar conversões no e-commerce?",
                "Estratégias de marketing para redes sociais",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(suggestion)}
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </form>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          O LedChat pode cometer erros. Considere verificar informações importantes.
        </div>
      </div>
    </div>
  );
}