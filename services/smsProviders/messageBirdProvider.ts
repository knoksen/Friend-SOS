import type { SMSProvider, SMSProviderConfig, SendSMSOptions } from './types';

interface MessageBirdResponse {
    id: string;
    status: string;
    error?: {
        code: number;
        description: string;
    };
}

export class MessageBirdProvider implements SMSProvider {
    private accessKey: string | null = null;
    private defaultFrom: string | null = null;

    public id = 'messagebird';
    public name = 'MessageBird';
    public description = 'Send SMS using MessageBird\'s messaging service';

    constructor(config?: SMSProviderConfig) {
        if (config) {
            this.configureProvider(config);
        }
    }

    isConfigured(): boolean {
        return !!(this.accessKey && this.defaultFrom);
    }

    configureProvider(config: SMSProviderConfig): void {
        if (!config.accountSecret) {
            throw new Error("Access Key is required for MessageBird provider");
        }
        if (!config.from) {
            throw new Error("Default 'from' number is required for MessageBird provider");
        }

        this.accessKey = config.accountSecret;
        this.defaultFrom = config.from;
    }

    getRequiredConfigFields(): string[] {
        return ['accountSecret', 'from'];
    }

    async sendSMS(options: SendSMSOptions): Promise<{ messageId: string }> {
        if (!this.isConfigured()) {
            throw new Error("MessageBird provider not configured. Please set your credentials.");
        }

        try {
            const response = await fetch(
                'https://rest.messagebird.com/messages',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `AccessKey ${this.accessKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        originator: options.from || this.defaultFrom,
                        recipients: [options.to],
                        body: options.message
                    })
                }
            );

            const data: MessageBirdResponse = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error?.description || 'Failed to send SMS');
            }

            return { messageId: data.id };
        } catch (error) {
            console.error("Error sending SMS via MessageBird:", error);
            throw new Error("Failed to send SMS. Please try again later.");
        }
    }
}
