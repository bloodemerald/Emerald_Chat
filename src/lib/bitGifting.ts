import { userPool, ChatUser } from './userPool';

/**
 * Bit Gift Event
 */
export interface BitGift {
  id: string;
  gifterId: string;
  gifterUsername: string;
  recipientId: string;
  recipientUsername: string;
  amount: number;
  timestamp: number;
  reason?: 'zero_bits' | 'funny_comment' | 'helpful' | 'subscriber' | 'random';
}

/**
 * Bit Gifting Manager
 */
class BitGiftingManager {
  private giftHistory: BitGift[] = [];
  private giftListeners: ((gift: BitGift) => void)[] = [];

  /**
   * Gift bits from one user to another
   */
  giftBits(
    gifterId: string,
    gifterUsername: string,
    recipientId: string,
    recipientUsername: string,
    amount: number,
    reason?: BitGift['reason']
  ): BitGift | null {
    // Get both users
    const gifter = userPool.getAllUsers().find((u) => u.id === gifterId);
    const recipient = userPool.getAllUsers().find((u) => u.id === recipientId);

    if (!gifter || !recipient) {
      console.log('⚠️ Bit gift failed: user not found');
      return null;
    }

    // Check if gifter has enough bits
    if (gifter.bits < amount) {
      console.log(`⚠️ ${gifterUsername} tried to gift ${amount} bits but only has ${gifter.bits}`);
      return null;
    }

    // Transfer bits
    gifter.bits -= amount;
    recipient.bits += amount;

    // Create gift event
    const gift: BitGift = {
      id: `gift-${Date.now()}-${Math.random()}`,
      gifterId,
      gifterUsername,
      recipientId,
      recipientUsername,
      amount,
      timestamp: Date.now(),
      reason,
    };

    this.giftHistory.push(gift);

    // Notify listeners
    this.notifyGift(gift);

    console.log(`🎁 ${gifterUsername} gifted ${amount} bits to ${recipientUsername} (${reason || 'no reason'})`);

    return gift;
  }

  /**
   * AI-driven bit gifting logic
   * 2% chance per message of gifting
   */
  attemptAIGift(): BitGift | null {
    // 2% chance to gift
    if (Math.random() > 0.02) return null;

    const activeUsers = userPool.getActiveUsers();
    if (activeUsers.length < 2) return null;

    // Find users with 500+ bits who can gift
    const eligibleGifters = activeUsers.filter((u) => u.bits >= 500);
    if (eligibleGifters.length === 0) return null;

    const gifter = eligibleGifters[Math.floor(Math.random() * eligibleGifters.length)];

    // Determine recipient and reason
    let recipient: ChatUser | null = null;
    let reason: BitGift['reason'] = 'random';
    let amount = 100 + Math.floor(Math.random() * 401); // 100-500 bits

    // Priority 1: Users with 0 bits (50% chance)
    const zeroBitUsers = activeUsers.filter((u) => u.bits === 0 && u.id !== gifter.id);
    if (zeroBitUsers.length > 0 && Math.random() < 0.5) {
      recipient = zeroBitUsers[Math.floor(Math.random() * zeroBitUsers.length)];
      reason = 'zero_bits';
      amount = 200 + Math.floor(Math.random() * 301); // Give more to zero bit users
    }

    // Priority 2: Long-time subscribers (30% chance)
    if (!recipient) {
      const subscribers = activeUsers.filter(
        (u) => u.subscriberMonths > 3 && u.id !== gifter.id
      );
      if (subscribers.length > 0 && Math.random() < 0.3) {
        recipient = subscribers[Math.floor(Math.random() * subscribers.length)];
        reason = 'subscriber';
      }
    }

    // Priority 3: Random active user
    if (!recipient) {
      const otherUsers = activeUsers.filter((u) => u.id !== gifter.id);
      if (otherUsers.length > 0) {
        recipient = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        reason = 'random';
      }
    }

    if (!recipient) return null;

    // Perform the gift
    return this.giftBits(
      gifter.id,
      gifter.username,
      recipient.id,
      recipient.username,
      amount,
      reason
    );
  }

  /**
   * Gift bits to a specific user based on message quality
   */
  giftForMessage(messageUsername: string, quality: 'funny' | 'helpful'): BitGift | null {
    const activeUsers = userPool.getActiveUsers();

    // Find eligible gifters (500+ bits, not the message author)
    const eligibleGifters = activeUsers.filter(
      (u) => u.bits >= 500 && u.username !== messageUsername
    );

    if (eligibleGifters.length === 0) return null;

    const gifter = eligibleGifters[Math.floor(Math.random() * eligibleGifters.length)];
    const recipient = userPool.getUserByUsername(messageUsername);

    if (!recipient) return null;

    // Determine amount based on quality
    const amount = quality === 'funny' ? 150 + Math.floor(Math.random() * 151) : 100 + Math.floor(Math.random() * 101);

    return this.giftBits(
      gifter.id,
      gifter.username,
      recipient.id,
      recipient.username,
      amount,
      quality === 'funny' ? 'funny_comment' : 'helpful'
    );
  }

  /**
   * Get gift history
   */
  getGiftHistory(limit?: number): BitGift[] {
    const history = [...this.giftHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get total bits gifted by user
   */
  getUserTotalGifted(userId: string): number {
    return this.giftHistory
      .filter((g) => g.gifterId === userId)
      .reduce((sum, g) => sum + g.amount, 0);
  }

  /**
   * Get total bits received by user
   */
  getUserTotalReceived(userId: string): number {
    return this.giftHistory
      .filter((g) => g.recipientId === userId)
      .reduce((sum, g) => sum + g.amount, 0);
  }

  /**
   * Get top gifters
   */
  getTopGifters(limit: number = 10): { userId: string; username: string; total: number }[] {
    const gifterMap = new Map<string, { username: string; total: number }>();

    this.giftHistory.forEach((gift) => {
      const existing = gifterMap.get(gift.gifterId);
      if (existing) {
        existing.total += gift.amount;
      } else {
        gifterMap.set(gift.gifterId, {
          username: gift.gifterUsername,
          total: gift.amount,
        });
      }
    });

    return Array.from(gifterMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  /**
   * Subscribe to gift events
   */
  onGift(callback: (gift: BitGift) => void) {
    this.giftListeners.push(callback);
  }

  /**
   * Notify all listeners of a gift
   */
  private notifyGift(gift: BitGift) {
    this.giftListeners.forEach((listener) => listener(gift));
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.giftListeners = [];
  }

  /**
   * Clear history (for testing/reset)
   */
  clearHistory() {
    this.giftHistory = [];
  }
}

// Export singleton instance
export const bitGifting = new BitGiftingManager();
