// Twitch emote mappings to emoji/images
export const EMOTE_MAP: Record<string, string> = {
  // Popular Twitch emotes mapped to emoji
  'KEKW': '😂',
  'OMEGALUL': '😂',
  'LUL': '😆',
  'LULW': '😆',
  'Pog': '😮',
  'PogChamp': '😮',
  'POGGERS': '😮',
  'PogU': '😮',
  'monkaS': '😰',
  'monkaW': '😰',
  'Clap': '👏',
  'EZ': '😎',
  'PepeHands': '😢',
  'Sadge': '😢',
  'Copium': '🤡',
  'Pepega': '🤪',
  'pepeD': '🕺',
  'catJAM': '🐱',
  'FeelsGoodMan': '😊',
  'FeelsBadMan': '😔',
  'FeelsStrongMan': '💪',
  'monkaHmm': '🤔',
  'PepeLaugh': '😏',
  'WeirdChamp': '😬',
  'WutFace': '😨',
  '5Head': '🧠',
  'Jebaited': '🎣',
  'Kreygasm': '😍',
  'ResidentSleeper': '😴',
  'BibleThump': '😭',
  'NotLikeThis': '😱',
  'TriHard': '💪',
  'KappaPride': '🏳️‍🌈',
  'CoolStoryBob': '📖',
  'DansGame': '🤢',
  'SourPls': '🎵',
  'gg': '🎮',
  'GG': '🎮',
};

/**
 * Replace emote text with emoji in a message
 */
export function renderEmotes(text: string): string {
  let result = text;
  
  // Replace each emote with its emoji equivalent
  Object.entries(EMOTE_MAP).forEach(([emote, emoji]) => {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${emote}\\b`, 'g');
    result = result.replace(regex, emoji);
  });
  
  return result;
}

/**
 * Check if a message contains emotes
 */
export function hasEmotes(text: string): boolean {
  return Object.keys(EMOTE_MAP).some(emote => 
    new RegExp(`\\b${emote}\\b`, 'i').test(text)
  );
}
