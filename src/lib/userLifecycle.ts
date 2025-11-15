import { userPool, ChatUser } from './userPool';

/**
 * Manages user joining/leaving and viewer count dynamics
 */
export class UserLifecycleManager {
  private joinInterval: NodeJS.Timeout | null = null;
  private leaveInterval: NodeJS.Timeout | null = null;
  private activationInterval: NodeJS.Timeout | null = null;
  private onViewerCountChange: ((count: number) => void) | null = null;
  
  /**
   * Start the user lifecycle simulation
   */
  start(onViewerCountChange?: (count: number) => void) {
    this.onViewerCountChange = onViewerCountChange || null;
    
    // Initial burst: join 10-20 users immediately
    const initialUsers = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < initialUsers; i++) {
      userPool.joinRandomUser();
    }
    
    // Activate some of the lurkers
    const initialActive = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < initialActive; i++) {
      userPool.activateLurker();
    }
    
    this.notifyViewerCountChange();
    
    // Start intervals
    this.startJoinInterval();
    this.startLeaveInterval();
    this.startActivationInterval();
    
    console.log('🎬 User lifecycle started');
  }
  
  /**
   * Stop the user lifecycle simulation
   */
  stop() {
    if (this.joinInterval) clearInterval(this.joinInterval);
    if (this.leaveInterval) clearInterval(this.leaveInterval);
    if (this.activationInterval) clearInterval(this.activationInterval);
    
    this.joinInterval = null;
    this.leaveInterval = null;
    this.activationInterval = null;
    
    console.log('🛑 User lifecycle stopped');
  }
  
  /**
   * Users join at random intervals
   */
  private startJoinInterval() {
    const joinUser = () => {
      const viewerCount = userPool.getViewerCount();
      
      // Join probability decreases as viewer count increases
      const maxViewers = 60;
      const joinProbability = Math.max(0.3, 1 - (viewerCount / maxViewers));
      
      if (Math.random() < joinProbability) {
        const joined = userPool.joinRandomUser();
        if (joined) {
          this.notifyViewerCountChange();
        }
      }
      
      // Schedule next join (3-10 seconds)
      const nextJoin = 3000 + Math.random() * 7000;
      this.joinInterval = setTimeout(joinUser, nextJoin);
    };
    
    joinUser();
  }
  
  /**
   * Users leave at random intervals
   */
  private startLeaveInterval() {
    const leaveUser = () => {
      const viewerCount = userPool.getViewerCount();
      
      // Leave probability increases as viewer count increases
      const minViewers = 10;
      const leaveProbability = viewerCount > minViewers ? Math.min(0.7, viewerCount / 60) : 0.1;
      
      if (Math.random() < leaveProbability) {
        const left = userPool.leaveRandomUser();
        if (left) {
          this.notifyViewerCountChange();
        }
      }
      
      // Schedule next leave check (5-15 seconds)
      const nextLeave = 5000 + Math.random() * 10000;
      this.leaveInterval = setTimeout(leaveUser, nextLeave);
    };
    
    leaveUser();
  }
  
  /**
   * Lurkers become active at random intervals
   */
  private startActivationInterval() {
    const activateUser = () => {
      const activeChatters = userPool.getActiveChattersCount();
      const lurkers = userPool.getUsersByState('lurking').length;
      
      // Activate lurkers if we have some and not too many active already
      if (lurkers > 0 && activeChatters < 15 && Math.random() < 0.6) {
        const activated = userPool.activateLurker();
        if (activated) {
          // Viewer count doesn't change (lurker -> active), but engagement increases
        }
      }
      
      // Schedule next activation check (4-12 seconds)
      const nextActivation = 4000 + Math.random() * 8000;
      this.activationInterval = setTimeout(activateUser, nextActivation);
    };
    
    activateUser();
  }
  
  /**
   * Notify listener of viewer count change
   */
  private notifyViewerCountChange() {
    if (this.onViewerCountChange) {
      const count = userPool.getViewerCount();
      this.onViewerCountChange(count);
    }
  }
  
  /**
   * Get current viewer count
   */
  getViewerCount(): number {
    return userPool.getViewerCount();
  }
  
  /**
   * Trigger a viewer surge (e.g., during hype moments)
   */
  triggerSurge() {
    console.log('📈 Viewer surge!');
    
    // Join 5-10 new users quickly
    const surgeCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < surgeCount; i++) {
      setTimeout(() => {
        userPool.joinRandomUser();
        this.notifyViewerCountChange();
      }, i * 500);
    }
    
    // Activate more lurkers
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        userPool.activateLurker();
      }
    }, 2000);
  }
}

// Export singleton instance
export const userLifecycle = new UserLifecycleManager();
