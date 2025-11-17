import { userPool } from './userPool';

interface RaidConfig {
  minUsers: number;
  maxUsers: number;
  minIntervalMs: number;
  maxIntervalMs: number;
}

class RaidSimulation {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private config: RaidConfig = {
    minUsers: 10,
    maxUsers: 25,
    minIntervalMs: 15 * 60 * 1000, // 15 minutes
    maxIntervalMs: 30 * 60 * 1000, // 30 minutes
  };

  private onRaidCallback?: (raidSize: number) => void;

  /**
   * Start the automatic raid simulation
   */
  start(onRaid?: (raidSize: number) => void): void {
    if (this.isRunning) {
      console.warn('Raid simulation already running');
      return;
    }

    this.onRaidCallback = onRaid;
    this.isRunning = true;
    this.scheduleNextRaid();
    console.log('Raid simulation started');
  }

  /**
   * Stop the automatic raid simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Raid simulation stopped');
  }

  /**
   * Schedule the next raid to occur after a random interval
   */
  private scheduleNextRaid(): void {
    if (!this.isRunning) return;

    const delay = this.getRandomDelay();
    console.log(`Next raid scheduled in ${Math.round(delay / 1000 / 60)} minutes`);

    this.intervalId = setTimeout(() => {
      this.executeRaid();
      this.scheduleNextRaid();
    }, delay);
  }

  /**
   * Get a random delay between min and max interval
   */
  private getRandomDelay(): number {
    const { minIntervalMs, maxIntervalMs } = this.config;
    return Math.random() * (maxIntervalMs - minIntervalMs) + minIntervalMs;
  }

  /**
   * Execute a raid: bring in a random number of users rapidly
   */
  executeRaid(): void {
    const raidSize = Math.floor(
      Math.random() * (this.config.maxUsers - this.config.minUsers + 1) +
        this.config.minUsers
    );

    console.log(`🚨 RAID INCOMING! ${raidSize} users joining!`);

    // Bring in users in waves to simulate a raid
    const waveSize = Math.ceil(raidSize / 3);
    let usersAdded = 0;

    // First wave: immediate
    const firstWave = Math.min(waveSize, raidSize - usersAdded);
    this.addRaidUsers(firstWave);
    usersAdded += firstWave;

    // Second wave: after 500ms
    setTimeout(() => {
      const secondWave = Math.min(waveSize, raidSize - usersAdded);
      this.addRaidUsers(secondWave);
      usersAdded += secondWave;

      // Third wave: after another 500ms
      setTimeout(() => {
        const thirdWave = raidSize - usersAdded;
        if (thirdWave > 0) {
          this.addRaidUsers(thirdWave);
        }
      }, 500);
    }, 500);

    // Notify callback
    if (this.onRaidCallback) {
      this.onRaidCallback(raidSize);
    }
  }

  /**
   * Add a specific number of users and activate some of them
   */
  private addRaidUsers(count: number): void {
    for (let i = 0; i < count; i++) {
      const user = userPool.joinRandomUser();

      // 50% chance to activate immediately (raiders are chatty!)
      if (user && Math.random() < 0.5) {
        setTimeout(() => {
          userPool.activateLurker(user.id);
        }, Math.random() * 2000); // Stagger activations over 2 seconds
      }
    }
  }

  /**
   * Manually trigger a test raid
   */
  triggerTestRaid(): void {
    console.log('Triggering test raid...');
    this.executeRaid();
  }

  /**
   * Get the current running status
   */
  getStatus(): boolean {
    return this.isRunning;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RaidConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const raidSimulation = new RaidSimulation();
