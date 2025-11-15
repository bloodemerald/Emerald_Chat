import { Message } from '@/types/personality';
import { userPool } from './userPool';

interface ScheduledLike {
  messageId: string;
  username: string;
  scheduledTime: number;
  timeout: NodeJS.Timeout;
}

/**
 * Manages staggered likes with realistic timing
 * AI users like messages over time (2-15 seconds) instead of all at once
 */
export class StaggeredLikesManager {
  private scheduledLikes: Map<string, ScheduledLike[]> = new Map();
  private onLikeCallback: ((messageId: string, username: string) => void) | null = null;

  /**
   * Start the staggered likes system
   */
  start(onLike: (messageId: string, username: string) => void) {
    this.onLikeCallback = onLike;
    console.log('⏱️ Staggered likes system started');
  }

  /**
   * Stop and clear all scheduled likes
   */
  stop() {
    // Clear all scheduled timeouts
    this.scheduledLikes.forEach(likes => {
      likes.forEach(like => clearTimeout(like.timeout));
    });
    this.scheduledLikes.clear();
    this.onLikeCallback = null;
    console.log('⏹️ Staggered likes system stopped');
  }

  /**
   * Schedule likes for a new message
   * This determines which AI users will like the message and when
   */
  schedulelikesForMessage(message: Message): void {
    if (!this.onLikeCallback) return;

    const activeUsers = userPool.getActiveUsers();
    if (activeUsers.length === 0) return;

    // Calculate how many users should like this message
    const likeProbability = this.calculateLikeProbability(message);
    const potentialLikers = activeUsers.filter(u =>
      u.username !== message.username && // Can't like own message
      Math.random() < likeProbability
    );

    if (potentialLikers.length === 0) return;

    // Schedule each like with a random delay
    const scheduledLikes: ScheduledLike[] = [];

    potentialLikers.forEach(user => {
      const delay = this.calculateLikeDelay(message, user.personality);
      const scheduledTime = Date.now() + delay;

      const timeout = setTimeout(() => {
        if (this.onLikeCallback) {
          this.onLikeCallback(message.id, user.username);
        }

        // Remove from scheduled likes
        const likes = this.scheduledLikes.get(message.id) || [];
        const index = likes.findIndex(l => l.username === user.username);
        if (index !== -1) {
          likes.splice(index, 1);
          if (likes.length === 0) {
            this.scheduledLikes.delete(message.id);
          }
        }
      }, delay);

      scheduledLikes.push({
        messageId: message.id,
        username: user.username,
        scheduledTime,
        timeout
      });
    });

    if (scheduledLikes.length > 0) {
      this.scheduledLikes.set(message.id, scheduledLikes);
      console.log(`💚 Scheduled ${scheduledLikes.length} likes for message ${message.id}`);
    }
  }

  /**
   * Calculate delay before user likes a message
   * Based on message content and user personality
   */
  private calculateLikeDelay(message: Message, personality?: string): number {
    const messageLength = message.message.length;

    // Base reading time: ~200ms per character (reading speed)
    const baseReadingTime = messageLength * 200;

    // Add thinking/decision time
    const decisionTime = 1000 + Math.random() * 2000; // 1-3 seconds

    // Total base delay (min 2s, max 12s)
    let totalDelay = Math.min(Math.max(baseReadingTime + decisionTime, 2000), 12000);

    // Content-based speed modifiers
    const text = message.message.toLowerCase();
    const isFunny = /kekw|lmao|omegalul|lulw|😂|💀|haha|lol|bruh/i.test(text);
    const isHype = /lets go|yooo|poggers|pog|w streamer|clip|W |gg/i.test(text);
    const isWholesome = /❤️|💚|gg|wholesome|love|thanks|appreciate/i.test(text);

    // Funny/hype content gets faster reactions
    if (isFunny || isHype) {
      totalDelay *= 0.6; // 40% faster
    }

    // Personality-based modifiers
    switch (personality) {
      case 'hype':
        totalDelay *= 0.5; // Hype users react very fast
        break;
      case 'wholesome':
        if (isWholesome) totalDelay *= 0.6; // Quick to like wholesome content
        break;
      case 'analyst':
        totalDelay *= 1.3; // Analysts take longer to decide
        break;
      case 'lurker':
        totalDelay *= 2; // Lurkers are slow to react
        break;
      case 'meme':
        if (isFunny) totalDelay *= 0.5; // Meme users love funny stuff
        break;
    }

    // Add random variance (±20%)
    const variance = 0.8 + Math.random() * 0.4;
    totalDelay *= variance;

    // Ensure bounds: 2-15 seconds
    return Math.min(Math.max(totalDelay, 2000), 15000);
  }

  /**
   * Calculate probability that a user will like this message
   */
  private calculateLikeProbability(message: Message): number {
    const text = message.message.toLowerCase();

    // Base probability (20%)
    let probability = 0.2;

    // Moderator messages get more likes (people want to engage with streamer)
    if (message.isModerator) {
      probability = 0.6; // 60% base for moderator messages
    }

    // Content analysis
    const isFunny = /kekw|lmao|omegalul|lulw|😂|💀|haha|lol|bruh/i.test(text);
    const isHype = /lets go|yooo|poggers|pog|w streamer|clip|W |gg/i.test(text);
    const isWholesome = /❤️|💚|gg|wholesome|love|thanks|appreciate/i.test(text);
    const isQuestion = /\?|how|what|why|when|where/i.test(text);
    const hasEmote = /KEKW|OMEGALUL|Pog|Sadge|Copium|monkaS/i.test(text);

    if (isFunny) probability += 0.3;
    if (isHype) probability += 0.25;
    if (isWholesome) probability += 0.2;
    if (hasEmote) probability += 0.15;
    if (isQuestion) probability -= 0.15; // Questions get fewer likes

    // Short messages (emotes) are often liked less
    if (message.message.length < 10) {
      probability -= 0.1;
    }

    // Cap at 95%
    return Math.min(probability, 0.95);
  }

  /**
   * Cancel scheduled likes for a message (e.g., if message is deleted)
   */
  cancelLikesForMessage(messageId: string): void {
    const likes = this.scheduledLikes.get(messageId);
    if (likes) {
      likes.forEach(like => clearTimeout(like.timeout));
      this.scheduledLikes.delete(messageId);
    }
  }

  /**
   * Get scheduled likes info (for debugging)
   */
  getScheduledLikesInfo(): { messageId: string; count: number; nextAt: number }[] {
    const info: { messageId: string; count: number; nextAt: number }[] = [];

    this.scheduledLikes.forEach((likes, messageId) => {
      if (likes.length > 0) {
        const nextLikeTime = Math.min(...likes.map(l => l.scheduledTime));
        info.push({
          messageId,
          count: likes.length,
          nextAt: nextLikeTime
        });
      }
    });

    return info;
  }
}

// Export singleton
export const staggeredLikes = new StaggeredLikesManager();
