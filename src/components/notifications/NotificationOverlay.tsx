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

  return (
    <div className="notification-overlay fixed top-0 right-0 pointer-events-none z-50">
      {visible.map((notification, index) => renderNotification(notification, index))}
    </div>
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
