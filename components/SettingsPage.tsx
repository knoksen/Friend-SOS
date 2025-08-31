import React, { useState } from 'react';
import type { MessageTemplate } from '../types';

interface SettingsPageProps {
  onClose: () => void;
  defaultName: string;
  onDefaultNameChange: (value: string) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  customSystemInstruction: string;
  onCustomSystemInstructionChange: (value: string) => void;
  onClearData: () => void;
  templates: MessageTemplate[];
  onTemplatesChange: (templates: MessageTemplate[]) => void;
}

const GuideSection: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-red-300 border-b border-red-500/20 pb-2">App Guide</h2>
    <div className="space-y-4 text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg">
      <div>
        <h3 className="font-semibold text-white mb-2">How It Works</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-400">
          <li><span className="font-semibold text-gray-300">Fill Details:</span> Enter your name, contacts, and an optional message.</li>
          <li><span className="font-semibold text-gray-300">Configure:</span> Choose an alert sound and if you want to include your location.</li>
          <li><span className="font-semibold text-gray-300">Generate Alert:</span> Hit the main button. The AI will craft a clear emergency message.</li>
          <li><span className="font-semibold text-gray-300">Dispatch:</span> Use the action buttons (Call, SMS, etc.) on the next screen to send the message via your device's apps.</li>
        </ol>
      </div>
       <div>
        <h3 className="font-semibold text-white mb-2">Feature Breakdown</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li><span className="font-semibold text-gray-300">Contacts:</span> Add contacts by typing and pressing Enter or comma. Valid emails and phone numbers get a green check. You can also paste a comma-separated list.</li>
          <li><span className="font-semibold text-gray-300">Location:</span> If enabled, the app attaches your current GPS coordinates and a Google Maps link to the alert, helping others find you quickly.</li>
          <li><span className="font-semibold text-gray-300">Advanced AI:</span> The <span className="font-mono">Temperature</span> slider controls AI creativity. A custom <span className="font-mono">System Instruction</span> can completely change the AI's tone or response format (for power users).</li>
        </ul>
      </div>
    </div>
  </div>
);

const TemplateManager: React.FC<{ templates: MessageTemplate[]; onTemplatesChange: (templates: MessageTemplate[]) => void; }> = ({ templates, onTemplatesChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleAddTemplate = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    const newTemplate: MessageTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      title: newTitle.trim(),
      message: newMessage.trim(),
    };
    onTemplatesChange([...templates, newTemplate]);
    setNewTitle('');
    setNewMessage('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      onTemplatesChange(templates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-red-300 border-b border-red-500/20 pb-2">Message Templates</h2>
      <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
        <p className="text-sm text-gray-400">Create pre-written messages for faster alerts during an emergency.</p>
        
        {templates.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {templates.map(template => (
              <div key={template.id} className="bg-gray-800/60 p-3 rounded-md flex justify-between items-start gap-2">
                <div className="flex-grow">
                  <p className="font-semibold text-white break-words">{template.title}</p>
                  <p className="text-sm text-gray-400 italic break-words">"{template.message}"</p>
                </div>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  aria-label={`Delete ${template.title} template`}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-700/50 pt-4 space-y-3">
            <h3 className="text-md font-semibold text-white">{templates.length > 0 ? 'Add Another Template' : 'Add Your First Template'}</h3>
             <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Template Title (e.g., Car Trouble)"
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300"
            />
            <textarea
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Template Message (e.g., My car broke down, I need help.)"
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 resize-none"
            />
            <button
                onClick={handleAddTemplate}
                className="w-full bg-red-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={!newTitle.trim() || !newMessage.trim()}
            >
                Add Template
            </button>
        </div>
      </div>
    </div>
  );
};


const SettingsPage: React.FC<SettingsPageProps> = ({
  onClose,
  defaultName,
  onDefaultNameChange,
  temperature,
  onTemperatureChange,
  customSystemInstruction,
  onCustomSystemInstructionChange,
  onClearData,
  templates,
  onTemplatesChange,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-red-600/20 p-6 border-b border-red-500/30 text-center relative flex-shrink-0">
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full text-gray-300/70 hover:bg-white/10 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-white tracking-wider">Settings</h1>
        <p className="text-red-300 mt-1 text-sm">Configure Your App</p>
      </div>
      
      {/* Scrollable Content */}
      <div className="p-6 md:p-8 space-y-8 flex-grow overflow-y-auto">
        
        <GuideSection />

        <TemplateManager templates={templates} onTemplatesChange={onTemplatesChange} />
        
        {/* Standard Settings */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-red-300 border-b border-red-500/20 pb-2">Standard</h2>
            <div>
                 <label htmlFor="default-name" className="block mb-2 text-sm font-medium text-gray-300">
                    Default Name
                </label>
                <input
                    id="default-name"
                    type="text"
                    value={defaultName}
                    onChange={(e) => onDefaultNameChange(e.target.value)}
                    placeholder="Set a name to pre-fill"
                    className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 placeholder-gray-500"
                />
            </div>
            <div>
                 <label className="block mb-2 text-sm font-medium text-gray-300">
                    Data Management
                </label>
                <button
                    onClick={onClearData}
                    className="w-full bg-red-800/60 text-red-200 font-semibold py-3 px-4 rounded-lg hover:bg-red-800 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                >
                    Clear All App Data
                </button>
            </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-red-300 border-b border-red-500/20 pb-2">Advanced AI Controls</h2>
             <div>
                <label htmlFor="temperature" className="block mb-2 text-sm font-medium text-gray-300">
                    AI Temperature: <span className="font-mono text-red-300">{temperature.toFixed(2)}</span>
                </label>
                 <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                    aria-label="AI Temperature"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                />
                <p className="mt-2 text-xs text-gray-500">Controls randomness. Lower is more predictable, higher is more creative.</p>
            </div>
            <div>
                 <label htmlFor="system-instruction" className="block mb-2 text-sm font-medium text-gray-300">
                    Custom System Instruction
                </label>
                 <textarea
                    id="system-instruction"
                    rows={5}
                    value={customSystemInstruction}
                    onChange={(e) => onCustomSystemInstructionChange(e.target.value)}
                    placeholder="e.g., You are a helpful assistant that responds in pirate slang."
                    className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 placeholder-gray-500 resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">Overrides the default AI behavior. Leave blank to use the app's default prompt.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;