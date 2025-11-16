import { UserBadge, SUBSCRIBER_BADGES, BITS_BADGES, ROLE_BADGES, PERSONALITY_BADGES } from '@/types/badges';
import { PersonalityType } from '@/types/personality';

/**
 * Avatar emojis for different personalities
 */
const AVATAR_EMOJIS: Record<PersonalityType, string[]> = {
  toxic: ['😈', '👿', '💀', '☠️', '🔥'],
  helpful: ['😊', '🤗', '🌟', '✨', '💚'],
  meme: ['😂', '🤣', '🐸', '🤡', '🎭'],
  backseat: ['🎮', '🕹️', '👀', '🧐', '📊'],
  hype: ['🎉', '🚀', '⚡', '💥', '🔥'],
  lurker: ['👻', '🌙', '😶', '🤫', '👁️'],
  spammer: ['📣', '💬', '🗣️', '📢', '🎪'],
  analyst: ['🧠', '📈', '🤓', '📚', '💡'],
  speedrunner: ['⏱️', '🏃', '💨', '🎯', '🏁'],
  emote_spammer: ['😎', '🎨', '🌈', '✨', '💫'],
  clip_goblin: ['📹', '🎬', '📺', '🎥', '⏺️'],
  spoiler_police: ['🚨', '🚔', '👮', '⚠️', '🛑'],
  wholesome: ['🥰', '💖', '🌸', '🌺', '💝'],
  theorycrafter: ['🔬', '🧪', '📖', '🗺️', '🔍'],
  reaction_only: ['😲', '😱', '🤯', '😮', '👏'],
  mobile_only: ['📱', '📲', '🤳', '📞', '🔋']
};

/**
 * Profile colors based on personality
 */
const PROFILE_COLORS: Record<PersonalityType, string[]> = {
  toxic: ['#f44336', '#e91e63', '#d32f2f'],
  helpful: ['#4caf50', '#8bc34a', '#66bb6a'],
  meme: ['#ff5722', '#ff9800', '#ffc107'],
  backseat: ['#9c27b0', '#673ab7', '#7e57c2'],
  hype: ['#ffc107', '#ffeb3b', '#fdd835'],
  lurker: ['#607d8b', '#546e7a', '#78909c'],
  spammer: ['#03a9f4', '#00bcd4', '#26c6da'],
  analyst: ['#2196f3', '#1976d2', '#1e88e5'],
  speedrunner: ['#ff6b6b', '#ee5a6f', '#ff7675'],
  emote_spammer: ['#e91e63', '#f06292', '#ec407a'],
  clip_goblin: ['#673ab7', '#9575cd', '#b39ddb'],
  spoiler_police: ['#f44336', '#ef5350', '#e57373'],
  wholesome: ['#e91e63', '#f48fb1', '#f8bbd0'],
  theorycrafter: ['#3f51b5', '#5c6bc0', '#7986cb'],
  reaction_only: ['#ff9800', '#ffb74d', '#ffcc80'],
  mobile_only: ['#009688', '#4db6ac', '#80cbc4']
};

/**
 * Bio templates for different personalities
 */
const BIO_TEMPLATES: Record<PersonalityType, string[]> = {
  toxic: [
    'Here to tilt everyone',
    'Salt mine operator',
    'Professional rager',
    'Toxic but entertaining'
  ],
  helpful: [
    'Always here to help!',
    'Ask me anything',
    'Happy to assist',
    'Here for the community'
  ],
  meme: [
    'Dank memes only',
    'Meme connoisseur',
    'Here for the lulz',
    'Professional shitposter'
  ],
  backseat: [
    'You should have...',
    'Strategy expert',
    'Pro gamer wannabe',
    'Armchair analyst'
  ],
  hype: [
    'LET\'S GOOOOO',
    'Maximum energy 24/7',
    'Hype train conductor',
    'POG CHAMPION'
  ],
  lurker: [
    '...',
    'Just watching',
    'Silent observer',
    'Lurking since day 1'
  ],
  spammer: [
    'KEKW KEKW KEKW',
    'Emote spam master',
    'Copypasta collector',
    'Chat go brrrr'
  ],
  analyst: [
    'Stats don\'t lie',
    'Data-driven decisions',
    'Big brain plays',
    'Numbers guy'
  ],
  speedrunner: [
    'Any% WR holder',
    'Frame perfect execution',
    'Sub 30 or bust',
    'Glitchless btw'
  ],
  emote_spammer: [
    'Emotes > Words',
    'Emote enthusiast',
    'Visual communication expert',
    '🔥🔥🔥🔥🔥'
  ],
  clip_goblin: [
    'Clipping everything',
    'VOD reviewer',
    'Highlight hunter',
    'Clip it and ship it'
  ],
  spoiler_police: [
    'NO SPOILERS!',
    'Spoiler enforcer',
    'Protecting chat from spoilers',
    'Spoiler-free zone advocate'
  ],
  wholesome: [
    'Spreading positivity ❤️',
    'Good vibes only',
    'Here to make your day better',
    'Love and support'
  ],
  theorycrafter: [
    'Min-maxing life',
    'Theory enthusiast',
    'Deep lore knowledge',
    'Connecting all the dots'
  ],
  reaction_only: [
    'Words? Never heard of them',
    'React first, think later',
    'Pure emotion',
    '😱😲🤯'
  ],
  mobile_only: [
    'Chatting from phone',
    'Mobile warrior',
    'On the go',
    'Desktop is overrated'
  ]
};

/**
 * Possible favorite teams/affiliations
 */
const FAVORITE_TEAMS = [
  'Jets', 'Patriots', 'Cowboys', 'Packers', 'Eagles',
  'Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls',
  'TSM', 'C9', 'FaZe', 'OG', 'Liquid',
  'None', 'Undecided', 'Free Agent'
];

/**
 * Generate random badges for a user based on their activity
 */
export function generateUserBadges(
  personality: PersonalityType,
  subscriberMonths: number,
  bits: number,
  isModerator: boolean = false
): UserBadge[] {
  const badges: UserBadge[] = [];
  const now = Date.now();

  // Add moderator badge
  if (isModerator) {
    const modBadge = ROLE_BADGES.moderator;
    badges.push({
      id: `mod-${now}`,
      ...modBadge,
      earnedAt: now - Math.random() * 365 * 24 * 60 * 60 * 1000 // Random time in past year
    });
  }

  // Add VIP badge (20% chance)
  if (Math.random() < 0.2) {
    const vipBadge = ROLE_BADGES.vip;
    badges.push({
      id: `vip-${now}`,
      ...vipBadge,
      earnedAt: now - Math.random() * 180 * 24 * 60 * 60 * 1000
    });
  }

  // Add founder badge (5% chance)
  if (Math.random() < 0.05) {
    const founderBadge = ROLE_BADGES.founder;
    badges.push({
      id: `founder-${now}`,
      ...founderBadge,
      earnedAt: now - Math.random() * 730 * 24 * 60 * 60 * 1000 // 2 years ago
    });
  }

  // Add subscriber badge based on months
  if (subscriberMonths > 0) {
    // Find the highest tier they qualify for
    const tiers = Object.keys(SUBSCRIBER_BADGES).map(Number).sort((a, b) => b - a);
    const tier = tiers.find(t => subscriberMonths >= t);
    
    if (tier) {
      const subBadge = SUBSCRIBER_BADGES[tier];
      badges.push({
        id: `sub-${tier}-${now}`,
        ...subBadge,
        tier,
        earnedAt: now - (subscriberMonths * 30 * 24 * 60 * 60 * 1000)
      });
    }
  }

  // Add bits badge based on total bits
  if (bits > 0) {
    const tiers = Object.keys(BITS_BADGES).map(Number).sort((a, b) => b - a);
    const tier = tiers.find(t => bits >= t);
    
    if (tier) {
      const bitsBadge = BITS_BADGES[tier];
      badges.push({
        id: `bits-${tier}-${now}`,
        ...bitsBadge,
        tier,
        earnedAt: now - Math.random() * 365 * 24 * 60 * 60 * 1000
      });
    }
  }

  // Add personality badge (30% chance)
  if (Math.random() < 0.3 && PERSONALITY_BADGES[personality]) {
    const personalityBadge = PERSONALITY_BADGES[personality];
    badges.push({
      id: `personality-${personality}-${now}`,
      ...personalityBadge,
      earnedAt: now - Math.random() * 180 * 24 * 60 * 60 * 1000
    });
  }

  return badges;
}

/**
 * Generate random avatar emoji for personality
 */
export function generateAvatar(personality: PersonalityType): string {
  const emojis = AVATAR_EMOJIS[personality] || ['😀'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Generate random profile color for personality
 */
export function generateProfileColor(personality: PersonalityType): string {
  const colors = PROFILE_COLORS[personality] || ['#9e9e9e'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generate random bio for personality
 */
export function generateBio(personality: PersonalityType): string {
  const bios = BIO_TEMPLATES[personality] || ['Just here to chat'];
  return bios[Math.floor(Math.random() * bios.length)];
}

/**
 * Generate random favorite team
 */
export function generateFavoriteTeam(): string {
  return FAVORITE_TEAMS[Math.floor(Math.random() * FAVORITE_TEAMS.length)];
}

/**
 * Generate random subscriber months (0-36)
 */
export function generateSubscriberMonths(): number {
  const rand = Math.random();
  if (rand < 0.3) return 0; // 30% not subscribed
  if (rand < 0.5) return Math.floor(Math.random() * 3) + 1; // 1-3 months
  if (rand < 0.7) return Math.floor(Math.random() * 6) + 3; // 3-9 months
  if (rand < 0.85) return Math.floor(Math.random() * 12) + 6; // 6-18 months
  if (rand < 0.95) return Math.floor(Math.random() * 12) + 12; // 12-24 months
  return Math.floor(Math.random() * 12) + 24; // 24-36 months
}

/**
 * Generate random bits (scarce economy)
 */
export function generateBits(): number {
  const rand = Math.random();
  // Most users have no bits at all
  if (rand < 0.7) return 0; // 70% no bits

  // Small handful have a modest stash
  if (rand < 0.95) return Math.floor(Math.random() * 100) + 25; // 25-125

  // Rare whales with a larger balance
  return Math.floor(Math.random() * 900) + 100; // 100-1000
}
