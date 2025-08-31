import React from 'react';

interface ProgressBarProps {
  steps: {
    label: string;
    completed: boolean;
    current: boolean;
  }[];
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, className = '' }) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div 
      className={`w-full ${className}`} 
      role="progressbar" 
      aria-label="Alert generation progress"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.label}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  step.completed
                    ? 'border-green-500 bg-green-500 text-white'
                    : step.current
                    ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse'
                    : 'border-gray-600 bg-gray-800/50 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {/* Step label */}
              <span
                className={`mt-2 text-xs font-medium ${
                  step.current ? 'text-red-500' : step.completed ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
