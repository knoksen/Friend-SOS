import React from 'react';

interface KeyComboProps {
  keys: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent';
}

const KeyCombo: React.FC<KeyComboProps> = ({ 
  keys, 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const variantClasses = {
    default: 'bg-gray-700 text-gray-200 shadow-gray-900/20',
    accent: 'bg-red-500/20 text-red-300 shadow-red-900/20'
  };

  return (
    <div className="inline-flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd 
            className={`
              font-mono font-semibold rounded 
              shadow-inner ring-1 ring-gray-600/50 
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              transition-all duration-150
              hover:scale-105 hover:translate-y-[-1px]
              active:scale-95 active:translate-y-[1px]
            `}
          >
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-gray-400 mx-0.5">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default KeyCombo;
