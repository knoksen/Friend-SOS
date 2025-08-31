import type { AlertContent } from '../../types';

export interface AIGenerateOptions {
    temperature: number;
    systemInstruction?: string;
    maxTokens?: number;
    model?: string;
}

export interface AIProvider {
    id: string;
    name: string;
    description: string;
    isConfigured: () => boolean;
    generateAlert: (
        name: string,
        message: string,
        contacts: string,
        options: AIGenerateOptions
    ) => Promise<AlertContent>;
    configureProvider: (config: AIProviderConfig) => void;
    getRequiredConfigFields: () => string[];
}

export interface AIProviderConfig {
    [key: string]: string | undefined;
    apiKey?: string;
    endpoint?: string;
    model?: string;
    organizationId?: string;
}
