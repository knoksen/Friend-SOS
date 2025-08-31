interface VoiceCommand {
    command: string;
    action: () => void | Promise<void>;
    aliases?: string[];
    description: string;
}

interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export class VoiceCommandService {
    private static instance: VoiceCommandService;
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesisUtterance | null = null;
    private isListening: boolean = false;
    private commands: Map<string, VoiceCommand> = new Map();
    private commandHistory: string[] = [];
    private readonly COMMAND_PREFIX = 'friend sos';
    private onStateChange: ((isListening: boolean) => void) | null = null;

    private constructor() {
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.registerDefaultCommands();
    }

    public static getInstance(): VoiceCommandService {
        if (!VoiceCommandService.instance) {
            VoiceCommandService.instance = new VoiceCommandService();
        }
        return VoiceCommandService.instance;
    }

    private initializeSpeechRecognition(): void {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error('Speech recognition is not supported in this browser');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.onStateChange?.(true);
            this.speak('Voice commands activated');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onStateChange?.(false);
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                this.speak('Please enable microphone access to use voice commands');
            }
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            this.handleSpeechResult(event);
        };
    }

    private initializeSpeechSynthesis(): void {
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis is not supported in this browser');
            return;
        }

        this.synthesis = new SpeechSynthesisUtterance();
        this.synthesis.lang = 'en-US';
        this.synthesis.rate = 1.0;
        this.synthesis.pitch = 1.0;
        this.synthesis.volume = 1.0;
    }

    private async handleSpeechResult(event: SpeechRecognitionEvent): Promise<void> {
        const result: VoiceRecognitionResult = {
            transcript: '',
            confidence: 0,
            isFinal: false
        };

        for (let i = event.resultIndex; i < event.results.length; i++) {
            result.transcript = event.results[i][0].transcript.toLowerCase().trim();
            result.confidence = event.results[i][0].confidence;
            result.isFinal = event.results[i].isFinal;

            if (result.isFinal && result.transcript.startsWith(this.COMMAND_PREFIX)) {
                const command = result.transcript.slice(this.COMMAND_PREFIX.length).trim();
                await this.executeCommand(command);
            }
        }
    }

    private async executeCommand(command: string): Promise<void> {
        let matchedCommand: VoiceCommand | undefined;

        for (const [key, cmd] of this.commands.entries()) {
            if (command === key || cmd.aliases?.includes(command)) {
                matchedCommand = cmd;
                break;
            }
        }

        if (matchedCommand) {
            this.commandHistory.push(command);
            try {
                await matchedCommand.action();
            } catch (error) {
                console.error('Error executing command:', error);
                this.speak('Sorry, there was an error executing that command');
            }
        } else {
            this.speak('Sorry, I didn\'t recognize that command');
            this.suggestSimilarCommands(command);
        }
    }

    private suggestSimilarCommands(command: string): void {
        const allCommands = Array.from(this.commands.keys());
        const similar = allCommands
            .map(cmd => ({
                command: cmd,
                similarity: this.calculateSimilarity(command, cmd)
            }))
            .filter(result => result.similarity > 0.5)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);

        if (similar.length > 0) {
            this.speak('Did you mean: ' + similar.map(s => s.command).join(' or '));
        }
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }

        const costs: number[] = [];
        for (let i = 0; i <= longer.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= shorter.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) {
                costs[shorter.length] = lastValue;
            }
        }

        return (longer.length - costs[shorter.length]) / longer.length;
    }

    public registerCommand(
        command: string,
        action: () => void | Promise<void>,
        description: string,
        aliases?: string[]
    ): void {
        this.commands.set(command, { command, action, description, aliases });
    }

    public unregisterCommand(command: string): void {
        this.commands.delete(command);
    }

    public startListening(): void {
        if (!this.recognition || this.isListening) return;

        this.recognition.start();
    }

    public stopListening(): void {
        if (!this.recognition || !this.isListening) return;

        this.recognition.stop();
        this.speak('Voice commands deactivated');
    }

    public toggleListening(): void {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    public speak(text: string): void {
        if (!this.synthesis) return;

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        this.synthesis.text = text;
        window.speechSynthesis.speak(this.synthesis);
    }

    public isVoiceSupported(): boolean {
        return !!(
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
            'speechSynthesis' in window
        );
    }

    public setStateChangeCallback(callback: (isListening: boolean) => void): void {
        this.onStateChange = callback;
    }

    public getAvailableCommands(): { command: string; description: string; aliases?: string[] }[] {
        return Array.from(this.commands.values()).map(({ command, description, aliases }) => ({
            command,
            description,
            aliases
        }));
    }

    private registerDefaultCommands(): void {
        this.registerCommand(
            'help',
            () => {
                const commands = this.getAvailableCommands();
                this.speak('Available commands are: ' + 
                    commands.map(c => c.command).join(', '));
            },
            'List all available voice commands',
            ['commands', 'what can you do']
        );

        this.registerCommand(
            'stop listening',
            () => this.stopListening(),
            'Stop listening for voice commands',
            ['deactivate', 'turn off']
        );
    }

    public getCommandHistory(): string[] {
        return [...this.commandHistory];
    }

    public clearCommandHistory(): void {
        this.commandHistory = [];
    }

    public setVoiceProperties(properties: {
        lang?: string;
        rate?: number;
        pitch?: number;
        volume?: number;
    }): void {
        if (!this.synthesis) return;

        if (properties.lang) this.synthesis.lang = properties.lang;
        if (properties.rate) this.synthesis.rate = properties.rate;
        if (properties.pitch) this.synthesis.pitch = properties.pitch;
        if (properties.volume) this.synthesis.volume = properties.volume;
    }
}
