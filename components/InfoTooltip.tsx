import React, { useState } from 'react';

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  text, 
  position = 'top',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-flex items-center group">
      <div
        className={`
          absolute ${positionClasses[position]} 
          opacity-0 group-hover:opacity-100 
          invisible group-hover:visible 
          scale-95 group-hover:scale-100
          z-50
          transition-all duration-200 ease-in-out
          bg-gray-900 text-gray-100 
          text-sm font-medium
          px-3 py-2 rounded-lg
          shadow-lg shadow-black/20
          max-w-xs
          pointer-events-none
          whitespace-normal
          text-center
        `}
        role="tooltip"
      >
        {text}
        {/* Arrow */}
        <div 
          className={`
            absolute w-2 h-2 bg-gray-900 transform rotate-45
            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
          `}
        />
      </div>
      <div 
        className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
    </div>
  );
};

export default InfoTooltip;
