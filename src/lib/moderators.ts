import { PersonalityType } from "@/types/personality";
import { ChatUser, userPool } from "./userPool";

export interface Moderator {
  id: string;
  username: string;
  personality: PersonalityType;
  joinPriority: number; // Lower = joins first
  color: string;
  description: string;
}

export const MODERATORS: Moderator[] = [
  {
    id: 'mod-nunez',
    username: 'Nunez',
    personality: 'helpful',
    joinPriority: 1,
    color: '#FF6B6B',
    description: 'Lead moderator - guides chat and provides helpful insights'
  },
  {
    id: 'mod-jwoodz',
    username: 'JWoodZ',
    personality: 'analyst',
    joinPriority: 2,
    color: '#4ECDC4',
    description: 'Strategic moderator - analyzes gameplay and provides tactical advice'
  },
  {
    id: 'mod-dyno',
    username: 'Dyno',
    personality: 'wholesome',
    joinPriority: 3,
    color: '#45B7D1',
    description: 'Community moderator - keeps chat positive and welcoming'
  },
  {
    id: 'mod-hamma',
    username: 'Hamma',
    personality: 'hype',
    joinPriority: 4,
    color: '#96CEB4',
    description: 'Energy moderator - hypes up chat and creates excitement'
  }
];

export class ModeratorManager {
  private static instance: ModeratorManager;
  private activeModerators: Map<string, ChatUser> = new Map();
  private hasJoined = false;

  static getInstance(): ModeratorManager {
    if (!ModeratorManager.instance) {
      ModeratorManager.instance = new ModeratorManager();
    }
    return ModeratorManager.instance;
  }

  /**
   * Convert moderator config to ChatUser objects
   */
  private createModeratorUser(mod: Moderator): ChatUser {
    return {
      id: mod.id,
      username: mod.username,
      personality: mod.personality,
      state: 'active', // Mods are always active, never lurkers
      joinTime: Date.now(),
      lastActivityTime: Date.now(),
      messageCount: 0,
      likesGiven: 0,
      activityLevel: 0.3, // Moderate activity - mods don't spam chat
      // Give mods premium badges
      badges: [
        { 
          id: 'mod-badge',
          type: 'moderator', 
          name: 'Moderator',
          icon: '🛡️',
          description: 'Channel Moderator',
          earnedAt: Date.now() 
        },
        { 
          id: 'vip-badge',
          type: 'vip', 
          name: 'VIP',
          icon: '💎',
          description: 'VIP User',
          earnedAt: Date.now() 
        },
        { 
          id: 'founder-badge',
          type: 'founder', 
          name: 'Founder',
          icon: '👑',
          description: 'Founding Member',
          earnedAt: Date.now() 
        }
      ],
      subscriberMonths: 24, // Long-term subscribers
      bits: 10000, // Lots of bits to gift
      avatarEmoji: '👑',
      bio: mod.description,
      profileColor: mod.color,
      createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000, // Created 1 year ago
      moderation: {
        isBanned: false,
        isTimedOut: false,
        warnings: 0,
        modActions: []
      }
    };
  }

  /**
   * Join all moderators to the stream
   */
  joinModerators(): ChatUser[] {
    if (this.hasJoined) {
      return Array.from(this.activeModerators.values());
    }

    console.log('👑 Moderators joining the stream...');
    
    // Sort by priority and join in order
    const sortedMods = [...MODERATORS].sort((a, b) => a.joinPriority - b.joinPriority);
    
    sortedMods.forEach(mod => {
      console.log(`👑 Creating moderator: ${mod.username}`);
      const user = this.createModeratorUser(mod);
      this.activeModerators.set(mod.id, user);
      
      console.log(`👑 Adding ${mod.username} to user pool...`);
      // Add moderator to user pool so they can send messages
      userPool.addModeratorUser(user);
      
      console.log(`✅ ${mod.username} joined as moderator (${mod.personality}) - State: ${user.state}`);
    });

    this.hasJoined = true;
    return Array.from(this.activeModerators.values());
  }

  /**
   * Get all active moderators
   */
  getActiveModerators(): ChatUser[] {
    return Array.from(this.activeModerators.values());
  }

  /**
   * Check if a user is a moderator
   */
  isModerator(userId: string): boolean {
    return this.activeModerators.has(userId) || MODERATORS.some(mod => mod.id === userId);
  }

  /**
   * Check if username is a moderator
   */
  isModeratorByUsername(username: string): boolean {
    return MODERATORS.some(mod => mod.username === username);
  }

  /**
   * Get moderator by username
   */
  getModeratorByUsername(username: string): ChatUser | undefined {
    return this.activeModerators.get(username);
  }

  /**
   * Get moderator priority for message queue ordering
   * Mods get priority in chat responses
   */
  getModeratorPriority(username: string): number {
    const mod = MODERATORS.find(m => m.username === username);
    return mod ? 1000 - mod.joinPriority : 0; // Higher priority = lower number
  }

  /**
   * Reset moderator state (for testing)
   */
  reset(): void {
    this.activeModerators.clear();
    this.hasJoined = false;
  }
}

export const moderatorManager = ModeratorManager.getInstance();
