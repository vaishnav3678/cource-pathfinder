import React from 'react';

interface PathfinderLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'mark-only' | 'horizontal';
}

export const PathfinderLogo: React.FC<PathfinderLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  variant = 'mark-only',
}) => {
  // Uses the exact original Pathfinder logo image uploaded by the user
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 48;

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src="/pathfinder_logo.jpg"
          alt="Pathfinder Logo"
          width={numericSize}
          height={numericSize}
          className="rounded-full object-contain shrink-0 shadow-2xs"
          style={{ width: `${numericSize}px`, height: `${numericSize}px` }}
        />
        <div className="flex flex-col justify-center">
          <span className="text-xl font-extrabold tracking-tight text-[#0B2147] leading-none">
            PATHFINDER
          </span>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-1 uppercase">
            Learn • Build • Test • Deploy • Grow
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src="/pathfinder_logo.jpg"
        alt="Pathfinder Original Logo"
        width={numericSize}
        height={numericSize}
        className="rounded-full object-contain select-none shadow-2xs"
        style={{ width: `${numericSize}px`, height: `${numericSize}px` }}
      />
      {showText && (
        <div className="mt-2 text-center">
          <span className="text-sm font-extrabold tracking-wider text-[#0B2147] block">
            PATHFINDER
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block">
            Learn • Build • Test • Deploy • Grow
          </span>
        </div>
      )}
    </div>
  );
};
