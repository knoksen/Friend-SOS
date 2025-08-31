import React, { useState, useEffect } from 'react';
import { TemplateService } from '../services/templateService';

interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    contactId?: string;
    tags: string[];
    lastUsed?: Date;
    usageCount: number;
}

interface MessageTemplateEditorProps {
    contactId?: string;
    onTemplateSelect: (templateId: string) => void;
    selectedTemplateId?: string;
}

const MessageTemplateEditor: React.FC<MessageTemplateEditorProps> = ({
    contactId,
    onTemplateSelect,
    selectedTemplateId
}) => {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [newTemplate, setNewTemplate] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const templateService = TemplateService.getInstance();

    useEffect(() => {
        loadTemplates();
    }, [contactId]);

    const loadTemplates = () => {
        const loadedTemplates = contactId
            ? templateService.getTemplatesByContact(contactId)
            : templateService.getAllTemplates();
        setTemplates(loadedTemplates);
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            template.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedTags.length === 0 ||
                           selectedTags.some(tag => template.tags.includes(tag));
        return matchesSearch && matchesTags;
    });

    const handleEditTemplate = (template: MessageTemplate) => {
        setEditingTemplate(template);
        setNewTemplate(false);
    };

    const handleCreateTemplate = () => {
        setEditingTemplate({
            id: '',
            name: '',
            content: '',
            tags: [],
            usageCount: 0,
            contactId
        });
        setNewTemplate(true);
    };

    const handleSaveTemplate = () => {
        if (!editingTemplate) return;

        try {
            if (!templateService.validateTemplate(editingTemplate.content)) {
                setError('Invalid template format. Please check your variable placeholders.');
                return;
            }

            if (newTemplate) {
                const { id, usageCount, ...templateData } = editingTemplate;
                templateService.addTemplate(templateData);
            } else {
                templateService.updateTemplate(editingTemplate.id, editingTemplate);
            }

            setEditingTemplate(null);
            setNewTemplate(false);
            setError('');
            loadTemplates();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save template');
        }
    };

    const handleDeleteTemplate = (id: string) => {
        try {
            templateService.deleteTemplate(id);
            loadTemplates();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete template');
        }
    };

    const availableTags = Array.from(
        new Set(templates.flatMap(template => template.tags))
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-200">Message Templates</h2>
                <button
                    onClick={handleCreateTemplate}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    New Template
                </button>
            </div>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />

                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setSelectedTags(prev =>
                                    prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                );
                            }}
                            className={`px-2 py-1 text-xs rounded-full ${
                                selectedTags.includes(tag)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                    {error}
                </div>
            )}

            {editingTemplate ? (
                <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <input
                        type="text"
                        placeholder="Template name"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate(prev => prev ? {
                            ...prev,
                            name: e.target.value
                        } : null)}
                        className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <textarea
                        placeholder="Template content (use {variable} for placeholders)"
                        value={editingTemplate.content}
                        onChange={(e) => setEditingTemplate(prev => prev ? {
                            ...prev,
                            content: e.target.value
                        } : null)}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={editingTemplate.tags.join(', ')}
                        onChange={(e) => setEditingTemplate(prev => prev ? {
                            ...prev,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        } : null)}
                        className="w-full px-3 py-2 bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setEditingTemplate(null);
                                setError('');
                            }}
                            className="px-3 py-1 text-sm text-gray-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveTemplate}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Save Template
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className={`p-4 rounded-lg border ${
                                selectedTemplateId === template.id
                                    ? 'bg-gray-800/70 border-red-500/50'
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-200">{template.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{template.content}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {template.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {template.lastUsed && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Last used: {new Date(template.lastUsed).toLocaleDateString()}
                                            {' • '}
                                            Used {template.usageCount} times
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleEditTemplate(template)}
                                        className="p-1 text-gray-400 hover:text-gray-200"
                                        title="Edit template"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    {!template.contactId && (
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="p-1 text-gray-400 hover:text-red-400"
                                            title="Delete template"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onTemplateSelect(template.id)}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                            selectedTemplateId === template.id
                                                ? 'bg-red-500 text-white'
                                                : 'text-red-400 hover:text-red-300'
                                        }`}
                                    >
                                        Use
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessageTemplateEditor;
