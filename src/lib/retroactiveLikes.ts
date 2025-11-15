import { Message } from '@/types/personality';
import { userPool } from './userPool';

/**
 * Manages retroactive likes on older messages
 */
export class RetroactiveLikesManager {
  private likeInterval: NodeJS.Timeout | null = null;
  private onLikeMessage: ((messageId: string, likes: number, likedBy: string[]) => void) | null = null;
  
  /**
   * Start retroactive liking system
   */
  start(onLikeMessage: (messageId: string, likes: number, likedBy: string[]) => void) {
    this.onLikeMessage = onLikeMessage;
    this.startLikingInterval();
    console.log('❤️ Retroactive likes started');
  }
  
  /**
   * Stop retroactive liking
   */
  stop() {
    if (this.likeInterval) clearInterval(this.likeInterval);
    this.likeInterval = null;
    console.log('💔 Retroactive likes stopped');
  }
  
  /**
   * Periodically like random messages
   */
  private startLikingInterval() {
    const likeRandomMessage = () => {
      // This will be called from the main component with message list
      
      // Schedule next like (1-4 seconds for constant flow)
      const nextLike = 1000 + Math.random() * 3000;
      this.likeInterval = setTimeout(likeRandomMessage, nextLike);
    };
    
    likeRandomMessage();
  }
  
  /**
   * Process a batch of messages and add likes to eligible ones with realistic delays
   */
  processMessages(messages: Message[]): void {
    if (!this.onLikeMessage || messages.length === 0) return;
    
    const activeUsers = userPool.getActiveChattersCount();
    if (activeUsers === 0) return;
    
    // Only consider recent messages (last 20)
    const recentMessages = messages.slice(-20);
    
    // Filter messages that can be liked (not already at max likes)
    const eligibleMessages = recentMessages.filter(msg => 
      (msg.likes ?? 0) < activeUsers && // Can't have more likes than active users
      !msg.isModerator && // Don't like moderator messages
      this.isOldEnoughToLike(msg) // Wait for reading time
    );
    
    if (eligibleMessages.length === 0) return;
    
    // Pick a random eligible message
    const message = eligibleMessages[Math.floor(Math.random() * eligibleMessages.length)];
    
    // Determine if this message should get liked
    const likeProbability = this.calculateLikeProbability(message, activeUsers);
    
    if (Math.random() < likeProbability) {
      // Schedule like with realistic delay (reading time + decision time)
      const readingDelay = this.calculateReadingDelay(message);
      
      setTimeout(() => {
        // Get random likers
        const currentLikes = message.likes ?? 0;
        const newLikeCount = 1 + Math.floor(Math.random() * Math.min(2, activeUsers - currentLikes));
        
        const likers = userPool.getRandomLikers(newLikeCount, message.username);
        
        if (likers.length > 0 && this.onLikeMessage) {
          const newLikes = currentLikes + likers.length;
          const likerNames = likers.map(u => u.username);
          
          // Merge with existing likedBy
          const existingLikedBy = message.likedBy || [];
          const allLikedBy = [...existingLikedBy, ...likerNames];
          
          this.onLikeMessage(message.id, newLikes, allLikedBy);
        }
      }, readingDelay);
    }
  }
  
  /**
   * Check if message is old enough to be liked (reading time)
   */
  private isOldEnoughToLike(message: Message): boolean {
    if (!message.id) return false;
    
    const messageIndex = parseInt(message.id.split('-')[0]);
    const now = Date.now();
    const messageAge = now - messageIndex;
    
    // Minimum 2 seconds to read before liking
    return messageAge > 2000;
  }
  
  /**
   * Calculate realistic reading delay before liking
   */
  private calculateReadingDelay(message: Message): number {
    const text = message.message.toLowerCase();
    const messageLength = message.message.length;
    
    // Base reading time (200ms per character, min 2s, max 8s)
    const readingTime = Math.min(Math.max(2000, messageLength * 200), 6000);
    
    // Add decision time (1-3 seconds)
    const decisionTime = 1000 + Math.random() * 2000;
    
    // Funny/hype messages get faster reactions
    const isFunny = /kekw|lmao|omegalul|lulw|😂|💀|haha|lol|bruh/i.test(text);
    const isHype = /lets go|yooo|poggers|pog|w streamer|clip|W |gg/i.test(text);
    
    const speedBonus = (isFunny || isHype) ? -1000 : 0;
    
    return Math.max(2000, readingTime + decisionTime + speedBonus);
  }
  
  /**
   * Calculate probability of a message getting liked
   */
  private calculateLikeProbability(message: Message, activeUsers: number): number {
    const text = message.message.toLowerCase();
    
    let baseProbability = 0.15; // 15% base chance (reduced from 30%)
    
    // Scale with active users (more users = more engagement)
    baseProbability += (activeUsers / 20) * 0.2; // Up to +20% for 20+ users
    
    // Check message content
    const isFunny = /kekw|lmao|omegalul|lulw|😂|💀|haha|lol|bruh/i.test(text);
    const isHype = /lets go|yooo|poggers|pog|w streamer|clip|W |gg/i.test(text);
    const isQuestion = /\?|how|what|why|when|where/i.test(text);
    const hasEmote = /KEKW|OMEGALUL|Pog|Sadge|Copium|monkaS/i.test(text);
    
    if (isFunny) baseProbability += 0.3;
    if (isHype) baseProbability += 0.25;
    if (hasEmote) baseProbability += 0.15;
    if (isQuestion) baseProbability -= 0.1; // Questions get fewer likes
    
    // Newer messages are more likely to get liked
    const messageIndex = message.id ? parseInt(message.id.split('-')[0]) : 0;
    const now = Date.now();
    const messageAge = now - messageIndex;
    
    if (messageAge < 5000) baseProbability += 0.2; // Very recent
    else if (messageAge < 10000) baseProbability += 0.1; // Recent
    
    return Math.min(baseProbability, 0.95);
  }
}

// Export singleton
export const retroactiveLikes = new RetroactiveLikesManager();
