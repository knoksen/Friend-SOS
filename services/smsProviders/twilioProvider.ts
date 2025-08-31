import type { SMSProvider, SMSProviderConfig, SendSMSOptions } from './types';

interface TwilioMessage {
    body: string;
    to: string;
    from: string;
}

interface TwilioResponse {
    sid: string;
    status: string;
    error_code?: string;
    error_message?: string;
}

export class TwilioProvider implements SMSProvider {
    private accountSid: string | null = null;
    private authToken: string | null = null;
    private defaultFrom: string | null = null;

    public id = 'twilio';
    public name = 'Twilio';
    public description = 'Send SMS using Twilio\'s messaging service';

    constructor(config?: SMSProviderConfig) {
        if (config) {
            this.configureProvider(config);
        }
    }

    isConfigured(): boolean {
        return !!(this.accountSid && this.authToken && this.defaultFrom);
    }

    configureProvider(config: SMSProviderConfig): void {
        if (!config.accountSid) {
            throw new Error("Account SID is required for Twilio provider");
        }
        if (!config.accountSecret) {
            throw new Error("Auth Token is required for Twilio provider");
        }
        if (!config.from) {
            throw new Error("Default 'from' number is required for Twilio provider");
        }

        this.accountSid = config.accountSid;
        this.authToken = config.accountSecret;
        this.defaultFrom = config.from;
    }

    getRequiredConfigFields(): string[] {
        return ['accountSid', 'accountSecret', 'from'];
    }

    async sendSMS(options: SendSMSOptions): Promise<{ messageId: string }> {
        if (!this.isConfigured()) {
            throw new Error("Twilio provider not configured. Please set your credentials.");
        }

        const message: TwilioMessage = {
            body: options.message,
            to: options.to,
            from: options.from || this.defaultFrom!
        };

        try {
            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`)
                    },
                    body: new URLSearchParams({
                        Body: message.body,
                        To: message.to,
                        From: message.from
                    }).toString()
                }
            );

            const data: TwilioResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error_message || 'Failed to send SMS');
            }

            if (data.error_code) {
                throw new Error(`Twilio error ${data.error_code}: ${data.error_message}`);
            }

            return { messageId: data.sid };
        } catch (error) {
            console.error("Error sending SMS via Twilio:", error);
            throw new Error("Failed to send SMS. Please try again later.");
        }
    }
}
