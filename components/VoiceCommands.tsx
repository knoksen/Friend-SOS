import React, { useEffect, useState } from 'react';
import { VoiceCommandService } from '../services/voiceCommandService';

interface VoiceCommandProps {
    onEmergency: () => void;
    onCheckIn: () => void;
    onHelp: () => void;
}

const VoiceCommands: React.FC<VoiceCommandProps> = ({
    onEmergency,
    onCheckIn,
    onHelp
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const voiceService = VoiceCommandService.getInstance();

    useEffect(() => {
        setIsSupported(voiceService.isVoiceSupported());
        
        if (voiceService.isVoiceSupported()) {
            setupVoiceCommands();
            voiceService.setStateChangeCallback(setIsListening);
        }

        return () => {
            voiceService.stopListening();
        };
    }, []);

    const setupVoiceCommands = () => {
        // Emergency commands
        voiceService.registerCommand(
            'emergency',
            onEmergency,
            'Trigger an emergency alert',
            ['help me', 'sos', 'emergency alert']
        );

        // Check-in commands
        voiceService.registerCommand(
            'check in',
            onCheckIn,
            'Respond to an active check-in',
            ['im safe', 'i am safe', 'safe']
        );

        // Help commands
        voiceService.registerCommand(
            'need help',
            onHelp,
            'Signal that you need help',
            ['assistance', 'help needed']
        );
    };

    const toggleVoiceCommands = () => {
        voiceService.toggleListening();
    };

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                    Voice commands are not supported in your browser.
                    Please use a modern browser like Chrome or Edge.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleVoiceCommands}
                        className={`p-3 rounded-full transition-colors ${
                            isListening
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={isListening ? 'Stop voice commands' : 'Start voice commands'}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isListening ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0h14"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                            )}
                        </svg>
                    </button>
                    <div>
                        <p className="text-sm font-medium text-gray-200">
                            Voice Commands
                        </p>
                        <p className="text-xs text-gray-400">
                            {isListening ? 'Listening...' : 'Click to activate'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCommands(!showCommands)}
                    className="text-sm text-gray-400 hover:text-gray-300"
                >
                    {showCommands ? 'Hide Commands' : 'Show Commands'}
                </button>
            </div>

            {showCommands && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Available Commands
                    </h3>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                            Start each command with "Friend SOS" followed by:
                        </p>
                        <ul className="space-y-2">
                            {voiceService.getAvailableCommands().map((cmd, index) => (
                                <li key={index} className="text-sm">
                                    <span className="text-red-400">"{cmd.command}"</span>
                                    <span className="text-gray-400"> - {cmd.description}</span>
                                    {cmd.aliases && cmd.aliases.length > 0 && (
                                        <span className="text-gray-500">
                                            {' '}
                                            (or: {cmd.aliases.map(a => `"${a}"`).join(', ')})
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {isListening && (
                <div className="flex items-center justify-center p-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping bg-red-500 rounded-full opacity-25"></div>
                        <div className="relative w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceCommands;
