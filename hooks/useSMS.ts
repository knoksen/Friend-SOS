import { useState } from 'react';
import { SMSService } from '../services/smsService';

interface UseSMSResult {
    sending: boolean;
    error: string | null;
    sendSMS: (phoneNumber: string, message: string) => Promise<void>;
    isConfigured: boolean;
}

export function useSMS(): UseSMSResult {
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const smsService = SMSService.getInstance();

    const sendSMS = async (phoneNumber: string, message: string) => {
        if (!smsService.isConfigured()) {
            setError('SMS service is not configured. Please configure it in Settings.');
            return;
        }

        try {
            setSending(true);
            setError(null);
            await smsService.sendSMS({
                to: phoneNumber,
                message: message
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send SMS');
            throw err;
        } finally {
            setSending(false);
        }
    };

    return {
        sending,
        error,
        sendSMS,
        isConfigured: smsService.isConfigured()
    };
}
