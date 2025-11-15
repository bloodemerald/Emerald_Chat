import { memo } from 'react';
import { UserBadge } from '@/types/badges';

interface BadgeProps {
  badge: UserBadge;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

/**
 * Individual badge component
 * Displays a single user badge with optional tooltip
 */
export const Badge = memo(({ badge, size = 'md', showTooltip = true }: BadgeProps) => {
  const sizeClasses = {
    xs: 'text-[10px] w-3 h-3',
    sm: 'text-xs w-4 h-4',
    md: 'text-sm w-5 h-5',
    lg: 'text-base w-6 h-6'
  };

  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-300'
  };

  const rarityGlow = {
    common: '',
    rare: 'shadow-sm shadow-blue-300',
    epic: 'shadow-md shadow-purple-300',
    legendary: 'shadow-lg shadow-yellow-300 animate-pulse'
  };

  const rarity = badge.rarity || 'common';
  
  return (
    <div
      className={`
        inline-flex items-center justify-center rounded
        border ${rarityColors[rarity]} ${rarityGlow[rarity]}
        ${sizeClasses[size]} 
        transition-all duration-200 hover:scale-110
        ${showTooltip ? 'cursor-help' : ''}
      `}
      title={showTooltip ? `${badge.name}: ${badge.description}` : undefined}
      style={{ 
        backgroundColor: badge.color ? `${badge.color}20` : undefined,
        borderColor: badge.color || undefined
      }}
    >
      <span className="select-none">{badge.icon}</span>
    </div>
  );
});

Badge.displayName = 'Badge';
