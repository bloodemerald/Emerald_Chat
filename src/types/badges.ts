/**
 * Badge System Types
 * Twitch-style badges for users
 */

export type BadgeType = 
  | 'subscriber'
  | 'moderator'
  | 'vip'
  | 'bits'
  | 'founder'
  | 'anniversary'
  | 'personality'
  | 'custom';

export interface UserBadge {
  id: string;
  type: BadgeType;
  name: string;
  icon: string; // emoji or image URL
  description: string;
  earnedAt: number;
  tier?: number; // For subscriber months, bits tiers, etc.
  color?: string; // Custom badge color
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Predefined badge configurations
 */
export interface BadgeConfig {
  type: BadgeType;
  name: string;
  icon: string;
  description: string;
  color?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Subscriber tier badges
 */
export const SUBSCRIBER_BADGES: Record<number, BadgeConfig> = {
  1: {
    type: 'subscriber',
    name: '1 Month',
    icon: '⭐',
    description: 'Subscribed for 1 month',
    color: '#9147ff',
    rarity: 'common'
  },
  3: {
    type: 'subscriber',
    name: '3 Months',
    icon: '✨',
    description: 'Subscribed for 3 months',
    color: '#9147ff',
    rarity: 'common'
  },
  6: {
    type: 'subscriber',
    name: '6 Months',
    icon: '🌟',
    description: 'Subscribed for 6 months',
    color: '#9147ff',
    rarity: 'rare'
  },
  12: {
    type: 'subscriber',
    name: '1 Year',
    icon: '💫',
    description: 'Subscribed for 1 year',
    color: '#9147ff',
    rarity: 'rare'
  },
  24: {
    type: 'subscriber',
    name: '2 Years',
    icon: '🏆',
    description: 'Subscribed for 2 years',
    color: '#9147ff',
    rarity: 'epic'
  },
  36: {
    type: 'subscriber',
    name: '3 Years',
    icon: '👑',
    description: 'Subscribed for 3 years',
    color: '#9147ff',
    rarity: 'legendary'
  }
};

/**
 * Bits tier badges
 */
export const BITS_BADGES: Record<number, BadgeConfig> = {
  100: {
    type: 'bits',
    name: 'Bits 100',
    icon: '💎',
    description: 'Cheered 100+ bits',
    color: '#9c27b0',
    rarity: 'common'
  },
  1000: {
    type: 'bits',
    name: 'Bits 1K',
    icon: '💠',
    description: 'Cheered 1,000+ bits',
    color: '#673ab7',
    rarity: 'rare'
  },
  5000: {
    type: 'bits',
    name: 'Bits 5K',
    icon: '💍',
    description: 'Cheered 5,000+ bits',
    color: '#3f51b5',
    rarity: 'epic'
  },
  10000: {
    type: 'bits',
    name: 'Bits 10K',
    icon: '💰',
    description: 'Cheered 10,000+ bits',
    color: '#2196f3',
    rarity: 'legendary'
  }
};

/**
 * Special role badges
 */
export const ROLE_BADGES: Record<string, BadgeConfig> = {
  moderator: {
    type: 'moderator',
    name: 'Moderator',
    icon: '🛡️',
    description: 'Channel moderator',
    color: '#00ff00',
    rarity: 'epic'
  },
  vip: {
    type: 'vip',
    name: 'VIP',
    icon: '💜',
    description: 'VIP member',
    color: '#e91e63',
    rarity: 'rare'
  },
  founder: {
    type: 'founder',
    name: 'Founder',
    icon: '🌠',
    description: 'Channel founder',
    color: '#ff9800',
    rarity: 'legendary'
  }
};

/**
 * Personality-based badges
 */
export const PERSONALITY_BADGES: Record<string, BadgeConfig> = {
  toxic: {
    type: 'personality',
    name: 'Toxic King',
    icon: '☠️',
    description: 'Master of salt',
    color: '#f44336',
    rarity: 'rare'
  },
  helpful: {
    type: 'personality',
    name: 'Helper',
    icon: '🤝',
    description: 'Always helping others',
    color: '#4caf50',
    rarity: 'rare'
  },
  meme: {
    type: 'personality',
    name: 'Meme Lord',
    icon: '😂',
    description: 'Dank meme master',
    color: '#ff5722',
    rarity: 'epic'
  },
  hype: {
    type: 'personality',
    name: 'Hype Train',
    icon: '🚂',
    description: 'Maximum energy',
    color: '#ffc107',
    rarity: 'rare'
  },
  analyst: {
    type: 'personality',
    name: '5Head',
    icon: '🧠',
    description: 'Big brain plays',
    color: '#2196f3',
    rarity: 'epic'
  }
};
