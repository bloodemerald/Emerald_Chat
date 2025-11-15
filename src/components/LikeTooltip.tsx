import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LikeTooltipProps {
  likedBy: string[];
  children: React.ReactNode;
}

/**
 * Tooltip showing who liked a message
 * Displays first 10 users, then "and X more"
 */
export const LikeTooltip: React.FC<LikeTooltipProps> = ({ likedBy, children }) => {
  if (!likedBy || likedBy.length === 0) {
    return <>{children}</>;
  }

  const displayLimit = 10;
  const displayNames = likedBy.slice(0, displayLimit);
  const remainingCount = likedBy.length - displayLimit;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-gray-900 border border-gray-700 text-white"
        >
          <div className="space-y-1">
            <div className="font-semibold text-xs text-gray-300 mb-1">
              Liked by {likedBy.length} {likedBy.length === 1 ? 'user' : 'users'}
            </div>
            <div className="text-xs space-y-0.5">
              {displayNames.map((username, index) => (
                <div key={index} className="text-emerald-400">
                  {username}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="text-gray-400 italic mt-1">
                  and {remainingCount} more...
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LikeTooltip;
