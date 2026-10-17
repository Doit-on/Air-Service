import React from 'react';

interface NuanamLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'badge' | 'icon' | 'horizontal';
  showSubtitle?: boolean;
}

export const NuanamLogo: React.FC<NuanamLogoProps> = ({
  className = '',
  size = 48,
  variant = 'badge',
  showSubtitle = true,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <div
          style={{ width: dimension, height: dimension }}
          className="shrink-0 rounded-full bg-white border-2 border-sky-400 ring-2 ring-sky-200/70 shadow-xs overflow-hidden flex items-center justify-center p-[2%]"
        >
          <img
            src="/29068.jpg"
            alt="เหนือน้ำแอร์ ปทุมธานี โลโก้"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 leading-tight">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
              เหนือน้ำแอร์
            </span>
            <span className="font-bold text-sky-600 text-sm sm:text-base">
              ปทุมธานี
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] text-slate-500 tracking-wider">
              บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-white border-2 border-sky-400 ring-2 ring-sky-200/70 shadow-xs overflow-hidden select-none p-[2%] ${className}`}
    >
      <img
        src="/29068.jpg"
        alt="บริษัท เหนือน้ำแอร์ ปทุมธานี จำกัด (NUANAMAIR PATHUM THANI CO., LTD.)"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};
