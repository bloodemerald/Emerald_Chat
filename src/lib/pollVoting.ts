import { Poll, PollOption } from '@/types/polls';
import { userPool } from './userPool';
import { PersonalityType } from '@/types/personality';

interface ScheduledVote {
  pollId: string;
  username: string;
  optionId: string;
  scheduledTime: number;
  timeout: NodeJS.Timeout;
}

/**
 * Manages AI voting in polls based on personality traits
 */
export class PollVotingManager {
  private scheduledVotes: Map<string, ScheduledVote[]> = new Map();
  private onVoteCallback: ((pollId: string, username: string, optionId: string) => void) | null = null;

  /**
   * Start the poll voting system
   */
  start(onVote: (pollId: string, username: string, optionId: string) => void) {
    this.onVoteCallback = onVote;
    console.log('🗳️ Poll voting system started');
  }

  /**
   * Stop and clear all scheduled votes
   */
  stop() {
    this.scheduledVotes.forEach(votes => {
      votes.forEach(vote => clearTimeout(vote.timeout));
    });
    this.scheduledVotes.clear();
    this.onVoteCallback = null;
    console.log('🛑 Poll voting system stopped');
  }

  /**
   * Schedule votes for a new poll
   * AI users will vote based on their personalities
   */
  scheduleVotesForPoll(poll: Poll): void {
    if (!this.onVoteCallback) return;

    const activeUsers = userPool.getActiveUsers();
    if (activeUsers.length === 0) return;

    const scheduledVotes: ScheduledVote[] = [];

    activeUsers.forEach(user => {
      // Determine if this user will vote
      const voteProb ability = this.getVoteProbability(user.personality);
      if (Math.random() > voteProbability) return; // Skip this user

      // Choose which option to vote for
      const chosenOption = this.chooseOption(poll.options, user.personality);
      if (!chosenOption) return;

      // Calculate delay before voting (staggered over poll duration)
      const delay = this.calculateVoteDelay(poll.duration, user.personality);

      // Schedule the vote
      const timeout = setTimeout(() => {
        if (this.onVoteCallback) {
          this.onVoteCallback(poll.id, user.username, chosenOption.id);
        }

        // Remove from scheduled votes
        const votes = this.scheduledVotes.get(poll.id) || [];
        const index = votes.findIndex(v => v.username === user.username);
        if (index !== -1) {
          votes.splice(index, 1);
          if (votes.length === 0) {
            this.scheduledVotes.delete(poll.id);
          }
        }
      }, delay);

      scheduledVotes.push({
        pollId: poll.id,
        username: user.username,
        optionId: chosenOption.id,
        scheduledTime: Date.now() + delay,
        timeout
      });
    });

    if (scheduledVotes.length > 0) {
      this.scheduledVotes.set(poll.id, scheduledVotes);
      console.log(`🗳️ Scheduled ${scheduledVotes.length} votes for poll: ${poll.question}`);
    }
  }

  /**
   * Get probability that a user will vote based on personality
   */
  private getVoteProbability(personality?: PersonalityType): number {
    switch (personality) {
      case 'hype':
        return 0.95; // Hype users always participate
      case 'wholesome':
        return 0.90; // Wholesome users love engagement
      case 'meme':
        return 0.85; // Meme lords vote a lot
      case 'helpful':
        return 0.80; // Helpful users participate
      case 'analyst':
        return 0.75; // Analysts think before voting
      case 'backseat':
        return 0.70; // Backseat gamers have opinions
      case 'toxic':
        return 0.65; // Toxic users sometimes skip
      case 'spammer':
        return 0.60; // Spammers might skip
      case 'lurker':
        return 0.30; // Lurkers rarely vote
      default:
        return 0.60; // Default participation
    }
  }

  /**
   * Choose which option to vote for based on personality
   */
  private chooseOption(options: PollOption[], personality?: PersonalityType): PollOption | null {
    if (options.length === 0) return null;

    switch (personality) {
      case 'toxic':
        // Contrarian - pick the least popular option (or random if none voted yet)
        const leastPopular = options.reduce((prev, current) =>
          current.votes < prev.votes ? current : prev
        );
        return leastPopular.votes === 0 ? this.randomOption(options) : leastPopular;

      case 'hype':
        // Bandwagon - pick the most popular option (or first if none voted yet)
        const mostPopular = options.reduce((prev, current) =>
          current.votes > prev.votes ? current : prev
        );
        return mostPopular.votes === 0 ? options[0] : mostPopular;

      case 'analyst':
        // Logical - prefer options with specific keywords
        const logicalOptions = options.filter(opt =>
          /optimal|best|efficient|smart|logical|correct|right/i.test(opt.text)
        );
        return logicalOptions.length > 0
          ? this.randomOption(logicalOptions)
          : this.randomOption(options);

      case 'meme':
        // Funny - prefer humorous or extreme options
        const funnyOptions = options.filter(opt =>
          /lol|meme|dank|based|chad|pog|kek/i.test(opt.text.toLowerCase()) ||
          opt.text.includes('!') ||
          opt.text.includes('?!')
        );
        return funnyOptions.length > 0
          ? this.randomOption(funnyOptions)
          : this.randomOption(options);

      case 'wholesome':
        // Positive - prefer positive/wholesome options
        const positiveOptions = options.filter(opt =>
          /yes|love|amazing|great|good|wholesome|nice|kind/i.test(opt.text)
        );
        return positiveOptions.length > 0
          ? this.randomOption(positiveOptions)
          : this.randomOption(options);

      case 'helpful':
        // Balanced - tend toward middle or "maybe" options
        if (options.length >= 3) {
          return options[Math.floor(options.length / 2)];
        }
        return this.randomOption(options);

      case 'lurker':
        // Random - lurkers don't have strong opinions
        return this.randomOption(options);

      default:
        // Random weighted by current votes (follow the crowd slightly)
        return this.weightedRandomOption(options);
    }
  }

  /**
   * Get a random option from the list
   */
  private randomOption(options: PollOption[]): PollOption {
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get a random option weighted by current votes (popular options more likely)
   */
  private weightedRandomOption(options: PollOption[]): PollOption {
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    // If no votes yet, random
    if (totalVotes === 0) {
      return this.randomOption(options);
    }

    // Weight by votes + 1 (so zero-vote options still have a chance)
    const weights = options.map(opt => opt.votes + 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let random = Math.random() * totalWeight;

    for (let i = 0; i < options.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return options[i];
      }
    }

    return options[0];
  }

  /**
   * Calculate delay before user votes (staggered throughout poll duration)
   */
  private calculateVoteDelay(pollDuration: number, personality?: PersonalityType): number {
    const durationMs = pollDuration * 1000;

    let votingWindow: [number, number]; // [min%, max%] of poll duration

    switch (personality) {
      case 'hype':
        votingWindow = [0, 0.2]; // Vote immediately (0-20% of duration)
        break;
      case 'spam mer':
        votingWindow = [0, 0.3]; // Vote early (0-30%)
        break;
      case 'analyst':
        votingWindow = [0.5, 0.9]; // Vote late after analyzing (50-90%)
        break;
      case 'lurker':
        votingWindow = [0.6, 1.0]; // Vote very late if at all (60-100%)
        break;
      default:
        votingWindow = [0.1, 0.8]; // Vote throughout (10-80%)
    }

    const minDelay = durationMs * votingWindow[0];
    const maxDelay = durationMs * votingWindow[1];

    return minDelay + Math.random() * (maxDelay - minDelay);
  }

  /**
   * Cancel all votes for a poll
   */
  cancelVotesForPoll(pollId: string): void {
    const votes = this.scheduledVotes.get(pollId);
    if (votes) {
      votes.forEach(vote => clearTimeout(vote.timeout));
      this.scheduledVotes.delete(pollId);
    }
  }

  /**
   * Get info about scheduled votes (for debugging)
   */
  getScheduledVotesInfo(): { pollId: string; count: number }[] {
    const info: { pollId: string; count: number }[] = [];

    this.scheduledVotes.forEach((votes, pollId) => {
      info.push({
        pollId,
        count: votes.length
      });
    });

    return info;
  }
}

// Export singleton
export const pollVoting = new PollVotingManager();
