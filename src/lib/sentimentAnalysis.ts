/**
 * Lightweight sentiment analysis for chat messages
 * Optimized for performance with no external dependencies
 */

// Sentiment lexicon - optimized for chat/gaming context
const POSITIVE_WORDS = new Set([
  'love', 'great', 'good', 'awesome', 'amazing', 'excellent', 'fantastic', 'wonderful',
  'best', 'perfect', 'nice', 'happy', 'joy', 'beautiful', 'brilliant', 'cool',
  'epic', 'pog', 'poggers', 'pogchamp', 'hype', 'hyped', 'fire', 'lit', 'clutch',
  'gg', 'wp', 'nice', 'gj', 'gz', 'gratz', 'congrats', 'win', 'won', 'winning',
  'lol', 'lmao', 'funny', 'hilarious', 'like', 'liked', 'appreciate', 'thanks',
  'thank', 'helpful', 'useful', 'impressive', 'skilled', 'clean', 'smooth',
  'gorgeous', 'stunning', 'incredible', 'insane', 'crazy', 'wild', 'sick',
  '❤️', '😊', '😄', '😍', '🔥', '💯', '✨', '🎉', '👏', '🙌'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'trash', 'garbage',
  'stupid', 'dumb', 'idiot', 'sucks', 'boring', 'lame', 'cringe', 'yikes',
  'sad', 'angry', 'mad', 'annoying', 'irritating', 'frustrating', 'fail', 'failed',
  'toxic', 'troll', 'trolling', 'grief', 'griefing', 'throw', 'throwing', 'threw',
  'inting', 'int', 'feeding', 'noob', 'scrub', 'bot', 'reported', 'report',
  'ban', 'banned', 'timeout', 'muted', 'wrong', 'mistake', 'error', 'mess',
  'disappointing', 'disappointed', 'embarrassing', 'shameful', 'pathetic',
  'useless', 'pointless', 'waste', 'wasted', 'rip', 'dead', 'ded',
  '😢', '😭', '😡', '😠', '💀', '☠️', '👎'
]);

const INTENSIFIERS = new Set([
  'very', 'really', 'extremely', 'super', 'incredibly', 'absolutely', 'totally',
  'completely', 'utterly', 'so', 'too', 'mega', 'ultra', 'hella'
]);

const NEGATIONS = new Set([
  'not', 'no', 'never', 'neither', 'none', 'nobody', 'nothing', 'nowhere',
  "n't", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't",
  "shouldn't", "isn't", "aren't", "wasn't", "weren't"
]);

// Emote sentiment mapping
const EMOTE_SENTIMENT: Record<string, number> = {
  // Positive emotes
  'PogChamp': 0.8, 'Pog': 0.8, 'PogU': 0.8, 'POGGERS': 0.9,
  'Kreygasm': 0.7, 'Kappa': 0.3, 'LUL': 0.6, 'LULW': 0.6, 'OMEGALUL': 0.7,
  'PepeLaugh': 0.5, 'KEKW': 0.7, 'Clap': 0.6, 'GG': 0.7, 'EZ': 0.5,
  'widepeepoHappy': 0.8, 'peepoHappy': 0.7, 'Okayge': 0.4,
  'CoolCat': 0.5, 'CoolStoryBob': 0.3, 'FeelsGoodMan': 0.7, 'FeelsAmazingMan': 0.8,
  'catJAM': 0.6, 'JAM': 0.6, 'PauseChamp': 0.4, 'MonkaS': -0.3,

  // Negative emotes
  'BibleThump': -0.5, 'FeelsBadMan': -0.6, 'FeelsWeirdMan': -0.4, 'WeirdChamp': -0.5,
  'PepeHands': -0.7, 'Sadge': -0.6, 'FeelsDankMan': -0.3, 'monkaW': -0.5,
  'monkaS': -0.4, 'ResidentSleeper': -0.4, 'DansGame': -0.3,
  'NotLikeThis': -0.5, 'FailFish': -0.4, 'SMOrc': -0.2, 'TriHard': 0.3,
  'KappaPride': 0.5, 'VoHiYo': 0.4, 'SourPls': 0.5, 'RareParrot': 0.6
};

// Performance optimization: cache results for repeated messages
const sentimentCache = new Map<string, SentimentResult>();
const MAX_CACHE_SIZE = 500;

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  magnitude: number; // Intensity
}

/**
 * Analyzes sentiment of a chat message with performance optimization
 * @param message The message text to analyze
 * @returns Sentiment analysis result
 */
export function analyzeSentiment(message: string): SentimentResult {
  if (!message || message.trim().length === 0) {
    return {
      score: 0,
      label: 'neutral',
      confidence: 1,
      magnitude: 0
    };
  }

  // Check cache first
  const cacheKey = message.toLowerCase().trim();
  if (sentimentCache.has(cacheKey)) {
    return sentimentCache.get(cacheKey)!;
  }

  // Analyze sentiment
  const result = performSentimentAnalysis(message);

  // Update cache (with size limit)
  if (sentimentCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (first key)
    const firstKey = sentimentCache.keys().next().value;
    sentimentCache.delete(firstKey);
  }
  sentimentCache.set(cacheKey, result);

  return result;
}

/**
 * Core sentiment analysis algorithm
 */
function performSentimentAnalysis(message: string): SentimentResult {
  const text = message.toLowerCase();
  const words = text.split(/\s+/);

  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let totalWords = 0;

  // Track negation context
  let negationWindow = 0;
  let intensifierMultiplier = 1;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w\s'-]/g, ''); // Remove punctuation except apostrophes and hyphens

    if (word.length === 0) continue;
    totalWords++;

    // Check for negation
    if (NEGATIONS.has(word)) {
      negationWindow = 3; // Next 3 words are negated
      continue;
    }

    // Check for intensifiers
    if (INTENSIFIERS.has(word)) {
      intensifierMultiplier = 1.5;
      continue;
    }

    // Calculate word sentiment
    let wordScore = 0;

    if (POSITIVE_WORDS.has(word)) {
      wordScore = 1;
      positiveCount++;
    } else if (NEGATIVE_WORDS.has(word)) {
      wordScore = -1;
      negativeCount++;
    }

    // Apply negation (flip sentiment)
    if (negationWindow > 0) {
      wordScore *= -0.8; // Negation doesn't completely flip, just reduces
      negationWindow--;
    }

    // Apply intensifier
    wordScore *= intensifierMultiplier;
    intensifierMultiplier = 1; // Reset intensifier

    score += wordScore;
  }

  // Check for emotes
  const emoteScore = analyzeEmotes(message);
  score += emoteScore;

  // Check for all caps (often excitement or anger)
  if (message === message.toUpperCase() && message.length > 3 && /[A-Z]/.test(message)) {
    // Amplify existing sentiment
    score *= 1.3;
  }

  // Check for repeated punctuation (!!!, ???, ...)
  const exclamationCount = (message.match(/!/g) || []).length;
  const questionCount = (message.match(/\?/g) || []).length;

  if (exclamationCount > 1) {
    score *= 1.2; // Amplify sentiment
  }

  // Normalize score
  const maxPossible = Math.max(totalWords, 1) * 1.5;
  let normalizedScore = score / maxPossible;

  // Clamp between -1 and 1
  normalizedScore = Math.max(-1, Math.min(1, normalizedScore));

  // Calculate magnitude (intensity)
  const magnitude = Math.abs(normalizedScore);

  // Calculate confidence based on word count and clarity
  const wordCount = Math.min(totalWords, 20);
  const sentimentWordRatio = (positiveCount + negativeCount) / Math.max(totalWords, 1);
  const confidence = Math.min(
    1,
    (wordCount / 20) * 0.6 + sentimentWordRatio * 0.4
  );

  // Determine label
  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.15) {
    label = 'positive';
  } else if (normalizedScore < -0.15) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return {
    score: normalizedScore,
    label,
    confidence,
    magnitude
  };
}

/**
 * Analyzes emotes in the message for sentiment
 */
function analyzeEmotes(message: string): number {
  let emoteScore = 0;
  let emoteCount = 0;

  for (const [emote, score] of Object.entries(EMOTE_SENTIMENT)) {
    // Case-insensitive emote matching
    const regex = new RegExp(`\\b${emote}\\b`, 'gi');
    const matches = message.match(regex);
    if (matches) {
      emoteScore += score * matches.length;
      emoteCount += matches.length;
    }
  }

  // Emoji sentiment (basic)
  const positiveEmojis = message.match(/[😊😄😃😀🙂😍🥰😻💕❤️🔥💯✨🎉👏🙌]/g);
  const negativeEmojis = message.match(/[😢😭😞😔😟😠😡💀☠️👎]/g);

  if (positiveEmojis) {
    emoteScore += positiveEmojis.length * 0.5;
    emoteCount += positiveEmojis.length;
  }

  if (negativeEmojis) {
    emoteScore -= negativeEmojis.length * 0.5;
    emoteCount += negativeEmojis.length;
  }

  // Normalize emote score
  if (emoteCount > 0) {
    return emoteScore / Math.max(emoteCount, 1);
  }

  return 0;
}

/**
 * Clears the sentiment cache (useful for memory management)
 */
export function clearSentimentCache(): void {
  sentimentCache.clear();
}

/**
 * Gets cache statistics for debugging/monitoring
 */
export function getCacheStats() {
  return {
    size: sentimentCache.size,
    maxSize: MAX_CACHE_SIZE
  };
}

/**
 * Batch analyze multiple messages (more efficient for bulk operations)
 */
export function batchAnalyzeSentiment(messages: string[]): SentimentResult[] {
  return messages.map(msg => analyzeSentiment(msg));
}

/**
 * Get sentiment color for UI display
 */
export function getSentimentColor(sentiment: SentimentResult): string {
  const { label, magnitude } = sentiment;

  if (label === 'positive') {
    // Green shades based on magnitude
    if (magnitude > 0.7) return '#10b981'; // Strong positive - emerald-500
    if (magnitude > 0.4) return '#34d399'; // Medium positive - emerald-400
    return '#6ee7b7'; // Light positive - emerald-300
  }

  if (label === 'negative') {
    // Red shades based on magnitude
    if (magnitude > 0.7) return '#ef4444'; // Strong negative - red-500
    if (magnitude > 0.4) return '#f87171'; // Medium negative - red-400
    return '#fca5a5'; // Light negative - red-300
  }

  // Neutral - gray
  return '#9ca3af'; // gray-400
}

/**
 * Get sentiment emoji indicator
 */
export function getSentimentEmoji(sentiment: SentimentResult): string {
  const { label, magnitude } = sentiment;

  if (label === 'positive') {
    if (magnitude > 0.7) return '😄';
    if (magnitude > 0.4) return '🙂';
    return '😊';
  }

  if (label === 'negative') {
    if (magnitude > 0.7) return '😠';
    if (magnitude > 0.4) return '😟';
    return '😐';
  }

  return '😐';
}
