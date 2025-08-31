import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateAlert } from './services/geminiService';
import { playSound } from './services/soundService';
import type { AlertContent, MessageTemplate } from './types';
import InputField from './components/InputField';
import AlertButton from './components/AlertButton';
import Loader from './components/Loader';
import GeneratedAlert from './components/GeneratedAlert';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import SoundSelector from './components/SoundSelector';
import ContactInput from './components/ContactInput';
import { isValidContact } from './utils/validation';
import LocationInfo from './components/LocationInfo';
import SettingsPage from './components/SettingsPage';
import MessageTemplateSelector from './components/MessageTemplateSelector';
import Toast from './components/Toast';
import Skeleton from './components/Skeleton';
import TutorialManager from './components/TutorialManager';
import HelpButton from './components/HelpButton';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';


// Fix for SpeechRecognition API types which are not in default TS lib.
// This adds type definitions for the Web Speech API to the global scope.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (this: SpeechRecognition, ev: Event) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type GeolocationCoords = {
  latitude: number;
  longitude: number;
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechRecognitionSupported = !!SpeechRecognition;

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [contacts, setContacts] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [selectedSound, setSelectedSound] = useState<string>('default');
  const [volume, setVolume] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedAlert, setGeneratedAlert] = useState<AlertContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [location, setLocation] = useState<GeolocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(true);
  const [includeLocation, setIncludeLocation] = useState<boolean>(true);

  // Settings State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [defaultName, setDefaultName] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Initialize app state
  useEffect(() => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.ts')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }

    // Load all preferences from localStorage on initial render
    const savedContactsRaw = localStorage.getItem('sosContacts');
    if (savedContactsRaw) {
      try {
        const savedContacts = JSON.parse(savedContactsRaw);
        if (Array.isArray(savedContacts)) {
          setContacts(savedContacts);
        } else if (typeof savedContacts === 'string') {
          setContacts(savedContacts.split(',').map(c => c.trim()).filter(Boolean));
        }
      } catch (e) {
        if (typeof savedContactsRaw === 'string') {
           setContacts(savedContactsRaw.split(',').map(c => c.trim()).filter(Boolean));
        }
        console.error("Failed to parse contacts from localStorage", e);
      }
    }

    const savedSound = localStorage.getItem('sosSound');
    if (savedSound) setSelectedSound(savedSound);
    
    const savedVolume = localStorage.getItem('sosVolume');
    if (savedVolume) setVolume(parseFloat(savedVolume));

    const savedIncludeLocation = localStorage.getItem('sosIncludeLocation');
    if (savedIncludeLocation) setIncludeLocation(savedIncludeLocation === 'true');
    
    // Load Settings
    const savedDefaultName = localStorage.getItem('sosDefaultName');
    if (savedDefaultName) {
      setDefaultName(savedDefaultName);
      setName(savedDefaultName); // Pre-fill the name field
    }
    const savedTemperature = localStorage.getItem('sosTemperature');
    if (savedTemperature) setTemperature(parseFloat(savedTemperature));
    
    const savedSystemInstruction = localStorage.getItem('sosSystemInstruction');
    if (savedSystemInstruction) setCustomSystemInstruction(savedSystemInstruction);

    // Show keyboard shortcuts on first visit unless disabled
    const hideShortcutsOnStartup = localStorage.getItem('hideShortcutsOnStartup');
    if (hideShortcutsOnStartup !== 'true') {
      setShowKeyboardShortcuts(true);
    }

    const savedTemplates = localStorage.getItem('sosTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to parse templates from localStorage", e);
      }
    }

    // Fetch location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsFetchingLocation(false);
            },
            (err) => {
                setLocationError(`Location access denied: ${err.message}.`);
                setIsFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        setLocationError("Geolocation is not supported by this browser.");
        setIsFetchingLocation(false);
    }

  }, []);

  // Persist all state to localStorage
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('sosContacts', JSON.stringify(contacts));
    } else {
      localStorage.removeItem('sosContacts');
    }
  }, [contacts]);
  useEffect(() => { localStorage.setItem('sosSound', selectedSound); }, [selectedSound]);
  useEffect(() => { localStorage.setItem('sosVolume', String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem('sosIncludeLocation', String(includeLocation)); }, [includeLocation]);
  useEffect(() => { localStorage.setItem('sosDefaultName', defaultName); }, [defaultName]);
  useEffect(() => { localStorage.setItem('sosTemperature', String(temperature)); }, [temperature]);
  useEffect(() => { localStorage.setItem('sosSystemInstruction', customSystemInstruction); }, [customSystemInstruction]);
  useEffect(() => { localStorage.setItem('sosTemplates', JSON.stringify(templates)); }, [templates]);


  useEffect(() => {
    if (!speechRecognitionSupported) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript.trim() + ' ';
        }
      }
      if (finalTranscript) {
        setMessage(prev => prev + finalTranscript);
      }
    };
    recognitionRef.current = recognition;
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch(e) {
        console.error("Error starting speech recognition:", e);
        setError("Could not start voice recording. Please check microphone permissions.");
      }
    }
  };


  const handleSendAlert = useCallback(async () => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (contacts.length === 0) {
      setError('Please enter at least one contact.');
      return;
    }
    if (contacts.some(c => !isValidContact(c))) {
      setError('Please correct any invalid contacts before sending.');
      return;
    }
    if (includeLocation && !location) {
        setError("Your location has not been determined yet. Please wait or disable location sharing.");
        return;
    }

    setIsLoading(true);
    setGeneratedAlert(null);
    
    let messageWithLocation = message;
    if (includeLocation && location) {
        messageWithLocation += `\n\nMy current location is: [${location.latitude}, ${location.longitude}].`;
    }

    try {
      const alertContent = await generateAlert(name, messageWithLocation, contacts.join(', '), {
        temperature,
        systemInstruction: customSystemInstruction,
      });
      setGeneratedAlert(alertContent);
      playSound(selectedSound, volume);
      showToast('Alert generated successfully!', 'success');
    } catch (e) {
      const err = e as Error;
      const errorMessage = `Failed to send alert. ${err.message}. Ensure your API key is configured correctly.`;
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [name, message, contacts, selectedSound, volume, location, includeLocation, temperature, customSystemInstruction]);
  
  const handlePreviewSound = useCallback(() => {
    playSound(selectedSound, volume);
  }, [selectedSound, volume]);

  const handleSelectTemplate = (templateMessage: string) => {
    setMessage(templateMessage);
  };

  const resetForm = () => {
    setName(defaultName); // Reset name to default
    setMessage('');
    setGeneratedAlert(null);
    setError(null);
    setIsLoading(false);
  }
  
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all app data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  const allContactsValid = contacts.length > 0 && contacts.every(isValidContact);

  // Double Escape handling
  const lastEscPress = useRef<number>(0);
  const escDelay = 300; // ms between presses to count as double-tap

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Essential Actions
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading && name.trim() && allContactsValid) {
        e.preventDefault();
        handleSendAlert();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && speechRecognitionSupported) {
        e.preventDefault();
        handleToggleListening();
      }
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscPress.current < escDelay) {
          // Double Escape press - Reset form
          e.preventDefault();
          resetForm();
          lastEscPress.current = 0; // Reset timer
        } else {
          // Single Escape press - Close modals
          e.preventDefault();
          if (generatedAlert) resetForm();
          if (showSettings) setShowSettings(false);
          if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
          if (showHelpMenu) setShowHelpMenu(false);
          lastEscPress.current = now;
        }
      }

      // Navigation & Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHelpMenu(prev => !prev);
      }

      // Quick Controls
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handlePreviewSound();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIncludeLocation(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetForm();
      }

      // Help & Learning
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setIsTutorialOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        window.open('https://github.com/yourusername/friend-sos#documentation', '_blank');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    handleSendAlert, handleToggleListening, handlePreviewSound, generatedAlert,
    isLoading, name, allContactsValid, showSettings, showKeyboardShortcuts,
    showHelpMenu, resetForm
  ]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <Skeleton height="h-16" className="rounded-t-2xl" /> {/* Header */}
          <div className="space-y-4 p-6">
            <Skeleton height="h-12" /> {/* Name input */}
            <Skeleton height="h-24" /> {/* Contacts input */}
            <Skeleton height="h-16" /> {/* Sound selector */}
            <Skeleton height="h-12" /> {/* Location info */}
            <Skeleton height="h-32" /> {/* Message input */}
            <Skeleton height="h-14" className="w-full" /> {/* Send button */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans [perspective:1000px]">
      {/* Toast Messages */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <TutorialManager>
        <div 
          className={`w-full max-w-lg mx-auto transition-transform duration-700 [transform-style:preserve-3d] ${showSettings ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* Front of Card: Main App */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden [backface-visibility:hidden]">
            <Header onSettingsClick={() => setShowSettings(true)} />

          <div className="p-6 md:p-8 space-y-6">
            {generatedAlert ? (
              <GeneratedAlert 
                alert={generatedAlert} 
                onReset={resetForm} 
                contacts={contacts}
              />
            ) : (
              <>
                <div className="space-y-4">
                  <div id="name-input">
                    <InputField
                      id="name"
                      label="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex"
                      required
                    />
                  </div>
                  <div id="contacts-input">
                    <ContactInput
                      value={contacts}
                      onChange={setContacts}
                    />
                  </div>
                  <div id="sound-selector">
                    <SoundSelector
                      value={selectedSound}
                      onChange={(e) => setSelectedSound(e.target.value)}
                      onPreview={handlePreviewSound}
                      volume={volume}
                      onVolumeChange={(e) => setVolume(parseFloat(e.target.value))}
                    />
                  </div>
                  <div id="location-toggle">
                    <LocationInfo 
                      isLoading={isFetchingLocation}
                      location={location}
                      error={locationError}
                      includeLocation={includeLocation}
                      onToggleInclude={() => setIncludeLocation(prev => !prev)}
                    />
                  </div>
                  <MessageTemplateSelector templates={templates} onSelect={handleSelectTemplate} />
                  <div id="message-input">
                    <InputField
                      id="message"
                      label="What's the emergency? (Optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Briefly describe, use a template, or use the mic..."
                      isTextarea
                      voiceSupport={speechRecognitionSupported}
                      isListening={isListening}
                      onVoiceClick={handleToggleListening}
                    />
                  </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                <div className="pt-2" id="send-alert-button">
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <AlertButton onClick={handleSendAlert} disabled={!name.trim() || !allContactsValid} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        {/* Back of Card: Settings */}
        <div className="absolute top-0 left-0 w-full h-full bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
           <SettingsPage
              onClose={() => setShowSettings(false)}
              defaultName={defaultName}
              onDefaultNameChange={setDefaultName}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              customSystemInstruction={customSystemInstruction}
              onCustomSystemInstructionChange={setCustomSystemInstruction}
              onClearData={handleClearData}
              templates={templates}
              onTemplatesChange={setTemplates}
           />
        </div>

      </div>
       <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Friend SOS &copy; {new Date().getFullYear()}. For demonstration purposes only.</p>
      </footer>
      </TutorialManager>
      
      {/* Help Button and Keyboard Shortcuts */}
      <HelpButton 
        onStartTutorial={() => setIsTutorialOpen(true)} 
        onShowShortcuts={() => setShowKeyboardShortcuts(true)}
      />
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};

export default App;