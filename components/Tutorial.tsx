import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/uiSounds';
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptics';

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({
  steps,
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlight(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        playUISound('CLICK');
        vibrate(HAPTIC_PATTERNS.SUCCESS);
      }
    }
  }, [currentStep, isOpen, steps]);

  if (!isOpen || !highlight) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onComplete();
      setCurrentStep(0);
    }
  };

  const handleSkip = () => {
    onSkip();
    setCurrentStep(0);
  };

  const { title, content, position } = steps[currentStep];

  const positionStyles = {
    top: {
      tooltip: `bottom-[${highlight.bottom + 10}px] left-[${highlight.left + highlight.width / 2}px] transform -translate-x-1/2`,
      arrow: 'bottom-[-8px] left-1/2 transform -translate-x-1/2 rotate-45'
    },
    bottom: {
      tooltip: `top-[${highlight.top + highlight.height + 10}px] left-[${highlight.left + highlight.width / 2}px] transform -translate-x-1/2`,
      arrow: 'top-[-8px] left-1/2 transform -translate-x-1/2 rotate-45'
    },
    left: {
      tooltip: `top-[${highlight.top + highlight.height / 2}px] right-[${window.innerWidth - highlight.left + 10}px] transform -translate-y-1/2`,
      arrow: 'right-[-8px] top-1/2 transform -translate-y-1/2 rotate-45'
    },
    right: {
      tooltip: `top-[${highlight.top + highlight.height / 2}px] left-[${highlight.right + 10}px] transform -translate-y-1/2`,
      arrow: 'left-[-8px] top-1/2 transform -translate-y-1/2 rotate-45'
    }
  }[position];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300">
        {/* Highlight */}
        <div
          className="tutorial-highlight"
          style={{
            top: highlight.top - 4,
            left: highlight.left - 4,
            width: highlight.width + 8,
            height: highlight.height + 8,
          }}
        />

        {/* Tooltip */}
        <div
          className={`absolute ${positionStyles.tooltip} bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-xs z-20`}
          style={{ width: '320px' }}
        >
          <div className={`absolute ${positionStyles.arrow} w-4 h-4 bg-gray-900`} />
          
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{content}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-red-500 w-4' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tutorial;
