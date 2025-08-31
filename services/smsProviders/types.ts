export interface SMSProviderConfig {
    [key: string]: string | undefined;
    apiKey?: string;
    accountSid?: string;
    accountSecret?: string;
    from?: string;
}

export interface SendSMSOptions {
    to: string;
    message: string;
    from?: string;
}

export interface SMSProvider {
    id: string;
    name: string;
    description: string;
    configureProvider(config: SMSProviderConfig): void;
    isConfigured(): boolean;
    sendSMS(options: SendSMSOptions): Promise<{ messageId: string }>;
    getRequiredConfigFields(): string[];
}
