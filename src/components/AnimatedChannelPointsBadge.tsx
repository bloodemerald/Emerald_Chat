import { useEffect, useState, useRef } from 'react';

interface AnimatedChannelPointsBadgeProps {
  points: number;
  username: string;
}

/**
 * Animated badge that shows channel points next to username
 * Animates when points change (increase/decrease)
 */
export const AnimatedChannelPointsBadge = ({ points }: AnimatedChannelPointsBadgeProps) => {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);
  const [change, setChange] = useState<number | null>(null);
  const prevPointsRef = useRef(points);

  useEffect(() => {
    if (prevPointsRef.current !== points) {
      const diff = points - prevPointsRef.current;
      setChange(diff);
      setIsAnimating(true);
      
      // Animate the number change
      const duration = 500;
      const steps = 20;
      const increment = diff / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayPoints(points);
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            setChange(null);
          }, 1000);
        } else {
          setDisplayPoints(prev => Math.round(prev + increment));
        }
      }, duration / steps);

      prevPointsRef.current = points;
      
      return () => clearInterval(interval);
    }
  }, [points]);

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`
          px-2 py-1 rounded-md font-bold text-[11px]
          bg-gradient-to-r from-purple-500 to-purple-600
          text-white shadow-sm
          transition-all duration-300
          ${isAnimating ? 'scale-110 shadow-lg shadow-purple-300' : 'scale-100'}
        `}
      >
        ⚡ {displayPoints.toLocaleString()}
      </div>
      
      {/* Floating change indicator */}
      {change !== null && (
        <div
          className={`
            absolute -top-6 left-1/2 transform -translate-x-1/2
            text-xs font-bold
            animate-float-up pointer-events-none
            ${change > 0 ? 'text-green-600' : 'text-red-600'}
          `}
        >
          {change > 0 ? '+' : ''}{change}
        </div>
      )}
    </div>
  );
};
