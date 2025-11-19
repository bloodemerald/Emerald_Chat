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
  screenshot?: string | null;
  detectedContent?: string;
}

export const ChatHeader = ({
  viewerCount = 0,
  isLive = false,
  onOpenUserList,
  onOpenTimeline,
  onCreatePoll,
  frameCount = 0,
  screenshot,
  detectedContent,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="scale-90 origin-left">
        <EmeraldChatHeader />
      </div>

      <div className="flex items-center gap-3">
        {/* Vision Preview in Header - Compact & Sleek */}
        {screenshot && (
          <div className="flex items-center gap-2 mr-2 group relative">
            <div className="relative overflow-hidden rounded-md border border-black/10 bg-black/5 w-24 h-auto transition-all duration-300 hover:w-[200px] hover:scale-105 hover:z-50 hover:shadow-xl shadow-sm cursor-help origin-top-right">
              <div className="absolute top-1 left-1.5 z-10 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-semibold text-white/90 tracking-wider uppercase drop-shadow-md shadow-black">Vision</span>
              </div>
              <img
                src={screenshot}
                alt="AI Vision Context"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              {detectedContent && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 backdrop-blur-md">
                  <p className="text-[8px] text-white/90 font-medium leading-tight truncate">
                    {detectedContent}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
