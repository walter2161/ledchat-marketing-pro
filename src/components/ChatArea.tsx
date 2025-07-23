import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatContext } from "@/contexts/ChatContext";
import { GraduationCapIcon, SparklesIcon, TrendingUpIcon, TargetIcon } from "lucide-react";

export function ChatArea() {
  const { currentConversation } = useChatContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCapIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Bem-vindo ao LedChat
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Seu assistente especializado em marketing digital, powered by Mistral AI
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <SparklesIcon className="w-6 h-6 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Estratégias Personalizadas</h3>
                <p className="text-sm text-muted-foreground">
                  Receba estratégias de marketing digital customizadas para seu negócio
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <TrendingUpIcon className="w-6 h-6 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Análise de Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda a analisar e otimizar suas campanhas de marketing
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <TargetIcon className="w-6 h-6 text-primary mb-2 mx-auto" />
                <h3 className="font-semibold mb-1">Foco em Conversão</h3>
                <p className="text-sm text-muted-foreground">
                  Estratégias comprovadas para aumentar suas taxas de conversão
                </p>
              </div>
            </div>
          </div>
        </div>
        <ChatInput />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="max-w-4xl mx-auto">
          {currentConversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <ChatInput />
    </div>
  );
}