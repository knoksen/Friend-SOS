import React from 'react';
import { AIProvider, AIProviderConfig } from '../services/aiProviders/types';
import { AIProviderManager } from '../services/aiProviders/providerManager';

interface AIProviderSelectorProps {
    className?: string;
}

interface ProviderModalProps {
    provider: AIProvider;
    onClose: () => void;
    onSave: (config: AIProviderConfig) => void;
}

const ProviderConfigModal: React.FC<ProviderModalProps> = ({ provider, onClose, onSave }) => {
    const [config, setConfig] = React.useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(config as AIProviderConfig);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Configure {provider.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {provider.getRequiredConfigFields().map(field => (
                        <div key={field}>
                            <label className="block text-sm font-medium mb-1">
                                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input
                                type="text"
                                id={`config-${field}`}
                                name={field}
                                aria-label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                value={config[field] || ''}
                                onChange={e => setConfig(prev => ({ ...prev, [field]: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder={`Enter ${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}`}
                                required
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ className }) => {
    const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
    const [configuring, setConfiguring] = React.useState<AIProvider | null>(null);
    const providerManager = AIProviderManager.getInstance();

    React.useEffect(() => {
        providerManager.initialize();
        const active = providerManager.getActiveProvider();
        if (active) {
            setSelectedProvider(active.id);
        }
    }, []);

    const handleProviderChange = (providerId: string) => {
        const provider = providerManager.getProvider(providerId);
        if (provider) {
            if (!provider.isConfigured()) {
                setConfiguring(provider);
            } else {
                providerManager.setActiveProvider(providerId);
                setSelectedProvider(providerId);
            }
        }
    };

    const handleConfigSave = (config: AIProviderConfig) => {
        if (configuring) {
            providerManager.configureProvider(configuring.id, config);
            providerManager.setActiveProvider(configuring.id);
            setSelectedProvider(configuring.id);
            setConfiguring(null);
        }
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-1">
                AI Provider
            </label>
            <div className="relative">
                <select
                    id="ai-provider-selector"
                    name="ai-provider"
                    aria-label="Select AI Provider"
                    title="Select AI Provider"
                    value={selectedProvider || ''}
                    onChange={e => handleProviderChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="" disabled>Select a provider</option>
                    {providerManager.getAllProviders().map(provider => (
                        <option key={provider.id} value={provider.id}>
                            {provider.name} {provider.isConfigured() ? '(Configured)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {configuring && (
                <ProviderConfigModal
                    provider={configuring}
                    onClose={() => setConfiguring(null)}
                    onSave={handleConfigSave}
                />
            )}
        </div>
    );
};
