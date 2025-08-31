import { AlertContent } from '../../types';
import type { AIProvider, AIGenerateOptions, AIProviderConfig } from './types';

import OpenAI from 'openai';

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an AI assistant for the "Friend SOS" app. Your role is to take a user's name, their emergency message, and a list of their contacts, and then generate a clear, concise, and urgent alert.
Your response must be in JSON format with the following schema:
{
    "title": "A very short, urgent title for the alert. Example: 'URGENT: SOS from [Name]'",
    "body": "A concise alert body ready for the user to send via SMS/WhatsApp. It must clearly state the sender's name, message, and list the intended recipients. If GPS coordinates are provided, format them clearly and add a Google Maps link."
}
`;

export class OpenAIProvider implements AIProvider {
    private client: OpenAI | null = null;
    private model: string = 'gpt-3.5-turbo';
    
    public id = 'openai';
    public name = 'OpenAI';
    public description = 'Uses OpenAI\'s models to generate emergency alerts.';

    constructor(config?: AIProviderConfig) {
        if (config) {
            this.configureProvider(config);
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    configureProvider(config: AIProviderConfig): void {
        if (!config.apiKey) {
            throw new Error("API key is required for OpenAI provider");
        }

        const configuration: OpenAI.ClientOptions = {
            apiKey: config.apiKey,
            baseURL: config.endpoint,
        };

        if (config.organizationId) {
            configuration.organization = config.organizationId;
        }

        this.client = new OpenAI(configuration);
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
        if (!this.client) {
            throw new Error("OpenAI provider not configured. Please set your API key.");
        }

        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: options.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION
                    },
                    {
                        role: 'user',
                        content: `
                            My name is "${name}" and I am sending an urgent SOS alert.
                            The contacts I am sending this to are: ${contacts}.
                            My emergency message is: "${message || 'No message provided.'}".
                            Please create the alert.
                        `
                    }
                ],
                temperature: options.temperature,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error("API returned an empty response.");
            }

            const parsedResponse: AlertContent = JSON.parse(content);
            return parsedResponse;
        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            throw new Error("Failed to generate alert from OpenAI service.");
        }
    }
}
