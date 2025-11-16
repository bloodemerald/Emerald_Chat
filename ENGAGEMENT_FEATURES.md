# Channel Points & Engagement System

This document describes the comprehensive engagement system added to Emerald Chat, including Channel Points, Bit Cheering, Bit Gifting, Subscriptions, and Notification Overlays.

## 🎯 Phase 1: Realistic Initial Viewer Count

**File Modified:** `src/lib/userLifecycle.ts`

### Changes:
- Initial viewers reduced from 10-20 to **2-3** for a more realistic small stream start
- Active chatters start at **0-1** instead of 3-8
- Creates a more organic growth pattern

## 💰 Phase 2: Channel Points System

**New File:** `src/lib/channelPoints.ts`

### Features:
- **Point Accumulation**: Active viewers earn 10-50 points per minute
- **6 Redemption Options:**
  - 💥 **Highlight Bomb** (500 pts): Make a message explode with sparkles
  - 👻 **Ghost Message** (300 pts): Make a message invisible for 10s
  - 🎨 **Color Blast** (400 pts): Change someone's username color temporarily
  - ⭐ **Super Like** (200 pts): Add 5 instant likes to a message
  - 🔄 **Copy Pasta** (600 pts): Force everyone to repeat a message
  - 🎭 **Personality Swap** (800 pts): Temporarily change someone's personality

### API:
```typescript
import { channelPoints } from '@/lib/channelPoints';

// Start accumulation
channelPoints.start();

// Get user points
const points = channelPoints.getUserPoints(userId);

// Redeem a reward
const result = channelPoints.redeem(userId, 'super_like', targetUser, targetMessage);

// AI-driven redemption
channelPoints.attemptAIRedemption();
```

## 💎 Phase 3: Enhanced Bit System

**New File:** `src/lib/bitCheering.ts`

### Features:
- **5 Bit Tiers** with unique colors and animations:
  - cheer1 (1+ bits): Gray, bounce animation
  - cheer100 (100+ bits): Purple, pulse animation
  - cheer1000 (1000+ bits): Teal, explode animation
  - cheer5000 (5000+ bits): Red, fireworks animation
  - cheer10000 (10000+ bits): Rainbow, mega-burst animation

### AI Behavior:
- 5% chance AI uses bits per message
- Amount based on user's balance:
  - 50% chance: 1-100 bits
  - 30% chance: 100-500 bits
  - 15% chance: 500-1000 bits
  - 5% chance: 1000+ bits (whale alert!)

### API:
```typescript
import { bitCheering } from '@/lib/bitCheering';

// Manual cheer
bitCheering.cheer(userId, username, amount, message);

// AI cheer attempt
bitCheering.attemptAICheer(user, message);

// Get cheer history
const history = bitCheering.getCheerHistory(10);
```

## 🎁 Phase 4: Bit Gifting System

**New File:** `src/lib/bitGifting.ts`
**New Component:** `src/components/notifications/BitGiftNotification.tsx`

### Features:
- AI users with 500+ bits can gift 100-500 bits
- 2% chance per message of gifting
- Intelligent targeting:
  - Priority to users with 0 bits (50% chance)
  - Long-time subscribers (30% chance)
  - Random users (20% chance)

### API:
```typescript
import { bitGifting } from '@/lib/bitGifting';

// Gift bits
bitGifting.giftBits(gifterId, gifterUsername, recipientId, recipientUsername, amount, reason);

// AI gift attempt
bitGifting.attemptAIGift();

// Gift for quality message
bitGifting.giftForMessage(username, 'funny');
```

## 👑 Phase 5: Subscription System

**New File:** `src/lib/subscriptions.ts`
**New Component:** `src/components/notifications/SubNotification.tsx`

### Features:
- **3 Subscription Tiers:**
  - Tier 1 ($4.99): No ads, 1 emote slot, badge
  - Tier 2 ($9.99): No ads, 2 emote slots, better badge, priority
  - Tier 3 ($24.99): No ads, 5 emote slots, fancy badge, priority, custom color

- **Event Types:**
  - New subscriptions
  - Re-subscriptions with milestone tracking (3, 6, 12, 24, 36, 48, 60 months)
  - Gift subscriptions
  - Sub trains (3+ subs in 30 seconds)

### AI Behavior:
- 5% chance for lurkers to subscribe
- 3% chance for subscribers to resub
- 2% chance for subscribers to gift a sub

### API:
```typescript
import { subscriptions } from '@/lib/subscriptions';

// Subscribe
subscriptions.subscribe(userId, username, 'tier1');

// Gift sub
subscriptions.giftSub(gifterId, gifterUsername, recipientId, recipientUsername, 'tier1');

// AI subscription attempts
subscriptions.attemptAISubscription();
subscriptions.attemptAIGiftSub();
```

## 🎬 Phase 6: Notification Overlay System

**New Files:**
- `src/components/notifications/NotificationOverlay.tsx` (Main overlay)
- `src/components/notifications/BitCheerNotification.tsx`
- `src/components/notifications/ChannelPointsNotification.tsx`

### Features:
- **Queue Management**: Maximum 3 visible notifications at once
- **Auto-Dismiss**: 5-8 seconds depending on importance
- **Click to Dismiss**: Instant dismissal on click
- **Stacked Layout**: Notifications stack vertically
- **Smooth Animations**: Slide in from right

### API:
```typescript
import {
  notifyBitGift,
  notifyBitCheer,
  notifySubscription,
  notifyChannelPoints,
} from '@/components/notifications/NotificationOverlay';

// Trigger notifications
notifyBitGift(giftData);
notifyBitCheer(cheerData);
notifySubscription(subEvent);
notifyChannelPoints(redemptionEffect);
```

## 🎮 Integration Manager

**New File:** `src/lib/engagementManager.ts`

The Engagement Manager coordinates all systems and manages AI-driven events.

### Usage:
```typescript
import { engagementManager } from '@/lib/engagementManager';

// Start all systems
engagementManager.start();

// Stop all systems
engagementManager.stop();

// Get stats
const stats = engagementManager.getStats();

// Reset for testing
engagementManager.reset();
```

### AI Event Schedule:
- **Bit Cheers**: Every 10-20 seconds
- **Bit Gifts**: Every 15-30 seconds
- **Subscriptions**: Every 20-40 seconds
- **Gift Subs**: Every 30-60 seconds
- **Channel Point Redemptions**: Every 15-30 seconds

## 🚀 Quick Start

### 1. Add NotificationOverlay to your main component:
```tsx
import { NotificationOverlay } from '@/components/notifications/NotificationOverlay';

function App() {
  return (
    <>
      <YourChatComponent />
      <NotificationOverlay />
    </>
  );
}
```

### 2. Start the engagement manager:
```typescript
import { engagementManager } from '@/lib/engagementManager';
import { userLifecycle } from '@/lib/userLifecycle';

// Start user lifecycle (viewers joining/leaving)
userLifecycle.start();

// Start engagement systems
engagementManager.start();
```

### 3. Clean up on unmount:
```typescript
useEffect(() => {
  engagementManager.start();

  return () => {
    engagementManager.stop();
  };
}, []);
```

## 📊 Statistics & Monitoring

Get comprehensive stats from all systems:

```typescript
const stats = engagementManager.getStats();

console.log(stats);
// {
//   channelPoints: {
//     totalUsers: 25,
//     topEarners: [...]
//   },
//   bitCheering: {
//     totalCheers: 45,
//     topCheerers: [...]
//   },
//   bitGifting: {
//     totalGifts: 12,
//     topGifters: [...]
//   },
//   subscriptions: {
//     totalSubscribers: 8,
//     recentEvents: [...]
//   }
// }
```

## 🎨 Customization

### Adjust AI Event Frequencies

Edit `src/lib/engagementManager.ts` to change how often AI events occur:

```typescript
// Bit cheers every 10-20 seconds -> Change to 5-10 seconds
const delay = 5000 + Math.random() * 5000;
```

### Modify Redemption Costs

Edit `src/lib/channelPoints.ts`:

```typescript
{
  id: 'super_like',
  name: 'Super Like',
  cost: 100, // Change from 200 to 100
  // ...
}
```

### Adjust Initial Viewer Count

Edit `src/lib/userLifecycle.ts`:

```typescript
const initialUsers = 5 + Math.floor(Math.random() * 5); // 5-10 instead of 2-3
```

## 🐛 Troubleshooting

### Notifications not appearing
- Ensure `<NotificationOverlay />` is mounted in your component tree
- Check that `engagementManager.start()` has been called
- Verify no z-index conflicts with other elements

### Channel points not accumulating
- Make sure `channelPoints.start()` is called via `engagementManager.start()`
- Check that users are in 'active' or 'lurking' state

### No AI events triggering
- Verify `engagementManager.start()` is called
- Check that there are active users in the userPool
- Review console logs for event activity

## 📝 Type Definitions

All systems are fully typed with TypeScript. Key interfaces:

```typescript
// Channel Points
interface UserPoints {
  userId: string;
  username: string;
  points: number;
  totalEarned: number;
  lastEarnedTime: number;
}

// Bit Cheering
interface BitCheer {
  id: string;
  userId: string;
  username: string;
  amount: number;
  tier: BitTier;
  message?: string;
  timestamp: number;
}

// Bit Gifting
interface BitGift {
  id: string;
  gifterId: string;
  gifterUsername: string;
  recipientId: string;
  recipientUsername: string;
  amount: number;
  timestamp: number;
  reason?: 'zero_bits' | 'funny_comment' | 'helpful' | 'subscriber' | 'random';
}

// Subscriptions
interface SubEvent {
  id: string;
  type: 'new_sub' | 'resub' | 'gift_sub' | 'sub_train';
  userId: string;
  username: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  timestamp: number;
  months?: number;
  milestone?: boolean;
  // ... more fields
}
```

## 🎯 Future Enhancements

Potential additions to consider:

- **Polls & Predictions**: Let viewers vote with channel points
- **Sound Effects**: Audio feedback for notifications
- **Custom Rewards**: User-defined channel point redemptions
- **Emote Explosions**: Visual effects for emote spam
- **Hype Trains**: Consecutive engagement triggers special events
- **Leaderboards**: Display top contributors
- **Analytics Dashboard**: Detailed engagement metrics

---

**Author**: Claude
**Version**: 1.0.0
**Last Updated**: 2025-11-16
