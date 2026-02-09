import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface ChatAnimationRef {
    addFloatingText: (text: string, type?: 'normal' | 'hype' | 'combo' | 'sub') => void;
}

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    type: 'normal' | 'hype' | 'combo' | 'sub';
    rotation: number;
    scale: number;
}

export const ChatAnimations = forwardRef<ChatAnimationRef, Record<string, never>>((_props, ref) => {
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    const addFloatingText = useCallback((text: string, type: 'normal' | 'hype' | 'combo' | 'sub' = 'normal') => {
        const id = Date.now() + Math.random();
        const startX = Math.random() * 60 + 20; // 20% to 80% width
        const startY = 80 + Math.random() * 10; // Start near bottom
        const rotation = (Math.random() - 0.5) * 20; // -10 to 10 deg rotation
        const scale = type === 'hype' ? 1.5 : type === 'combo' ? 2.0 : 1.0;

        setFloatingTexts((prev) => [
            ...prev,
            { id, text, x: startX, y: startY, type, rotation, scale },
        ]);

        // Cleanup after animation
        setTimeout(() => {
            setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
        }, 2000);
    }, []);

    useImperativeHandle(ref, () => ({
        addFloatingText,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {floatingTexts.map((item) => (
                <div
                    key={item.id}
                    className={`absolute transform transition-all duration-[2000ms] ease-out flex flex-col items-center ${item.type === 'hype' ? 'animate-bounce-slight' : ''
                        }`}
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                        opacity: 0, // Start opacity (will be handled by keyframes or inline styles if we want complex physics)
                        animation: `floatUp 2s ease-out forwards`,
                    }}
                >
                    <span
                        className={`
              font-bold whitespace-nowrap select-none
              ${item.type === 'normal' ? 'text-white text-lg drop-shadow-md' : ''}
              ${item.type === 'hype' ? 'text-yellow-300 text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] stroke-black stroke-2' : ''}
              ${item.type === 'combo' ? 'text-orange-500 text-4xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]' : ''}
              ${item.type === 'sub' ? 'text-purple-400 text-xl font-bold drop-shadow-lg' : ''}
            `}
                        style={{
                            textShadow: item.type !== 'normal' ? '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' : '1px 1px 2px rgba(0,0,0,0.8)',
                        }}
                    >
                        {item.text}
                    </span>
                </div>
            ))}
            <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.5);
            top: 80%;
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -20px) scale(1.2);
          }
          20% {
            transform: translate(-50%, -30px) scale(1);
          }
          100% {
            opacity: 0;
            top: 20%;
            transform: translate(-50%, -100px) scale(1);
          }
        }
      `}</style>
        </div>
    );
});

ChatAnimations.displayName = 'ChatAnimations';
