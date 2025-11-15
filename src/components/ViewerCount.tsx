import { memo } from 'react';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  count: number;
  isLive?: boolean;
}

export const ViewerCount = memo(({ count, isLive = true }: ViewerCountProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* Live Indicator - only show when live */}
      {isLive && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 rounded-md text-white text-xs font-bold uppercase">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>LIVE</span>
        </div>
      )}
      
      {/* Total Viewers (lurkers + chatters) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
        <Users className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-bold text-gray-900 tabular-nums">
          {count}
        </span>
        <span className="text-xs text-gray-600 font-medium">
          {count === 1 ? 'viewer' : 'viewers'}
        </span>
      </div>
    </div>
  );
});

ViewerCount.displayName = 'ViewerCount';
