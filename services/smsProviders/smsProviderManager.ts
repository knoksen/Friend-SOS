import type { SMSProvider, SMSProviderConfig } from './types';
import { TwilioProvider } from './twilioProvider';
import { MessageBirdProvider } from './messageBirdProvider';

export class SMSProviderManager {
    private static instance: SMSProviderManager;
    private providers: Map<string, SMSProvider>;
    private activeProvider: SMSProvider | null = null;

    private constructor() {
        this.providers = new Map();
        this.registerDefaultProviders();
    }

    public static getInstance(): SMSProviderManager {
        if (!SMSProviderManager.instance) {
            SMSProviderManager.instance = new SMSProviderManager();
        }
        return SMSProviderManager.instance;
    }

    private registerDefaultProviders(): void {
        this.registerProvider(new TwilioProvider());
        this.registerProvider(new MessageBirdProvider());
        // Add more providers here as they are implemented
    }

    public registerProvider(provider: SMSProvider): void {
        if (this.providers.has(provider.id)) {
            throw new Error(`Provider with id '${provider.id}' is already registered`);
        }
        this.providers.set(provider.id, provider);
    }

    public getProvider(providerId: string): SMSProvider | undefined {
        return this.providers.get(providerId);
    }

    public getAllProviders(): SMSProvider[] {
        return Array.from(this.providers.values());
    }

    public getActiveProvider(): SMSProvider | null {
        return this.activeProvider;
    }

    public setActiveProvider(providerId: string, config?: SMSProviderConfig): void {
        const provider = this.getProvider(providerId);
        if (!provider) {
            throw new Error(`Provider '${providerId}' not found`);
        }

        if (config) {
            provider.configureProvider(config);
        }

        if (!provider.isConfigured()) {
            throw new Error(`Provider '${providerId}' is not properly configured`);
        }

        this.activeProvider = provider;
    }

    public isProviderConfigured(providerId: string): boolean {
        const provider = this.getProvider(providerId);
        return provider ? provider.isConfigured() : false;
    }

    public getRequiredConfigFields(providerId: string): string[] {
        const provider = this.getProvider(providerId);
        if (!provider) {
            throw new Error(`Provider '${providerId}' not found`);
        }
        return provider.getRequiredConfigFields();
    }
}
