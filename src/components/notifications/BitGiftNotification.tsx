import { BitGift } from '@/lib/bitGifting';
import { useEffect, useState } from 'react';

interface BitGiftNotificationProps {
  gift: BitGift;
  onComplete?: () => void;
}

export function BitGiftNotification({ gift, onComplete }: BitGiftNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 6 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  const getReasonText = (reason?: BitGift['reason']) => {
    switch (reason) {
      case 'zero_bits':
        return '(helping out a new viewer)';
      case 'funny_comment':
        return '(for being funny)';
      case 'helpful':
        return '(for being helpful)';
      case 'subscriber':
        return '(loyal subscriber)';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-purple-600 to-pink-600
        text-white rounded-lg shadow-2xl
        px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-105
        border-2 border-purple-400
        relative
      `}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl animate-bounce">🎁</div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">Bit Gift!</div>
          <div className="text-sm opacity-90">
            <span className="font-semibold">{gift.gifterUsername}</span>
            <span className="mx-1">gifted</span>
            <span className="font-bold text-yellow-300">{gift.amount} bits</span>
            <span className="mx-1">to</span>
            <span className="font-semibold">{gift.recipientUsername}</span>
          </div>
          {gift.reason && (
            <div className="text-xs opacity-75 mt-1">{getReasonText(gift.reason)}</div>
          )}
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
}
