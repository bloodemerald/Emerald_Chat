import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Swords, Ghost, Flame } from 'lucide-react';
import { useRaidBossStore, BossType } from '@/lib/raidBossStore';

const BossIcon = ({ type }: { type: BossType }) => {
    switch (type) {
        case 'Dragon': return <Flame className="w-32 h-32 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />;
        case 'Ghost': return <Ghost className="w-32 h-32 text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]" />;
        case 'Robot': return <Swords className="w-32 h-32 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />;
        default: return <Skull className="w-32 h-32 text-gray-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />;
    }
};

export default function RaidBossOverlay() {
    const { isActive, bossName, bossType, currentHealth, maxHealth, damageLog } = useRaidBossStore();
    const [shake, setShake] = useState(0);

    // Trigger shake effect on damage
    useEffect(() => {
        if (damageLog.length > 0) {
            setShake(prev => prev + 1);
            const timer = setTimeout(() => setShake(0), 200);
            return () => clearTimeout(timer);
        }
    }, [damageLog]);

    if (!isActive) return null;

    const healthPercent = (currentHealth / maxHealth) * 100;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-50">
            {/* Boss Avatar */}
            <motion.div
                animate={{
                    x: shake ? [0, -10, 10, -10, 10, 0] : 0,
                    scale: [1, 1.05, 1]
                }}
                transition={{ duration: shake ? 0.4 : 2, repeat: shake ? 0 : Infinity }}
                className="relative"
            >
                <BossIcon type={bossType} />

                {/* Floating Damage Numbers */}
                <AnimatePresence>
                    {damageLog.slice(-5).map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 1, y: 0, x: (Math.random() - 0.5) * 50 }}
                            animate={{ opacity: 0, y: -100 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black text-white stroke-black stroke-2 drop-shadow-lg whitespace-nowrap"
                            style={{ textShadow: '2px 2px 0 #000' }}
                        >
                            -{log.amount}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Boss Info & Health Bar */}
            <div className="flex flex-col items-center gap-1 w-[400px]">
                <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {bossName}
                </h2>

                <div className="w-full h-8 bg-gray-900/80 border-2 border-white/20 rounded-full overflow-hidden relative backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        initial={{ width: '100%' }}
                        animate={{ width: `${healthPercent}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-md">
                        {currentHealth} / {maxHealth}
                    </div>
                </div>
            </div>
        </div>
    );
}
