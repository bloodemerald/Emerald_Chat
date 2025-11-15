import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CyberExpandButtonProps {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

const CyberExpandButton: React.FC<CyberExpandButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  backgroundColor = 'hsl(var(--primary))',
  textColor = 'white',
  disabled = false,
  ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || text}
      className="cyber-expand-btn group relative flex items-center justify-start h-[45px] w-[45px] border-none rounded-full cursor-pointer overflow-hidden transition-all duration-300 neon-border disabled:opacity-50 disabled:cursor-not-allowed hover:w-[125px] hover:rounded-[40px] active:translate-x-[2px] active:translate-y-[2px]"
      style={{
        backgroundColor,
        boxShadow: `2px 2px 10px rgba(0, 0, 0, 0.199)`,
      }}
    >
      {/* Icon container */}
      <div className="cyber-expand-sign w-full transition-all duration-300 flex items-center justify-center group-hover:w-[30%] group-hover:pl-5">
        <Icon className="w-[17px] h-[17px]" style={{ color: textColor }} />
      </div>

      {/* Text */}
      <div
        className="cyber-expand-text absolute right-0 w-0 opacity-0 text-[1.2em] font-semibold transition-all duration-300 group-hover:opacity-100 group-hover:w-[70%] group-hover:pr-2.5"
        style={{ color: textColor }}
      >
        {text}
      </div>
    </button>
  );
};

export default CyberExpandButton;
