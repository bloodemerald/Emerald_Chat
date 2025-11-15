import { ChatUser, userPool } from './userPool';
import { ModAction, ModActionType, TIMEOUT_DURATIONS, TimeoutDuration } from '@/types/moderation';

/**
 * Ban a user
 */
export function banUser(username: string, reason?: string, moderatorUsername: string = 'MODERATOR'): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user) return false;

  const action: ModAction = {
    id: `${Date.now()}-${Math.random()}`,
    type: 'ban',
    targetUsername: username,
    moderatorUsername,
    reason,
    timestamp: Date.now(),
  };

  user.moderation.isBanned = true;
  user.moderation.banReason = reason;
  user.moderation.modActions.push(action);

  // Move user offline
  user.state = 'offline';

  console.log(`🔨 ${username} has been banned by ${moderatorUsername}${reason ? `: ${reason}` : ''}`);
  return true;
}

/**
 * Unban a user
 */
export function unbanUser(username: string, moderatorUsername: string = 'MODERATOR'): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user) return false;

  user.moderation.isBanned = false;
  user.moderation.banReason = undefined;

  console.log(`✅ ${username} has been unbanned by ${moderatorUsername}`);
  return true;
}

/**
 * Timeout a user for a specific duration
 */
export function timeoutUser(
  username: string,
  duration: TimeoutDuration,
  reason?: string,
  moderatorUsername: string = 'MODERATOR'
): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user) return false;

  const durationMs = TIMEOUT_DURATIONS[duration];
  const expiresAt = Date.now() + durationMs;

  const action: ModAction = {
    id: `${Date.now()}-${Math.random()}`,
    type: 'timeout',
    targetUsername: username,
    moderatorUsername,
    reason,
    timestamp: Date.now(),
    duration: durationMs,
    expiresAt,
  };

  user.moderation.isTimedOut = true;
  user.moderation.timeoutUntil = expiresAt;
  user.moderation.timeoutReason = reason;
  user.moderation.modActions.push(action);

  // Move user offline during timeout
  user.state = 'offline';

  console.log(`⏱️ ${username} has been timed out for ${duration} by ${moderatorUsername}${reason ? `: ${reason}` : ''}`);

  // Auto-remove timeout when it expires
  setTimeout(() => {
    untimeoutUser(username);
  }, durationMs);

  return true;
}

/**
 * Remove timeout from a user
 */
export function untimeoutUser(username: string): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user) return false;

  user.moderation.isTimedOut = false;
  user.moderation.timeoutUntil = undefined;
  user.moderation.timeoutReason = undefined;

  console.log(`✅ ${username}'s timeout has been removed`);
  return true;
}

/**
 * Warn a user
 */
export function warnUser(username: string, reason?: string, moderatorUsername: string = 'MODERATOR'): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user) return false;

  const action: ModAction = {
    id: `${Date.now()}-${Math.random()}`,
    type: 'warn',
    targetUsername: username,
    moderatorUsername,
    reason,
    timestamp: Date.now(),
  };

  user.moderation.warnings++;
  user.moderation.modActions.push(action);

  console.log(`⚠️ ${username} has been warned by ${moderatorUsername}${reason ? `: ${reason}` : ''}`);
  return true;
}

/**
 * Check if a user is currently banned
 */
export function isUserBanned(username: string): boolean {
  const user = userPool.getUserByUsername(username);
  return user?.moderation.isBanned ?? false;
}

/**
 * Check if a user is currently timed out
 */
export function isUserTimedOut(username: string): boolean {
  const user = userPool.getUserByUsername(username);
  if (!user || !user.moderation.isTimedOut) return false;

  // Check if timeout has expired
  if (user.moderation.timeoutUntil && Date.now() > user.moderation.timeoutUntil) {
    untimeoutUser(username);
    return false;
  }

  return true;
}

/**
 * Check if a user can send messages (not banned or timed out)
 */
export function canUserSendMessages(username: string): boolean {
  return !isUserBanned(username) && !isUserTimedOut(username);
}

/**
 * Get all moderation actions for a user
 */
export function getUserModActions(username: string): ModAction[] {
  const user = userPool.getUserByUsername(username);
  return user?.moderation.modActions ?? [];
}

/**
 * Get formatted timeout remaining time
 */
export function getTimeoutRemaining(username: string): string | null {
  const user = userPool.getUserByUsername(username);
  if (!user || !user.moderation.isTimedOut || !user.moderation.timeoutUntil) {
    return null;
  }

  const remaining = user.moderation.timeoutUntil - Date.now();
  if (remaining <= 0) {
    untimeoutUser(username);
    return null;
  }

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Clear timeout intervals for cleanup
 */
const activeTimeouts = new Map<string, NodeJS.Timeout>();

export function clearAllTimeouts() {
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeTimeouts.clear();
}
