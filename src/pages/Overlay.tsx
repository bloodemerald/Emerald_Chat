import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useHypeStore } from "@/lib/hypeManager";
import RaidBossOverlay from "@/components/overlay/RaidBossOverlay";

// This component will be loaded in a transparent window
export default function Overlay() {
    const { level, percent, isActive, addHype } = useHypeStore();

    // Simulate listening to events for demo purposes
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                addHype(10);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [addHype]);

    return (
        <div className="min-h-screen w-full bg-transparent overflow-hidden pointer-events-none">
            {/* Hype Meter (Always visible in corner) */}
            <div className="fixed bottom-10 right-10 pointer-events-auto">
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="bg-black/80 backdrop-blur-md border border-emerald-500/50 rounded-full p-4 flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                        >
                            <div className="relative">
                                <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                                <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-50" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                    Hype Train
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-black text-white italic">
                                        LEVEL {level}
                                    </div>
                                    <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-emerald-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Emotes Area (Full screen) */}
            <div className="fixed inset-0 pointer-events-none">
                <RaidBossOverlay />
                {/* Emotes will be rendered here */}
            </div>
        </div>
    );
}
