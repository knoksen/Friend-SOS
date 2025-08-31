import React, { useState, KeyboardEvent, useEffect } from 'react';
import { isValidContact } from '../utils/validation';
import { ContactManagementService } from '../services/contactManagementService';
import type { EmergencyContact, EmergencyList } from '../types';

interface ContactInputProps {
  value: string[];
  onChange: (contacts: string[]) => void;
}

const ContactInput: React.FC<ContactInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [savedContacts, setSavedContacts] = useState<EmergencyContact[]>([]);
  const [savedLists, setSavedLists] = useState<EmergencyList[]>([]);
  const [showSavedContacts, setShowSavedContacts] = useState(false);
  
  useEffect(() => {
    const contactService = ContactManagementService.getInstance();
    setSavedContacts(contactService.getAllContacts());
    setSavedLists(contactService.getAllLists());
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ','].includes(e.key) && inputValue.trim()) {
      e.preventDefault();
      const newContact = inputValue.trim();
      if (newContact && !value.includes(newContact)) {
        onChange([...value, newContact]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const removeContact = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const contactsFromPaste = pasteData.split(/[,;\n]/).map(c => c.trim()).filter(Boolean);
    if(contactsFromPaste.length > 0) {
        const newContacts = [...value];
        contactsFromPaste.forEach(contact => {
            if(!newContacts.includes(contact)) {
                newContacts.push(contact);
            }
        });
        onChange(newContacts);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="contacts" className="text-sm font-medium text-gray-300">
          Contacts to Alert <span className="text-red-400">*</span>
        </label>
        {(savedContacts.length > 0 || savedLists.length > 0) && (
          <button
            onClick={() => setShowSavedContacts(!showSavedContacts)}
            className="text-sm text-red-400 hover:text-red-300"
            aria-label={showSavedContacts ? 'Hide saved contacts' : 'Show saved contacts'}
          >
            {showSavedContacts ? 'Hide Saved' : 'Show Saved'}
          </button>
        )}
      </div>

      {showSavedContacts && (savedContacts.length > 0 || savedLists.length > 0) && (
        <div className="mb-3 space-y-3">
          {savedLists.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Emergency Lists</h4>
              <div className="flex flex-wrap gap-2">
                {savedLists.map(list => {
                  const contactService = ContactManagementService.getInstance();
                  const listContacts = contactService.getContactsFromList(list.id);
                  return (
                    <button
                      key={list.id}
                      onClick={() => {
                        const newContacts = [...value];
                        listContacts.forEach(contact => {
                          if (!newContacts.includes(contact.contact)) {
                            newContacts.push(contact.contact);
                          }
                        });
                        onChange(newContacts);
                      }}
                      className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm hover:bg-red-900/50 transition-colors"
                      title={`Add all contacts from ${list.name}`}
                    >
                      {list.name} ({listContacts.length})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {savedContacts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Saved Contacts</h4>
              <div className="flex flex-wrap gap-2">
                {savedContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      if (!value.includes(contact.contact)) {
                        onChange([...value, contact.contact]);
                      }
                    }}
                    disabled={value.includes(contact.contact)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      value.includes(contact.contact)
                        ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                    title={value.includes(contact.contact) ? 'Already added' : `Add ${contact.name}`}
                  >
                    {contact.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-300 flex flex-wrap items-center gap-2">
        {value.map((contact, index) => {
          const valid = isValidContact(contact);
          return (
            <span
              key={index}
              className={`flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 animate-fade-in ${
                valid 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
              }`}
            >
              {valid ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {contact}
              <button 
                onClick={() => removeContact(index)}
                aria-label={`Remove ${contact}`}
                className="ml-1 text-white/50 hover:text-white focus:outline-none font-bold text-md leading-none"
              >
                &times;
              </button>
            </span>
          );
        })}
        <input
          id="contacts"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? "Type a contact, then press Enter" : ""}
          className="bg-transparent outline-none flex-grow min-w-[150px] py-1"
          aria-label="Add a contact"
        />
      </div>
      {value.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Tip: Add phone numbers or emails. You can also paste a comma-separated list.
        </p>
      )}
    </div>
  );
};

export default ContactInput;