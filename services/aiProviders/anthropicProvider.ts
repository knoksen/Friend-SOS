import { AlertContent } from '../../types';
import type { AIProvider, AIGenerateOptions, AIProviderConfig } from './types';

interface AnthropicResponse {
    content: Array<{
        text: string;
    }>;
}

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an AI assistant for the "Friend SOS" app. Your role is to take a user's name, their emergency message, and a list of their contacts, and then generate a clear, concise, and urgent alert.
Your response must be in JSON format with the following schema:
{
    "title": "A very short, urgent title for the alert. Example: 'URGENT: SOS from [Name]'",
    "body": "A concise alert body ready for the user to send via SMS/WhatsApp. It must clearly state the sender's name, message, and list the intended recipients. If GPS coordinates are provided, format them clearly and add a Google Maps link."
}
`;

export class AnthropicProvider implements AIProvider {
    private apiKey: string | null = null;
    private endpoint: string = 'https://api.anthropic.com/v1/messages';
    private model: string = 'claude-3-opus-20240229';
    
    public id = 'anthropic';
    public name = 'Anthropic Claude';
    public description = 'Uses Anthropic\'s Claude models to generate emergency alerts.';

    constructor(config?: AIProviderConfig) {
        if (config) {
            this.configureProvider(config);
        }
    }

    isConfigured(): boolean {
        return this.apiKey !== null;
    }

    configureProvider(config: AIProviderConfig): void {
        if (!config.apiKey) {
            throw new Error("API key is required for Anthropic provider");
        }
        this.apiKey = config.apiKey;
        this.endpoint = config.endpoint || this.endpoint;
        this.model = config.model || this.model;
    }

    getRequiredConfigFields(): string[] {
        return ['apiKey'];
    }

    async generateAlert(
        name: string,
        message: string,
        contacts: string,
        options: AIGenerateOptions
    ): Promise<AlertContent> {
        if (!this.apiKey) {
            throw new Error("Anthropic provider not configured. Please set your API key.");
        }

        const systemPrompt = options.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
        const userPrompt = `
            My name is "${name}" and I am sending an urgent SOS alert.
            The contacts I am sending this to are: ${contacts}.
            My emergency message is: "${message || 'No message provided.'}".
            Please create the alert.
        `;

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1024,
                    temperature: options.temperature,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    system: 'Respond in JSON format only.'
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
            }

            const data: AnthropicResponse = await response.json();
            const content = data.content[0]?.text;
            
            if (!content) {
                throw new Error("API returned an empty response.");
            }

            const parsedResponse: AlertContent = JSON.parse(content);
            return parsedResponse;
        } catch (error) {
            console.error("Error calling Anthropic API:", error);
            throw new Error("Failed to generate alert from Anthropic service.");
        }
    }
}
