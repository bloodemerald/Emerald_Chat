import { X } from 'lucide-react';
import { memo } from 'react';

interface MessageReplyIndicatorProps {
  replyToUsername: string;
  replyToMessage: string;
  onClear?: () => void;
  onJumpTo?: () => void;
  compact?: boolean;
}

/**
 * Shows a reply indicator above a message or in the input area
 * Twitch-style reply UI
 */
export const MessageReplyIndicator = memo(({ 
  replyToUsername, 
  replyToMessage, 
  onClear, 
  onJumpTo,
  compact = false 
}: MessageReplyIndicatorProps) => {
  const maxLength = compact ? 50 : 100;
  const truncatedMessage = replyToMessage.length > maxLength 
    ? replyToMessage.slice(0, maxLength) + '...' 
    : replyToMessage;

  return (
    <div className={`flex items-start gap-2 px-3 py-1.5 bg-gray-100 border-l-2 border-purple-500 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Reply Icon */}
      <span className="text-purple-500 flex-shrink-0 mt-0.5">↩️</span>
      
      <div className="flex-1 min-w-0">
        <div 
          className={`cursor-pointer hover:underline ${compact ? 'space-y-0' : 'space-y-1'}`}
          onClick={onJumpTo}
        >
          <div className="text-muted-foreground">
            Replying to <span className="font-semibold text-purple-600">@{replyToUsername}</span>
          </div>
          <div className="text-gray-600 truncate italic">
            "{truncatedMessage}"
          </div>
        </div>
      </div>

      {/* Clear button */}
      {onClear && (
        <button
          onClick={onClear}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Clear reply"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
});

MessageReplyIndicator.displayName = 'MessageReplyIndicator';
