import { useEffect, useState } from 'react';

interface FloatingFeedbackProps {
  message: string;
  type: 'bits' | 'points' | 'sub' | 'gift';
  isPositive?: boolean;
  duration?: number;
}

/**
 * Floating feedback animation for bits, points, subs, etc.
 * Shows visual "+10 bits" or "-500 points" that floats up and fades
 */
export const FloatingFeedback = ({ message, type, isPositive = true, duration = 2000 }: FloatingFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const colors = {
    bits: isPositive ? 'text-yellow-600 bg-yellow-100' : 'text-yellow-700 bg-yellow-50',
    points: isPositive ? 'text-purple-600 bg-purple-100' : 'text-purple-700 bg-purple-50',
    sub: 'text-pink-600 bg-pink-100',
    gift: 'text-blue-600 bg-blue-100',
  };

  const icons = {
    bits: '💎',
    points: '⚡',
    sub: '⭐',
    gift: '🎁',
  };

  return (
    <div
      className={`
        fixed z-50 
        ${colors[type]}
        px-3 py-1.5 rounded-full
        font-bold text-sm
        shadow-lg
        animate-float-up
        pointer-events-none
      `}
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className="mr-1">{icons[type]}</span>
      {message}
    </div>
  );
};

/**
 * Container for managing multiple floating feedbacks
 */
export const FloatingFeedbackContainer = ({ 
  feedbacks 
}: { 
  feedbacks: Array<{ id: string; message: string; type: 'bits' | 'points' | 'sub' | 'gift'; isPositive?: boolean }> 
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {feedbacks.map((feedback, index) => (
        <div
          key={feedback.id}
          style={{
            position: 'absolute',
            top: `${40 + index * 60}px`,
            right: '20px',
          }}
        >
          <FloatingFeedback
            message={feedback.message}
            type={feedback.type}
            isPositive={feedback.isPositive}
          />
        </div>
      ))}
    </div>
  );
};
