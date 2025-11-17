import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Settings, Play, Square, RotateCcw } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { MessageReplyIndicator } from "./MessageReplyIndicator";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  isGenerating?: boolean;
  isPopoutOpen?: boolean;
  onToggleSettings?: () => void;
  onOpenPopout?: () => void;
  onPlayStop?: () => void;
  onClearChat?: () => void;
  replyingTo?: {
    username: string;
    message: string;
  } | null;
  onClearReply?: () => void;
  isLofiMode?: boolean;
  onToggleLofiMode?: () => void;
}

const styles = `
  /* Toggle Switch Styles - Scaled down to match other buttons */
  .toggle {
    display: inline-block;
    position: relative;
    height: 32px;
    width: 32px;
  }

  .toggle:before {
    box-shadow: 0;
    border-radius: 27px;
    background: #fff;
    position: absolute;
    margin-left: -11.5px;
    margin-top: -11.5px;
    opacity: 0.2;
    height: 23px;
    width: 23px;
    left: 50%;
    top: 50%;
  }

  .toggle .button {
    transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: 0 4.8px 8px -1.3px rgba(0, 0, 0, 0.5), inset 0 -1px 1.3px -0.3px rgba(0, 0, 0, 0.2), 0 -3.2px 4.8px -0.3px rgba(255, 255, 255, 0.6), inset 0 1px 1.3px -0.3px rgba(255, 255, 255, 0.2), inset 0 0 1.6px 0.3px rgba(255, 255, 255, 0.8), inset 0 6.4px 9.6px 0 rgba(255, 255, 255, 0.2);
    border-radius: 22px;
    position: absolute;
    background: #eaeaea;
    margin-left: -11px;
    margin-top: -11px;
    display: block;
    height: 22px;
    width: 22px;
    left: 50%;
    top: 50%;
  }

  .toggle .label {
    transition: color 300ms ease-out;
    line-height: 32px;
    text-align: center;
    position: absolute;
    font-weight: 700;
    font-size: 9px;
    display: block;
    opacity: 0.9;
    height: 100%;
    width: 100%;
    color: rgba(0, 0, 0, 0.9);
  }

  .toggle input {
    opacity: 0;
    position: absolute;
    cursor: pointer;
    z-index: 1;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
  }

  .toggle input:active ~ .button {
    filter: blur(0.5px);
    box-shadow: 0 3.8px 8px -1.3px rgba(0, 0, 0, 0.4), inset 0 -2.6px 9.6px 0.3px rgba(255, 255, 255, 0.9), 0 -3.2px 4.8px -0.3px rgba(255, 255, 255, 0.6), inset 0 2.6px 8px 0 rgba(0, 0, 0, 0.4), inset 0 0 3.2px 0.3px rgba(255, 255, 255, 0.6);
  }

  .toggle input:active ~ .label {
    font-size: 8px;
    color: rgba(0, 0, 0, 0.45);
  }

  .toggle input:checked ~ .button {
    filter: blur(0.5px);
    box-shadow: 0 3.2px 8px -1.3px rgba(0, 0, 0, 0.4), inset 0 -2.6px 8px -0.3px rgba(255, 255, 255, 0.9), 0 -3.2px 4.8px -0.3px rgba(255, 255, 255, 0.6), inset 0 2.6px 6.4px 0 rgba(0, 0, 0, 0.2), inset 0 0 1.6px 0.3px rgba(255, 255, 255, 0.6);
  }

  .toggle input:checked ~ .label {
    color: rgba(0, 0, 0, 0.8);
  }

  .toggle input:checked ~ .button {
    background: #10b981;
  }

  /* Smaller action buttons to match */
  .action-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .action-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .action-button svg {
    width: 16px;
    height: 16px;
  }
`;

export const ChatInput = ({
  onSendMessage,
  placeholder = "Chat as moderator...✦",
  disabled = false,
  autoFocus = false,
  isGenerating = false,
  onToggleSettings,
  onPlayStop,
  onClearChat,
  replyingTo,
  onClearReply,
  isLofiMode = false,
  onToggleLofiMode,
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [isToggleOn, setIsToggleOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    onSendMessage(trimmed);
    setValue("");
    setIsToggleOn(false);
  };

  const handleToggle = () => {
    if (!value.trim() || disabled) {
      setIsToggleOn(false);
      return;
    }
    handleSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = value.length > MAX_MESSAGE_LENGTH;

  return (
    <>
      <style>{styles}</style>
      <div className="flex flex-col w-full">
        {/* Reply Indicator */}
        {replyingTo && (
          <div className="mb-2">
            <MessageReplyIndicator
              replyToUsername={replyingTo.username}
              replyToMessage={replyingTo.message}
              onClear={onClearReply}
            />
          </div>
        )}

        {/* Main Chat Container - Single Line */}
        <div className="relative rounded-[12px] overflow-hidden bg-white">
          {/* Inner Container */}
          <div className="flex items-center gap-3 bg-gray-50 backdrop-blur-sm border border-gray-200 px-3 py-2.5">
            {/* Single Line Input */}
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={MAX_MESSAGE_LENGTH + 50}
              className={`flex-1 bg-transparent text-sm font-normal outline-none border-none placeholder:transition-colors ${
                isLofiMode 
                  ? "text-slate-100 placeholder:text-slate-400 focus:placeholder:text-slate-500" 
                  : "text-foreground placeholder:text-muted-foreground focus:placeholder:text-muted-foreground/50"
              }`}
              aria-label="Moderator message input"
              aria-invalid={isOverLimit}
            />

            {/* Action Buttons - Consistent 32px size */}
            <div className="flex gap-2 items-center">
              {/* Settings Button */}
              <button
                type="button"
                onClick={onToggleSettings}
                className={`action-button ${
                  isLofiMode 
                    ? "text-slate-400 hover:text-slate-200" 
                    : "text-gray-400 hover:text-gray-700"
                }`}
                aria-label="Settings"
              >
                <Settings />
              </button>

              {/* Lofi Mode Button (replaces Popout) */}
              <button
                type="button"
                onClick={onToggleLofiMode}
                className={`action-button ${
                  isLofiMode
                    ? "text-emerald-500 bg-emerald-50 border-emerald-300"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                aria-label={isLofiMode ? "Disable lofi mode" : "Enable lofi mode"}
              >
                <span className="text-[11px] font-semibold">Lofi</span>
              </button>

              {/* Play/Stop Button */}
              <button
                type="button"
                onClick={onPlayStop}
                className={`action-button ${
                  isGenerating
                    ? "text-red-500 hover:text-red-600"
                    : isLofiMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                aria-label={isGenerating ? "Stop generation" : "Start generation"}
              >
                {isGenerating ? <Square /> : <Play />}
              </button>

              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={onClearChat}
                className={`action-button ${
                  isLofiMode 
                    ? "text-slate-400 hover:text-orange-400" 
                    : "text-gray-400 hover:text-orange-500"
                }`}
                aria-label="Clear chat and reset context"
                title="Clear chat and reset context"
              >
                <RotateCcw />
              </button>

              {/* Toggle Send Button */}
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={isToggleOn}
                  onChange={handleToggle}
                  disabled={!value.trim() || disabled}
                />
                <div className="button"></div>
                <div className="label">➤</div>
              </label>
            </div>
          </div>
        </div>

        {/* Character Counter */}
        {value.length > 0 && (
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs font-semibold ${
                isOverLimit
                  ? "text-red-500"
                  : value.length > MAX_MESSAGE_LENGTH - 20
                    ? "text-yellow-600"
                    : "text-muted-foreground"
              }`}
            >
              {isOverLimit
                ? `${value.length - MAX_MESSAGE_LENGTH} over limit`
                : `${MAX_MESSAGE_LENGTH - value.length} remaining`}
            </span>
          </div>
        )}
      </div>
    </>
  );
};
