import { userPool, ChatUser } from './userPool';

export type RaidIntensity = 'low' | 'medium' | 'high' | 'mega';

export interface RaidConfig {
  raiderCount: number;
  raiderUsername: string;
  intensity: RaidIntensity;
  duration?: number; // in seconds, how long the raid lasts
  waveDelay?: number; // milliseconds between user joins
}

export interface RaidStats {
  totalRaiders: number;
  joinedRaiders: number;
  activatedRaiders: number;
  messagesGenerated: number;
  startTime: number;
  endTime: number | null;
  isActive: boolean;
  raiderUsername: string;
}

/**
 * Raid-themed message templates
 */
const RAID_MESSAGES = {
  arrival: [
    'RAID! 🎉',
    'WE HERE! 🔥',
    'LETS GOOO! 💪',
    'RAID SQUAD! 🎊',
    'PARTY TIME! 🎉',
    'YOOOO! 👋',
    'HELLO FROM {raider}! 👋',
    '{raider} SENT US! 🎯',
    'RAIDING! 🚨',
    'SUP! 😎'
  ],
  hype: [
    'This stream is fire! 🔥',
    'Love the vibes here! ✨',
    'Amazing content! 💯',
    'This is sick! 😱',
    'Instant follow! ⭐',
    'New favorite streamer! 💚',
    'Chat is so friendly! 💙',
    'This community rocks! 🎸',
    'Best raid ever! 🎉',
    'What a stream! 🌟'
  ],
  questions: [
    'What game is this?',
    'How long have you been streaming?',
    'What\'s your schedule?',
    'First time here!',
    'Can I get a shoutout?',
    'Love the setup! What mic?',
    'Where are you from?',
    'How did you start streaming?'
  ],
  engagement: [
    'Followed! ✅',
    'Subbed! 💜',
    'Dropped a follow! ⭐',
    'Here from {raider}!',
    'Love this already!',
    'Welcome raid! 🎊',
    'First raid?',
    'Chat is wild! 😂'
  ]
};

/**
 * Manages raid simulation with realistic timing and engagement
 */
export class RaidSimulator {
  private stats: RaidStats | null = null;
  private joinIntervals: NodeJS.Timeout[] = [];
  private activationIntervals: NodeJS.Timeout[] = [];
  private messageIntervals: NodeJS.Timeout[] = [];
  private onStatsUpdate: ((stats: RaidStats) => void) | null = null;
  private onRaidMessage: ((message: string, username: string) => void) | null = null;

  /**
   * Start a raid simulation
   */
  startRaid(
    config: RaidConfig,
    onStatsUpdate?: (stats: RaidStats) => void,
    onRaidMessage?: (message: string, username: string) => void
  ) {
    // Stop any existing raid
    this.stopRaid();

    this.onStatsUpdate = onStatsUpdate || null;
    this.onRaidMessage = onRaidMessage || null;

    // Initialize stats
    this.stats = {
      totalRaiders: config.raiderCount,
      joinedRaiders: 0,
      activatedRaiders: 0,
      messagesGenerated: 0,
      startTime: Date.now(),
      endTime: null,
      isActive: true,
      raiderUsername: config.raiderUsername
    };

    console.log(`🎯 Starting raid: ${config.raiderCount} raiders from ${config.raiderUsername} (${config.intensity} intensity)`);

    // Calculate wave parameters based on intensity
    const waveParams = this.getWaveParameters(config.intensity, config.raiderCount);

    // Start joining raiders in waves
    this.joinRaidersInWaves(config, waveParams);

    // Activate raiders progressively
    this.activateRaidersProgressively(config, waveParams);

    // Generate raid messages
    this.generateRaidMessages(config, waveParams);

    // Auto-stop raid after duration
    if (config.duration) {
      setTimeout(() => {
        this.stopRaid();
      }, config.duration * 1000);
    }

    this.notifyStatsUpdate();
  }

  /**
   * Get wave parameters based on intensity
   */
  private getWaveParameters(intensity: RaidIntensity, raiderCount: number) {
    switch (intensity) {
      case 'low':
        return {
          waveDelay: 800, // milliseconds between joins
          activationDelay: 2000, // delay before activation starts
          activationRate: 0.4, // 40% of raiders become active
          messageFrequency: 5000, // message every 5 seconds
          messageCount: Math.floor(raiderCount * 0.3) // 30% send messages
        };
      case 'medium':
        return {
          waveDelay: 400,
          activationDelay: 1000,
          activationRate: 0.6,
          messageFrequency: 3000,
          messageCount: Math.floor(raiderCount * 0.5)
        };
      case 'high':
        return {
          waveDelay: 200,
          activationDelay: 500,
          activationRate: 0.75,
          messageFrequency: 2000,
          messageCount: Math.floor(raiderCount * 0.7)
        };
      case 'mega':
        return {
          waveDelay: 100,
          activationDelay: 300,
          activationRate: 0.9,
          messageFrequency: 1000,
          messageCount: Math.floor(raiderCount * 0.85)
        };
    }
  }

  /**
   * Join raiders in waves for realistic arrival
   */
  private joinRaidersInWaves(config: RaidConfig, waveParams: any) {
    const { raiderCount } = config;
    const { waveDelay } = waveParams;

    for (let i = 0; i < raiderCount; i++) {
      const timeout = setTimeout(() => {
        const user = userPool.joinRandomUser();
        if (user && this.stats) {
          this.stats.joinedRaiders++;
          this.notifyStatsUpdate();

          // Send arrival message occasionally
          if (Math.random() < 0.3) { // 30% chance
            const message = this.getRaidMessage('arrival', config.raiderUsername);
            if (this.onRaidMessage) {
              this.onRaidMessage(message, user.username);
            }
          }
        }
      }, i * waveDelay);

      this.joinIntervals.push(timeout);
    }
  }

  /**
   * Activate raiders progressively (lurking -> active)
   */
  private activateRaidersProgressively(config: RaidConfig, waveParams: any) {
    const { raiderCount } = config;
    const { activationDelay, activationRate } = waveParams;

    const targetActivations = Math.floor(raiderCount * activationRate);

    setTimeout(() => {
      for (let i = 0; i < targetActivations; i++) {
        const timeout = setTimeout(() => {
          const user = userPool.activateLurker();
          if (user && this.stats) {
            this.stats.activatedRaiders++;
            this.notifyStatsUpdate();
          }
        }, i * 300); // Activate every 300ms

        this.activationIntervals.push(timeout);
      }
    }, activationDelay);
  }

  /**
   * Generate raid-themed messages
   */
  private generateRaidMessages(config: RaidConfig, waveParams: any) {
    const { messageFrequency, messageCount } = waveParams;
    const messageTypes = ['hype', 'questions', 'engagement'];

    for (let i = 0; i < messageCount; i++) {
      const timeout = setTimeout(() => {
        if (!this.stats?.isActive) return;

        const activeUsers = userPool.getUsersByState('active');
        if (activeUsers.length === 0) return;

        const user = activeUsers[Math.floor(Math.random() * activeUsers.length)];
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)] as keyof typeof RAID_MESSAGES;
        const message = this.getRaidMessage(messageType, config.raiderUsername);

        if (this.onRaidMessage && this.stats) {
          this.onRaidMessage(message, user.username);
          this.stats.messagesGenerated++;
          this.notifyStatsUpdate();
        }
      }, 3000 + i * messageFrequency); // Start after 3s initial delay

      this.messageIntervals.push(timeout);
    }
  }

  /**
   * Get a random raid message with template replacement
   */
  private getRaidMessage(type: keyof typeof RAID_MESSAGES, raiderUsername: string): string {
    const messages = RAID_MESSAGES[type];
    const template = messages[Math.floor(Math.random() * messages.length)];
    return template.replace('{raider}', raiderUsername);
  }

  /**
   * Stop the current raid
   */
  stopRaid() {
    // Clear all intervals
    this.joinIntervals.forEach(t => clearTimeout(t));
    this.activationIntervals.forEach(t => clearTimeout(t));
    this.messageIntervals.forEach(t => clearTimeout(t));

    this.joinIntervals = [];
    this.activationIntervals = [];
    this.messageIntervals = [];

    if (this.stats) {
      this.stats.isActive = false;
      this.stats.endTime = Date.now();
      this.notifyStatsUpdate();

      console.log(`🏁 Raid ended: ${this.stats.joinedRaiders}/${this.stats.totalRaiders} joined, ${this.stats.activatedRaiders} active, ${this.stats.messagesGenerated} messages`);
    }

    this.stats = null;
    this.onStatsUpdate = null;
    this.onRaidMessage = null;
  }

  /**
   * Get current raid stats
   */
  getStats(): RaidStats | null {
    return this.stats;
  }

  /**
   * Check if raid is active
   */
  isActive(): boolean {
    return this.stats?.isActive || false;
  }

  /**
   * Notify stats update
   */
  private notifyStatsUpdate() {
    if (this.onStatsUpdate && this.stats) {
      this.onStatsUpdate(this.stats);
    }
  }

  /**
   * Quick raid presets
   */
  static presets = {
    tiny: { raiderCount: 5, intensity: 'low' as RaidIntensity, duration: 30 },
    small: { raiderCount: 15, intensity: 'medium' as RaidIntensity, duration: 45 },
    medium: { raiderCount: 30, intensity: 'medium' as RaidIntensity, duration: 60 },
    large: { raiderCount: 50, intensity: 'high' as RaidIntensity, duration: 90 },
    massive: { raiderCount: 100, intensity: 'mega' as RaidIntensity, duration: 120 }
  };
}

// Export singleton instance
export const raidSimulator = new RaidSimulator();
