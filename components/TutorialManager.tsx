import React, { useState, useEffect } from 'react';
import Tutorial from './Tutorial';

export const tutorialSteps = [
  {
    target: '#name-input',
    title: 'Enter Your Name',
    content: 'Start by entering your name. This will be used to personalize your emergency alerts.',
    position: 'bottom' as const,
  },
  {
    target: '#contacts-input',
    title: 'Add Emergency Contacts',
    content: 'Add phone numbers or email addresses of people to contact in case of emergency. You can add multiple contacts.',
    position: 'bottom' as const,
  },
  {
    target: '#sound-selector',
    title: 'Choose Alert Sound',
    content: 'Select a sound that will play when your alert is sent. You can test the sound and adjust the volume.',
    position: 'left' as const,
  },
  {
    target: '#location-toggle',
    title: 'Location Sharing',
    content: 'Choose whether to include your current location in the alert. This can help people find you quickly.',
    position: 'right' as const,
  },
  {
    target: '#message-input',
    title: 'Emergency Message',
    content: 'Describe your situation or use a template. You can also use voice input if available.',
    position: 'top' as const,
  },
  {
    target: '#send-alert-button',
    title: 'Send Alert',
    content: 'When ready, click this button to send your emergency alert. The system will generate a clear message based on your input.',
    position: 'top' as const,
  },
];

interface TutorialManagerProps {
  children: React.ReactNode;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({ children }) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('sosTutorialSeen');
    if (!seen) {
      setIsTutorialOpen(true);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('sosTutorialSeen', 'true');
    setIsTutorialOpen(false);
    setHasSeenTutorial(true);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('sosTutorialSeen', 'true');
    setIsTutorialOpen(false);
    setHasSeenTutorial(true);
  };

  const startTutorial = () => {
    setIsTutorialOpen(true);
  };

  return (
    <>
      {children}
      <Tutorial
        steps={tutorialSteps}
        isOpen={isTutorialOpen}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
      {hasSeenTutorial && !isTutorialOpen && (
        <button
          onClick={startTutorial}
          className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Restart tutorial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </>
  );
};

export default TutorialManager;
