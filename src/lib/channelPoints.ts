import { userPool } from './userPool';

/**
 * Channel Point Redemption Definition
 */
export interface ChannelPointRedemption {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
  cooldown: number; // seconds
  lastUsed: number; // timestamp
  effect: (userId: string, targetUser?: string, targetMessage?: string) => RedemptionEffect | null;
}

/**
 * Result of a redemption
 */
export interface RedemptionEffect {
  type:
    | 'highlight_bomb'
    | 'color_blast'
    | 'super_like'
    | 'personality_swap'
    | 'ghost_message'
    | 'copy_pasta';
  userId: string;
  targetUser?: string;
  targetMessage?: string;
  duration?: number; // milliseconds
  data?: any;
}

/**
 * User Point Balance
 */
export interface UserPoints {
  userId: string;
  username: string;
  points: number;
  totalEarned: number;
  lastEarnedTime: number;
}

/**
 * Channel Points Manager
 */
class ChannelPointsManager {
  private userPoints: Map<string, UserPoints> = new Map();
  private redemptions: Map<string, ChannelPointRedemption> = new Map();
  private accumulationInterval: NodeJS.Timeout | null = null;
  private redemptionListeners: ((effect: RedemptionEffect) => void)[] = [];

  constructor() {
    this.initializeRedemptions();
  }

  /**
   * Initialize all available redemptions
   */
  private initializeRedemptions() {
    const redemptions: ChannelPointRedemption[] = [
      {
        id: 'highlight_bomb',
        name: 'Highlight Bomb',
        cost: 500,
        icon: '💥',
        description: 'Make a message explode with sparkles',
        cooldown: 30,
        lastUsed: 0,
        effect: (userId, targetUser, targetMessage) => ({
          type: 'highlight_bomb',
          userId,
          targetUser,
          targetMessage,
          duration: 30000, // 30 seconds so it's visible
        }),
      },
      {
        id: 'color_blast',
        name: 'Color Blast',
        cost: 400,
        icon: '🎨',
        description: "Change someone's username color temporarily",
        cooldown: 60,
        lastUsed: 0,
        effect: (userId, targetUser) => ({
          type: 'color_blast',
          userId,
          targetUser,
          duration: 30000,
          data: {
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        }),
      },
      {
        id: 'super_like',
        name: 'Super Like',
        cost: 200,
        icon: '⭐',
        description: 'Add 5 instant likes to a message',
        cooldown: 20,
        lastUsed: 0,
        effect: (userId, targetUser, targetMessage) => ({
          type: 'super_like',
          userId,
          targetUser,
          targetMessage,
          data: { likes: 5 },
        }),
      },
      {
        id: 'personality_swap',
        name: 'Bold Blast',
        cost: 800,
        icon: '💪',
        description: 'Make a message BOLD and larger',
        cooldown: 120,
        lastUsed: 0,
        effect: (userId, targetUser) => ({
          type: 'personality_swap',
          userId,
          targetUser,
          duration: 60000, // 1 minute
          data: {
            newPersonality: this.getRandomPersonality(),
          },
        }),
      },
    ];

    redemptions.forEach((r) => this.redemptions.set(r.id, r));
    console.log('🎯 Channel Points redemptions initialized');
  }

  /**
   * Get a random personality for personality swap
   */
  private getRandomPersonality() {
    const personalities = ['toxic', 'helpful', 'meme', 'backseat', 'hype', 'spammer', 'analyst'];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  /**
   * Start point accumulation for active viewers
   */
  start() {
    // Accumulate points every minute
    this.accumulationInterval = setInterval(() => {
      this.accumulatePoints();
    }, 60000); // 1 minute

    console.log('🎯 Channel Points accumulation started');
  }

  /**
   * Stop point accumulation
   */
  stop() {
    if (this.accumulationInterval) {
      clearInterval(this.accumulationInterval);
      this.accumulationInterval = null;
    }
    console.log('🛑 Channel Points accumulation stopped');
  }

  /**
   * Accumulate points for all active viewers
   */
  private accumulatePoints() {
    const activeUsers = userPool.getActiveUsers();

    activeUsers.forEach((user) => {
      const points = 5 + Math.floor(Math.random() * 16); // 5-20 points per minute (REDUCED)
      this.addPoints(user.id, user.username, points);
    });

    console.log(`💰 Accumulated points for ${activeUsers.length} viewers`);
  }

  /**
   * Add points to a user
   */
  addPoints(userId: string, username: string, amount: number) {
    let userPoints = this.userPoints.get(userId);

    if (!userPoints) {
      userPoints = {
        userId,
        username,
        points: 500, // Start with 500 points so they can redeem immediately
        totalEarned: 500,
        lastEarnedTime: Date.now(),
      };
      this.userPoints.set(userId, userPoints);
      console.log(`🎁 New user ${username} started with 500 points`);
    }

    userPoints.points += amount;
    userPoints.totalEarned += amount;
    userPoints.lastEarnedTime = Date.now();
  }

  /**
   * Deduct points from a user
   */
  private deductPoints(userId: string, amount: number): boolean {
    const userPoints = this.userPoints.get(userId);
    if (!userPoints || userPoints.points < amount) {
      console.warn(`⚠️ ${userId} doesn't have enough points (has ${userPoints?.points || 0}, needs ${amount})`);
      return false;
    }

    const oldPoints = userPoints.points;
    userPoints.points -= amount;
    console.log(`💸 ${userId} spent ${amount} points (${oldPoints} → ${userPoints.points})`);
    return true;
  }

  /**
   * Get user's current points
   */
  getUserPoints(userId: string): number {
    return this.userPoints.get(userId)?.points || 0;
  }

  /**
   * Get all user points
   */
  getAllUserPoints(): UserPoints[] {
    return Array.from(this.userPoints.values());
  }

  /**
   * Get all available redemptions
   */
  getRedemptions(): ChannelPointRedemption[] {
    return Array.from(this.redemptions.values());
  }

  /**
   * Check if redemption is on cooldown
   */
  isOnCooldown(redemptionId: string): boolean {
    const redemption = this.redemptions.get(redemptionId);
    if (!redemption) return true;

    const timeSinceLastUse = (Date.now() - redemption.lastUsed) / 1000;
    return timeSinceLastUse < redemption.cooldown;
  }

  /**
   * Get remaining cooldown time in seconds
   */
  getCooldownRemaining(redemptionId: string): number {
    const redemption = this.redemptions.get(redemptionId);
    if (!redemption) return 0;

    const timeSinceLastUse = (Date.now() - redemption.lastUsed) / 1000;
    return Math.max(0, redemption.cooldown - timeSinceLastUse);
  }

  /**
   * Attempt to redeem a reward
   */
  redeem(
    userId: string,
    redemptionId: string,
    targetUser?: string,
    targetMessage?: string
  ): { success: boolean; effect?: RedemptionEffect; error?: string } {
    const redemption = this.redemptions.get(redemptionId);
    if (!redemption) {
      return { success: false, error: 'Redemption not found' };
    }

    // Check cooldown
    if (this.isOnCooldown(redemptionId)) {
      const remaining = Math.ceil(this.getCooldownRemaining(redemptionId));
      return { success: false, error: `On cooldown (${remaining}s remaining)` };
    }

    // Check if user has enough points
    const userPoints = this.getUserPoints(userId);
    if (userPoints < redemption.cost) {
      return { success: false, error: `Not enough points (need ${redemption.cost}, have ${userPoints})` };
    }

    // Deduct points
    if (!this.deductPoints(userId, redemption.cost)) {
      return { success: false, error: 'Failed to deduct points' };
    }

    // Execute effect
    const effect = redemption.effect(userId, targetUser, targetMessage);
    if (!effect) {
      // Refund points if effect failed
      this.addPoints(userId, this.userPoints.get(userId)!.username, redemption.cost);
      return { success: false, error: 'Effect failed to execute' };
    }

    // Update last used time
    redemption.lastUsed = Date.now();

    // Notify listeners
    this.notifyRedemption(effect);

    console.log(`🎯 ${this.userPoints.get(userId)?.username} redeemed ${redemption.name} for ${redemption.cost} points`);

    return { success: true, effect };
  }

  /**
   * AI attempts to redeem a reward
   */
  attemptAIRedemption(): RedemptionEffect | null {
    console.log('🎲 Attempting AI channel point redemption...');
    const activeUsers = userPool.getActiveUsers();
    console.log(`👥 Active users: ${activeUsers.length}`);
    if (activeUsers.length === 0) {
      console.warn('⚠️ No active users for redemption');
      return null;
    }

    // 30% chance per check (TESTING - increased from 2%)
    if (Math.random() > 0.3) {
      console.log('🎲 Random chance failed (70% skip rate)');
      return null;
    }
    console.log('✅ Passed random chance check!');

    // Pick a random user with enough points
    const eligibleUsers = activeUsers.filter((user) => {
      const points = this.getUserPoints(user.id);
      return points >= 200;
    });

    console.log(`💰 Eligible users with 200+ points: ${eligibleUsers.length}`);
    if (eligibleUsers.length === 0) {
      console.warn('⚠️ No users with enough points');
      return null;
    }

    const user = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const userPoints = this.getUserPoints(user.id);

    // Get affordable redemptions
    const affordableRedemptions = this.getRedemptions().filter(
      (r) => r.cost <= userPoints && !this.isOnCooldown(r.id)
    );

    if (affordableRedemptions.length === 0) return null;

    // Pick a random redemption
    const redemption = affordableRedemptions[Math.floor(Math.random() * affordableRedemptions.length)];

    // Pick a random target user if needed
    let targetUser: string | undefined;
    let targetMessage: string | undefined;

    if (['color_blast', 'super_like', 'personality_swap', 'highlight_bomb'].includes(redemption.id)) {
      const otherUsers = activeUsers.filter((u) => u.id !== user.id);
      if (otherUsers.length > 0) {
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        targetUser = randomUser.username;
        console.log(`🎯 Targeting ${redemption.name} at user: ${targetUser}`);
      }
    }

    // Attempt redemption
    const result = this.redeem(user.id, redemption.id, targetUser, targetMessage);

    if (result.success && result.effect) {
      return result.effect;
    }

    return null;
  }

  /**
   * Subscribe to redemption events
   */
  onRedemption(callback: (effect: RedemptionEffect) => void) {
    this.redemptionListeners.push(callback);
  }

  /**
   * Notify all listeners of a redemption
   */
  private notifyRedemption(effect: RedemptionEffect) {
    this.redemptionListeners.forEach((listener) => listener(effect));
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.redemptionListeners = [];
  }
}

// Export singleton instance
export const channelPoints = new ChannelPointsManager();
