import { create } from 'zustand';

interface HypeState {
    level: number;
    percent: number;
    combo: number;
    isActive: boolean;
    addHype: (amount: number) => void;
    reset: () => void;
}

export const useHypeStore = create<HypeState>((set, get) => ({
    level: 0,
    percent: 0,
    combo: 0,
    isActive: false,

    addHype: (amount: number) => {
        const { level, percent, combo } = get();

        // Calculate new percentage
        let newPercent = percent + amount;
        let newLevel = level;
        const newCombo = combo + 1;

        // Level up logic
        if (newPercent >= 100) {
            newLevel = Math.min(level + 1, 5);
            newPercent = newPercent - 100;
        }

        // Decay logic would go here in a real app (setInterval)

        set({
            level: newLevel,
            percent: newPercent,
            combo: newCombo,
            isActive: newLevel > 0 || newPercent > 0
        });
    },

    reset: () => set({ level: 0, percent: 0, combo: 0, isActive: false })
}));

// Helper to calculate hype value from message
export const calculateHypeValue = (message: string, bits: number = 0): number => {
    let value = 1; // Base value for any message

    // Length bonus
    if (message.length > 50) value += 1;

    // Emote/Caps bonus (simple heuristic)
    if (message === message.toUpperCase() && message.length > 4) value += 2;

    // Bits bonus
    if (bits > 0) {
        value += Math.ceil(bits / 10);
    }

    return value;
};
