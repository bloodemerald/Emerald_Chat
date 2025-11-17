// Application Constants

// Screenshot Configuration - HIGH QUALITY FOR VISION AI
export const SCREENSHOT_MAX_WIDTH = 1920; // Full HD for better text readability
export const SCREENSHOT_MAX_HEIGHT = 1080; // Full HD for better text readability
export const SCREENSHOT_QUALITY = 0.85; // High quality so AI can read small text
export const SCREENSHOT_FORMAT = 'image/jpeg'; // JPEG for Ollama compatibility

// Chat Configuration
export const RECENT_MESSAGES_LIMIT = 10; // Number of messages sent to AI for context
export const MAX_DISPLAY_MESSAGES = 200; // Maximum messages to keep in chat (for performance)
export const MESSAGE_FREQUENCY_MIN = 1; // Minimum seconds between messages (increased activity)
export const MESSAGE_FREQUENCY_MAX = 6; // Maximum seconds between messages (increased activity)
export const MESSAGE_FREQUENCY_DEFAULT = 3; // Default seconds between messages (increased activity)
export const MAX_MESSAGE_LENGTH = 140; // Twitch-style character limit
export const CHAT_HISTORY_STORAGE_KEY = 'screen-chatter-messages';
export const SETTINGS_STORAGE_KEY = 'screen-chatter-settings';

// AI Configuration
export const AI_TEMPERATURE = 0.7; // Creativity vs consistency (0-1)
export const AI_MAX_TOKENS = 100; // Maximum response length
export const AI_MODEL = 'google/gemini-2.5-flash';
export const AI_BATCH_SIZE = 1; // Number of messages to generate per API call (faster for local models)

// Popout Window Configuration
export const POPOUT_WIDTH = 420;
export const POPOUT_HEIGHT = 700;
export const POPOUT_WINDOW_NAME = 'TwitchChatPopout';

// BroadcastChannel Configuration
export const BROADCAST_CHANNEL_NAME = 'twitch-chat-sync';

// Colors
export const MODERATOR_COLOR = '#00FF00';

// Debounce/Throttle Timings (ms)
export const SETTINGS_UPDATE_DEBOUNCE = 500;
export const SCREENSHOT_CAPTURE_COOLDOWN = 1000;
export const API_RATE_LIMIT_DELAY = 1000;

// Local Storage Limits
export const MAX_STORED_MESSAGES = 100; // Prevent localStorage from growing too large

// Virtualization Threshold
export const VIRTUALIZE_MESSAGES_THRESHOLD = 50; // Start virtualizing after this many messages

// Error Messages
export const ERROR_MESSAGES = {
  SCREEN_CAPTURE_FAILED: 'Screen capture failed. Please allow screen sharing.',
  AI_GENERATION_FAILED: 'Failed to generate chat message',
  RATE_LIMIT_EXCEEDED: 'Google AI rate limit exceeded',
  AI_CREDITS_EXHAUSTED: 'AI credits exhausted. Please add credits in Settings.',
  NO_SCREENSHOT: 'Please capture your screen first',
  INVALID_SETTINGS: 'Invalid settings configuration',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SCREEN_CAPTURED: 'Screen captured! Ready to generate AI chat.',
  MESSAGES_CLEARED: 'Chat history cleared',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
