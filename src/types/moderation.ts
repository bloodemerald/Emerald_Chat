import { Message } from './personality';

/**
 * Moderation action types
 */
export type ModActionType = 'ban' | 'timeout' | 'delete_message' | 'warn';

/**
 * Timeout duration presets (in milliseconds)
 */
export const TIMEOUT_DURATIONS = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
} as const;

export type TimeoutDuration = keyof typeof TIMEOUT_DURATIONS;

/**
 * Moderation action record
 */
export interface ModAction {
  id: string;
  type: ModActionType;
  targetUsername: string;
  moderatorUsername: string;
  reason?: string;
  timestamp: number;
  duration?: number; // For timeouts (milliseconds)
  expiresAt?: number; // For timeouts (timestamp)
  messageId?: string; // For message deletions
}

/**
 * User moderation state
 */
export interface UserModerationState {
  isBanned: boolean;
  isTimedOut: boolean;
  timeoutUntil?: number;
  banReason?: string;
  timeoutReason?: string;
  warnings: number;
  modActions: ModAction[];
}

/**
 * Extended ChatUser with moderation state
 * This extends the existing ChatUser type from userPool
 */
export interface ChatUserWithModeration {
  moderation: UserModerationState;
}

/**
 * Message history entry for a user
 */
export interface UserMessageHistory {
  username: string;
  messages: Message[];
  totalMessages: number;
  firstMessageTime?: number;
  lastMessageTime?: number;
}
