import { useEffect, useState, useCallback, useRef } from "react";
import { Message } from "@/types/personality";
import { ChatPersonality } from "./ChatPersonality";
import { ChatHeader } from "./ChatHeader";
import { NoChatEmptyState } from "./EmptyState";
import { useChatSync } from "@/hooks/useChatSync";

export const PopoutChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Helper function to mark a message as new for animation
  const markMessageAsNew = useCallback((messageId: string) => {
    setNewMessageIds((prev) => new Set([...prev, messageId]));
    // Clear the "new" status after animation completes
    setTimeout(() => {
      setNewMessageIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }, 1500);
  }, []);

  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    markMessageAsNew(message.id);
  }, [markMessageAsNew]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useChatSync(messages, handleNewMessage, handleClearMessages, true);

  useEffect(() => {
    // Auto-scroll to bottom
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="bg-secondary border-b border-border px-4 py-3">
        <ChatHeader title="AI Chat Overlay" subtitle="Pop-out Window" />
      </div>

      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto bg-chat-bg"
        role="log"
        aria-live="polite"
        aria-label="Chat messages popout"
      >
        {messages.length === 0 ? (
          <NoChatEmptyState />
        ) : (
          messages.map((msg) => (
            <ChatPersonality
              key={msg.id}
              message={msg}
              isNew={newMessageIds.has(msg.id)}
              animationStyle="right"
            />
          ))
        )}
      </div>
    </div>
  );
};
