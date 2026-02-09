import { memo } from "react";
import { Reply, Shield } from "lucide-react";
import { Message, ChatSettings } from "@/types/personality";
import { PERSONALITIES } from "@/lib/personalities";
import { renderEmotes } from "@/lib/emotes";
import HeartLike from "./HeartLike";
import { BadgeList } from "./badges/BadgeList";
import { MessageReplyIndicator } from "./MessageReplyIndicator";
import { ModeratorControls } from "./ModeratorControls";
import { moderatorManager } from "@/lib/moderators";
import { getSentimentColor, getSentimentEmoji } from "@/lib/sentimentAnalysis";

interface ChatPersonalityProps {
  message: Message;
  settings?: ChatSettings;
  onLike?: (messageId: string) => void;
  onReply?: (messageId: string, username: string, message: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  onViewHistory?: (username: string) => void;
  onViewProfile?: (username: string) => void;
  isMostPopular?: boolean; // Only THE most liked message gets bubble treatment
  isLofiMode?: boolean;
  isNew?: boolean; // Whether this is a newly added message (for entrance animation)
  isHighlighted?: boolean; // Whether this message should be highlighted (e.g., after jump-to)
  animationStyle?: 'bottom' | 'right' | 'left'; // Slide-in animation direction
}

export const ChatPersonality = memo(({
  message,
  settings,
  onLike,
  onReply,
  onJumpToMessage,
  onViewHistory,
  onViewProfile,
  isMostPopular = false,
  isLofiMode = false,
  isNew = false,
  isHighlighted = false,
  animationStyle = 'bottom'
}: ChatPersonalityProps) => {
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

  // Only THE single most liked message gets the bubble (passed from parent)
  const isPopular = isMostPopular;

  // Check if user is a moderator
  const isModerator = moderatorManager.isModeratorByUsername(message.username);

  // Check if effect is still active
  const isEffectActive = message.redemptionEffect &&
                        message.effectExpiry &&
                        message.effectExpiry > Date.now();

  // Sentiment highlighting
  const shouldHighlightPositive = settings?.highlightPositive &&
                                  message.sentiment?.label === 'positive';
  const shouldHighlightNegative = settings?.highlightNegative &&
                                  message.sentiment?.label === 'negative';
  
  // Apply channel point effect styling
  let effectClasses = '';
  let messageStyle: React.CSSProperties = {};
  let usernameStyle: React.CSSProperties = { color: message.color };
  const displayPersonality = personality;
  
  if (isEffectActive && message.redemptionEffect) {
    switch (message.redemptionEffect.type) {
      case 'highlight_bomb':
        effectClasses = 'animate-pulse bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 border-4 border-yellow-500 shadow-2xl shadow-yellow-400/50 scale-105';
        break;
      case 'color_blast':
        usernameStyle = {
          background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          fontSize: '1.2em'
        };
        break;
      case 'personality_swap':
        // Bold lettering effect - make entire message bold and larger
        messageStyle = {
          fontWeight: '900',
          fontSize: '1.15em',
          letterSpacing: '0.5px',
          textShadow: '0 0 10px rgba(0,0,0,0.1)'
        };
        break;
      case 'super_like':
        // Shaking effect for super liked messages
        effectClasses = 'animate-shake bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-400 shadow-lg';
        break;
    }
  }

  // Apply sentiment highlighting (if no effect is active)
  if (!isEffectActive) {
    if (shouldHighlightPositive) {
      effectClasses = 'bg-emerald-50 border-l-2 border-emerald-400';
    } else if (shouldHighlightNegative) {
      effectClasses = 'bg-red-50 border-l-2 border-red-400';
    }
  }
  
  // Animation classes based on props
  const getAnimationClass = () => {
    if (!isNew) return '';
    switch (animationStyle) {
      case 'right': return 'chat-message-slide-right';
      case 'left': return 'chat-message-slide-left';
      default: return 'chat-message-enter';
    }
  };

  const highlightClass = isHighlighted ? 'message-jump-highlight' : (isNew ? 'message-new-highlight' : '');
  const animationClass = getAnimationClass();

  // Twitch-style flat design - minimal padding, no rounded corners on normal messages
  const containerClasses = isPopular
    ? `mb-2 ${isLofiMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} rounded-lg border group hover:shadow-md transition-all duration-300 px-3 py-2.5 ${animationClass} ${highlightClass} ${
        isModerator ? 'border-2 border-yellow-400 shadow-sm shadow-yellow-100' : ''
      } ${effectClasses}`
    : `mb-0 group ${isLofiMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100/30'} transition-colors duration-150 px-2 py-1 ${animationClass} ${highlightClass} ${
        isModerator ? 'border-l-2 border-yellow-400' : ''
      } ${effectClasses}`;

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

      <div className="flex items-start gap-1.5">
        <div className="flex-shrink-0">
          {displayPersonality && (
            <span className={`${isPopular ? 'text-base' : 'text-sm'} opacity-70`}>
              {displayPersonality.emoji}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Badges */}
            {message.badges && message.badges.length > 0 && (
              <BadgeList badges={message.badges} size="xs" maxDisplay={5} />
            )}

            <span
              className="font-bold text-sm cursor-pointer hover:underline transition-all"
              style={message.isModerator ? { color: 'hsl(var(--primary))' } : usernameStyle}
              onClick={() => onViewProfile?.(message.username)}
              title="View profile"
            >
              {message.username}
            </span>

            {/* Bit Cheer Badge - Only show if > 0 bits */}
            {(message.bits ?? 0) > 0 && (
              <span 
                className="text-[10px] px-1.5 py-0.5 text-white rounded font-bold animate-pulse"
                style={{ 
                  backgroundColor: message.cheerTier?.badgeColor || '#9147ff',
                  boxShadow: '0 0 8px rgba(145, 71, 255, 0.5)'
                }}
                title={`Cheered ${message.bits} bits`}
              >
                💎 {message.bits}
              </span>
            )}

            {message.isModerator && (
              <span className="text-[8px] px-1.5 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded font-bold uppercase">
                MOD
              </span>
            )}

            {showTimestamps && (
              <span className={`text-[9px] font-mono ${isLofiMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                {message.timestamp}
              </span>
            )}

            {/* Sentiment indicator */}
            {settings?.showSentimentIndicators && message.sentiment && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5"
                style={{
                  backgroundColor: `${getSentimentColor(message.sentiment)}20`,
                  color: getSentimentColor(message.sentiment),
                  border: `1px solid ${getSentimentColor(message.sentiment)}40`
                }}
                title={`Sentiment: ${message.sentiment.label} (${(message.sentiment.score * 100).toFixed(0)}% confidence: ${(message.sentiment.confidence * 100).toFixed(0)}%)`}
              >
                <span>{getSentimentEmoji(message.sentiment)}</span>
                <span className="uppercase">{message.sentiment.label.slice(0, 3)}</span>
              </span>
            )}

            <span className={`text-sm break-words leading-relaxed ${isLofiMode ? 'text-slate-100' : 'text-foreground'}`} style={messageStyle}>
              {renderEmotes(message.message)}
            </span>
          </div>

          {/* Thread count indicator */}
          {message.threadCount && message.threadCount > 0 && (
            <div className="text-xs text-purple-600 font-semibold mt-1">
              💬 {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
            </div>
          )}

          {/* Channel Point Effect Indicator */}
          {isEffectActive && message.redemptionEffect && (
            <div className="text-[10px] text-purple-600 font-bold mt-1 flex items-center gap-1">
              <span>⚡</span>
              <span>
                {message.redemptionEffect.type === 'highlight_bomb' && '💥 HIGHLIGHT BOMB ACTIVE'}
                {message.redemptionEffect.type === 'color_blast' && '🎨 COLOR BLAST ACTIVE'}
                {message.redemptionEffect.type === 'personality_swap' && '💪 BOLD BLAST ACTIVE'}
                {message.redemptionEffect.type === 'super_like' && '⭐ SUPER LIKED!'}
              </span>
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
