interface ChatMessageProps {
  username: string;
  color: string;
  message: string;
  timestamp: string;
  isModerator?: boolean;
}

export const ChatMessage = ({ username, color, message, timestamp, isModerator }: ChatMessageProps) => {
  return (
    <div className="px-3 py-1.5 hover:bg-chat-hover transition-colors">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{timestamp}</span>
        <span 
          className="font-semibold text-sm"
          style={{ color: isModerator ? 'hsl(var(--moderator))' : color }}
        >
          {username}
        </span>
        <span className="text-sm text-foreground break-words">{message}</span>
      </div>
    </div>
  );
};
