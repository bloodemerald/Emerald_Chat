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
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full text-white text-[10px] font-bold uppercase tracking-wide shadow-[0_2px_8px_rgba(239,68,68,0.4),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.5),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.2)] transition-all">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      )}
      
      {/* Total Viewers - minimal Apple style */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-white via-gray-50 to-gray-100/80 rounded-full border border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.04)] transition-all">
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
