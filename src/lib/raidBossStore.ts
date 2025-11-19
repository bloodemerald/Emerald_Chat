import { create } from 'zustand';

export type BossType = 'Dragon' | 'Robot' | 'Ghost' | 'Demon';

export interface DamageEvent {
    id: string;
    amount: number;
    user: string;
    timestamp: number;
}

interface RaidBossState {
    isActive: boolean;
    bossName: string;
    bossType: BossType;
    currentHealth: number;
    maxHealth: number;
    damageLog: DamageEvent[];

    // Actions
    startRaid: (type: BossType, health: number, name?: string) => void;
    damageBoss: (amount: number, user: string) => void;
    endRaid: () => void;
}

export const useRaidBossStore = create<RaidBossState>((set, get) => ({
    isActive: false,
    bossName: 'Boss',
    bossType: 'Dragon',
    currentHealth: 1000,
    maxHealth: 1000,
    damageLog: [],

    startRaid: (type, health, name) => {
        set({
            isActive: true,
            bossType: type,
            maxHealth: health,
            currentHealth: health,
            bossName: name || `${type} Boss`,
            damageLog: []
        });
    },

    damageBoss: (amount, user) => {
        const { isActive, currentHealth, damageLog } = get();

        if (!isActive || currentHealth <= 0) return;

        const newHealth = Math.max(0, currentHealth - amount);
        const newDamageEvent: DamageEvent = {
            id: Math.random().toString(36).substr(2, 9),
            amount,
            user,
            timestamp: Date.now()
        };

        set({
            currentHealth: newHealth,
            damageLog: [...damageLog.slice(-19), newDamageEvent] // Keep last 20 events
        });

        if (newHealth === 0) {
            // Boss defeated logic could go here or be handled by a subscriber/effect
            setTimeout(() => {
                get().endRaid();
            }, 5000); // Auto-end after 5 seconds of death
        }
    },

    endRaid: () => {
        set({ isActive: false });
    }
}));
