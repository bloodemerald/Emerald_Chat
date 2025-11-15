import React, { useState, useEffect } from 'react';
import { Poll, PollOption } from '@/types/polls';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trophy, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PollMessageProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  hasVoted: boolean;
  userVote?: string; // Option ID the user voted for
}

export const PollMessage: React.FC<PollMessageProps> = ({
  poll,
  onVote,
  hasVoted,
  userVote
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isEnded, setIsEnded] = useState(poll.status === 'ended');

  // Update time remaining
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, poll.endsAt - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0 && !isEnded) {
        setIsEnded(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poll.endsAt, isEnded]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const getPercentage = (votes: number): number => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const winningOption = poll.options.reduce((prev, current) =>
    current.votes > prev.votes ? current : prev
  );

  const handleVote = (optionId: string) => {
    if (!hasVoted && !isEnded) {
      onVote(poll.id, optionId);
    }
  };

  return (
    <div className="mb-4 mx-2 md:mx-0">
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-left-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
              Poll by {poll.createdBy}
            </span>
          </div>

          {/* Timer/Status */}
          <div>
            {isEnded ? (
              <Badge variant="outline" className="border-red-500 text-red-400 bg-red-900/20">
                <Trophy className="w-3 h-3 mr-1" />
                Ended
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-900/20">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl font-bold text-white mb-6">
          {poll.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = getPercentage(option.votes);
            const isWinner = isEnded && winningOption.id === option.id;
            const isUserVote = userVote === option.id;

            return (
              <div key={option.id} className="relative">
                <Button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || isEnded}
                  className={cn(
                    "w-full h-auto py-4 px-4 text-left relative overflow-hidden transition-all duration-300",
                    "border-2 rounded-lg",
                    hasVoted || isEnded
                      ? "cursor-default"
                      : "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
                    isWinner && "ring-2 ring-yellow-400 border-yellow-400",
                    isUserVote && "border-white",
                    !isUserVote && !isWinner && "border-gray-600"
                  )}
                  style={{
                    background: `linear-gradient(90deg, ${option.color}40 ${percentage}%, transparent ${percentage}%)`,
                    borderColor: isWinner ? '#FFD700' : isUserVote ? '#FFFFFF' : option.color,
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isWinner && (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      )}
                      <span className="font-semibold text-white text-base">
                        {option.text}
                      </span>
                      {isUserVote && (
                        <Badge variant="outline" className="border-white text-white text-xs">
                          Your vote
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">
                        {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                      </span>
                      <span
                        className="text-lg font-bold text-white min-w-[3.5rem] text-right"
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-4 pt-4 border-t border-purple-500/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Total Votes: <span className="text-white font-semibold">{poll.totalVotes}</span>
            </span>
            {isEnded && winningOption && (
              <span className="text-yellow-400 font-semibold flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Winner: {winningOption.text}
              </span>
            )}
            {!hasVoted && !isEnded && (
              <span className="text-emerald-400 font-semibold">
                Click to vote!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollMessage;
