export type PersonalityType = 
  | "toxic"
  | "helpful"
  | "meme"
  | "backseat"
  | "hype"
  | "lurker"
  | "spammer"
  | "analyst"
  | "speedrunner"
  | "emote_spammer"
  | "clip_goblin"
  | "spoiler_police"
  | "wholesome"
  | "theorycrafter"
  | "reaction_only"
  | "mobile_only";

export type MessageType = 
  | "reaction"
  | "question"
  | "command"
  | "copypasta"
  | "emote"
  | "reply"
  | "prediction"
  | "normal";

export interface Personality {
  type: PersonalityType;
  name: string;
  color: string;
  emoji: string;
  weight: number;
  messageTypes: { type: MessageType; weight: number }[];
  signaturePhrases: string[];
  emotes: string[];
}

export interface Message {
  id: string;
  username: string;
  color: string;
  message: string;
  timestamp: string;
  isModerator?: boolean;
  personality?: PersonalityType;
  likes?: number;
  dislikes?: number;
  likedBy?: string[];
  // Channel point effects
  redemptionEffect?: {
    type:
      | 'highlight_bomb'
      | 'ghost_message'
      | 'color_blast'
      | 'super_like'
      | 'personality_swap'
      | 'copy_pasta';
    userId: string;
    targetUser?: string;
    targetMessage?: string;
    duration?: number;
    data?: any;
  };
  effectExpiry?: number; // Timestamp when effect expires
  // Reply/Threading
  replyToId?: string;
  replyToUsername?: string;
  replyToMessage?: string;
  threadCount?: number;
  // Badges
  badges?: import('./badges').UserBadge[];
  // User metadata
  subscriberMonths?: number;
  bits?: number;
  // Bit cheering
  cheerTier?: import('../lib/bitCheering').BitTier;
  cheerAnimation?: string;
  // Sentiment analysis
  sentiment?: {
    score: number; // -1 to 1 (negative to positive)
    label: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0 to 1
    magnitude: number; // Intensity of sentiment
  };
}

export interface ChatSettings {
  personalities: Record<PersonalityType, boolean>;
  messageFrequency: number;
  diversityLevel: "low" | "medium" | "high";
  // AI Provider Selection
  aiProvider: "local" | "cloud" | "auto";
  ollamaModel?: string;
  ollamaApiUrl?: string;
  // Useful Twitch-inspired features
  pauseOnScroll: boolean;
  showTimestamps: boolean;
  enableAutoMod: boolean;
  // Sentiment Analysis
  enableSentimentAnalysis: boolean;
  showSentimentIndicators: boolean;
  sentimentFilter?: 'all' | 'positive' | 'negative' | 'neutral';
  highlightPositive: boolean;
  highlightNegative: boolean;
}
