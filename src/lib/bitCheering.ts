import { userPool, ChatUser } from './userPool';
import { Message } from '@/types/personality';

/**
 * Bit Tier Definition
 */
export interface BitTier {
  minAmount: number;
  name: string;
  color: string;
  badgeColor: string;
  animation: 'bounce' | 'pulse' | 'explode' | 'fireworks' | 'mega-burst';
  particleCount: number;
}

/**
 * Bit Cheer Event
 */
export interface BitCheer {
  id: string;
  userId: string;
  username: string;
  amount: number;
  tier: BitTier;
  message?: string;
  timestamp: number;
}

/**
 * Bit Tier Configuration
 */
export const BIT_TIERS: BitTier[] = [
  {
    minAmount: 10000,
    name: 'cheer10000',
    color: 'rainbow',
    badgeColor: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #9400d3)',
    animation: 'mega-burst',
    particleCount: 100,
  },
  {
    minAmount: 5000,
    name: 'cheer5000',
    color: 'red',
    badgeColor: '#ff4444',
    animation: 'fireworks',
    particleCount: 50,
  },
  {
    minAmount: 1000,
    name: 'cheer1000',
    color: 'teal',
    badgeColor: '#00d9ff',
    animation: 'explode',
    particleCount: 30,
  },
  {
    minAmount: 100,
    name: 'cheer100',
    color: 'purple',
    badgeColor: '#9147ff',
    animation: 'pulse',
    particleCount: 15,
  },
  {
    minAmount: 1,
    name: 'cheer1',
    color: 'gray',
    badgeColor: '#999999',
    animation: 'bounce',
    particleCount: 5,
  },
];

/**
 * Get the appropriate tier for a bit amount
 */
export function getBitTier(amount: number): BitTier {
  for (const tier of BIT_TIERS) {
    if (amount >= tier.minAmount) {
      return tier;
    }
  }
  return BIT_TIERS[BIT_TIERS.length - 1]; // Default to lowest tier
}

/**
 * Bit Cheering Manager
 */
class BitCheeringManager {
  private cheerHistory: BitCheer[] = [];
  private cheerListeners: ((cheer: BitCheer) => void)[] = [];

  /**
   * Record a bit cheer
   */
  cheer(userId: string, username: string, amount: number, message?: string): BitCheer | null {
    // Get user and check if they have enough bits
    const user = userPool.getAllUsers().find((u) => u.id === userId);
    if (!user || user.bits < amount) {
      console.log(`⚠️ ${username} tried to cheer ${amount} bits but only has ${user?.bits || 0}`);
      return null;
    }

    // Deduct bits from user
    user.bits -= amount;

    // Create cheer event
    const tier = getBitTier(amount);
    const cheer: BitCheer = {
      id: `cheer-${Date.now()}-${Math.random()}`,
      userId,
      username,
      amount,
      tier,
      message,
      timestamp: Date.now(),
    };

    this.cheerHistory.push(cheer);

    // Notify listeners
    this.notifyCheer(cheer);

    console.log(`💎 ${username} cheered ${amount} bits (${tier.name})`);

    return cheer;
  }

  /**
   * AI-driven cheering logic
   * 5% chance AI uses bits per message
   */
  attemptAICheer(user: ChatUser, message?: string): BitCheer | null {
    // 5% chance to cheer
    if (Math.random() > 0.05) return null;

    // Check if user has bits
    if (user.bits < 1) return null;

    // Determine amount based on user's balance and excitement
    const maxCheer = Math.min(user.bits, 1000); // Max 1000 bits per cheer
    let cheerAmount: number;

    // Weight towards smaller amounts
    const roll = Math.random();
    if (roll < 0.5) {
      // 50% chance: 1-100 bits
      cheerAmount = 1 + Math.floor(Math.random() * Math.min(100, maxCheer));
    } else if (roll < 0.8) {
      // 30% chance: 100-500 bits
      cheerAmount = 100 + Math.floor(Math.random() * Math.min(400, maxCheer - 100));
    } else if (roll < 0.95) {
      // 15% chance: 500-1000 bits
      cheerAmount = 500 + Math.floor(Math.random() * Math.min(500, maxCheer - 500));
    } else {
      // 5% chance: 1000+ bits (whale alert!)
      cheerAmount = 1000 + Math.floor(Math.random() * Math.min(9000, maxCheer - 1000));
    }

    // Perform the cheer
    return this.cheer(user.id, user.username, cheerAmount, message);
  }

  /**
   * Get cheer history
   */
  getCheerHistory(limit?: number): BitCheer[] {
    const history = [...this.cheerHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get total bits cheered by user
   */
  getUserTotalCheered(userId: string): number {
    return this.cheerHistory
      .filter((c) => c.userId === userId)
      .reduce((sum, c) => sum + c.amount, 0);
  }

  /**
   * Get top cheerers
   */
  getTopCheerers(limit: number = 10): { userId: string; username: string; total: number }[] {
    const cheererMap = new Map<string, { username: string; total: number }>();

    this.cheerHistory.forEach((cheer) => {
      const existing = cheererMap.get(cheer.userId);
      if (existing) {
        existing.total += cheer.amount;
      } else {
        cheererMap.set(cheer.userId, {
          username: cheer.username,
          total: cheer.amount,
        });
      }
    });

    return Array.from(cheererMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  /**
   * Subscribe to cheer events
   */
  onCheer(callback: (cheer: BitCheer) => void) {
    this.cheerListeners.push(callback);
  }

  /**
   * Notify all listeners of a cheer
   */
  private notifyCheer(cheer: BitCheer) {
    this.cheerListeners.forEach((listener) => listener(cheer));
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.cheerListeners = [];
  }

  /**
   * Clear history (for testing/reset)
   */
  clearHistory() {
    this.cheerHistory = [];
  }
}

/**
 * Enhance a message with bit cheer data
 */
export function enhanceMessageWithCheer(message: Message, cheer: BitCheer): Message {
  return {
    ...message,
    bits: cheer.amount,
    // Add custom data for rendering
    cheerTier: cheer.tier,
    cheerAnimation: cheer.tier.animation,
  } as Message & { cheerTier?: BitTier; cheerAnimation?: string };
}

// Export singleton instance
export const bitCheering = new BitCheeringManager();
