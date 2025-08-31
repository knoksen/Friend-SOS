import { useState } from 'react';
import { SMSService } from '../services/smsService';

interface BulkSMSResult {
    to: string;
    messageId: string;
    error?: string;
}

interface UseSMSResult {
    sending: boolean;
    error: string | null;
    sendSMS: (phoneNumber: string, message: string) => Promise<void>;
    sendBulkSMS: (phoneNumbers: string[], message: string) => Promise<BulkSMSResult[]>;
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

    const sendBulkSMS = async (phoneNumbers: string[], message: string): Promise<BulkSMSResult[]> => {
        if (!smsService.isConfigured()) {
            setError('SMS service is not configured. Please configure it in Settings.');
            return [];
        }

        try {
            setSending(true);
            setError(null);
            return await smsService.sendBulkSMS(phoneNumbers, message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send bulk SMS');
            throw err;
        } finally {
            setSending(false);
        }
    };

    return {
        sending,
        error,
        sendSMS,
        sendBulkSMS,
        isConfigured: smsService.isConfigured()
    };
}
