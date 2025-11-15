import { Message, ChatSettings } from '@/types/personality';
import {
  CHAT_HISTORY_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  MAX_STORED_MESSAGES,
} from './constants';

/**
 * Save messages to localStorage with size limit
 */
export function saveMessages(messages: Message[]): void {
  try {
    // Keep only the most recent messages to prevent localStorage overflow
    const messagesToSave = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messagesToSave));
  } catch (error) {
     
    console.error('Failed to save messages to localStorage:', error);
    // If storage is full, try clearing and saving again
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
        const recentMessages = messages.slice(-50); // Save fewer messages
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(recentMessages));
      } catch {
        // Silent fail - localStorage is not critical
      }
    }
  }
}

/**
 * Load messages from localStorage
 */
export function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
     
    console.error('Failed to load messages from localStorage:', error);
  }
  return [];
}

/**
 * Clear all messages from localStorage
 */
export function clearMessages(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
  } catch (error) {
     
    console.error('Failed to clear messages from localStorage:', error);
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: ChatSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
     
    console.error('Failed to save settings to localStorage:', error);
  }
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): ChatSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
     
    console.error('Failed to load settings from localStorage:', error);
  }
  return null;
}

/**
 * Get localStorage usage information
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers have 5-10MB limit, we'll assume 5MB as conservative estimate
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  } catch (error) {
     
    console.error('Failed to get storage info:', error);
    return { used: 0, available: 0, percentage: 0 };
  }
}
