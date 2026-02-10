import { BitGift } from '@/lib/bitGifting';
import { useTimedNotification } from './useTimedNotification';

interface BitGiftNotificationProps {
  gift: BitGift;
  onComplete?: () => void;
}

const GIFT_DROPS = ['🎁', '🧧', '💰', '🍭'];

export function BitGiftNotification({ gift, onComplete }: BitGiftNotificationProps) {
  const { isVisible, isExiting, dismiss } = useTimedNotification({
    autoDismissMs: 6000,
    onComplete,
  });

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
        text-white rounded-lg px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-500
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-[1.02]
        relative overflow-hidden
      `}
      style={{
        background: 'linear-gradient(135deg, #40224d 0%, #6c2e6f 50%, #ff7ab5 100%)',
        border: '4px solid #ffe6a7',
        boxShadow: '0 0 0 4px #1a0f24, inset 0 0 0 3px rgba(255,255,255,0.08)',
        imageRendering: 'pixelated'
      }}
      onClick={dismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className="text-4xl drop-shadow-[0_4px_0_#1a0f24] animate-bounce">🎁</div>
        <div className="flex-1">
          <div className="font-black text-lg mb-1 tracking-wide text-[#fef3c7] uppercase pixel-font">Gift Drop!</div>
          <div className="text-sm text-white/90">
            <span className="font-semibold text-[#ffe066]">{gift.gifterUsername}</span>
            <span className="mx-1">gifted</span>
            <span className="font-black text-[#b6f3ff]">{gift.amount} bits</span>
            <span className="mx-1">to</span>
            <span className="font-semibold text-[#ffe4f3]">{gift.recipientUsername}</span>
          </div>
          {gift.reason && (
            <div className="text-xs text-white/70 mt-2 bg-white/10 px-2 py-1 rounded border border-white/20">
              {getReasonText(gift.reason)}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-lg animate-[pixel-drop_1.3s_ease-in_forwards]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-10 - Math.random() * 25}%`,
              animationDelay: `${i * 0.07}s`,
            }}
          >
            {GIFT_DROPS[i % GIFT_DROPS.length]}
          </span>
        ))}
      </div>

      <style>{`
        .pixel-font {
          font-family: 'Press Start 2P', 'VT323', system-ui, sans-serif;
        }
        @keyframes pixel-drop {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          70% { transform: translateY(220px) scale(1); opacity: 1; }
          90% { transform: translateY(215px) scale(0.9); }
          100% { transform: translateY(230px) scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
