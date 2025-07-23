import React from "react";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";

const Index = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ChatSidebar />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatArea />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;