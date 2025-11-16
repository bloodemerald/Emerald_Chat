import EmeraldChatHeader from './EmeraldChatHeader';
import { ViewerCount } from './ViewerCount';

interface ChatHeaderProps {
  viewerCount?: number;
  isLive?: boolean;
  onOpenUserList?: () => void;
}

export const ChatHeader = ({
  viewerCount = 0,
  isLive = false,
  onOpenUserList,
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <EmeraldChatHeader />
      {viewerCount > 0 && (
        <div 
          onClick={onOpenUserList} 
          className={`transition-transform hover:scale-105 ${onOpenUserList ? 'cursor-pointer' : ''}`}
        >
          <ViewerCount count={viewerCount} isLive={isLive} />
        </div>
      )}
    </div>
  );
};
