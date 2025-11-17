import { useState } from "react";
import { Pin, ChevronDown, ChevronUp, X } from "lucide-react";
import { Message } from "@/types/personality";
import { renderEmotes } from "@/lib/emotes";

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin: (messageId: string) => void;
  onJumpToMessage: (messageId: string) => void;
  isLofiMode?: boolean;
}

export const PinnedMessages = ({ messages, onUnpin, onJumpToMessage, isLofiMode = false }: PinnedMessagesProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (messages.length === 0) return null;

  return (
    <div className={`border-b shadow-sm ${isLofiMode ? 'bg-slate-800 border-slate-700' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-yellow-600" />
            <span className={`text-sm font-semibold ${isLofiMode ? 'text-slate-200' : 'text-yellow-900'}`}>
              Pinned Messages ({messages.length}/5)
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded hover:bg-yellow-100 transition-colors ${isLofiMode ? 'hover:bg-slate-700' : ''}`}
            aria-label={isCollapsed ? "Expand pinned messages" : "Collapse pinned messages"}
          >
            {isCollapsed ? (
              <ChevronDown className={`w-4 h-4 ${isLofiMode ? 'text-slate-400' : 'text-yellow-700'}`} />
            ) : (
              <ChevronUp className={`w-4 h-4 ${isLofiMode ? 'text-slate-400' : 'text-yellow-700'}`} />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 p-2 rounded-lg group ${
                  isLofiMode
                    ? 'bg-slate-700 hover:bg-slate-650'
                    : 'bg-white hover:bg-yellow-100'
                } transition-colors cursor-pointer`}
                onClick={() => onJumpToMessage(msg.id)}
              >
                <Pin className="w-3 h-3 text-yellow-600 fill-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold text-xs"
                      style={{ color: msg.color }}
                    >
                      {msg.username}
                    </span>
                    <span className={`text-[9px] font-mono ${isLofiMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm break-words line-clamp-2 ${isLofiMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    {renderEmotes(msg.message)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(msg.id);
                  }}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    isLofiMode
                      ? 'hover:bg-slate-600'
                      : 'hover:bg-yellow-200'
                  }`}
                  aria-label="Unpin message"
                  title="Unpin"
                >
                  <X className={`w-3 h-3 ${isLofiMode ? 'text-slate-400' : 'text-yellow-700'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
