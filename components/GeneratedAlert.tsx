import React, { useState } from 'react';
import type { AlertContent, AlertStatus } from '../types';
import { getContactType, formatPhoneNumberForURL } from '../utils/validation';
import ProgressBar from './ProgressBar';
import { useSMS } from '../hooks/useSMS';
import Toast from './Toast';

interface GeneratedAlertProps {
  alert: AlertContent;
  onReset: () => void;
  contacts: string[];
}

const CallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);
const SmsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.613-1.476l-6.238 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);
const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.65 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.28 1.4.24 1.15.99l-3.37 14.3c-.19.83-.74 1.02-1.4.63l-4.54-3.32-2.14 2.05c-.23.22-.42.41-.83.41z"/>
  </svg>
)

const ActionButton: React.FC<{href: string; label: string; children: React.ReactNode;}> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-2 bg-gray-700/80 text-gray-300 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
  >
    {children}
  </a>
);

const GeneratedAlert: React.FC<GeneratedAlertProps> = ({ alert, onReset, contacts }) => {
  const encodedTitle = encodeURIComponent(alert.title);
  const encodedBody = encodeURIComponent(alert.body);
  const { sending, error, sendSMS, sendBulkSMS, isConfigured } = useSMS();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [bulkSendResults, setBulkSendResults] = useState<Array<{ to: string; success: boolean; error?: string }>>([]);

  const handleSendSMS = async (phoneNumber: string) => {
    setSendingTo(phoneNumber);
    try {
      await sendSMS(phoneNumber, alert.body);
    } catch (err) {
      setShowError(err instanceof Error ? err.message : 'Failed to send SMS');
    } finally {
      setSendingTo(null);
    }
  };

  const steps = [
    { label: 'Validating', completed: true, current: alert.status === 'validating' },
    { label: 'Generating', completed: alert.status !== 'validating', current: alert.status === 'generating' },
    { label: 'Ready', completed: alert.status === 'ready', current: false },
  ];

  if (alert.status !== 'ready') {
    return (
      <div className="text-center p-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-red-300 mb-8">Generating Alert...</h2>
        <ProgressBar 
          steps={steps} 
          className="mb-8"
        />
        <p className="text-gray-400 text-sm">
          {alert.status === 'validating' ? 'Validating your input...' : 
           alert.status === 'generating' ? 'Generating your alert...' :
           'Processing...'}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center p-4 animate-fade-in">
      <div className="flex justify-center items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-300">Alert Ready to Send!</h2>
      <p className="text-gray-300 mb-6 mt-1">Your message is ready. Click the icons below to send it using your device's apps.</p>
      
      <div className="text-left bg-gray-900/60 p-4 rounded-md border border-gray-700 space-y-3">
        <div>
            <p className="text-sm text-gray-400 font-semibold">Title:</p>
            <p className="font-bold text-lg text-white">{alert.title}</p>
        </div>
        <div>
            <p className="text-sm text-gray-400 font-semibold">Body:</p>
            <p className="text-gray-200 whitespace-pre-wrap">{alert.body}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">Dispatch to Contacts:</h3>
        <ul className="space-y-2">
            {contacts.map((contact, index) => {
                const contactType = getContactType(contact);
                const phoneUrl = formatPhoneNumberForURL(contact);

                return (
                    <li key={index} className={`bg-gray-900/50 p-3 rounded-lg flex items-center justify-between animate-fade-in delay-${index}`}>
                        <span className="font-mono text-sm text-gray-200 truncate pr-2">{contact}</span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {contactType === 'phone' && (
                                <>
                                    <ActionButton href={`tel:${phoneUrl}`} label={`Call ${contact}`}><CallIcon /></ActionButton>
                                    {isConfigured ? (
                                        <button
                                            onClick={() => handleSendSMS(phoneUrl)}
                                            disabled={sending && sendingTo === phoneUrl}
                                            aria-label={`Send SMS to ${contact}`}
                                            title={sending && sendingTo === phoneUrl ? 'Sending...' : 'Send SMS'}
                                            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500
                                                ${sending && sendingTo === phoneUrl 
                                                    ? 'bg-yellow-600/80 text-white cursor-wait' 
                                                    : 'bg-gray-700/80 text-gray-300 hover:bg-red-600 hover:text-white'}`}
                                        >
                                            <SmsIcon />
                                        </button>
                                    ) : (
                                        <ActionButton href={`sms:${phoneUrl}?&body=${encodedBody}`} label={`SMS ${contact}`}><SmsIcon /></ActionButton>
                                    )}
                                    <ActionButton href={`https://wa.me/${phoneUrl}?text=${encodedBody}`} label={`WhatsApp ${contact}`}><WhatsAppIcon /></ActionButton>
                                </>
                            )}
                            {contactType === 'email' && (
                                <ActionButton href={`mailto:${contact}?subject=${encodedTitle}&body=${encodedBody}`} label={`Email ${contact}`}><EmailIcon /></ActionButton>
                            )}
                            {contactType === 'unknown' && <span className="text-xs text-gray-500">No actions</span>}
                        </div>
                    </li>
                );
            })}
        </ul>
      </div>

      <div className="mt-6 border-t border-gray-700/50 pt-4 flex flex-col items-center gap-3">
        {isConfigured && contacts.filter(c => getContactType(c) === 'phone').length > 1 && (
          <button
            onClick={async () => {
              const phoneNumbers = contacts
                .filter(c => getContactType(c) === 'phone')
                .map(c => formatPhoneNumberForURL(c));
              
              try {
                const results = await sendBulkSMS(phoneNumbers, alert.body);
                setBulkSendResults(
                  results.map(r => ({
                    to: r.to,
                    success: !r.error,
                    error: r.error
                  }))
                );
              } catch (err) {
                setShowError(err instanceof Error ? err.message : 'Failed to send bulk SMS');
              }
            }}
            disabled={sending}
            className={`inline-flex items-center gap-2 text-sm ${
              sending 
                ? 'bg-yellow-600/80 cursor-wait' 
                : 'bg-green-600/80 hover:bg-green-700'
            } text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
          >
            {sending ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending to all contacts...
              </>
            ) : (
              <>
                <SmsIcon /> Send SMS to All Contacts
              </>
            )}
          </button>
        )}

        <a 
          href={`https://t.me/share/url?url=&text=${encodedBody}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm bg-blue-500/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <TelegramIcon /> Share on Telegram
        </a>

        {bulkSendResults.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Bulk Send Results:</h3>
            {bulkSendResults.map((result, index) => (
              <div 
                key={index}
                className={`text-sm p-2 rounded ${
                  result.success 
                    ? 'bg-green-900/20 text-green-300' 
                    : 'bg-red-900/20 text-red-300'
                }`}
              >
                <span className="font-mono">{result.to}</span>: {result.success ? 'Sent' : result.error}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="mt-8 w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transition-colors duration-300"
      >
        Create Another Alert
      </button>

      {showError && (
        <Toast
          message={showError}
          type="error"
          onClose={() => setShowError(null)}
          autoHideDuration={5000}
        />
      )}
    </div>
  );
};

export default GeneratedAlert;