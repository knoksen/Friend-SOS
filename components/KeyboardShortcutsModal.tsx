import React from 'react';

interface ShortcutListItemProps {
  keys: string[];
  description: string;
}

const ShortcutListItem: React.FC<ShortcutListItemProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-none">
    <span className="text-gray-300">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd className="px-2 py-1 text-sm font-semibold text-gray-200 bg-gray-700 rounded shadow-inner">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-gray-400 mx-1">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl/⌘', 'Enter'], description: 'Send alert' },
    { keys: ['Ctrl/⌘', 'M'], description: 'Toggle microphone' },
    { keys: ['Ctrl/⌘', ','], description: 'Open settings' },
    { keys: ['Ctrl/⌘', 'K'], description: 'Show keyboard shortcuts' },
    { keys: ['Ctrl/⌘', 'S'], description: 'Preview sound' },
    { keys: ['Ctrl/⌘', 'L'], description: 'Toggle location sharing' },
    { keys: ['Esc'], description: 'Close alert/modal' },
    { keys: ['Ctrl/⌘', 'H'], description: 'Show help' },
    { keys: ['Ctrl/⌘', 'R'], description: 'Reset form' },
    { keys: ['Ctrl/⌘', 'T'], description: 'Start tutorial' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="shortcuts-title" className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close keyboard shortcuts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <ShortcutListItem
                key={shortcut.description}
                keys={shortcut.keys}
                description={shortcut.description}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Pro Tips:</h3>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>Use Tab and Shift+Tab to navigate between inputs</li>
              <li>Press Space or Enter to toggle buttons and switches</li>
              <li>Use Arrow keys to adjust volume and select options</li>
              <li>Hold Shift while clicking sound preview for a longer sample</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
