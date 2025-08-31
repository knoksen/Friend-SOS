import React, { useState } from 'react';
import { playUISound } from '../utils/uiSounds';
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptics';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

interface HelpButtonProps {
  onStartTutorial: () => void;
  onShowShortcuts: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onStartTutorial, onShowShortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    playUISound('CLICK');
    vibrate(HAPTIC_PATTERNS.BUTTON_PRESS);
  };

  const handleStartTutorial = () => {
    setIsOpen(false);
    onStartTutorial();
    playUISound('SUCCESS');
    vibrate(HAPTIC_PATTERNS.SUCCESS);
  };

  const handleShowShortcuts = () => {
    setIsOpen(false);
    onShowShortcuts();
    playUISound('CLICK');
    vibrate(HAPTIC_PATTERNS.BUTTON_PRESS);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={handleToggle}
        className="bg-gray-800 text-white w-12 h-12 rounded-full shadow-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-600"
        aria-label="Help and shortcuts"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Help Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-800 rounded-lg shadow-xl w-48 overflow-hidden">
          <button
            onClick={handleStartTutorial}
            className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Start Tutorial
          </button>
          <button
            onClick={handleShowShortcuts}
            className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Keyboard Shortcuts
          </button>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
