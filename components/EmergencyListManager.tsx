import React, { useState } from 'react';
import type { EmergencyList, EmergencyContact, ContactGroup } from '../types';
import { ContactManagementService } from '../services/contactManagementService';

interface ListEditorProps {
    list?: EmergencyList;
    onSave: (list: Omit<EmergencyList, 'id'>) => void;
    onCancel: () => void;
}

const ListEditor: React.FC<ListEditorProps> = ({ list, onSave, onCancel }) => {
    const contactService = ContactManagementService.getInstance();
    const [name, setName] = useState(list?.name || '');
    const [description, setDescription] = useState(list?.description || '');
    const [selectedContacts, setSelectedContacts] = useState<string[]>(list?.contacts || []);
    const [selectedGroups, setSelectedGroups] = useState<string[]>(list?.groups || []);
    const [error, setError] = useState('');

    const allContacts = contactService.getAllContacts();
    const allGroups = contactService.getAllGroups();

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (selectedContacts.length === 0 && selectedGroups.length === 0) {
            setError('Select at least one contact or group');
            return;
        }

        onSave({
            name: name.trim(),
            description: description.trim() || undefined,
            contacts: selectedContacts,
            groups: selectedGroups.length > 0 ? selectedGroups : undefined
        });
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                    placeholder="Emergency List Name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                    rows={2}
                    placeholder="Optional description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contacts</label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                    {allContacts.map(contact => (
                        <label
                            key={contact.id}
                            className="flex items-center p-2 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedContacts.includes(contact.id)}
                                onChange={(e) => {
                                    setSelectedContacts(prev =>
                                        e.target.checked
                                            ? [...prev, contact.id]
                                            : prev.filter(id => id !== contact.id)
                                    );
                                }}
                                className="mr-3"
                            />
                            <div>
                                <div className="text-white">{contact.name}</div>
                                <div className="text-sm text-gray-400">{contact.contact}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Groups</label>
                <div className="flex flex-wrap gap-2">
                    {allGroups.map(group => (
                        <button
                            key={group.id}
                            onClick={() => {
                                setSelectedGroups(prev =>
                                    prev.includes(group.id)
                                        ? prev.filter(id => id !== group.id)
                                        : [...prev, group.id]
                                );
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                                ${selectedGroups.includes(group.id)
                                    ? 'bg-red-600/80 text-white'
                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                }`}
                            title={`Toggle ${group.name} group`}
                            aria-label={`Toggle ${group.name} group`}
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600"
                >
                    Save List
                </button>
            </div>
        </div>
    );
};

const EmergencyListManager: React.FC = () => {
    const contactService = ContactManagementService.getInstance();
    const [lists, setLists] = useState<EmergencyList[]>(contactService.getAllLists());
    const [selectedList, setSelectedList] = useState<EmergencyList | undefined>();
    const [showEditor, setShowEditor] = useState(false);

    const refreshLists = () => {
        setLists(contactService.getAllLists());
    };

    const handleSaveList = (list: Omit<EmergencyList, 'id'>) => {
        if (selectedList) {
            contactService.updateList({ ...list, id: selectedList.id });
        } else {
            contactService.addList(list);
        }
        refreshLists();
        setShowEditor(false);
        setSelectedList(undefined);
    };

    const handleDeleteList = (id: string) => {
        if (window.confirm('Are you sure you want to delete this emergency list?')) {
            contactService.deleteList(id);
            refreshLists();
        }
    };

    const getListSummary = (list: EmergencyList) => {
        const contacts = contactService.getContactsFromList(list.id);
        return `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Emergency Lists</h3>
                <button
                    onClick={() => setShowEditor(true)}
                    className="px-3 py-1 bg-red-600/80 text-white rounded-md hover:bg-red-600 text-sm"
                >
                    Create List
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="space-y-2">
                        {lists.map(list => (
                            <div
                                key={list.id}
                                className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between group"
                            >
                                <div>
                                    <h4 className="font-medium text-white">{list.name}</h4>
                                    {list.description && (
                                        <p className="text-sm text-gray-400 mt-1">{list.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">{getListSummary(list)}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedList(list);
                                            setShowEditor(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-white"
                                        title={`Edit ${list.name}`}
                                        aria-label={`Edit ${list.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteList(list.id)}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                        title={`Delete ${list.name}`}
                                        aria-label={`Delete ${list.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {lists.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No emergency lists created</p>
                        )}
                    </div>
                </div>

                {showEditor && (
                    <div className="flex-1">
                        <ListEditor
                            list={selectedList}
                            onSave={handleSaveList}
                            onCancel={() => {
                                setShowEditor(false);
                                setSelectedList(undefined);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyListManager;
