/**
 * Engagement Manager
 * Coordinates all engagement systems: Channel Points, Bits, Subscriptions, etc.
 */

import { channelPoints } from './channelPoints';
import { bitCheering } from './bitCheering';
import { bitGifting } from './bitGifting';
import { subscriptions } from './subscriptions';
import { userPool } from './userPool';
import {
  notifyBitGift,
  notifyBitCheer,
  notifySubscription,
  notifyChannelPoints,
} from '@/components/notifications/NotificationOverlay';

/**
 * Engagement Manager
 * Manages all engagement systems and AI-driven events
 */
class EngagementManager {
  private isRunning = false;
  private channelPointsInterval: NodeJS.Timeout | null = null;
  private bitCheerCheckInterval: NodeJS.Timeout | null = null;
  private bitGiftCheckInterval: NodeJS.Timeout | null = null;
  private subscriptionCheckInterval: NodeJS.Timeout | null = null;
  private redemptionCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Start all engagement systems
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🎮 Starting Engagement Manager...');

    // Start channel points accumulation
    channelPoints.start();

    // Setup event listeners
    this.setupListeners();

    // Start AI-driven events
    this.startAIEvents();

    console.log('✅ Engagement Manager started');
  }

  /**
   * Stop all engagement systems
   */
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log('🛑 Stopping Engagement Manager...');

    // Stop channel points
    channelPoints.stop();

    // Clear intervals
    if (this.channelPointsInterval) clearInterval(this.channelPointsInterval);
    if (this.bitCheerCheckInterval) clearInterval(this.bitCheerCheckInterval);
    if (this.bitGiftCheckInterval) clearInterval(this.bitGiftCheckInterval);
    if (this.subscriptionCheckInterval) clearInterval(this.subscriptionCheckInterval);
    if (this.redemptionCheckInterval) clearInterval(this.redemptionCheckInterval);

    // Clear listeners
    channelPoints.clearListeners();
    bitCheering.clearListeners();
    bitGifting.clearListeners();
    subscriptions.clearListeners();

    console.log('✅ Engagement Manager stopped');
  }

  /**
   * Setup event listeners for all systems
   */
  private setupListeners() {
    // Listen for bit cheers
    bitCheering.onCheer((cheer) => {
      console.log(`💎 Bit cheer: ${cheer.username} - ${cheer.amount} bits`);
      notifyBitCheer(cheer);
    });

    // Listen for bit gifts
    bitGifting.onGift((gift) => {
      console.log(`🎁 Bit gift: ${gift.gifterUsername} → ${gift.recipientUsername} (${gift.amount} bits)`);
      notifyBitGift(gift);
    });

    // Listen for subscriptions
    subscriptions.onSub((event) => {
      console.log(`👑 Subscription: ${event.username} - ${event.type}`);
      notifySubscription(event);
    });

    // Listen for channel point redemptions
    channelPoints.onRedemption((effect) => {
      console.log(`🎯 Channel points: ${effect.userId} - ${effect.type}`);
      notifyChannelPoints(effect);
    });
  }

  /**
   * Start AI-driven events
   */
  private startAIEvents() {
    // Check for AI bit cheers every 10-20 seconds (slightly more active)
    const scheduleNextCheerCheck = () => {
      const delay = 10000 + Math.random() * 10000; // 10-20s
      this.bitCheerCheckInterval = setTimeout(() => {
        const activeUsers = userPool.getActiveUsers();
        if (activeUsers.length > 0) {
          const user = activeUsers[Math.floor(Math.random() * activeUsers.length)];
          bitCheering.attemptAICheer(user);
        }
        scheduleNextCheerCheck();
      }, delay);
    };
    scheduleNextCheerCheck();

    // Check for AI bit gifts every 20-40 seconds (slightly more active)
    const scheduleNextGiftCheck = () => {
      const delay = 20000 + Math.random() * 20000; // 20-40s
      this.bitGiftCheckInterval = setTimeout(() => {
        bitGifting.attemptAIGift();
        scheduleNextGiftCheck();
      }, delay);
    };
    scheduleNextGiftCheck();

    // Check for AI subscriptions every 45-90 seconds (slightly more active)
    const scheduleNextSubCheck = () => {
      const delay = 45000 + Math.random() * 45000; // 45-90s
      this.subscriptionCheckInterval = setTimeout(() => {
        // Try new sub or resub
        subscriptions.attemptAISubscription();
        scheduleNextSubCheck();
      }, delay);
    };
    scheduleNextSubCheck();

    // Check for AI gift subs every 75-120 seconds (slightly more active)
    const scheduleNextGiftSubCheck = () => {
      const delay = 75000 + Math.random() * 45000; // 75-120s
      setTimeout(() => {
        subscriptions.attemptAIGiftSub();
        scheduleNextGiftSubCheck();
      }, delay);
    };
    scheduleNextGiftSubCheck();

    // Check for AI channel point redemptions every 30-60 seconds (slower)
    const scheduleNextRedemptionCheck = () => {
      const delay = 30000 + Math.random() * 30000; // 30-60s
      this.redemptionCheckInterval = setTimeout(() => {
        channelPoints.attemptAIRedemption();
        scheduleNextRedemptionCheck();
      }, delay);
    };
    scheduleNextRedemptionCheck();

    console.log('🤖 AI-driven events started');
  }

  /**
   * Get stats for all engagement systems
   */
  getStats() {
    return {
      channelPoints: {
        totalUsers: channelPoints.getAllUserPoints().length,
        topEarners: channelPoints
          .getAllUserPoints()
          .sort((a, b) => b.totalEarned - a.totalEarned)
          .slice(0, 5),
      },
      bitCheering: {
        totalCheers: bitCheering.getCheerHistory().length,
        topCheerers: bitCheering.getTopCheerers(5),
      },
      bitGifting: {
        totalGifts: bitGifting.getGiftHistory().length,
        topGifters: bitGifting.getTopGifters(5),
      },
      subscriptions: {
        totalSubscribers: subscriptions.getSubscriberCount(),
        recentEvents: subscriptions.getSubEvents(5),
      },
    };
  }

  /**
   * Reset all systems (for testing)
   */
  reset() {
    channelPoints.clearListeners();
    bitCheering.clearHistory();
    bitGifting.clearHistory();
    subscriptions.clearHistory();
    console.log('🔄 All engagement systems reset');
  }
}

// Export singleton instance
export const engagementManager = new EngagementManager();
