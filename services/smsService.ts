import { SMSProviderManager } from './smsProviders/smsProviderManager';
import type { SMSProviderConfig, SendSMSOptions } from './smsProviders/types';

export class SMSService {
    private static instance: SMSService;
    private providerManager: SMSProviderManager;

    private constructor() {
        this.providerManager = SMSProviderManager.getInstance();
    }

    public static getInstance(): SMSService {
        if (!SMSService.instance) {
            SMSService.instance = new SMSService();
        }
        return SMSService.instance;
    }

    public getAvailableProviders() {
        return this.providerManager.getAllProviders();
    }

    public getActiveProvider() {
        return this.providerManager.getActiveProvider();
    }

    public configureProvider(providerId: string, config: SMSProviderConfig): void {
        this.providerManager.setActiveProvider(providerId, config);
    }

    public isConfigured(): boolean {
        const activeProvider = this.providerManager.getActiveProvider();
        return activeProvider ? activeProvider.isConfigured() : false;
    }

    public getRequiredConfigFields(providerId: string): string[] {
        return this.providerManager.getRequiredConfigFields(providerId);
    }

    public async sendSMS(options: SendSMSOptions): Promise<{ messageId: string }> {
        const activeProvider = this.providerManager.getActiveProvider();
        
        if (!activeProvider) {
            throw new Error("No SMS provider configured. Please configure a provider first.");
        }

        return activeProvider.sendSMS(options);
    }
}
