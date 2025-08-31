import { GoogleGenAI, Type } from "@google/genai";
import type { AlertContent } from "../../types";
import type { AIProvider, AIGenerateOptions, AIProviderConfig } from "./types";

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an AI assistant for the "Friend SOS" app. Your role is to take a user's name, their emergency message, and a list of their contacts, and then generate a clear, concise, and urgent alert. The output must be in JSON format.
The generated 'body' of the alert must be ready for the user to copy and paste directly into a messaging app like SMS or WhatsApp.
It must include the sender's name.
It must include the sender's message.
It must list the contacts the message is being sent to.
If the user's message includes GPS coordinates in the format [latitude, longitude], you MUST include them in the body and also provide a functional Google Maps link like this: https://www.google.com/maps?q=latitude,longitude.
The tone should be serious and urgent but calm and clear.
`;

// FIX: The 'required' property is not supported in the responseSchema for the Google GenAI API.
// Properties declared in 'properties' are implicitly required.
const alertSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A very short, urgent title for the alert. Example: 'URGENT: SOS from [Name]'."
    },
    body: {
      type: Type.STRING,
      description: "A concise alert body ready for the user to send via SMS/WhatsApp. It must clearly state the sender's name and their message. It must list the intended recipients. If GPS coordinates are in the message, format them clearly and add a Google Maps link."
    }
  }
};

export class GeminiProvider implements AIProvider {
    private ai: GoogleGenAI | null = null;
    public id = 'gemini';
    public name = 'Google Gemini';
    public description = 'Uses Google\'s Gemini AI to generate emergency alerts.';

    constructor(config?: AIProviderConfig) {
        if (config?.apiKey) {
            this.configureProvider(config);
        }
    }

    isConfigured(): boolean {
        return this.ai !== null;
    }

    configureProvider(config: AIProviderConfig): void {
        if (!config.apiKey) {
            throw new Error("API key is required for Gemini provider");
        }
        this.ai = new GoogleGenAI({ apiKey: config.apiKey });
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
        if (!this.ai) {
            throw new Error("Gemini provider not configured. Please set your API key.");
        }

        const prompt = `
            My name is "${name}" and I am sending an urgent SOS alert.
            The contacts I am sending this to are: ${contacts}.
            My emergency message is: "${message || 'No message provided.'}".
            Please create the alert.
        `;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: alertSchema,
                    temperature: options.temperature,
                    systemInstruction: options.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
                },
            });

            const jsonText = response.text.trim();
            if (!jsonText) {
                throw new Error("API returned an empty response.");
            }

            const parsedResponse: AlertContent = JSON.parse(jsonText);
            return parsedResponse;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error("Failed to generate alert from Gemini service.");
        }
    }
}
