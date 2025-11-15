import { PersonalityType } from "@/types/personality";
import { UserModerationState } from "@/types/moderation";
import {
  generateUserBadges,
  generateAvatar,
  generateProfileColor,
  generateBio,
  generateFavoriteTeam,
  generateSubscriberMonths,
  generateBits
} from './badgeGenerator';

export type UserState = 'offline' | 'lurking' | 'active';

export interface ChatUser {
  id: string;
  username: string;
  personality: PersonalityType;
  state: UserState;
  joinTime: number;
  lastActivityTime: number;
  messageCount: number;
  likesGiven: number;
  activityLevel: number; // 0-1, how engaged they are
  // Badge & Profile Data
  badges: import('@/types/badges').UserBadge[];
  subscriberMonths: number;
  bits: number;
  avatarEmoji: string; // emoji avatar
  bio: string;
  favoriteTeam?: string;
  profileColor: string;
  createdAt: number;
  // Moderation State
  moderation: UserModerationState;
}

// Twitch-style username generators
const USERNAME_PREFIXES = [
  'Xx', 'lil', 'Big', 'Pro', 'Noob', 'Epic', 'Dark', 'Shadow', 'Fire', 'Ice',
  'Cyber', 'Neon', 'Pixel', 'Retro', 'Giga', 'Ultra', 'Mega', 'Super', 'Hyper'
];

const USERNAME_SUFFIXES = [
  'xX', 'TV', 'TTV', 'YT', 'Pro', 'Gamer', 'Lord', 'King', 'Queen', 'Boss',
  '420', '69', '777', '999', '123', '360', 'HD', 'Live', 'Plays', 'Clips'
];

const USERNAME_BASES: Record<PersonalityType, string[]> = {
  toxic: ['Rager', 'Flamer', 'Tilted', 'Salty', 'Malding', 'Toxic', 'Griefer', 'Troll'],
  helpful: ['Helper', 'Guide', 'Mentor', 'Teacher', 'Friendly', 'Supporter', 'Coach', 'Advisor'],
  meme: ['Memer', 'Shitpost', 'Pepega', 'Dank', 'Based', 'Chad', 'Gigachad', 'Poggers'],
  backseat: ['GameCoach', 'Strategist', 'Analyst', 'Tactician', 'Advisor', 'Expert', 'Critic'],
  hype: ['Hyper', 'Pumped', 'Excited', 'Energy', 'Vibes', 'Pog', 'Lets', 'Go'],
  lurker: ['Lurker', 'Silent', 'Watcher', 'Observer', 'Viewer', 'Spectator', 'Shadow', 'Ghost'],
  spammer: ['Spammer', 'Clipper', 'Copypasta', 'Emote', 'Spammy', 'Flooder', 'Chatter'],
  analyst: ['Stats', 'Numbers', 'Data', 'Logic', 'Brain', 'Thinker', 'Calculator', 'IQ'],
  speedrunner: ['Runner', 'Speedy', 'Fast', 'Quick', 'Racer', 'Timer', 'Record', 'WR'],
  emote_spammer: ['Emotes', 'Emoji', 'Visual', 'Icon', 'Symbol', 'Expressive', 'Faces'],
  clip_goblin: ['Clipper', 'Recorder', 'Saver', 'Highlight', 'VOD', 'Replay', 'Catcher'],
  spoiler_police: ['NoSpoil', 'Guard', 'Protector', 'Shield', 'Defender', 'Watch', 'Alert'],
  wholesome: ['Kind', 'Sweet', 'Positive', 'Lovely', 'Caring', 'Warm', 'Gentle', 'Pure'],
  theorycrafter: ['Theory', 'Crafter', 'Lore', 'Deep', 'Scholar', 'Researcher', 'Thinker'],
  reaction_only: ['React', 'Emoji', 'Express', 'Feel', 'Vibe', 'Response', 'Emote'],
  mobile_only: ['Mobile', 'Phone', 'OnTheGo', 'Portable', 'Wireless', 'Handheld']
};

/**
 * Generate a unique Twitch-style username
 */
function generateUsername(personality: PersonalityType, existingNames: Set<string>): string {
  const bases = USERNAME_BASES[personality];
  const base = bases[Math.floor(Math.random() * bases.length)];
  
  let username: string;
  let attempts = 0;
  
  do {
    const usePrefix = Math.random() > 0.4; // Increased from 0.5
    const useSuffix = Math.random() > 0.3; // Increased from 0.5

    const parts = [base];
    
    if (usePrefix) {
      const prefix = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
      parts.unshift(prefix);
    }
    
    if (useSuffix) {
      const suffix = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)];
      parts.push(suffix);
    }
    
    // Always add random number for guaranteed uniqueness
    const randomNum = Math.floor(Math.random() * 9999) + (attempts * 1000);
    parts.push(String(randomNum));
    
    username = parts.join('_');
    attempts++;
    
    // Force uniqueness after 10 attempts
    if (attempts >= 10) {
      username = `${username}_${Date.now().toString().slice(-4)}`;
    }
  } while (existingNames.has(username) && attempts < 20);
  
  return username;
}

/**
 * User Pool - manages all persistent chat users
 */
class UserPool {
  private users: Map<string, ChatUser> = new Map();
  private usernameSet: Set<string> = new Set();
  private readonly USERS_PER_PERSONALITY = 8; // 8 users per personality type
  
  constructor() {
    this.initializeUserPool();
  }
  
  /**
   * Create the initial pool of users
   */
  private initializeUserPool() {
    const personalities: PersonalityType[] = [
      'toxic', 'helpful', 'meme', 'backseat', 'hype', 'lurker', 'spammer', 'analyst'
    ];
    
    personalities.forEach(personality => {
      for (let i = 0; i < this.USERS_PER_PERSONALITY; i++) {
        const username = generateUsername(personality, this.usernameSet);
        
        // Validate uniqueness
        if (this.usernameSet.has(username)) {
          console.error(`⚠️ Duplicate username detected: ${username}`);
          continue;
        }
        
        // Generate user metadata
        const subscriberMonths = generateSubscriberMonths();
        const bits = generateBits();
        const createdAt = Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000; // Random date within last year
        
        const user: ChatUser = {
          id: `${personality}-${i}`,
          username,
          personality,
          state: 'offline',
          joinTime: 0,
          lastActivityTime: 0,
          messageCount: 0,
          likesGiven: 0,
          activityLevel: Math.random() * 0.5 + 0.3, // 0.3-0.8 activity level
          // Badge & Profile Data
          badges: generateUserBadges(personality, subscriberMonths, bits, false),
          subscriberMonths,
          bits,
          avatarEmoji: generateAvatar(personality),
          bio: generateBio(personality),
          favoriteTeam: Math.random() < 0.7 ? generateFavoriteTeam() : undefined,
          profileColor: generateProfileColor(personality),
          createdAt,
          // Moderation State
          moderation: {
            isBanned: false,
            isTimedOut: false,
            warnings: 0,
            modActions: []
          }
        };
        
        this.users.set(user.id, user);
        this.usernameSet.add(username);
      }
    });
    
    console.log(`👥 Initialized user pool with ${this.users.size} unique users`);
    console.log(`📝 Unique usernames: ${this.usernameSet.size}`);
    
    // Validate no duplicates
    if (this.users.size !== this.usernameSet.size) {
      console.error('❌ Username duplication detected in pool!');
    }
  }
  
  /**
   * Get all users in a specific state
   */
  getUsersByState(state: UserState): ChatUser[] {
    return Array.from(this.users.values()).filter(u => u.state === state);
  }
  
  /**
   * Get active user count (lurkers + active)
   */
  getViewerCount(): number {
    return this.getUsersByState('lurking').length + this.getUsersByState('active').length;
  }
  
  /**
   * Get active chatters count
   */
  getActiveChattersCount(): number {
    return this.getUsersByState('active').length;
  }
  
  /**
   * Join a random offline user to chat
   */
  joinRandomUser(): ChatUser | null {
    const offlineUsers = this.getUsersByState('offline');
    if (offlineUsers.length === 0) return null;
    
    const user = offlineUsers[Math.floor(Math.random() * offlineUsers.length)];
    user.state = 'lurking';
    user.joinTime = Date.now();
    user.lastActivityTime = Date.now();
    
    console.log(`📥 ${user.username} joined (lurking)`);
    return user;
  }
  
  /**
   * Promote a lurker to active
   */
  activateLurker(): ChatUser | null {
    const lurkers = this.getUsersByState('lurking');
    if (lurkers.length === 0) return null;
    
    // Prefer users who have been lurking longer
    const eligibleLurkers = lurkers.filter(u => 
      Date.now() - u.joinTime > 10000 // lurked for at least 10 seconds
    );
    
    if (eligibleLurkers.length === 0) return null;
    
    const user = eligibleLurkers[Math.floor(Math.random() * eligibleLurkers.length)];
    user.state = 'active';
    user.lastActivityTime = Date.now();
    
    console.log(`✅ ${user.username} became active`);
    return user;
  }
  
  /**
   * Leave a random active/lurking user
   */
  leaveRandomUser(): ChatUser | null {
    const presentUsers = [...this.getUsersByState('lurking'), ...this.getUsersByState('active')];
    if (presentUsers.length === 0) return null;
    
    // Prefer users who have been around longer
    const eligibleUsers = presentUsers.filter(u =>
      Date.now() - u.joinTime > 30000 // been in chat at least 30 seconds
    );
    
    if (eligibleUsers.length === 0) return null;
    
    const user = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    user.state = 'offline';
    
    console.log(`📤 ${user.username} left chat`);
    return user;
  }
  
  /**
   * Get a random active user who can send a message
   */
  getRandomActiveUser(personality?: PersonalityType): ChatUser | null {
    let activeUsers = this.getUsersByState('active');
    
    if (personality) {
      activeUsers = activeUsers.filter(u => u.personality === personality);
    }
    
    if (activeUsers.length === 0) return null;
    
    // Weight by activity level
    const totalActivity = activeUsers.reduce((sum, u) => sum + u.activityLevel, 0);
    let random = Math.random() * totalActivity;
    
    for (const user of activeUsers) {
      random -= user.activityLevel;
      if (random <= 0) {
        user.lastActivityTime = Date.now();
        user.messageCount++;
        return user;
      }
    }
    
    return activeUsers[0];
  }
  
  /**
   * Get random users who can like a message
   */
  getRandomLikers(count: number, excludeUsername?: string): ChatUser[] {
    const activeUsers = this.getUsersByState('active').filter(
      u => u.username !== excludeUsername
    );
    
    if (activeUsers.length === 0) return [];
    
    // Shuffle and take random users
    const shuffled = activeUsers.sort(() => Math.random() - 0.5);
    const likers = shuffled.slice(0, Math.min(count, activeUsers.length));
    
    likers.forEach(u => {
      u.likesGiven++;
      u.lastActivityTime = Date.now();
    });
    
    return likers;
  }
  
  /**
   * Get user by username
   */
  getUserByUsername(username: string): ChatUser | null {
    return Array.from(this.users.values()).find(u => u.username === username) || null;
  }
  
  /**
   * Update user activity
   */
  updateUserActivity(userId: string) {
    const user = this.users.get(userId);
    if (user) {
      user.lastActivityTime = Date.now();
    }
  }
  
  /**
   * Get all users
   */
  getAllUsers(): ChatUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Get all active users (lurking or active state)
   */
  getActiveUsers(): ChatUser[] {
    return [...this.getUsersByState('active'), ...this.getUsersByState('lurking')];
  }
}

// Export singleton instance
export const userPool = new UserPool();
