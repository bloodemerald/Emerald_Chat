import { memo, useMemo } from 'react';
import { UserBadge } from '@/types/badges';
import { Badge } from './Badge';

interface BadgeListProps {
  badges: UserBadge[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showTooltip?: boolean;
}

/**
 * Displays a horizontal list of user badges
 * Used in chat messages and user profiles
 */
export const BadgeList = memo(({ 
  badges, 
  size = 'sm', 
  maxDisplay = 5,
  showTooltip = true 
}: BadgeListProps) => {
  if (!badges || badges.length === 0) return null;

  // Memoize sorted badges to prevent re-sorting on every render
  const sortedBadges = useMemo(() => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const typeOrder = { 
      moderator: 0, 
      founder: 1, 
      vip: 2, 
      subscriber: 3, 
      bits: 4, 
      personality: 5,
      anniversary: 6,
      custom: 7 
    };
    
    return [...badges].sort((a, b) => {
      const rarityA = rarityOrder[a.rarity || 'common'];
      const rarityB = rarityOrder[b.rarity || 'common'];
      
      if (rarityA !== rarityB) return rarityA - rarityB;
      
      const typeA = typeOrder[a.type] ?? 99;
      const typeB = typeOrder[b.type] ?? 99;
      
      return typeA - typeB;
    });
  }, [badges]);

  const displayBadges = sortedBadges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="inline-flex items-center gap-1">
      {displayBadges.map((badge) => (
        <Badge 
          key={badge.id} 
          badge={badge} 
          size={size}
          showTooltip={showTooltip}
        />
      ))}
      {remainingCount > 0 && (
        <span 
          className="text-xs text-muted-foreground font-semibold"
          title={`${remainingCount} more badge${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
});

BadgeList.displayName = 'BadgeList';
