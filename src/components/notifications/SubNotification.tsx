import { SubEvent, SUB_TIERS } from '@/lib/subscriptions';
import { useEffect, useState } from 'react';

interface SubNotificationProps {
  event: SubEvent;
  onComplete?: () => void;
}

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
  const bgColor =
    event.type === 'sub_train'
      ? 'from-yellow-500 to-orange-500'
      : event.milestone
        ? 'from-purple-500 to-pink-500'
        : 'from-indigo-600 to-purple-600';

  return (
    <div
      className={`
        bg-gradient-to-r ${bgColor}
        text-white rounded-lg shadow-2xl
        px-6 py-4 min-w-[320px] max-w-[400px]
        transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[450px] opacity-0'}
        cursor-pointer hover:scale-105
        border-2 ${event.type === 'sub_train' ? 'border-yellow-300' : 'border-purple-400'}
        relative
      `}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className={`text-4xl ${event.type === 'sub_train' ? 'animate-bounce' : ''}`}>
          {content.icon}
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">{content.title}</div>
          <div className="text-sm opacity-90">{content.message}</div>
        </div>
      </div>

      {/* Confetti/sparkle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {[...Array(event.milestone || event.type === 'sub_train' ? 12 : 6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${1 + Math.random()}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            {event.type === 'sub_train' ? '🎊' : event.milestone ? '🎉' : '✨'}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
