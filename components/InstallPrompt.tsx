import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-red-600 dark:bg-red-700 rounded-lg shadow-lg p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install Friend SOS</h3>
          <p className="text-sm text-red-100">Get quick access to emergency features</p>
        </div>
        <button
          onClick={handleInstallClick}
          className="ml-4 px-4 py-2 bg-white text-red-600 rounded-md font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Install
        </button>
      </div>
    </div>
  );
};
