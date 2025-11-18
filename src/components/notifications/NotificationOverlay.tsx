import { useEffect, useState } from 'react';
import { BitGift } from '@/lib/bitGifting';
import { BitCheer } from '@/lib/bitCheering';
import { SubEvent } from '@/lib/subscriptions';
import { RedemptionEffect } from '@/lib/channelPoints';
import { BitGiftNotification } from './BitGiftNotification';
import { SubNotification } from './SubNotification';
import { BitCheerNotification } from './BitCheerNotification';
import { ChannelPointsNotification } from './ChannelPointsNotification';

/**
 * Notification Types
 */
export type NotificationType = 'bit_gift' | 'bit_cheer' | 'subscription' | 'channel_points';

/**
 * Generic Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  data: BitGift | BitCheer | SubEvent | RedemptionEffect;
  timestamp: number;
}

interface RaidCelebrationPayload {
  id: string;
  size: number;
  timestamp: number;
}

interface NotificationOverlayProps {
  maxVisible?: number;
}

/**
 * Main Notification Overlay Component
 * Manages queue and display of all notification types
 */
export function NotificationOverlay({ maxVisible = 3 }: NotificationOverlayProps) {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [visible, setVisible] = useState<Notification[]>([]);
  const [raidCelebration, setRaidCelebration] = useState<RaidCelebrationPayload | null>(null);

  /**
   * Add a notification to the queue
   */
  const addNotification = (notification: Notification) => {
    setQueue((prev) => [...prev, notification]);
  };

  /**
   * Remove a notification from visible list
   */
  const removeNotification = (id: string) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
  };

  /**
   * Process queue - move items from queue to visible
   */
  useEffect(() => {
    if (queue.length === 0 || visible.length >= maxVisible) return;

    const nextNotification = queue[0];
    setQueue((prev) => prev.slice(1));
    setVisible((prev) => [...prev, nextNotification]);
  }, [queue, visible, maxVisible]);

  /**
   * Render the appropriate notification component
   */
  const renderNotification = (notification: Notification, index: number) => {
    const onComplete = () => removeNotification(notification.id);

    // Calculate vertical position (stacked) - using rem for top-4 = 1rem = 16px
    const topOffset = 16 + index * 130; // 16px base + 130px spacing per notification

    const wrapperStyle = {
      top: `${topOffset}px`,
      position: 'relative' as const,
      marginBottom: '1rem',
      pointerEvents: 'auto' as const,
    };

    switch (notification.type) {
      case 'bit_gift':
        return (
          <div key={notification.id} style={wrapperStyle}>
            <BitGiftNotification gift={notification.data as BitGift} onComplete={onComplete} />
          </div>
        );

      case 'bit_cheer':
        return (
          <div key={notification.id} style={wrapperStyle}>
            <BitCheerNotification cheer={notification.data as BitCheer} onComplete={onComplete} />
          </div>
        );

      case 'subscription':
        return (
          <div key={notification.id} style={wrapperStyle}>
            <SubNotification event={notification.data as SubEvent} onComplete={onComplete} />
          </div>
        );

      case 'channel_points':
        return (
          <div key={notification.id} style={wrapperStyle}>
            <ChannelPointsNotification
              effect={notification.data as RedemptionEffect}
              onComplete={onComplete}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Expose method to add notifications globally
  useEffect(() => {
    // @ts-ignore - Global notification queue
    window.addNotification = addNotification;

    return () => {
      // @ts-ignore
      delete window.addNotification;
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    window.showRaidCelebration = (payload: RaidCelebrationPayload) => {
      setRaidCelebration(payload);
    };

    return () => {
      // @ts-ignore
      delete window.showRaidCelebration;
    };
  }, []);

  useEffect(() => {
    if (!raidCelebration) return;
    const timer = setTimeout(() => setRaidCelebration(null), 6500);
    return () => clearTimeout(timer);
  }, [raidCelebration]);

  return (
    <>
      <div className="notification-overlay fixed top-0 right-0 pointer-events-none z-50">
        {visible.map((notification, index) => renderNotification(notification, index))}
      </div>
      {raidCelebration && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <RaidCelebrationBanner size={raidCelebration.size} />
        </div>
      )}
    </>
  );
}

/**
 * Helper functions to create notifications
 */

export function notifyBitGift(gift: BitGift) {
  const notification: Notification = {
    id: gift.id,
    type: 'bit_gift',
    data: gift,
    timestamp: gift.timestamp,
  };
  // @ts-ignore
  window.addNotification?.(notification);
}

export function notifyRaidCelebration(size: number) {
  const payload: RaidCelebrationPayload = {
    id: `raid-${Date.now()}-${Math.random()}`,
    size,
    timestamp: Date.now(),
  };
  // @ts-ignore
  window.showRaidCelebration?.(payload);
}

const RAID_DROP_ICONS = ['💎', '🍗', '🗡️', '🎒'];

const RaidCelebrationBanner = ({ size }: { size: number }) => {
  return (
    <div
      className="pointer-events-auto"
      style={{
        background: 'linear-gradient(135deg, #101b2c 0%, #1f345a 50%, #274d7a 100%)',
        border: '5px solid #f5d562',
        boxShadow: '0 0 0 4px #05080f, inset 0 0 0 3px rgba(255,255,255,0.08)',
        imageRendering: 'pixelated'
      }}
    >
      <div className="relative overflow-hidden px-8 py-4 text-center">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="text-xs tracking-[0.3em] text-[#ffd966] pixel-font">RAID PARTY</div>
          <div className="text-2xl font-black text-white pixel-font drop-shadow-[0_4px_0_#05080f] animate-pulse">{size} adventurers arrived!</div>
          <div className="text-[11px] text-white/80">Shower them with pixel loot ✨</div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-lg animate-[raid-drop_1.4s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-15 - Math.random() * 30}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {RAID_DROP_ICONS[i % RAID_DROP_ICONS.length]}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .pixel-font {
          font-family: 'Press Start 2P', 'VT323', system-ui, sans-serif;
        }
        @keyframes raid-drop {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          60% { transform: translateY(240px) scale(1.05); opacity: 1; }
          80% { transform: translateY(230px) scale(0.95); }
          100% { transform: translateY(250px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

declare global {
  interface Window {
    addNotification?: (notification: Notification) => void;
    showRaidCelebration?: (payload: RaidCelebrationPayload) => void;
  }
}

export function notifyBitCheer(cheer: BitCheer) {
  const notification: Notification = {
    id: cheer.id,
    type: 'bit_cheer',
    data: cheer,
    timestamp: cheer.timestamp,
  };
  // @ts-ignore
  window.addNotification?.(notification);
}

export function notifySubscription(event: SubEvent) {
  const notification: Notification = {
    id: event.id,
    type: 'subscription',
    data: event,
    timestamp: event.timestamp,
  };
  // @ts-ignore
  window.addNotification?.(notification);
}

export function notifyChannelPoints(effect: RedemptionEffect) {
  const notification: Notification = {
    id: `redemption-${Date.now()}-${Math.random()}`,
    type: 'channel_points',
    data: effect,
    timestamp: Date.now(),
  };
  // @ts-ignore
  window.addNotification?.(notification);
}
