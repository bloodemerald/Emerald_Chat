import EmeraldChatHeader from './EmeraldChatHeader';
import { ViewerCount } from './ViewerCount';
import { Activity } from 'lucide-react';

interface ChatHeaderProps {
  viewerCount?: number;
  isLive?: boolean;
  onOpenUserList?: () => void;
  onOpenTimeline?: () => void;
  frameCount?: number;
}

export const ChatHeader = ({
  viewerCount = 0,
  isLive = false,
  onOpenUserList,
  onOpenTimeline,
  frameCount = 0,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <EmeraldChatHeader />
      <div className="flex items-center gap-3">
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
