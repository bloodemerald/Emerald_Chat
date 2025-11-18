import { SubEvent, SUB_TIERS } from '@/lib/subscriptions';
import { useEffect, useState } from 'react';

interface SubNotificationProps {
  event: SubEvent;
  onComplete?: () => void;
}

const SUB_DROPS = ['🍄', '📜', '⭐', '🍯'];

export function SubNotification({ event, onComplete }: SubNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 6-8 seconds (longer for milestones)
    const duration = event.milestone || event.type === 'sub_train' ? 8000 : 6000;
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [event]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  const tierConfig = SUB_TIERS[event.tier];

  const getContent = () => {
    switch (event.type) {
      case 'new_sub':
        return {
          icon: '👑',
          title: 'New Subscriber!',
          message: (
            <>
              <span className="font-semibold">{event.username}</span>
              <span className="mx-1">just subscribed!</span>
              <span className="font-bold" style={{ color: tierConfig.badgeColor }}>
                {tierConfig.name}
              </span>
            </>
          ),
        };

      case 'resub':
        return {
          icon: event.milestone ? '🎉' : '👑',
          title: event.milestone ? 'Milestone Resub!' : 'Resubscribed!',
          message: (
            <>
              <span className="font-semibold">{event.username}</span>
              <span className="mx-1">resubscribed for</span>
              <span className="font-bold text-yellow-300">{event.months} months!</span>
              <span className="ml-1" style={{ color: tierConfig.badgeColor }}>
                ({tierConfig.name})
              </span>
            </>
          ),
        };

      case 'gift_sub':
        return {
          icon: '🎁',
          title: 'Gift Sub!',
          message: (
            <>
              <span className="font-semibold">{event.gifterUsername}</span>
              <span className="mx-1">gifted a</span>
              <span className="font-bold" style={{ color: tierConfig.badgeColor }}>
                {tierConfig.name}
              </span>
              <span className="mx-1">sub to</span>
              <span className="font-semibold">{event.recipientUsername}</span>
            </>
          ),
        };

      case 'sub_train':
        return {
          icon: '🚂',
          title: 'SUB TRAIN!!!',
          message: (
            <>
              <span className="font-bold text-yellow-300">{event.trainCount} subs</span>
              <span className="mx-1">in 30 seconds!</span>
              <div className="text-xs opacity-75 mt-1">
                {event.trainParticipants?.slice(0, 3).join(', ')}
                {(event.trainCount || 0) > 3 && ` +${(event.trainCount || 0) - 3} more`}
              </div>
            </>
          ),
        };

      default:
        return {
          icon: '👑',
          title: 'Subscription',
          message: <span>{event.username} subscribed</span>,
        };
    }
  };

  const content = getContent();
  const cardPalette = event.type === 'sub_train'
    ? {
        gradient: 'linear-gradient(135deg, #ffb347 0%, #ff6a00 60%, #c53c00 100%)',
        border: '#ffe29a'
      }
    : event.milestone
      ? {
          gradient: 'linear-gradient(135deg, #6e3dd3 0%, #b358ff 50%, #ff9ed6 100%)',
          border: '#fbe6ff'
        }
      : {
          gradient: 'linear-gradient(135deg, #2a3f73 0%, #3f5fb3 60%, #7da8ff 100%)',
          border: '#cde5ff'
        };

  return (
    <div
      className={`
        text-white rounded-lg px-6 py-4 min-w-[320px] max-w-[420px]
        transition-all duration-500
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-[1.02]
        relative overflow-hidden
      `}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
      style={{
        background: cardPalette.gradient,
        border: `4px solid ${cardPalette.border}`,
        boxShadow: '0 0 0 4px #0c1326, inset 0 0 0 3px rgba(255,255,255,0.1)',
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className={`text-4xl drop-shadow-[0_4px_0_#0c1326] ${event.type === 'sub_train' ? 'animate-bounce' : 'animate-pulse'}`}>
          {content.icon}
        </div>
        <div className="flex-1">
          <div className="font-black text-lg mb-1 tracking-wide text-[#fef3c7] uppercase pixel-font">{content.title}</div>
          <div className="text-sm text-white/90">{content.message}</div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: event.milestone || event.type === 'sub_train' ? 12 : 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-lg animate-[pixel-drop_1.4s_ease-in_forwards]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-15 - Math.random() * 25}%`,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {SUB_DROPS[i % SUB_DROPS.length]}
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
          100% { transform: translateY(235px) scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
