/**
 * Poll option with voting data
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedBy: string[]; // Usernames who voted for this option
  color: string; // Visual color for this option
}

/**
 * Poll status
 */
export type PollStatus = 'active' | 'ended';

/**
 * Poll data structure
 */
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: number;
  duration: number; // Duration in seconds
  endsAt: number; // Timestamp when poll ends
  status: PollStatus;
  totalVotes: number;
  winnerId?: string; // ID of the winning option (set when poll ends)
}

/**
 * Poll message - a special message type for polls
 * This extends the regular Message type
 */
export interface PollMessage {
  id: string;
  type: 'poll';
  poll: Poll;
  timestamp: string;
  isModerator: true;
}

/**
 * Vote record for tracking
 */
export interface VoteRecord {
  pollId: string;
  username: string;
  optionId: string;
  timestamp: number;
}

/**
 * Poll duration presets (in seconds)
 */
export const POLL_DURATIONS = {
  '30s': 30,
  '1m': 60,
  '2m': 120,
  '5m': 300,
  '10m': 600,
} as const;

export type PollDuration = keyof typeof POLL_DURATIONS;

/**
 * Poll option colors (Twitch-style)
 */
export const POLL_OPTION_COLORS = [
  '#9147FF', // Purple (Twitch primary)
  '#F1416C', // Pink/Red
  '#00E096', // Green
  '#FFA500', // Orange
  '#00B8D4', // Cyan
  '#FFD700', // Gold
] as const;

/**
 * Quick poll templates for easy creation
 */
export interface PollTemplate {
  question: string;
  options: string[];
}

export const POLL_TEMPLATES: Record<string, PollTemplate> = {
  color: {
    question: 'Which color is better?',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
  },
  whatNext: {
    question: 'What should I do next?',
    options: ['Keep going', 'Try something new', 'Take a break', 'Chat decides'],
  },
  rating: {
    question: 'How was that?',
    options: ['Amazing!', 'Pretty good', 'Okay', 'Could be better'],
  },
  yesNo: {
    question: 'Should I do it?',
    options: ['Yes!', 'No way', 'Maybe?'],
  },
  game: {
    question: 'Which game next?',
    options: ['Game 1', 'Game 2', 'Game 3', 'Chat decides'],
  },
};
