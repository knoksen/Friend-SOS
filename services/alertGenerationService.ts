import type { AlertContent } from "../types";
import { AIProviderManager } from "./aiProviders/providerManager";
import { AIGenerateOptions } from "./aiProviders/types";

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an AI assistant for the "Friend SOS" app. Your role is to take a user's name, their emergency message, and a list of their contacts, and then generate a clear, concise, and urgent alert. The output must be in JSON format.
The generated 'body' of the alert must be ready for the user to copy and paste directly into a messaging app like SMS or WhatsApp.
It must include the sender's name.
It must include the sender's message.
It must list the contacts the message is being sent to.
If the user's message includes GPS coordinates in the format [latitude, longitude], you MUST include them in the body and also provide a functional Google Maps link like this: https://www.google.com/maps?q=latitude,longitude.
The tone should be serious and urgent but calm and clear.
`;

export const generateAlert = async (
    name: string, 
    message: string, 
    contacts: string,
    options: AIGenerateOptions
): Promise<AlertContent> => {
    const providerManager = AIProviderManager.getInstance();
    const activeProvider = providerManager.getActiveProvider();

    if (!activeProvider) {
        throw new Error("No AI provider is currently active. Please configure a provider in settings.");
    }

    try {
        return await activeProvider.generateAlert(name, message, contacts, {
            ...options,
            systemInstruction: options.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION
        });
    } catch (error) {
        console.error("Error generating alert:", error);
        throw new Error("Failed to generate alert. Please try again or check your settings.");
    }
};

// Initialize the provider manager with environment variables if available
const initializeDefaultProvider = () => {
    const providerManager = AIProviderManager.getInstance();

    // Try to initialize Gemini provider first (for backward compatibility)
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (geminiApiKey) {
        try {
            providerManager.configureProvider('gemini', { apiKey: geminiApiKey });
            providerManager.setActiveProvider('gemini');
            return;
        } catch (error) {
            console.warn("Failed to initialize Gemini provider:", error);
        }
    }

    // Try OpenAI provider
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
        try {
            providerManager.configureProvider('openai', { apiKey: openaiApiKey });
            providerManager.setActiveProvider('openai');
            return;
        } catch (error) {
            console.warn("Failed to initialize OpenAI provider:", error);
        }
    }

    // Try Anthropic provider
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
        try {
            providerManager.configureProvider('anthropic', { apiKey: anthropicApiKey });
            providerManager.setActiveProvider('anthropic');
            return;
        } catch (error) {
            console.warn("Failed to initialize Anthropic provider:", error);
        }
    }

    // Initialize from localStorage if available
    providerManager.initialize();
};

// Initialize providers when the service is imported
initializeDefaultProvider();
