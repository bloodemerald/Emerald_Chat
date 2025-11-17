import EmeraldChatHeader from './EmeraldChatHeader';
import { ViewerCount } from './ViewerCount';
import { Activity, BarChart3 } from 'lucide-react';

interface ChatHeaderProps {
  viewerCount?: number;
  isLive?: boolean;
  onOpenUserList?: () => void;
  onOpenTimeline?: () => void;
  onCreatePoll?: () => void;
  frameCount?: number;
}

export const ChatHeader = ({
  viewerCount = 0,
  isLive = false,
  onOpenUserList,
  onOpenTimeline,
  onCreatePoll,
  frameCount = 0,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <EmeraldChatHeader />
      <div className="flex items-center gap-3">
        {onCreatePoll && (
          <button
            onClick={onCreatePoll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-sm hover:shadow-md"
            title="Create a poll"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Create Poll</span>
          </button>
        )}
        {frameCount > 0 && onOpenTimeline && (
          <button
            onClick={onOpenTimeline}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            title="View screenshot timeline"
          >
            <Activity className="w-4 h-4" />
            <span>{frameCount} frames</span>
          </button>
        )}
        {viewerCount > 0 && (
          <div
            onClick={onOpenUserList}
            className={`transition-transform hover:scale-105 ${onOpenUserList ? 'cursor-pointer' : ''}`}
          >
            <ViewerCount count={viewerCount} isLive={isLive} />
          </div>
        )}
      </div>
    </div>
  );
};
