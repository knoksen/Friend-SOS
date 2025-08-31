import React, { useState, useEffect } from 'react';
import type { EmergencyContact, ContactGroup, EmergencyList } from '../types';
import { getContactType } from '../utils/validation';
import { ContactManagementService } from '../services/contactManagementService';

interface ContactEditorProps {
    contact?: EmergencyContact;
    onSave: (contact: Omit<EmergencyContact, 'id'>) => void;
    onCancel: () => void;
    availableGroups: ContactGroup[];
}

const ContactEditor: React.FC<ContactEditorProps> = ({ contact, onSave, onCancel, availableGroups }) => {
    const [name, setName] = useState(contact?.name || '');
    const [contactInfo, setContactInfo] = useState(contact?.contact || '');
    const [type, setType] = useState<'phone' | 'email'>(contact?.type || 'phone');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(contact?.priority || 'medium');
    const [selectedGroups, setSelectedGroups] = useState<string[]>(contact?.groups || []);
    const [notes, setNotes] = useState(contact?.notes || '');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (!contactInfo.trim()) {
            setError('Contact information is required');
            return;
        }

        const contactType = getContactType(contactInfo);
        if (contactType === 'unknown') {
            setError('Invalid contact information format');
            return;
        }

        if (contactType !== type) {
            setError(`Contact format does not match selected type (${type})`);
            return;
        }

        onSave({
            name: name.trim(),
            contact: contactInfo.trim(),
            type,
            priority,
            groups: selectedGroups,
            notes: notes.trim() || undefined
        });
    };

    return (
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                    placeholder="Contact name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Contact Information</label>
                <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                    placeholder={type === 'phone' ? '+1234567890' : 'email@example.com'}
                />
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'phone' | 'email')}
                        className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                        title="Contact type"
                        aria-label="Contact type"
                    >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                        className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                        title="Contact priority"
                        aria-label="Contact priority"
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Groups</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {availableGroups.map(group => (
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
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full bg-gray-800 text-white rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Optional notes about this contact"
                />
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
                    Save Contact
                </button>
            </div>
        </div>
    );
};

export const ContactManager: React.FC = () => {
    const contactService = ContactManagementService.getInstance();
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [groups, setGroups] = useState<ContactGroup[]>([]);
    const [lists, setLists] = useState<EmergencyList[]>([]);
    const [selectedContact, setSelectedContact] = useState<EmergencyContact | undefined>();
    const [showEditor, setShowEditor] = useState(false);
    const [showGroupEditor, setShowGroupEditor] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>('all');

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setContacts(contactService.getAllContacts());
        setGroups(contactService.getAllGroups());
        setLists(contactService.getAllLists());
    };

    const handleSaveContact = (contact: Omit<EmergencyContact, 'id'>) => {
        if (selectedContact) {
            contactService.updateContact({ ...contact, id: selectedContact.id });
        } else {
            contactService.addContact(contact);
        }
        refreshData();
        setShowEditor(false);
        setSelectedContact(undefined);
    };

    const handleDeleteContact = (id: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            contactService.deleteContact(id);
            refreshData();
        }
    };

    const handleSaveGroup = () => {
        if (newGroupName.trim()) {
            contactService.addGroup({
                name: newGroupName.trim(),
                description: '',
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
            });
            refreshData();
            setNewGroupName('');
            setShowGroupEditor(false);
        }
    };

    const filteredContacts = selectedGroupId === 'all'
        ? contacts
        : contacts.filter(c => c.groups.includes(selectedGroupId));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Emergency Contacts</h2>
                <button
                    onClick={() => setShowEditor(true)}
                    className="px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600"
                >
                    Add Contact
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="bg-gray-800 text-white rounded-md px-3 py-2"
                        >
                            <option value="all">All Contacts</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowGroupEditor(true)}
                            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 text-sm"
                        >
                            New Group
                        </button>
                    </div>

                    {showGroupEditor && (
                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="flex-1 bg-gray-800 text-white rounded-md px-3 py-2"
                                placeholder="Group name"
                            />
                            <button
                                onClick={handleSaveGroup}
                                disabled={!newGroupName.trim()}
                                className="px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowGroupEditor(false)}
                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {filteredContacts.map(contact => (
                            <div
                                key={contact.id}
                                className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between group"
                            >
                                <div>
                                    <h3 className="font-medium text-white">{contact.name}</h3>
                                    <p className="text-sm text-gray-400">{contact.contact}</p>
                                    <div className="flex gap-2 mt-1">
                                        {contact.groups.map(groupId => {
                                            const group = groups.find(g => g.id === groupId);
                                            return group ? (
                                                <span
                                                    key={group.id}
                                                    className="px-2 py-0.5 bg-gray-700/50 rounded-full text-xs text-gray-300"
                                                >
                                                    {group.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedContact(contact);
                                            setShowEditor(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteContact(contact.id)}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredContacts.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No contacts found</p>
                        )}
                    </div>
                </div>

                {showEditor && (
                    <div className="flex-1">
                        <ContactEditor
                            contact={selectedContact}
                            onSave={handleSaveContact}
                            onCancel={() => {
                                setShowEditor(false);
                                setSelectedContact(undefined);
                            }}
                            availableGroups={groups}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactManager;
