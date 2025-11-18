import { BitCheer } from '@/lib/bitCheering';
import { useEffect, useState } from 'react';

interface BitCheerNotificationProps {
  cheer: BitCheer;
  onComplete?: () => void;
}

const PIXEL_DROPS = ['💰', '💎', '🔮', '🍬'];

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
        text-white rounded-lg px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-500
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-[1.02]
        relative overflow-hidden
      `}
      style={{
        background: 'linear-gradient(135deg, #1f2d4f 0%, #1b1936 50%, #2f4575 100%)',
        border: '4px solid #f6ca5d',
        boxShadow: '0 0 0 4px #0b1021, inset 0 0 0 3px rgba(255,255,255,0.08)',
        imageRendering: 'pixelated'
      }}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className={`text-4xl drop-shadow-[0_4px_0_#0b1021] ${tier.animation === 'bounce' ? 'animate-bounce' : 'animate-pulse'}`}>💎</div>
        <div className="flex-1">
          <div className="font-black text-lg mb-1 tracking-wide text-[#fef3c7] uppercase pixel-font">
            {isWhale ? 'Mega Bit Rain!' : 'Bit Drop!'}
          </div>
          <div className="text-sm text-white/90">
            <span className="font-semibold text-[#ffe066]">{cheer.username}</span>
            <span className="mx-1">sent</span>
            <span className="font-black text-xl text-[#b1f0ff]">{cheer.amount}</span>
            <span className="ml-1">bits</span>
          </div>
          {cheer.message && (
            <div className="text-xs text-white/70 mt-2 bg-white/10 px-2 py-1 rounded border border-white/20">
              &ldquo;{cheer.message}&rdquo;
            </div>
          )}
          <div className="text-[11px] text-white/70 mt-2">{tier.name}</div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-lg animate-[pixel-drop_1.2s_ease-in_forwards]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-10 - Math.random() * 20}%`,
              animationDelay: `${i * 0.08}s`,
            }}
          >
            {PIXEL_DROPS[i % PIXEL_DROPS.length]}
          </span>
        ))}
      </div>

      <style>{`
        .pixel-font {
          font-family: 'Press Start 2P', 'VT323', system-ui, sans-serif;
        }
        @keyframes pixel-drop {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          70% { transform: translateY(220px) scale(1); opacity: 1; }
          85% { transform: translateY(210px) scale(0.9); }
          100% { transform: translateY(230px) scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
