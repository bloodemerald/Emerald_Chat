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
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
      <EmeraldChatHeader />
      {viewerCount > 0 && (
        <div onClick={onOpenUserList} className={onOpenUserList ? 'cursor-pointer' : ''}>
          <ViewerCount count={viewerCount} isLive={isLive} />
        </div>
      )}
    </div>
  );
};
