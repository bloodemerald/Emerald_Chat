import { memo } from "react";
import { Reply, Shield } from "lucide-react";
import { Message, ChatSettings } from "@/types/personality";
import { PERSONALITIES } from "@/lib/personalities";
import { renderEmotes } from "@/lib/emotes";
import HeartLike from "./HeartLike";
import { BadgeList } from "./badges/BadgeList";
import { MessageReplyIndicator } from "./MessageReplyIndicator";
import { ModeratorControls } from "./ModeratorControls";

interface ChatPersonalityProps {
  message: Message;
  settings?: ChatSettings;
  onLike?: (messageId: string) => void;
  onReply?: (messageId: string, username: string, message: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  onViewHistory?: (username: string) => void;
  onViewProfile?: (username: string) => void;
}

export const ChatPersonality = memo(({ message, settings, onLike, onReply, onJumpToMessage, onViewHistory, onViewProfile }: ChatPersonalityProps) => {
  const personality = message.personality ? PERSONALITIES[message.personality] : null;

  const handleLike = () => {
    if (onLike) {
      onLike(message.id);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message.id, message.username, message.message);
    }
  };

  const handleJumpToReply = () => {
    if (onJumpToMessage && message.replyToId) {
      onJumpToMessage(message.replyToId);
    }
  };

  const showTimestamps = settings?.showTimestamps !== false;
  
  // Determine if this message should have a bubble (6+ likes)
  const isPopular = (message.likes ?? 0) >= 6;

  const containerClasses = isPopular
    ? `mb-2 bg-white rounded-[12px] card-shadow group hover:shadow-lg transition-all duration-300 px-4 py-3 animate-in fade-in slide-in-from-left-2 mx-2 md:mx-0`
    : `mb-1 group hover:bg-gray-50/50 transition-all duration-200 px-3 py-2 mx-2 md:mx-0 md:px-2 md:py-1.5`;

  return (
    <div className={containerClasses}>
      {/* Reply indicator */}
      {message.replyToId && message.replyToUsername && message.replyToMessage && (
        <MessageReplyIndicator
          replyToUsername={message.replyToUsername}
          replyToMessage={message.replyToMessage}
          onJumpTo={handleJumpToReply}
          compact
        />
      )}

      <div className="flex items-start gap-2">
        <div className="flex-shrink-0">
          {personality && (
            <span className={`${isPopular ? 'text-xl' : 'text-base'} opacity-80 group-hover:opacity-100 transition-all duration-300`}>
              {personality.emoji}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Badges */}
            {message.badges && message.badges.length > 0 && (
              <BadgeList badges={message.badges} size="sm" maxDisplay={3} />
            )}

            <span
              className="font-bold text-sm"
              style={{ color: message.isModerator ? 'hsl(var(--primary))' : message.color }}
            >
              {message.username}
            </span>

            {message.isModerator && (
              <span className="text-[8px] px-1.5 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded font-bold uppercase">
                MOD
              </span>
            )}

            {showTimestamps && (
              <span className="text-[9px] text-muted-foreground font-mono">
                {message.timestamp}
              </span>
            )}

            <span className="text-sm text-foreground break-words leading-relaxed">
              {renderEmotes(message.message)}
            </span>
          </div>

          {/* Thread count indicator */}
          {message.threadCount && message.threadCount > 0 && (
            <div className="text-xs text-purple-600 font-semibold mt-1">
              💬 {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 items-center opacity-60 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 relative">
          {/* Moderator controls */}
          {!message.isModerator && onViewHistory && onViewProfile && (
            <ModeratorControls
              message={message}
              onViewHistory={onViewHistory}
              onViewProfile={onViewProfile}
            >
              <button
                className="p-1.5 hover:bg-emerald-100 rounded transition-colors"
                aria-label="Moderator controls"
                title="Moderator controls"
              >
                <Shield className="w-4 h-4 text-emerald-600" />
              </button>
            </ModeratorControls>
          )}

          {/* Reply button */}
          {onReply && (
            <button
              onClick={handleReply}
              className="p-1.5 hover:bg-purple-100 rounded transition-colors"
              aria-label="Reply to message"
              title="Reply"
            >
              <Reply className="w-4 h-4 text-purple-600" />
            </button>
          )}

          <HeartLike
            messageId={message.id}
            initialLikes={message.likes ?? 0}
            onLike={handleLike}
            likedBy={message.likedBy ?? []}
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.likes === nextProps.message.likes &&
         prevProps.message.threadCount === nextProps.message.threadCount &&
         JSON.stringify(prevProps.message.likedBy) === JSON.stringify(nextProps.message.likedBy);
});
