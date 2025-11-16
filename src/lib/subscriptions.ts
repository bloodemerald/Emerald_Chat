import { userPool, ChatUser } from './userPool';

/**
 * Subscription Tier
 */
export type SubTier = 'tier1' | 'tier2' | 'tier3';

/**
 * Subscription Tier Configuration
 */
export interface SubTierConfig {
  tier: SubTier;
  cost: number;
  name: string;
  benefits: string[];
  badgeColor: string;
  emoteSlots: number;
}

/**
 * Subscription Event Type
 */
export type SubEventType = 'new_sub' | 'resub' | 'gift_sub' | 'sub_train';

/**
 * Subscription Event
 */
export interface SubEvent {
  id: string;
  type: SubEventType;
  userId: string;
  username: string;
  tier: SubTier;
  timestamp: number;
  // For resubs
  months?: number;
  milestone?: boolean;
  // For gift subs
  gifterId?: string;
  gifterUsername?: string;
  recipientId?: string;
  recipientUsername?: string;
  // For sub trains
  trainCount?: number;
  trainParticipants?: string[];
}

/**
 * Subscription Tier Configurations
 */
export const SUB_TIERS: Record<SubTier, SubTierConfig> = {
  tier1: {
    tier: 'tier1',
    cost: 4.99,
    name: 'Tier 1',
    benefits: ['No ads', '1 emote slot', 'Subscriber badge'],
    badgeColor: '#9147ff',
    emoteSlots: 1,
  },
  tier2: {
    tier: 'tier2',
    cost: 9.99,
    name: 'Tier 2',
    benefits: ['No ads', '2 emote slots', 'Better badge', 'Priority chat'],
    badgeColor: '#ff6b6b',
    emoteSlots: 2,
  },
  tier3: {
    tier: 'tier3',
    cost: 24.99,
    name: 'Tier 3',
    benefits: ['No ads', '5 emote slots', 'Fancy badge', 'Priority chat', 'Custom color'],
    badgeColor: '#ffd700',
    emoteSlots: 5,
  },
};

/**
 * Subscription milestone months
 */
const MILESTONE_MONTHS = [3, 6, 12, 24, 36, 48, 60];

/**
 * Check if a month count is a milestone
 */
function isMilestone(months: number): boolean {
  return MILESTONE_MONTHS.includes(months);
}

/**
 * Subscription Manager
 */
class SubscriptionManager {
  private subEvents: SubEvent[] = [];
  private subListeners: ((event: SubEvent) => void)[] = [];
  private recentSubs: SubEvent[] = []; // For tracking sub trains
  private readonly SUB_TRAIN_WINDOW = 30000; // 30 seconds

  /**
   * Subscribe a user
   */
  subscribe(userId: string, username: string, tier: SubTier = 'tier1', isGift: boolean = false): SubEvent | null {
    const user = userPool.getAllUsers().find((u) => u.id === userId);
    if (!user) {
      console.log('⚠️ Subscription failed: user not found');
      return null;
    }

    // Determine if this is a new sub or resub
    const isResub = user.subscriberMonths > 0;
    const months = isResub ? user.subscriberMonths + 1 : 1;
    const milestone = isMilestone(months);

    // Update user subscription
    user.subscriberMonths = months;

    // Create event
    const event: SubEvent = {
      id: `sub-${Date.now()}-${Math.random()}`,
      type: isResub ? 'resub' : 'new_sub',
      userId,
      username,
      tier,
      timestamp: Date.now(),
      months: isResub ? months : undefined,
      milestone: isResub ? milestone : undefined,
    };

    this.subEvents.push(event);
    this.recentSubs.push(event);

    // Check for sub train
    this.checkSubTrain();

    // Notify listeners
    this.notifySub(event);

    console.log(
      `👑 ${username} ${isResub ? `resubscribed for ${months} months` : 'subscribed'} (${tier})${milestone ? ' 🎉 MILESTONE!' : ''}`
    );

    return event;
  }

  /**
   * Gift a subscription
   */
  giftSub(
    gifterId: string,
    gifterUsername: string,
    recipientId: string,
    recipientUsername: string,
    tier: SubTier = 'tier1'
  ): SubEvent | null {
    const gifter = userPool.getAllUsers().find((u) => u.id === gifterId);
    const recipient = userPool.getAllUsers().find((u) => u.id === recipientId);

    if (!gifter || !recipient) {
      console.log('⚠️ Gift sub failed: user not found');
      return null;
    }

    // Update recipient subscription
    recipient.subscriberMonths = (recipient.subscriberMonths || 0) + 1;

    // Create event
    const event: SubEvent = {
      id: `giftsub-${Date.now()}-${Math.random()}`,
      type: 'gift_sub',
      userId: recipientId,
      username: recipientUsername,
      tier,
      timestamp: Date.now(),
      gifterId,
      gifterUsername,
      recipientId,
      recipientUsername,
    };

    this.subEvents.push(event);
    this.recentSubs.push(event);

    // Check for sub train
    this.checkSubTrain();

    // Notify listeners
    this.notifySub(event);

    console.log(`🎁 ${gifterUsername} gifted a ${tier} sub to ${recipientUsername}`);

    return event;
  }

  /**
   * Check if we have a sub train (3+ subs in 30 seconds)
   */
  private checkSubTrain() {
    const now = Date.now();

    // Clean up old recent subs
    this.recentSubs = this.recentSubs.filter((s) => now - s.timestamp < this.SUB_TRAIN_WINDOW);

    // Check if we have 3+ subs
    if (this.recentSubs.length >= 3) {
      const trainEvent: SubEvent = {
        id: `subtrain-${Date.now()}-${Math.random()}`,
        type: 'sub_train',
        userId: 'system',
        username: 'System',
        tier: 'tier1',
        timestamp: now,
        trainCount: this.recentSubs.length,
        trainParticipants: this.recentSubs.map((s) => s.username),
      };

      console.log(`🚂 SUB TRAIN! ${this.recentSubs.length} subs in ${this.SUB_TRAIN_WINDOW / 1000}s`);

      // Don't add to subEvents to avoid infinite loop
      this.notifySub(trainEvent);

      // Clear recent subs after announcing train
      this.recentSubs = [];
    }
  }

  /**
   * AI-driven subscription logic
   */
  attemptAISubscription(): SubEvent | null {
    const activeUsers = userPool.getActiveUsers();
    if (activeUsers.length === 0) return null;

    // Find non-subscribers (lurkers who might subscribe)
    const lurkers = activeUsers.filter((u) => u.subscriberMonths === 0);

    // 40% chance for a lurker to subscribe (TESTING - increased from 5%)
    if (lurkers.length > 0 && Math.random() < 0.4) {
      const user = lurkers[Math.floor(Math.random() * lurkers.length)];

      // Random tier (weighted towards tier 1)
      const tierRoll = Math.random();
      let tier: SubTier = 'tier1';
      if (tierRoll > 0.9) tier = 'tier3';
      else if (tierRoll > 0.7) tier = 'tier2';

      return this.subscribe(user.id, user.username, tier);
    }

    // Check for resubs (subscribers who might resub)
    const subscribers = activeUsers.filter((u) => u.subscriberMonths > 0);

    // 30% chance for a subscriber to resub (TESTING - increased from 3%)
    if (subscribers.length > 0 && Math.random() < 0.3) {
      const user = subscribers[Math.floor(Math.random() * subscribers.length)];

      // Determine tier (usually stay same, but might upgrade)
      const tierRoll = Math.random();
      let tier: SubTier = 'tier1';
      if (tierRoll > 0.85) tier = 'tier3';
      else if (tierRoll > 0.6) tier = 'tier2';

      return this.subscribe(user.id, user.username, tier);
    }

    return null;
  }

  /**
   * AI-driven gift sub logic
   */
  attemptAIGiftSub(): SubEvent | null {
    const activeUsers = userPool.getActiveUsers();
    if (activeUsers.length < 2) return null;

    // Find subscribers who might gift
    const subscribers = activeUsers.filter((u) => u.subscriberMonths > 0);

    // 20% chance for a subscriber to gift a sub (TESTING - increased from 2%)
    if (subscribers.length > 0 && Math.random() < 0.2) {
      const gifter = subscribers[Math.floor(Math.random() * subscribers.length)];

      // Pick a random non-subscriber or low-month subscriber to receive
      const eligibleRecipients = activeUsers.filter(
        (u) => u.id !== gifter.id && u.subscriberMonths < 3
      );

      if (eligibleRecipients.length === 0) return null;

      const recipient = eligibleRecipients[Math.floor(Math.random() * eligibleRecipients.length)];

      // Random tier (weighted towards tier 1)
      const tierRoll = Math.random();
      let tier: SubTier = 'tier1';
      if (tierRoll > 0.95) tier = 'tier3';
      else if (tierRoll > 0.85) tier = 'tier2';

      return this.giftSub(gifter.id, gifter.username, recipient.id, recipient.username, tier);
    }

    return null;
  }

  /**
   * Get subscription events
   */
  getSubEvents(limit?: number): SubEvent[] {
    const events = [...this.subEvents].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return userPool.getAllUsers().filter((u) => u.subscriberMonths > 0).length;
  }

  /**
   * Subscribe to subscription events
   */
  onSub(callback: (event: SubEvent) => void) {
    this.subListeners.push(callback);
  }

  /**
   * Notify all listeners of a subscription
   */
  private notifySub(event: SubEvent) {
    this.subListeners.forEach((listener) => listener(event));
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.subListeners = [];
  }

  /**
   * Clear history (for testing/reset)
   */
  clearHistory() {
    this.subEvents = [];
    this.recentSubs = [];
  }
}

// Export singleton instance
export const subscriptions = new SubscriptionManager();
