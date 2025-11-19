import { create } from 'zustand';

export interface PredictionOption {
    id: string;
    label: string;
    totalPoints: number;
    voters: string[];
}

export interface Prediction {
    id: string;
    title: string;
    status: 'active' | 'locked' | 'resolved';
    options: PredictionOption[];
    winningOptionId?: string;
    createdAt: number;
    endsAt: number;
}

interface PredictionState {
    activePrediction: Prediction | null;
    history: Prediction[];

    createPrediction: (title: string, options: string[], durationSeconds: number) => void;
    placeBet: (optionId: string, amount: number, username: string) => void;
    lockPrediction: () => void;
    resolvePrediction: (winningOptionId: string) => void;
    cancelPrediction: () => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
    activePrediction: null,
    history: [],

    createPrediction: (title, options, durationSeconds) => {
        const newPrediction: Prediction = {
            id: Date.now().toString(),
            title,
            status: 'active',
            options: options.map((opt, idx) => ({
                id: `opt-${idx}`,
                label: opt,
                totalPoints: 0,
                voters: []
            })),
            createdAt: Date.now(),
            endsAt: Date.now() + (durationSeconds * 1000)
        };

        set({ activePrediction: newPrediction });

        // Auto-lock after duration
        setTimeout(() => {
            const { activePrediction } = get();
            if (activePrediction && activePrediction.id === newPrediction.id && activePrediction.status === 'active') {
                get().lockPrediction();
            }
        }, durationSeconds * 1000);
    },

    placeBet: (optionId, amount, username) => {
        const { activePrediction } = get();
        if (!activePrediction || activePrediction.status !== 'active') return;

        const updatedOptions = activePrediction.options.map(opt => {
            if (opt.id === optionId) {
                return {
                    ...opt,
                    totalPoints: opt.totalPoints + amount,
                    voters: [...opt.voters, username] // Simplified: just tracking names for now
                };
            }
            return opt;
        });

        set({
            activePrediction: {
                ...activePrediction,
                options: updatedOptions
            }
        });
    },

    lockPrediction: () => {
        const { activePrediction } = get();
        if (!activePrediction) return;

        set({
            activePrediction: {
                ...activePrediction,
                status: 'locked'
            }
        });
    },

    resolvePrediction: (winningOptionId) => {
        const { activePrediction, history } = get();
        if (!activePrediction) return;

        const resolvedPrediction = {
            ...activePrediction,
            status: 'resolved' as const,
            winningOptionId
        };

        // Here we would calculate payouts and distribute points
        // For now, we just move it to history

        set({
            activePrediction: null,
            history: [resolvedPrediction, ...history]
        });
    },

    cancelPrediction: () => {
        set({ activePrediction: null });
        // Refund logic would go here
    }
}));
