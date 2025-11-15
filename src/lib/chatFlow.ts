import { Message, PersonalityType } from "@/types/personality";
import { userPool, ChatUser } from './userPool';

/**
 * Get a user from the pool to send a message
 * Returns full ChatUser object with badges and metadata
 */
export function getOrCreateChatUser(personality: PersonalityType): ChatUser {
  const user = userPool.getRandomActiveUser(personality);
  
  if (user) {
    return user;
  }
  
  // Fallback: activate a lurker if no active users of this type
  userPool.activateLurker();
  const fallbackUser = userPool.getRandomActiveUser(personality);
  
  if (fallbackUser) {
    return fallbackUser;
  }
  
  // Last resort: get any active user
  const anyUser = userPool.getRandomActiveUser();
  if (anyUser) {
    return anyUser;
  }
  
  // Shouldn't happen, but fallback to a minimal user object
  // This should be extremely rare as the user pool always has users
  return {
    id: `fallback-${Date.now()}`,
    username: `User${Math.floor(Math.random() * 9999)}`,
    personality,
    state: 'active',
    joinTime: Date.now(),
    lastActivityTime: Date.now(),
    messageCount: 0,
    likesGiven: 0,
    activityLevel: 0.5,
    badges: [],
    subscriberMonths: 0,
    bits: 0,
    avatarEmoji: '😀',
    bio: 'New user',
    profileColor: '#9e9e9e',
    createdAt: Date.now()
  };
}

/**
 * Cleanup function (now handled by userPool)
 */
export function cleanupInactiveUsers(): void {
  // User pool handles lifecycle automatically
}

/**
 * Detect if a message should trigger a copypasta chain
 */
export function shouldTriggerCopypasta(message: string): boolean {
  // Short emote messages are good for spam
  const emoteOnly = /^[A-Z]{2,}$/;
  const shortMessage = message.length < 15;
  const hasEmote = /KEKW|OMEGALUL|POGGERS|Pog|LUL|EZ/i.test(message);

  return (emoteOnly.test(message.trim()) || (shortMessage && hasEmote)) && Math.random() < 0.3;
}

/**
 * Generate copypasta chain messages
 */
export function generateCopypastaChain(originalMessage: string, count: number = 3): string[] {
  const variations = [
    originalMessage,
    originalMessage,
    originalMessage.toUpperCase(),
    `${originalMessage} ${originalMessage}`,
  ];

  return Array(count).fill(0).map(() =>
    variations[Math.floor(Math.random() * variations.length)]
  );
}

/**
 * Calculate message timing variance (for burst/slow periods)
 */
export function calculateMessageDelay(baseFrequency: number, recentMessages: Message[]): number {
  // Analyze recent message patterns
  const last3Messages = recentMessages.slice(-3);
  const hasExcitement = last3Messages.some(m =>
    /YOOO|LETS GO|POGGERS|HOLY|WTF|NO WAY/i.test(m.message) ||
    m.message.includes('!!!') ||
    m.message === m.message.toUpperCase()
  );

  const hasQuestion = last3Messages.some(m => m.message.includes('?'));
  const isSlow = last3Messages.every(m => m.message.length < 20);

  if (hasExcitement) {
    // BURST MODE - messages come fast!
    return baseFrequency * 0.3; // 3x faster
  } else if (hasQuestion) {
    // Someone asked something - people respond
    return baseFrequency * 0.6; // Slightly faster
  } else if (isSlow) {
    // Boring moment - chat slows down
    return baseFrequency * 1.5; // Slower
  }

  // Add natural variance
  const variance = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3x
  return baseFrequency * variance;
}

/**
 * Detect if we should have user-to-user interaction
 */
export function shouldAddUserInteraction(recentMessages: Message[]): { shouldInteract: boolean; targetUser?: string } {
  const last5 = recentMessages.slice(-5);

  // 40% chance someone responds to another user
  if (Math.random() < 0.4 && last5.length > 0) {
    const targetMessage = last5[Math.floor(Math.random() * last5.length)];
    return {
      shouldInteract: true,
      targetUser: targetMessage.username
    };
  }

  return { shouldInteract: false };
}

/**
 * Generate @ mention interaction prompt
 */
export function generateInteractionPrompt(targetUsername: string, targetMessage: string): string {
  return `Include @${targetUsername} and react to their message: "${targetMessage}"`;
}

/**
 * Detect excitement level from screenshot (would need AI integration)
 */
export function detectExcitementLevel(recentMessages: Message[]): 'high' | 'medium' | 'low' {
  const last5 = recentMessages.slice(-5);

  const excitementWords = /YOOO|LETS GO|POGGERS|HOLY|WTF|NO WAY|CLIP|INSANE|CRAZY/i;
  const excitedCount = last5.filter(m =>
    excitementWords.test(m.message) ||
    m.message.includes('!!!') ||
    (m.message === m.message.toUpperCase() && m.message.length > 3)
  ).length;

  if (excitedCount >= 3) return 'high';
  if (excitedCount >= 1) return 'medium';
  return 'low';
}

/**
 * Should we add a "just got here" lurker message?
 */
export function shouldAddLurkerJoin(messagesSinceStart: number): boolean {
  // Random chance for lurkers to "join" every 20-40 messages
  return messagesSinceStart > 0 &&
         messagesSinceStart % Math.floor(20 + Math.random() * 20) === 0 &&
         Math.random() < 0.6;
}

/**
 * Generate reaction chain (when something big happens)
 */
export function shouldCreateReactionChain(recentMessages: Message[]): boolean {
  const excitement = detectExcitementLevel(recentMessages);
  return excitement === 'high' && Math.random() < 0.5;
}

/**
 * Get active chat stats
 */
export function getActiveChatStats() {
  const activeUsers = userPool.getUsersByState('active');
  const topChatters = activeUsers
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5);

  return {
    activeUsers: activeUsers.length,
    totalUsers: userPool.getViewerCount(),
    topChatters,
  };
}

/**
 * Determine if a message is "funny" and should be liked by AI
 */
export function shouldAILikeMessage(message: Message): boolean {
  const text = message.message.toLowerCase();

  // Check for funny/meme indicators
  const funnyIndicators = [
    /kekw/i,
    /lmao/i,
    /omegalul/i,
    /lulw/i,
    /😂/,
    /💀/,
    /haha/i,
    /lol/i,
    /bruh/i,
  ];

  const hasFunnyWord = funnyIndicators.some(pattern => pattern.test(text));

  // Check for roasts/burns
  const isRoast = /skill issue|ratio|L \+|trash|uninstall|lost/i.test(text);

  // Check for hype moments
  const isHype = /lets go|yooo|poggers|w streamer|clip/i.test(text);

  // Check for clever observations
  const isClever = /200 iq|5head|galaxy brain|big brain/i.test(text);

  // Base probability - ASMR style constant flow
  let probability = 0.75; // Start with 75% base chance for constant likes

  if (hasFunnyWord) probability += 0.2;
  if (isRoast) probability += 0.15;
  if (isHype) probability += 0.1;
  if (isClever) probability += 0.15;

  // Cap at 0.98 max probability for near-constant likes
  probability = Math.min(probability, 0.98);

  return Math.random() < probability;
}

/**
 * Generate AI likes for a message
 */
export function generateAILikes(message: Message): { likes: number; likedBy: string[] } {
  // Get likers from user pool
  const activeCount = userPool.getActiveChattersCount();
  
  if (activeCount === 0) {
    return { likes: 0, likedBy: [] };
  }

  // Determine how many users should like it (2-6 for ASMR-style constant flow)
  const likeCount = Math.min(
    Math.floor(Math.random() * 5) + 2,
    activeCount
  );
  
  const likers = userPool.getRandomLikers(likeCount, message.username);

  return {
    likes: likers.length,
    likedBy: likers.map(u => u.username),
  };
}
