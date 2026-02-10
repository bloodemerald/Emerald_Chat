import { RedemptionEffect } from '@/lib/channelPoints';
import { useTimedNotification } from './useTimedNotification';

interface ChannelPointsNotificationProps {
  effect: RedemptionEffect;
  onComplete?: () => void;
}

export function ChannelPointsNotification({ effect, onComplete }: ChannelPointsNotificationProps) {
  const { isVisible, isExiting, dismiss } = useTimedNotification({
    autoDismissMs: 5000,
    onComplete,
  });

  const getRedemptionInfo = () => {
    switch (effect.type) {
      case 'highlight_bomb':
        return {
          icon: '💥',
          title: 'Highlight Bomb!',
          color: 'from-orange-500 to-red-500',
          message: `Message exploded with sparkles!`,
        };
      case 'ghost_message':
        return {
          icon: '👻',
          title: 'Ghost Message!',
          color: 'from-gray-600 to-gray-800',
          message: `Message turned invisible for 10s`,
        };
      case 'color_blast':
        return {
          icon: '🎨',
          title: 'Color Blast!',
          color: 'from-pink-500 to-purple-500',
          message: `Username color changed!`,
        };
      case 'super_like':
        return {
          icon: '⭐',
          title: 'Super Like!',
          color: 'from-yellow-400 to-yellow-600',
          message: `Added 5 instant likes!`,
        };
      case 'copy_pasta':
        return {
          icon: '🔄',
          title: 'Copy Pasta!',
          color: 'from-blue-500 to-cyan-500',
          message: `Everyone will repeat this message!`,
        };
      case 'personality_swap':
        return {
          icon: '🎭',
          title: 'Personality Swap!',
          color: 'from-purple-600 to-indigo-600',
          message: `Personality changed for 1 minute!`,
        };
      default:
        return {
          icon: '🎯',
          title: 'Channel Points',
          color: 'from-teal-500 to-green-500',
          message: 'Redeemed!',
        };
    }
  };

  const info = getRedemptionInfo();

  return (
    <div
      className={`
        bg-gradient-to-r ${info.color} backdrop-blur-xl
        text-white rounded-lg shadow-2xl
        px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-80' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-105
        border-2 border-white/30
        relative
      `}
      onClick={dismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl animate-pulse">{info.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">{info.title}</div>
          <div className="text-sm opacity-90">
            <span className="font-semibold">{effect.userId}</span>
            {effect.targetUser && (
              <>
                <span className="mx-1">→</span>
                <span className="font-semibold">{effect.targetUser}</span>
              </>
            )}
          </div>
          <div className="text-xs opacity-80 mt-1">{info.message}</div>
        </div>
      </div>

      {/* Effect-specific particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-sm animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          >
            {info.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
