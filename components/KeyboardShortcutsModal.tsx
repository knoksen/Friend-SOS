import React, { useState } from 'react';
import KeyCombo from './KeyCombo';

interface ShortcutCategory {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    detail?: string;
  }[];
}

interface ShortcutListItemProps {
  keys: string[];
  description: string;
  detail?: string;
}

const ShortcutListItem: React.FC<ShortcutListItemProps> = ({ keys, description, detail }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group flex items-center justify-between py-2 px-3 border-b border-gray-700 last:border-none hover:bg-gray-700/30 transition-colors rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col">
        <span className="text-gray-300">{description}</span>
        {detail && (
          <span className={`text-xs text-gray-500 transition-all duration-300 ${isHovered ? 'h-auto opacity-100 mt-1' : 'h-0 opacity-0'}`}>
            {detail}
          </span>
        )}
      </div>
      <KeyCombo 
        keys={keys} 
        variant={isHovered ? 'accent' : 'default'}
      />
    </div>
  );
};

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutCategories: ShortcutCategory[] = [
    {
      title: 'Essential Actions',
      shortcuts: [
        { 
          keys: ['Ctrl/⌘', 'Enter'], 
          description: 'Send alert',
          detail: 'Quickly send emergency alert when all required fields are filled'
        },
        { 
          keys: ['Ctrl/⌘', 'M'], 
          description: 'Toggle microphone',
          detail: 'Start/stop voice recording for hands-free message input'
        },
        { 
          keys: ['Esc'], 
          description: 'Close alert/modal',
          detail: 'Quickly dismiss any popup or return to the main form'
        }
      ]
    },
    {
      title: 'Navigation & Settings',
      shortcuts: [
        { 
          keys: ['Ctrl/⌘', ','], 
          description: 'Open settings',
          detail: 'Access app configuration, templates, and preferences'
        },
        { 
          keys: ['Ctrl/⌘', 'K'], 
          description: 'Show keyboard shortcuts',
          detail: 'Display this shortcuts guide anytime'
        },
        { 
          keys: ['Ctrl/⌘', 'H'], 
          description: 'Show help menu',
          detail: 'Access help options and restart the tutorial'
        }
      ]
    },
    {
      title: 'Quick Controls',
      shortcuts: [
        { 
          keys: ['Ctrl/⌘', 'S'], 
          description: 'Preview sound',
          detail: 'Test the selected alert sound at current volume'
        },
        { 
          keys: ['Ctrl/⌘', 'L'], 
          description: 'Toggle location',
          detail: 'Quick toggle for including location in alerts'
        },
        { 
          keys: ['Ctrl/⌘', 'R'], 
          description: 'Reset form',
          detail: 'Clear all fields and return to default state'
        }
      ]
    },
    {
      title: 'Help & Learning',
      shortcuts: [
        { 
          keys: ['Ctrl/⌘', 'T'], 
          description: 'Start tutorial',
          detail: 'Begin the interactive app walkthrough'
        },
        { 
          keys: ['Ctrl/⌘', '?'], 
          description: 'Documentation',
          detail: 'Open the full app documentation in a new tab'
        }
      ]
    }
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
          {/* Categories */}
          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.title} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.shortcuts.map((shortcut) => (
                    <ShortcutListItem
                      key={shortcut.description}
                      keys={shortcut.keys}
                      description={shortcut.description}
                      detail={shortcut.detail}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              Power User Tips:
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500/70">•</span>
                <span>Use <KeyCombo keys={['Tab']} size="sm" /> and <KeyCombo keys={['Shift', 'Tab']} size="sm" /> to navigate between inputs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500/70">•</span>
                <span>Press <KeyCombo keys={['Space']} size="sm" /> or <KeyCombo keys={['Enter']} size="sm" /> to toggle buttons and switches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500/70">•</span>
                <span>Use <KeyCombo keys={['↑']} size="sm" /> <KeyCombo keys={['↓']} size="sm" /> to adjust volume and <KeyCombo keys={['←']} size="sm" /> <KeyCombo keys={['→']} size="sm" /> to navigate options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500/70">•</span>
                <span>Hold <KeyCombo keys={['Shift']} size="sm" /> while clicking sound preview for a longer sample</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500/70">•</span>
                <span>Double-tap <KeyCombo keys={['Esc']} size="sm" /> to quickly reset the entire form</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500/50"
              onChange={(e) => {
                localStorage.setItem('hideShortcutsOnStartup', e.target.checked.toString());
              }}
            />
            <span className="text-sm text-gray-400">Don't show on startup</span>
          </label>
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
