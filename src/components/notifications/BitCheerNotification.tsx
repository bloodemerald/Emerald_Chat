import { BitCheer } from '@/lib/bitCheering';
import { useEffect, useState } from 'react';

interface BitCheerNotificationProps {
  cheer: BitCheer;
  onComplete?: () => void;
}

export function BitCheerNotification({ cheer, onComplete }: BitCheerNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 5-7 seconds (longer for bigger cheers)
    const duration = cheer.amount >= 1000 ? 7000 : 5000;
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [cheer]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  const { tier } = cheer;
  const isWhale = cheer.amount >= 5000;

  return (
    <div
      className={`
        text-white rounded-lg shadow-2xl backdrop-blur-xl
        px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-80' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-105
        border-2
        relative
      `}
      style={{
        background: tier.badgeColor,
        borderColor: isWhale ? '#ffd700' : tier.color,
      }}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className={`text-4xl ${tier.animation === 'bounce' ? 'animate-bounce' : ''}`}>💎</div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">
            {isWhale ? '🐋 WHALE ALERT!' : 'Bit Cheer!'}
          </div>
          <div className="text-sm opacity-90">
            <span className="font-semibold">{cheer.username}</span>
            <span className="mx-1">cheered</span>
            <span className="font-bold text-yellow-300 text-lg">{cheer.amount}</span>
            <span className="ml-1">bits!</span>
          </div>
          {cheer.message && (
            <div className="text-xs opacity-80 mt-2 italic">&quot;{cheer.message}&quot;</div>
          )}
          <div className="text-xs opacity-60 mt-1">{tier.name}</div>
        </div>
      </div>

      {/* Particle effects based on tier */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {[...Array(Math.min(tier.particleCount, 20))].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `particle-${tier.animation} ${0.5 + Math.random()}s ease-out`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            💎
          </div>
        ))}
      </div>

      <style>{`
        @keyframes particle-bounce {
          0%, 100% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-20px) scale(1); opacity: 1; }
        }
        @keyframes particle-pulse {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        @keyframes particle-explode {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--x, 50px), var(--y, -50px)) scale(0); opacity: 0; }
        }
        @keyframes particle-fireworks {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(0, -30px) scale(1); opacity: 1; }
          100% { transform: translate(var(--x, 30px), -60px) scale(0.5); opacity: 0; }
        }
        @keyframes particle-mega-burst {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          50% { transform: translate(0, 0) scale(2); opacity: 1; }
          100% { transform: translate(var(--x, 60px), var(--y, -60px)) scale(0) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
