import React, { useState, useEffect } from 'react';
import { SMSService } from '../services/smsService';
import type { SMSProvider } from '../services/smsProviders/types';

export const SMSSettings: React.FC = () => {
    const smsService = SMSService.getInstance();
    const [providers, setProviders] = useState<SMSProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const [configFields, setConfigFields] = useState<string[]>([]);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        const allProviders = smsService.getAvailableProviders();
        setProviders(allProviders);

        const activeProvider = smsService.getActiveProvider();
        if (activeProvider) {
            setSelectedProvider(activeProvider.id);
            setConfigFields(smsService.getRequiredConfigFields(activeProvider.id));
        }
    }, []);

    const handleProviderChange = (providerId: string) => {
        setSelectedProvider(providerId);
        setConfigFields(smsService.getRequiredConfigFields(providerId));
        setConfig({});
        setError('');
        setSuccess('');
    };

    const handleConfigChange = (field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        try {
            smsService.configureProvider(selectedProvider, config);
            setSuccess('SMS provider configured successfully!');
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to configure SMS provider');
            setSuccess('');
        }
    };

    if (providers.length === 0) {
        return <div>No SMS providers available.</div>;
    }

    return (
        <div className="sms-settings">
            <h2>SMS Settings</h2>
            
            <div className="provider-selector">
                <label>
                    SMS Provider:
                    <select 
                        value={selectedProvider} 
                        onChange={(e) => handleProviderChange(e.target.value)}
                    >
                        <option value="">Select a provider...</option>
                        {providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {selectedProvider && (
                <div className="config-fields">
                    {configFields.map(field => (
                        <div key={field} className="config-field">
                            <label>
                                {field}:
                                <input
                                    type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                                    value={config[field] || ''}
                                    onChange={(e) => handleConfigChange(field, e.target.value)}
                                    placeholder={`Enter ${field}`}
                                />
                            </label>
                        </div>
                    ))}
                    <button 
                        onClick={handleSave}
                        disabled={!selectedProvider || configFields.some(field => !config[field])}
                    >
                        Save Configuration
                    </button>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <style>{`
                .sms-settings {
                    padding: 1rem;
                }

                .provider-selector,
                .config-fields {
                    margin: 1rem 0;
                }

                .config-field {
                    margin: 0.5rem 0;
                }

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                }

                input,
                select {
                    width: 100%;
                    padding: 0.5rem;
                    margin-top: 0.25rem;
                }

                button {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                }

                .error-message {
                    color: #dc3545;
                    margin-top: 1rem;
                }

                .success-message {
                    color: #28a745;
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default SMSSettings;
