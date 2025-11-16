import { memo } from 'react';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  count: number;
  isLive?: boolean;
}

export const ViewerCount = memo(({ count, isLive = true }: ViewerCountProps) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* Live Indicator - sleek Apple style */}
      {isLive && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-[10px] font-bold uppercase tracking-wide shadow-md shadow-red-200">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      )}
      
      {/* Total Viewers - minimal Apple style */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200/50 hover:bg-gray-100 transition-colors">
        <Users className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700 tabular-nums">
          {count}
        </span>
        <span className="text-[11px] text-gray-500 font-medium">
          {count === 1 ? 'viewer' : 'viewers'}
        </span>
      </div>
    </div>
  );
});

ViewerCount.displayName = 'ViewerCount';
