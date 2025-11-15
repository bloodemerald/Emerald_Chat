import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CyberRadioButtonProps {
  id: string;
  name: string;
  label: string;
  number: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  glitchText?: string;
}

const CyberRadioButton: React.FC<CyberRadioButtonProps> = ({
  id,
  name,
  label,
  number,
  checked,
  onChange,
  disabled = false,
  icon: Icon,
  glitchText,
}) => {
  return (
    <div className="relative h-[38px] w-[84px] m-[3px]">
      <input
        className="absolute h-full w-full m-0 cursor-pointer z-10 opacity-0"
        name={name}
        id={id}
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div
        className={`
          relative w-full h-full flex items-center justify-center
          text-[9px] font-black uppercase tracking-wider
          transition-all duration-200
          ${checked ? 'text-white' : 'text-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          clipPath: 'polygon(11% 0, 95% 0, 100% 25%, 90% 90%, 95% 90%, 85% 90%, 85% 100%, 7% 100%, 0 80%)',
          lineHeight: '38px',
        }}
      >
        {/* Background layers */}
        <div
          className={`absolute inset-0 -z-10 transition-all duration-300`}
          style={{
            clipPath: 'polygon(11% 0, 95% 0, 100% 25%, 90% 90%, 95% 90%, 85% 90%, 85% 100%, 7% 100%, 0 80%)',
            background: checked ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
          }}
        />
        <div
          className={`absolute inset-0 -z-20 transition-all duration-300`}
          style={{
            clipPath: 'polygon(11% 0, 95% 0, 100% 25%, 90% 90%, 95% 90%, 85% 90%, 85% 100%, 7% 100%, 0 80%)',
            background: checked ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
            transform: 'translate(5px, 0)',
          }}
        />

        {/* Content */}
        <div className="flex items-center gap-1 z-10">
          {Icon && <Icon className="w-3 h-3" />}
          <span>{label}</span>
        </div>

        {/* Glitch effect overlay */}
        {(checked || !disabled) && (
          <div
            className={`
              absolute inset-[-5px] flex items-center justify-center
              pointer-events-none
              ${checked ? 'animate-glitch' : 'opacity-0 group-hover:opacity-100'}
            `}
            style={{
              clipPath: 'polygon(11% 0, 95% 0, 100% 25%, 90% 90%, 95% 90%, 85% 90%, 85% 100%, 7% 100%, 0 80%)',
              background: checked ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
              textShadow: `2px 2px hsl(var(--primary)), -2px -2px hsl(var(--secondary))`,
            }}
          >
            <div className="flex items-center gap-1">
              {Icon && <Icon className="w-3 h-3" />}
              <span>{glitchText || label}</span>
            </div>
          </div>
        )}

        {/* Number label */}
        <label
          className="absolute top-0 left-[81%] w-[15px] h-[6px] text-[5.5px] font-bold tracking-wide leading-[6.2px] text-[#323232] flex items-center justify-center"
          style={{
            background: checked ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
          }}
        >
          {number}
        </label>
      </div>
    </div>
  );
};

export default CyberRadioButton;