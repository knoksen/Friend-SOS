import type { AIProvider, AIProviderConfig } from './types';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';

export class AIProviderManager {
    private static instance: AIProviderManager;
    private providers: Map<string, AIProvider> = new Map();
    private activeProvider: AIProvider | null = null;

    private constructor() {
        // Initialize with default providers
        this.registerProvider(new GeminiProvider());
        this.registerProvider(new OpenAIProvider());
        this.registerProvider(new AnthropicProvider());
    }

    public static getInstance(): AIProviderManager {
        if (!AIProviderManager.instance) {
            AIProviderManager.instance = new AIProviderManager();
        }
        return AIProviderManager.instance;
    }

    public registerProvider(provider: AIProvider): void {
        this.providers.set(provider.id, provider);
    }

    public getProvider(id: string): AIProvider | undefined {
        return this.providers.get(id);
    }

    public getAllProviders(): AIProvider[] {
        return Array.from(this.providers.values());
    }

    public getConfiguredProviders(): AIProvider[] {
        return this.getAllProviders().filter(provider => provider.isConfigured());
    }

    public getActiveProvider(): AIProvider | null {
        return this.activeProvider;
    }

    public setActiveProvider(id: string): void {
        const provider = this.getProvider(id);
        if (!provider) {
            throw new Error(`No provider found with id: ${id}`);
        }
        if (!provider.isConfigured()) {
            throw new Error(`Provider ${id} is not configured`);
        }
        this.activeProvider = provider;
        localStorage.setItem('activeProviderId', id);
    }

    public configureProvider(id: string, config: AIProviderConfig): void {
        const provider = this.getProvider(id);
        if (!provider) {
            throw new Error(`No provider found with id: ${id}`);
        }
        provider.configureProvider(config);

        // Save configuration to localStorage
        const safeConfig = {
            ...config,
            apiKey: config.apiKey ? '[HIDDEN]' : undefined // Don't store actual API key
        };
        localStorage.setItem(`provider_${id}_config`, JSON.stringify(safeConfig));
        
        // If this is the first configured provider, make it active
        if (!this.activeProvider && provider.isConfigured()) {
            this.setActiveProvider(id);
        }
    }

    public initialize(): void {
        // Load provider configurations from localStorage
        this.providers.forEach((provider, id) => {
            const savedConfig = localStorage.getItem(`provider_${id}_config`);
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    provider.configureProvider(config);
                } catch (error) {
                    console.error(`Error loading configuration for provider ${id}:`, error);
                }
            }
        });

        // Set active provider from localStorage
        const activeId = localStorage.getItem('activeProviderId');
        if (activeId) {
            try {
                this.setActiveProvider(activeId);
            } catch (error) {
                console.error('Error setting active provider:', error);
                // Try to set the first configured provider as active
                const configuredProvider = this.getConfiguredProviders()[0];
                if (configuredProvider) {
                    this.setActiveProvider(configuredProvider.id);
                }
            }
        }
    }
}
