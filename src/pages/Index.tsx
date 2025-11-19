import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from "react";
import { ChatPersonality } from "@/components/ChatPersonality";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { SettingsPanel } from "@/components/SettingsPanel";
import { NoChatEmptyState } from "@/components/EmptyState";
import { UserListPanel } from "@/components/UserListPanel";
import { UserProfileModal } from "@/components/UserProfileModal";
import { UserHistoryModal } from "@/components/UserHistoryModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message, ChatSettings, PersonalityType } from "@/types/personality";
import { selectPersonality, PERSONALITIES } from "@/lib/personalities";
import { useChatSync } from "@/hooks/useChatSync";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { compressScreenshot } from "@/lib/imageUtils";
import { saveMessages, loadMessages, clearMessages, saveSettings, loadSettings } from "@/lib/storage";
import { RateLimiter } from "@/lib/debounce";
import {
  MESSAGE_FREQUENCY_DEFAULT,
  RECENT_MESSAGES_LIMIT,
  MAX_DISPLAY_MESSAGES,
  MODERATOR_COLOR,
  POPOUT_WIDTH,
  POPOUT_HEIGHT,
  POPOUT_WINDOW_NAME,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_RATE_LIMIT_DELAY,
  AI_BATCH_SIZE,
} from "@/lib/constants";
import {
  getOrCreateChatUser,
  shouldTriggerCopypasta,
  generateCopypastaChain,
  calculateMessageDelay,
  shouldAddLurkerJoin,
  shouldCreateReactionChain,
} from "@/lib/chatFlow";
import { isOllamaAvailable, generateWithOllama, generateTextWithOllama } from "@/lib/localAI";
import { userLifecycle } from "@/lib/userLifecycle";
import { retroactiveLikes } from "@/lib/retroactiveLikes";
import { staggeredLikes } from "@/lib/staggeredLikes";
import { userPool, ChatUser } from "@/lib/userPool";
import { channelPoints } from "@/lib/channelPoints";
import { bitCheering, BitCheer } from "@/lib/bitCheering";
import { bitGifting, BitGift } from "@/lib/bitGifting";
import { engagementManager } from "@/lib/engagementManager";
import { raidSimulation } from "@/lib/raidSimulation";
import { moderatorManager } from "@/lib/moderators";
import { NotificationOverlay, notifyRaidCelebration } from "@/components/notifications/NotificationOverlay";
import { ChatAnimations, ChatAnimationRef } from "@/components/ChatAnimations";

const DEFAULT_SETTINGS: ChatSettings = {
  personalities: {
    toxic: true,
    helpful: true,
    meme: true,
    backseat: true,
    hype: true,
    lurker: true,
    spammer: true,
    analyst: true,
    speedrunner: true,
    emote_spammer: true,
    clip_goblin: true,
    spoiler_police: true,
    wholesome: true,
    theorycrafter: true,
    reaction_only: true,
    mobile_only: true,
  },
  messageFrequency: MESSAGE_FREQUENCY_DEFAULT,
  diversityLevel: "high",
  aiProvider: "local", // Force local-only mode
  ollamaModel: "llava:7b", // Balanced speed and quality for RTX 3070
  // Useful Twitch-inspired features
  pauseOnScroll: true,
  showTimestamps: true,
  enableAutoMod: false,
  // Sentiment defaults
  enableSentimentAnalysis: false,
  showSentimentIndicators: false,
  highlightPositive: false,
  highlightNegative: false,
  sentimentFilter: 'all',
};

const Index = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedContent, setDetectedContent] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string;
    username: string;
    message: string;
  } | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [isLofiMode, setIsLofiMode] = useState(false);

  // Refs
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const popoutWindowRef = useRef<Window | null>(null);
  const rateLimiterRef = useRef(new RateLimiter(API_RATE_LIMIT_DELAY));
  const messageQueueRef = useRef<Array<{ message: string; personality: PersonalityType }>>([]);
  const retryCountRef = useRef(0);
  const isWaitingForAIRef = useRef(false);
  const animationRef = useRef<ChatAnimationRef>(null);

  // Extract content keywords from AI messages for context
  const extractContentFromMessages = useCallback((messages: Array<{ message: string; personality: PersonalityType }>): string => {
    const keywordDetectors: Array<{ keywords: string[]; label: string }> = [
      { keywords: ["vs code", "vscode", "visual studio code", "windsurf", "cursor"], label: "VS Code / coding workspace" },
      { keywords: ["unreal", "unity"], label: "Game engine editor" },
      { keywords: ["figma"], label: "Figma design canvas" },
      { keywords: ["after effects", "premiere", "davinci"], label: "Video editing timeline" },
      { keywords: ["valorant", "league", "lol", "apex", "overwatch", "csgo", "minecraft"], label: "Popular game on screen" },
      { keywords: ["terminal", "shell", "powershell"], label: "Terminal / CLI" },
    ];

    // Look for game names, app names, or specific content identifiers
    const contentPatterns = [
      /\b(\w+(?:\s+\w+)?(?:\s+\d+)?)\s+(working|running|loading|crashed|failed|success|error|bug|fix|update|patch)\b/gi,
      /\b(localhost:\d+|127\.0\.0\.1:\d+|0\.0\.0\.0:\d+)\b/g,
      /\b(\w+(?:\s+\w+)?)\s+(game|app|software|program|tool|utility)\b/gi,
      /\b(visual\s+studio|vs\s+code|intellij|eclipse|notepad\+\+|sublime|atom|vim|emacs|cursor|windsurf)\b/gi,
      /\b(chrome|firefox|safari|edge|browser|web\s+page|website|tab)\b/gi,
      /\b(windows|mac|linux|ubuntu|terminal|command\s+line|shell|bash|powershell)\b/gi,
      /\b(react|vue|angular|javascript|typescript|python|java|cpp|c\+\+|html|css|node|npm|next\.js)\b/gi,
      /\b(league|valorant|csgo|minecraft|fortnite|apex|overwatch|dota|lol|wow|fifa|nba|nfl|elden\s+ring|tarkov)\b/gi,
      /\blooks\s+like\s+(?:it's\s+)?([\w\s:+#.-]{3,40})/gi,
      /\bthis\s+is\s+([\w\s:+#.-]{3,40})/gi,
      /\bplaying\s+([\w\s:+#.-]{3,40})/gi,
    ];

    const stripFiller = (text: string) =>
      text
        .replace(/\b(working|running|loading|crashed|failed|success|error|bug|fix|update|patch|game|app|software|program|tool|utility|looks|like|it's|its|playing|streaming|watching|tab|window)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    for (const message of messages) {
      const normalized = message.message.toLowerCase();

      const keywordMatch = keywordDetectors.find((detector) =>
        detector.keywords.some((keyword) => normalized.includes(keyword))
      );
      if (keywordMatch) {
        return keywordMatch.label;
      }

      for (const pattern of contentPatterns) {
        const matches = message.message.match(pattern);
        if (matches && matches.length > 0) {
          // Clean up and return the first meaningful match
          const content = stripFiller(matches[0]);
          if (content.length > 2 && content.length < 50) {
            return content;
          }
        }
      }
    }
    return "";
  }, []);

  // Keep message bit badges in sync with user balances (cheers & gifts)
  useEffect(() => {
    const updateBitsForUser = (username: string) => {
      const user = userPool.getUserByUsername(username);
      if (!user) return;
      setMessages((current) =>
        current.map((msg) =>
          msg.username === username ? { ...msg, bits: user.bits } : msg
        )
      );
    };

    const handleCheer = (cheer: BitCheer) => {
      updateBitsForUser(cheer.username);

      // Apply a bit-driven "super like" effect to the cheerer's most recent message
      setMessages((current) => {
        if (current.length === 0) return current;

        // Find the most recent message from this user
        const reversedIndex = [...current]
          .reverse()
          .findIndex((m) => m.username === cheer.username);

        if (reversedIndex === -1) return current;

        const targetIndex = current.length - 1 - reversedIndex;
        const target = current[targetIndex];

        const extraLikes = Math.max(1, Math.round(cheer.amount / 100));
        const effectDuration = 15000; // 15s shake window so it's noticeable

        const effect = {
          type: 'super_like' as const,
          userId: cheer.userId,
          targetUser: cheer.username,
          targetMessage: target.id,
          duration: effectDuration,
          data: { likes: extraLikes },
        };

        return current.map((msg, idx) => {
          if (idx !== targetIndex) return msg;

          const currentLikes = msg.likes ?? 0;
          const currentLikedBy = msg.likedBy ?? [];
          const nextLikedBy = currentLikedBy.includes(cheer.username)
            ? currentLikedBy
            : [...currentLikedBy, cheer.username];

          return {
            ...msg,
            likes: currentLikes + extraLikes,
            likedBy: nextLikedBy,
            redemptionEffect: effect,
            effectExpiry: Date.now() + effectDuration,
          };
        });
      });
    };

    const handleGift = (gift: BitGift) => {
      updateBitsForUser(gift.gifterUsername);
      updateBitsForUser(gift.recipientUsername);
    };

    bitCheering.onCheer(handleCheer);
    bitGifting.onGift(handleGift);

    return () => {
      bitCheering.offCheer(handleCheer);
      bitGifting.offGift(handleGift);
    };
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const savedMessages = loadMessages();
    const savedSettings = loadSettings();

    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }

    if (savedSettings) {
      // Migrate old settings to include new personality types
      const migratedSettings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings,
        personalities: {
          ...DEFAULT_SETTINGS.personalities,
          ...savedSettings.personalities,
        },
      };
      setSettings(migratedSettings);
      // Save migrated settings
      saveSettings(migratedSettings);
    }
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettings &&
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    raidSimulation.onRaid((size) => {
      notifyRaidCelebration(size);
    });
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Save settings to localStorage when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Initialize user lifecycle and retroactive likes
  useEffect(() => {
    // Start user lifecycle (users joining/leaving)
    userLifecycle.start((count) => {
      setViewerCount(count);
    });

    // Start retroactive likes system (for older messages)
    retroactiveLikes.start((messageId, likes, likedBy) => {
      setMessages((current) =>
        current.map((msg) =>
          msg.id === messageId
            ? { ...msg, likes, likedBy }
            : msg
        )
      );
    });

    // Start staggered likes system (for new messages)
    staggeredLikes.start((messageId, username) => {
      setMessages((current) =>
        current.map((msg) => {
          if (msg.id === messageId) {
            const currentLikedBy = msg.likedBy || [];
            if (!currentLikedBy.includes(username)) {
              return {
                ...msg,
                likes: (msg.likes ?? 0) + 1,
                likedBy: [...currentLikedBy, username]
              };
            }
          }
          return msg;
        })
      );
    });

    console.log('🎬 User simulation started');

    // Join moderators first (high priority)
    moderatorManager.joinModerators();

    return () => {
      userLifecycle.stop();
      retroactiveLikes.stop();
      staggeredLikes.stop();
      moderatorManager.reset();
      console.log('🛑 User simulation stopped');
    };
  }, []);

  useEffect(() => {
    if (isGenerating) {
      engagementManager.start();
    } else {
      engagementManager.stop();
    }
  }, [isGenerating]);

  // Listen for channel point redemption effects
  useEffect(() => {
    channelPoints.onRedemption((effect) => {
      console.log(`🎯🎯🎯 CHANNEL POINT EFFECT: ${effect.type} by ${effect.userId}`);
      console.log(`Target message: ${effect.targetMessage}, Target user: ${effect.targetUser}`);

      // Effect will be applied to the target message

      // Apply effect to target message or user
      setMessages((currentMessages) => {
        console.log(`🔍 Looking for target in ${currentMessages.length} messages`);
        console.log(`🔍 Target user: ${effect.targetUser}, Target message: ${effect.targetMessage}`);

        let foundTarget = false;
        const result = currentMessages.map((msg) => {

          // Check if this message is the target
          const isTarget = effect.targetMessage === msg.id ||
            (effect.targetUser && msg.username === effect.targetUser);

          if (isTarget) {
            foundTarget = true;
            console.log(`✅✅✅ APPLYING ${effect.type} to "${msg.message.substring(0, 30)}..." by ${msg.username}`);
            const effectDuration = effect.duration || 30000; // Default 30 seconds

            if (effect.type === 'super_like') {
              // Super like adds instant likes AND visual shake effect
              return {
                ...msg,
                likes: (msg.likes || 0) + (effect.data?.likes || 5),
                likedBy: [...(msg.likedBy || []), effect.userId],
                redemptionEffect: effect,
                effectExpiry: Date.now() + effectDuration
              };
            } else {
              // Other effects add visual effect with expiry
              return {
                ...msg,
                redemptionEffect: effect,
                effectExpiry: Date.now() + effectDuration
              };
            }
          }
          // No channel point updates needed in chat view
          return msg;
        });

        if (!foundTarget) {
          console.warn(`⚠️ Could not find target for ${effect.type} effect!`);
        }

        return result;
      });

      // Notification is handled by the engagement manager
    });
  }, []);

  // Sync users from user pool
  useEffect(() => {
    const syncUsers = () => {
      const users = userPool.getAllUsers();
      const activeUsers = users.filter(u => u.state === 'lurking' || u.state === 'active');
      console.log(`👥 User sync: ${users.length} total, ${activeUsers.length} active viewers`);

      // Only update if users actually changed to prevent unnecessary re-renders
      setAllUsers(prevUsers => {
        if (prevUsers.length !== users.length) return users;

        // Check if any user state changed
        const hasChanges = users.some((user, index) => {
          const prevUser = prevUsers[index];
          return !prevUser ||
            prevUser.state !== user.state ||
            prevUser.messageCount !== user.messageCount ||
            prevUser.lastActivityTime !== user.lastActivityTime;
        });

        return hasChanges ? users : prevUsers;
      });
    };

    // Initial sync
    syncUsers();

    // Sync every 5 seconds (reduced frequency) to keep user list updated
    const interval = setInterval(syncUsers, 5000);

    return () => clearInterval(interval);
  }, []);

  // Process messages for retroactive likes
  useEffect(() => {
    if (messages.length > 0) {
      retroactiveLikes.processMessages(messages);
    }
  }, [messages]);

  // Clean up expired channel point effects
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setMessages((currentMessages) => {
        return currentMessages.map((msg) => {
          if (msg.effectExpiry && msg.effectExpiry <= Date.now()) {
            // Remove expired effect
            const { redemptionEffect, effectExpiry, ...cleanMessage } = msg;
            return cleanMessage;
          }
          return msg;
        });
      });
    }, 1000); // Check every second

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleSettingsChange = (newSettings: ChatSettings) => {
    setSettings(newSettings);
  };

  const handleTriggerTestRaid = () => {
    console.log('🎯 Triggering test raid from UI...');
    const raidSize = raidSimulation.triggerTestRaid();
    if (raidSize) {
      notifyRaidCelebration(raidSize);
    }
    toast.success('Test raid triggered! Watch for incoming users.');
  };

  // Callbacks for chat sync
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    // Schedule staggered likes for this new message
    staggeredLikes.schedulelikesForMessage(message);
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    clearMessages();
    toast.success(SUCCESS_MESSAGES.MESSAGES_CLEARED);
  }, []);

  const { broadcastMessage, broadcastClear } = useChatSync(
    messages,
    handleNewMessage,
    handleClearMessages
  );

  // Limit messages to prevent memory issues (keep last 200 messages)
  useEffect(() => {
    if (messages.length > MAX_DISPLAY_MESSAGES) {
      setMessages(prev => prev.slice(-MAX_DISPLAY_MESSAGES));
    }
  }, [messages.length]);

  // Handle pause on scroll functionality
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox || !settings.pauseOnScroll) return;

    const handleScroll = () => {
      const isScrolledToBottom =
        chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 50;

      setIsPaused(!isScrolledToBottom);
    };

    chatBox.addEventListener('scroll', handleScroll);
    return () => chatBox.removeEventListener('scroll', handleScroll);
  }, [settings.pauseOnScroll]);

  // Auto-scroll to bottom when new messages arrive (unless paused)
  useEffect(() => {
    if (chatBoxRef.current && !isPaused) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isPaused]);

  // Capture a single frame from the active stream
  const captureFrameFromStream = useCallback(async (stream: MediaStream): Promise<string | null> => {
    try {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Small delay to ensure frame is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await compressScreenshot(video);
      return dataUrl;
    } catch (error) {
      console.error("Frame capture error:", error);
      return null;
    }
  }, []);

  // Start screen capture stream (keeps stream alive for continuous captures)
  const captureScreen = useCallback(async () => {
    if (isCapturing) return null;

    try {
      setIsCapturing(true);

      // Allow user to select specific window/app, not just whole screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      } as any);

      // Store the stream for continuous captures
      setMediaStream(stream);
      mediaStreamRef.current = stream;

      // Capture initial frame
      const dataUrl = await captureFrameFromStream(stream);
      if (dataUrl) {
        setScreenshot(dataUrl);
        toast.success("🎥 Screen streaming started!", {
          description: "Chat can now see what you're streaming in real-time.",
        });
      }

      // Monitor if user stops sharing
      stream.getVideoTracks()[0].onended = async () => {
        console.log("User stopped screen sharing");

        // Generate contextual message about stream ending
        const message = await generateContextualMessage('stream_ended', 'lurker');
        const lurkerUser = getOrCreateChatUser('lurker');
        const endMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          username: lurkerUser.username,
          color: PERSONALITIES.lurker.color,
          message,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          personality: 'lurker',
          likes: 0,
          likedBy: [],
          badges: lurkerUser.badges,
          subscriberMonths: lurkerUser.subscriberMonths,
          bits: lurkerUser.bits,
        };

        setMessages((prev) => [...prev, endMessage]);
        broadcastMessage(endMessage);
        staggeredLikes.schedulelikesForMessage(endMessage);

        stopStreaming();
        toast.info("Screen sharing stopped");
      };

      return dataUrl;
    } catch (error) {
      console.error("Screen capture error:", error);
      toast.error(ERROR_MESSAGES.SCREEN_CAPTURE_FAILED);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, captureFrameFromStream]);

  // Stop streaming and clean up
  const stopStreaming = useCallback(() => {
    const stream = mediaStreamRef.current || mediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    mediaStreamRef.current = null;
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setScreenshot(null);
  }, [mediaStream]);

  // Pop message from queue and display it with advanced features
  const displayNextQueuedMessage = useCallback(() => {
    if (messageQueueRef.current.length === 0) return;

    const { message, personality } = messageQueueRef.current.shift()!;
    const personalityData = PERSONALITIES[personality];

    // Use persistent users from the user pool
    const chatUser = getOrCreateChatUser(personality);

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      username: chatUser.username,
      color: personalityData.color,
      message,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      personality,
      isModerator: moderatorManager.isModeratorByUsername(chatUser.username),
      likes: 0,
      likedBy: [],
      badges: chatUser.badges,
      subscriberMonths: chatUser.subscriberMonths,
      bits: chatUser.bits,
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];

      // Schedule staggered likes for this new message
      staggeredLikes.schedulelikesForMessage(newMessage);

      // Trigger animations for hype messages
      const hypeKeywords = ["W", "L", "POG", "OMEGALUL", "KEKW", "HYPE", "GG", "EZ", "CLUTCH", "WTF", "OMG", "NOOO", "YOOO"];
      const isHype = hypeKeywords.some(k => message.toUpperCase().includes(k)) || (message === message.toUpperCase() && message.length > 5);

      if (isHype) {
        // Extract the hype word or use the whole message if short
        const hypeText = message.length < 15 ? message : hypeKeywords.find(k => message.toUpperCase().includes(k)) || "HYPE";
        animationRef.current?.addFloatingText(hypeText, 'hype');
      } else if (Math.random() < 0.1) {
        // Random chance for normal floating text
        animationRef.current?.addFloatingText(message.substring(0, 20), 'normal');
      }

      // Check if this message should trigger a copypasta chain
      if (shouldTriggerCopypasta(message)) {
        const chainMessages = generateCopypastaChain(message, 2);
        setTimeout(() => {
          chainMessages.forEach((chainMsg, idx) => {
            setTimeout(() => {
              const chainUser = getOrCreateChatUser(
                selectPersonality(settings.personalities)
              );
              const chainMessage: Message = {
                id: `${Date.now()}-${Math.random()}-chain-${idx}`,
                username: chainUser.username,
                color: PERSONALITIES[chainUser.personality].color,
                message: chainMsg,
                timestamp: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                personality: chainUser.personality,
                likes: 0,
                likedBy: [],
                badges: chainUser.badges,
                subscriberMonths: chainUser.subscriberMonths,
                bits: chainUser.bits,
              };
              setMessages((prev) => [...prev, chainMessage]);
              broadcastMessage(chainMessage);
              // Schedule likes for chain message
              staggeredLikes.schedulelikesForMessage(chainMessage);
            }, idx * 800); // Stagger chain messages
          });
        }, 500);
      }

      return updated;
    });

    broadcastMessage(newMessage);
  }, [broadcastMessage, settings.personalities]);

  // Test messages removed - using AI only

  // Generate contextual message when screen issues occur
  const generateContextualMessage = useCallback(async (context: 'no_screen' | 'stream_ended', personality: PersonalityType): Promise<string> => {
    const examples = {
      no_screen: [
        "uhh stream is frozen??",
        "yo i cant see anything",
        "screen went black",
        "is the stream down",
        "refresh your stream",
        "cant see the game",
        "stream lagging hard",
        "black screen lol",
      ],
      stream_ended: [
        "stream ended??",
        "wait it stopped",
        "noooo come back",
        "stream went offline",
        "is that it??",
        "bruh stream died",
        "rip stream",
      ]
    };

    try {
      const useLocal = settings.aiProvider === 'local' || settings.aiProvider === 'auto';

      if (useLocal) {
        const targetOllamaUrl = settings.ollamaApiUrl;
        const ollamaAvailable = await isOllamaAvailable(targetOllamaUrl);

        if (ollamaAvailable) {
          const prompt = `Generate ONE realistic Twitch chat message about ${context.replace('_', ' ')}. 

Personality: ${personality}
Style examples (do NOT copy exactly, create similar variations):
${examples[context].map(ex => `- "${ex}"`).join('\n')}

Rules:
- Write as a ${personality} personality
- Be casual, imperfect, like real Twitch chat
- Use lowercase, typos are OK
- Keep it short and authentic
- Output ONLY the message, nothing else
- Make it different from the examples but same style`;

          const message = await generateTextWithOllama({
            prompt: prompt,
            model: settings.ollamaModel,
            ollamaApiUrl: targetOllamaUrl,
          });

          return message || examples[context][Math.floor(Math.random() * examples[context].length)];
        }
      }
    } catch (error) {
      console.warn("Failed to generate contextual message, using fallback:", error);
    }

    // Fallback to random selection if AI fails
    return examples[context][Math.floor(Math.random() * examples[context].length)];
  }, [settings.aiProvider, settings.ollamaApiUrl, settings.ollamaModel]);

  // Generate batch of chat messages with rate limiting and retry logic
  const generateChatMessageBatch = useCallback(async () => {
    console.log("🎬 generateChatMessageBatch called", { hasScreenshot: !!screenshot, queueLength: messageQueueRef.current.length });

    if (!screenshot) {
      console.log("⚠️ No screenshot available, generating contextual message");
      // Generate contextual message about screen issues
      const message = await generateContextualMessage('no_screen', 'helpful');
      const helpfulUser = getOrCreateChatUser('helpful');
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        username: helpfulUser.username,
        color: PERSONALITIES.helpful.color,
        message,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        personality: 'helpful',
        likes: 0,
        likedBy: [],
        badges: helpfulUser.badges,
        subscriberMonths: helpfulUser.subscriberMonths,
        bits: helpfulUser.bits,
      };

      console.log("💬 Adding no-screen message:", newMessage.message);
      setMessages((prev) => [...prev, newMessage]);
      broadcastMessage(newMessage);
      return;
    }

    if (messageQueueRef.current.length > 0) {
      console.log("📤 Displaying queued message");
      displayNextQueuedMessage();
      return;
    }

    // Prevent multiple simultaneous AI calls
    if (isWaitingForAIRef.current) {
      console.log("⏳ Already waiting for AI response, skipping duplicate call");
      return;
    }

    try {
      isWaitingForAIRef.current = true;
      await rateLimiterRef.current.execute(async () => {
        const personalitySettings = { ...settings.personalities };

        const selectedPersonalities: PersonalityType[] = [];
        for (let i = 0; i < AI_BATCH_SIZE; i++) {
          const personality = selectPersonality(personalitySettings);
          selectedPersonalities.push(personality);
        }

        const recentMessages = messages
          .slice(-RECENT_MESSAGES_LIMIT)
          .map((m) => `${m.isModerator ? "[MODERATOR]" : ""} ${m.username}: ${m.message}`);

        // Find the most recent moderator message so the AI can answer it directly
        const latestModeratorMessage = [...messages]
          .slice()
          .reverse()
          .find((m) => m.isModerator);

        const moderatorAdditionalContext = latestModeratorMessage
          ? `The most recent moderator message was: "${latestModeratorMessage.username}: ${latestModeratorMessage.message}". Prioritize answering this directly while still sounding like natural Twitch chat.`
          : undefined;

        const screenContextHint = detectedContent
          ? `Latest detected screen content: ${detectedContent}. Confirm what you see or correct it with specifics.`
          : undefined;

        const combinedAdditionalContext = [moderatorAdditionalContext, screenContextHint]
          .filter(Boolean)
          .join(" ") || undefined;

        if (shouldAddLurkerJoin(messages.length)) {
          selectedPersonalities[0] = 'lurker';
        }

        const shouldBurst = shouldCreateReactionChain(messages);

        let data: { messages: Array<{ message: string; personality: PersonalityType }>; detectedContent?: string } | undefined;
        let error: Error | null = null;
        let usedLocal = false;

        const useLocal = settings.aiProvider === 'local' || settings.aiProvider === 'auto';
        const useCloud = settings.aiProvider === 'cloud' || settings.aiProvider === 'auto';

        if (useLocal) {
          const targetOllamaUrl = settings.ollamaApiUrl;
          const ollamaAvailable = await isOllamaAvailable(targetOllamaUrl);
          if (ollamaAvailable) {
            try {
              console.log("🤖 Attempting local Ollama generation...");

              // Add timeout to prevent infinite waiting (90s for llava:13b)
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Ollama timeout after 90s - model may be too slow or out of memory')), 90000)
              );

              data = await Promise.race([
                generateWithOllama({
                  screenshot,
                  recentChat: recentMessages,
                  personalities: selectedPersonalities,
                  model: settings.ollamaModel,
                  ollamaApiUrl: targetOllamaUrl,
                  batchSize: shouldBurst ? AI_BATCH_SIZE + 2 : AI_BATCH_SIZE,
                  additionalContext: combinedAdditionalContext,
                }),
                timeoutPromise
              ]) as { messages: Array<{ message: string; personality: PersonalityType }> };

              usedLocal = true;
              console.log("✅ Using Local Ollama (FREE!)");
            } catch (ollamaError) {
              console.error("❌ Local Ollama failed:", ollamaError);

              // For local-only mode, provide helpful guidance
              if (settings.aiProvider === 'local') {
                const errorMessage = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
                toast.error("Local Ollama failed", {
                  description: errorMessage.includes('timeout')
                    ? "Model is too slow. Try: 1) Use llava:7b instead of llava:13b, 2) Use llama3.2:3b for text-only, or 3) Check Ollama is running"
                    : "Check your Ollama setup and model.",
                  duration: 12000
                });
                stopGenerating();
                return;
              }
              // If auto mode, fall through to cloud
              console.log("⚠️ Falling back to cloud AI...");
            }
          } else if (settings.aiProvider === 'local') {
            toast.error("Ollama is not running", {
              description: targetOllamaUrl
                ? `Cannot reach ${targetOllamaUrl}. Start Ollama with: ollama serve`
                : "Start Ollama with 'ollama serve' then pull a vision model: 'ollama pull llava:7b'",
              duration: 12000
            });
            stopGenerating();
            return;
          }
        }

        if (useCloud && !usedLocal) {
          console.log("☁️ Using Cloud AI...");
          try {
            const geminiResponse = await supabase.functions.invoke("generate-chat-gemini", {
              body: {
                screenshot,
                recentChat: recentMessages,
                personalities: selectedPersonalities,
                batchSize: shouldBurst ? AI_BATCH_SIZE + 2 : AI_BATCH_SIZE,
                additionalContext: combinedAdditionalContext,
              },
            });
            data = geminiResponse.data;
            error = geminiResponse.error;
            if (!error) console.log("✅ Using Google Gemini API (Cloud)");
          } catch (geminiError) {
            console.warn("⚠️ Google Gemini failed, trying OpenRouter fallback:", geminiError);
            const openRouterResponse = await supabase.functions.invoke("generate-chat", {
              body: {
                screenshot,
                recentChat: recentMessages,
                personalities: selectedPersonalities,
                batchSize: shouldBurst ? AI_BATCH_SIZE + 2 : AI_BATCH_SIZE,
                additionalContext: combinedAdditionalContext,
              },
            });
            data = openRouterResponse.data;
            error = openRouterResponse.error;
            if (!error) console.log("✅ Using OpenRouter fallback");
          }
        }

        if (error) throw error;

        if (data?.messages && Array.isArray(data.messages)) {
          console.log(`✅ AI generated ${data.messages.length} messages`);

          const normalizedDetected = data.detectedContent && !/unknown/i.test(data.detectedContent)
            ? data.detectedContent.trim()
            : undefined;
          const heuristicContent = normalizedDetected ? undefined : extractContentFromMessages(data.messages);
          const nextDetectedContent = normalizedDetected || heuristicContent;

          if (nextDetectedContent && nextDetectedContent !== detectedContent) {
            setDetectedContent(nextDetectedContent);
            console.log(`🎯 Detected content: ${nextDetectedContent}`);
          }

          messageQueueRef.current.push(...data.messages);
          retryCountRef.current = 0;
          isWaitingForAIRef.current = false;
          displayNextQueuedMessage();
        } else {
          console.warn("⚠️ No messages in AI response", data);
          isWaitingForAIRef.current = false;
        }
      });
    } catch (error) {
      isWaitingForAIRef.current = false;
      console.error("Error generating message batch:", error);
      const errorStatus = (error as { status?: number; context?: { status?: number } })?.status || (error as { context?: { status?: number } })?.context?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';
      console.error("Error details:", { status: errorStatus, message: errorMessage, contextStatus: (error as { context?: { status?: number } })?.context?.status, name: errorName });

      if (errorStatus === 429) {
        toast.error("AI rate limit exceeded", { description: "Trying alternative models automatically. If this persists, wait a minute.", duration: 10000 });
        retryCountRef.current = 0;
        stopGenerating();
        return;
      } else if (errorStatus === 402) {
        toast.error(ERROR_MESSAGES.AI_CREDITS_EXHAUSTED);
        retryCountRef.current = 0;
        stopGenerating();
        return;
      } else if (errorStatus === 403 || errorStatus === 401) {
        toast.error("API authentication failed. Check your Google AI API key.", { duration: 10000 });
        retryCountRef.current = 0;
        stopGenerating();
        return;
      } else if (errorStatus === 500 || errorStatus === 503) {
        console.error("Full error object:", error);

        // Check if we should retry or give up
        if (retryCountRef.current < 2) {
          retryCountRef.current++;
          toast.warning(`AI service issue (attempt ${retryCountRef.current}/2)`, {
            description: "Retrying with different model...",
            duration: 5000
          });
          setTimeout(() => {
            generateChatMessageBatch();
          }, 2000);
          return;
        }

        // After retries, skip this batch but keep generation loop running
        console.warn("⚠️ Server error after retries, skipping batch but continuing generation");
        toast.warning("Server temporarily unavailable", {
          description: "Skipped this batch. Will retry with next message. Check Ollama/API setup.",
          duration: 8000
        });
        retryCountRef.current = 0;
        isWaitingForAIRef.current = false;
        return;
      }

      const maxRetries = 3;
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        toast.error(`Retry ${retryCountRef.current}/${maxRetries} in ${retryDelay / 1000}s...`);
        setTimeout(() => {
          generateChatMessageBatch();
        }, retryDelay);
        return;
      }

      // Reset state but DON'T stop generation - let the scheduled loop continue
      retryCountRef.current = 0;
      isWaitingForAIRef.current = false;
      console.warn("⚠️ Skipping this batch after failures, will try again on next cycle");
      toast.warning("Skipped failed batch", { description: "Will retry with next scheduled message. Check Ollama/API setup.", duration: 5000 });
    }
  }, [screenshot, settings, messages, broadcastMessage, displayNextQueuedMessage, isLofiMode, detectedContent]);

  // Start generating messages with dynamic timing
  const startGenerating = async () => {
    console.log("🚀 startGenerating called", { isGenerating, hasScreenshot: !!screenshot, hasMediaStream: !!mediaStream });

    // Force reset all state when manually starting (fix stuck states)
    isWaitingForAIRef.current = false;
    retryCountRef.current = 0;
    messageQueueRef.current = [];

    if (isGenerating) {
      console.log("⏭️ Already generating, forcing restart...");
      // Force restart to fix stuck state
      stopGenerating();
      // Small delay before restart
      setTimeout(() => {
        setIsGenerating(true);
        generateChatMessageBatch();
      }, 100);
      return;
    }

    // Auto-capture if no screenshot exists
    if (!screenshot || !mediaStream) {
      console.log("📸 No screenshot/stream, capturing...");
      const captured = await captureScreen();
      if (!captured) {
        console.error("❌ Screen capture failed");
        toast.error('Screen capture required to start AI chat');
        return;
      }
    }

    console.log("✅ Starting generation...");
    setIsGenerating(true);
    generateChatMessageBatch();

    // Start continuous screen capture (every 15 seconds - OPTIMIZED for performance)
    // Store in a separate ref to avoid triggering the auto-start effect
    const activeStream = mediaStreamRef.current;
    if (activeStream) {
      const latestScreenshotRef = { current: screenshot };

      captureIntervalRef.current = setInterval(async () => {
        const frame = await captureFrameFromStream(activeStream);
        if (frame) {
          latestScreenshotRef.current = frame;
          // Update screenshot state WITHOUT triggering auto-start
          setScreenshot(frame);
          console.log("📸 Screen refreshed for AI context");
        } else {
          // If frame capture fails, users should realistically comment
          console.warn("⚠️ Failed to capture new frame");
        }
      }, 5000); // Capture new frame every 5 seconds (OPTIMIZED for real-time reactions)
    }

    // Use dynamic timing instead of fixed interval
    const scheduleNext = () => {
      const dynamicDelay = calculateMessageDelay(settings.messageFrequency, messages);
      console.log(`⏰ Scheduling next message in ${dynamicDelay}s`);
      intervalRef.current = setTimeout(() => {
        console.log("🚀 Triggering next message batch");
        generateChatMessageBatch();
        scheduleNext(); // Schedule next message with new timing
      }, dynamicDelay * 1000);
    };

    scheduleNext();
  };

  // Stop generating messages
  const stopGenerating = () => {
    setIsGenerating(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  // Handle Play/Stop button: capture screen then auto-start, or stop generation + clear capture
  const handlePlayStop = async () => {
    if (isGenerating) {
      stopGenerating();
      stopStreaming();
      toast.info("🛑 Streaming stopped and capture cleared");
    } else {
      const dataUrl = await captureScreen();
      if (dataUrl) {
        toast.success("🎥 Screen captured! Starting generation...");
      }
    }
  };

  const toggleLofiMode = useCallback(() => {
    setIsLofiMode((prev) => !prev);
  }, []);

  // Auto-start generation when screenshot is captured via Play button (ONLY on initial capture)
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (screenshot && !isGenerating && !isCapturing && !hasStartedRef.current) {
      hasStartedRef.current = true;
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        startGenerating();
      }, 300);

      return () => clearTimeout(timer);
    }

    // Reset flag when screenshot is cleared
    if (!screenshot) {
      hasStartedRef.current = false;
    }
  }, [screenshot, isGenerating, isCapturing]);

  // Reply handlers
  const handleReply = useCallback((messageId: string, username: string, message: string) => {
    setReplyingTo({ messageId, username, message });
  }, []);

  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleJumpToMessage = useCallback((messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && chatBoxRef.current) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      messageElement.classList.add('bg-purple-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-purple-100');
      }, 1500);
    }
  }, []);

  const handleViewHistory = useCallback((username: string) => {
    const user = userPool.getUserByUsername(username);
    if (user) {
      setSelectedUser(user);
      setShowUserHistory(true);
    }
  }, []);

  const handleViewProfile = useCallback((username: string) => {
    const user = userPool.getUserByUsername(username);
    if (user) {
      setSelectedUser(user);
      setShowUserProfile(true);
    }
  }, []);

  // Send moderator message
  const sendModeratorMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      username: "MODERATOR",
      color: MODERATOR_COLOR,
      message: text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isModerator: true,
      likes: 0,
      likedBy: [],
      // Add reply data if replying
      replyToId: replyingTo?.messageId,
      replyToUsername: replyingTo?.username,
      replyToMessage: replyingTo?.message,
    };

    // Use startTransition to prevent UI freeze
    startTransition(() => {
      setMessages((prev) => [...prev, newMessage]);
      broadcastMessage(newMessage);
      // Schedule staggered likes for moderator message
      staggeredLikes.schedulelikesForMessage(newMessage);
      clearReply(); // Clear reply context after sending
    });
  };

  // Clear chat
  const handleClearChat = () => {
    handleClearMessages();
    broadcastClear();
  };

  // Export functionality removed - not currently used

  // Open popout window
  const openPopout = () => {
    const popout = window.open(
      "/popout.html",
      POPOUT_WINDOW_NAME,
      `width=${POPOUT_WIDTH},height=${POPOUT_HEIGHT},resizable=yes,scrollbars=yes`
    );

    if (popout) {
      popoutWindowRef.current = popout;
      setIsPopoutOpen(true);

      // Poll to detect when popout window is closed
      const checkClosed = setInterval(() => {
        if (popout.closed) {
          clearInterval(checkClosed);
          setIsPopoutOpen(false);
          popoutWindowRef.current = null;
        }
      }, 1000);
    }
  };

  // Dynamic timing is handled in startGenerating() with setTimeout

  // Handle tab visibility changes (fix browser suspension issues)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isGenerating) {
        console.log('👁️ Tab became visible, checking generation state...');

        // Reset stuck flags that might prevent generation
        if (isWaitingForAIRef.current) {
          console.log('🔄 Resetting stuck AI generation flag');
          isWaitingForAIRef.current = false;
        }

        // Restart generation if it was suspended
        if (!intervalRef.current && screenshot) {
          console.log('🚀 Restarting generation after tab suspension');
          generateChatMessageBatch();
        }
      } else if (document.visibilityState === 'hidden' && isGenerating) {
        console.log('🙈 Tab hidden, pausing generation to save resources');
        // Optional: Pause generation when hidden to prevent "starting soon" loops if video pauses
        // For now, we keep it running but maybe slow it down?
        // Actually, let's just log it. The user specifically mentioned minimizing causes issues.
        // If the video pauses when minimized, the AI sees a static frame.
        // We can't easily detect if the video is playing vs paused from a screenshot alone without comparing frames.
        // But we can rely on the "NEVER say starting soon" prompt fix.
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isGenerating, screenshot]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      rateLimiterRef.current.clear();
    };
  }, [mediaStream]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrlKey: true,
      description: "Capture screen",
      action: captureScreen,
    },
    {
      key: " ",
      description: "Toggle generation (Start/Stop)",
      action: () => {
        if (isGenerating) {
          stopGenerating();
        } else if (screenshot) {
          startGenerating();
        }
      },
    },
    {
      key: "/",
      ctrlKey: true,
      description: "Toggle settings",
      action: () => setShowSettings((prev) => !prev),
    },
    {
      key: "l",
      ctrlKey: true,
      shiftKey: true,
      description: "Clear chat",
      action: handleClearChat,
    },
  ]);

  // Memoize whether to show empty state
  const showEmptyState = useMemo(() => messages.length === 0, [messages.length]);

  return (
    <div
      className={`h-screen flex overflow-hidden bg-gradient-to-br ${isLofiMode
        ? "from-slate-950 via-slate-900 to-slate-950"
        : "from-background via-background-deep to-background"
        }`}
    >
      {/* Notification Overlay for bits, subs, channel points */}
      <NotificationOverlay />

      {/* Fullscreen Container - No padding, no centering */}
      <div className="w-full h-full relative">
        {/* Subtle Cyber Glow Effect */}
        <div className="absolute top-0 left-0 w-[50px] h-[50px] opacity-20 blur-md pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)), rgba(0, 255, 255, 0.2), transparent)'
          }}
        />
        <div className="absolute bottom-0 right-0 w-[50px] h-[50px] opacity-20 blur-md pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--secondary)), rgba(255, 0, 255, 0.2), transparent)'
          }}
        />

        {/* Chat Animations Overlay */}
        <ChatAnimations ref={animationRef} />

        {/* Fullscreen Card Container */}
        <div
          className={`w-full h-full card-shadow overflow-hidden flex flex-col ${isLofiMode ? "bg-slate-900/95 text-slate-50" : "bg-white"
            }`}
        >
          {/* Header */}
          <ChatHeader
            viewerCount={viewerCount}
            isLive={isGenerating}
            onOpenUserList={() => setShowUserList(true)}
            screenshot={isGenerating ? screenshot : null}
            detectedContent={detectedContent}
          />

          {/* Settings Panel */}
          {showSettings && (
            <div
              ref={settingsPanelRef}
              className="px-5 py-4 border-b border-gray-200 bg-gray-50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
            >
              <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} onTriggerTestRaid={handleTriggerTestRaid} />
            </div>
          )}

          {/* Chat Messages Container - Takes full height */}
          <div
            ref={chatBoxRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden pb-2 scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-gray-100 hover:scrollbar-thumb-emerald-500 active:scrollbar-thumb-emerald-600 relative bg-gradient-to-b ${isLofiMode ? "from-slate-900/80 to-slate-950/80" : "from-gray-50 to-gray-100"
              }`}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {/* Paused Indicator */}
            {isPaused && settings.pauseOnScroll && (
              <div className="sticky top-2 left-0 right-0 z-10 flex justify-center pointer-events-none mb-2">
                <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-pulse">
                  <span>⏸️</span>
                  <span>Chat Paused - Scroll to bottom to resume</span>
                </div>
              </div>
            )}

            {showEmptyState ? (
              <NoChatEmptyState />
            ) : (
              (() => {
                // Find the message with the most likes for bubble effect
                const mostLikedMessage = messages.reduce((max, msg) =>
                  (msg.likes ?? 0) > (max.likes ?? 0) ? msg : max
                  , messages[0]);

                return messages.map((msg) => (
                  <div key={msg.id} id={`message-${msg.id}`} className="transition-colors duration-300">
                    <ChatPersonality
                      message={msg}
                      settings={settings}
                      isMostPopular={msg.id === mostLikedMessage?.id && (msg.likes ?? 0) >= 3}
                      isLofiMode={isLofiMode}
                      onLike={(messageId) => {
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.id === messageId
                              ? { ...m, likes: (m.likes ?? 0) + 1 }
                              : m
                          )
                        );
                      }}
                      onReply={handleReply}
                      onJumpToMessage={handleJumpToMessage}
                      onViewHistory={handleViewHistory}
                      onViewProfile={handleViewProfile}
                    />
                  </div>
                ));
              })()
            )}
          </div>

          {/* Input Container */}
          <div className={`p-4 bg-gradient-to-b border-t shadow-[0_-2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] ${isLofiMode
            ? "from-slate-800 to-slate-900/30 border-slate-700"
            : "from-white to-gray-50/30 border-gray-200"
            }`}>
            <ChatInput
              onSendMessage={sendModeratorMessage}
              isGenerating={isGenerating}
              isPopoutOpen={isPopoutOpen}
              onToggleSettings={() => setShowSettings((prev) => !prev)}
              onOpenPopout={openPopout}
              onPlayStop={handlePlayStop}
              onClearChat={handleClearMessages}
              replyingTo={replyingTo ? { username: replyingTo.username, message: replyingTo.message } : null}
              onClearReply={clearReply}
              isLofiMode={isLofiMode}
              onToggleLofiMode={toggleLofiMode}
            />
          </div>
        </div>
      </div>

      {/* User List Panel */}
      <UserListPanel
        users={allUsers}
        isOpen={showUserList}
        onClose={() => setShowUserList(false)}
        onUserClick={(user) => {
          setSelectedUser(user);
          setShowUserList(false);
          setShowUserProfile(true);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUser(null);
        }}
      />

      {/* User History Modal */}
      <UserHistoryModal
        user={selectedUser}
        messages={messages}
        isOpen={showUserHistory}
        onClose={() => {
          setShowUserHistory(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default Index;
