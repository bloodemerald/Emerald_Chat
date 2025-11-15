import { useEffect, useRef, useCallback } from "react";
import { Message } from "@/types/personality";
import { BROADCAST_CHANNEL_NAME } from "@/lib/constants";

interface ChatSyncMessage {
  type: "new-message" | "clear-messages" | "sync-state";
  message?: Message;
  messages?: Message[];
  senderId?: string;
}

export function useChatSync(
  messages: Message[],
  onMessageReceived: (message: Message) => void,
  onMessagesCleared?: () => void,
  isPopout: boolean = false
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const windowIdRef = useRef<string>(
    `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const setupChannel = useCallback(() => {
    try {
      // Create or connect to broadcast channel
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;
      isConnectedRef.current = true;

      // Handle connection errors
      channel.onerror = (error) => {
         
        console.error('BroadcastChannel error:', error);
        isConnectedRef.current = false;

        // Attempt to reconnect after 2 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
           
          console.log('Attempting to reconnect BroadcastChannel...');
          setupChannel();
        }, 2000);
      };

      // Listen for messages from other windows
      channel.onmessage = (event: MessageEvent<ChatSyncMessage>) => {
        const data = event.data;

        // Ignore messages from this window
        if (data.senderId === windowIdRef.current) {
          return;
        }

        if (data.type === "new-message" && data.message) {
          // Check if we've already processed this message
          if (!processedMessageIdsRef.current.has(data.message.id)) {
            processedMessageIdsRef.current.add(data.message.id);
            onMessageReceived(data.message);

            // Clean up old message IDs to prevent memory leak
            if (processedMessageIdsRef.current.size > 1000) {
              const idsArray = Array.from(processedMessageIdsRef.current);
              processedMessageIdsRef.current = new Set(idsArray.slice(-500));
            }
          }
        } else if (data.type === "clear-messages") {
          onMessagesCleared?.();
        } else if (data.type === "sync-state" && data.messages && isPopout) {
          // Popout window can request full state sync from main window
          data.messages.forEach((msg) => {
            if (!processedMessageIdsRef.current.has(msg.id)) {
              processedMessageIdsRef.current.add(msg.id);
              onMessageReceived(msg);
            }
          });
        }
      };

      // If this is a popout window, request state sync from main window
      if (isPopout) {
        setTimeout(() => {
          channel.postMessage({
            type: "sync-state",
            senderId: windowIdRef.current,
          });
        }, 100);
      }

      return channel;
    } catch (error) {
       
      console.error('Failed to create BroadcastChannel:', error);
      isConnectedRef.current = false;

      // Retry after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        setupChannel();
      }, 2000);

      return null;
    }
  }, [onMessageReceived, onMessagesCleared, isPopout]);

  useEffect(() => {
    const channel = setupChannel();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      channel?.close();
      isConnectedRef.current = false;
    };
  }, [setupChannel]);

  // Mark our own messages as processed to prevent echo
  useEffect(() => {
    messages.forEach((msg) => {
      processedMessageIdsRef.current.add(msg.id);
    });
  }, [messages]);

  // Broadcast new messages to other windows
  const broadcastMessage = useCallback((message: Message) => {
    if (channelRef.current) {
      processedMessageIdsRef.current.add(message.id);
      channelRef.current.postMessage({
        type: "new-message",
        message,
        senderId: windowIdRef.current,
      } as ChatSyncMessage);
    }
  }, []);

  // Broadcast clear messages event
  const broadcastClear = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "clear-messages",
        senderId: windowIdRef.current,
      } as ChatSyncMessage);
    }
  }, []);

  // Respond to state sync requests (for main window only)
  useEffect(() => {
    if (isPopout || !channelRef.current) return;

    const handleSyncRequest = (event: MessageEvent<ChatSyncMessage>) => {
      if (event.data.type === "sync-state" && event.data.senderId !== windowIdRef.current) {
        channelRef.current?.postMessage({
          type: "sync-state",
          messages,
          senderId: windowIdRef.current,
        } as ChatSyncMessage);
      }
    };

    channelRef.current.addEventListener("message", handleSyncRequest);

    return () => {
      channelRef.current?.removeEventListener("message", handleSyncRequest);
    };
  }, [messages, isPopout]);

  return { broadcastMessage, broadcastClear };
}
