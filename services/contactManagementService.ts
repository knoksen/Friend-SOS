import type { EmergencyContact, ContactGroup, EmergencyList } from '../types';

export class ContactManagementService {
    private static instance: ContactManagementService;
    private contacts: Map<string, EmergencyContact>;
    private groups: Map<string, ContactGroup>;
    private lists: Map<string, EmergencyList>;

    private constructor() {
        this.contacts = new Map();
        this.groups = new Map();
        this.lists = new Map();
        this.loadFromLocalStorage();
    }

    public static getInstance(): ContactManagementService {
        if (!ContactManagementService.instance) {
            ContactManagementService.instance = new ContactManagementService();
        }
        return ContactManagementService.instance;
    }

    private loadFromLocalStorage(): void {
        try {
            const contactsData = localStorage.getItem('emergency-contacts');
            const groupsData = localStorage.getItem('contact-groups');
            const listsData = localStorage.getItem('emergency-lists');

            if (contactsData) {
                const contacts = JSON.parse(contactsData) as EmergencyContact[];
                this.contacts = new Map(contacts.map(c => [c.id, c]));
            }

            if (groupsData) {
                const groups = JSON.parse(groupsData) as ContactGroup[];
                this.groups = new Map(groups.map(g => [g.id, g]));
            }

            if (listsData) {
                const lists = JSON.parse(listsData) as EmergencyList[];
                this.lists = new Map(lists.map(l => [l.id, l]));
            }
        } catch (error) {
            console.error('Error loading contact data:', error);
        }
    }

    private saveToLocalStorage(): void {
        try {
            localStorage.setItem('emergency-contacts', JSON.stringify(Array.from(this.contacts.values())));
            localStorage.setItem('contact-groups', JSON.stringify(Array.from(this.groups.values())));
            localStorage.setItem('emergency-lists', JSON.stringify(Array.from(this.lists.values())));
        } catch (error) {
            console.error('Error saving contact data:', error);
        }
    }

    // Contact Management
    public addContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
        const newContact: EmergencyContact = {
            ...contact,
            id: Date.now().toString() + Math.random().toString(36).substring(2)
        };
        this.contacts.set(newContact.id, newContact);
        this.saveToLocalStorage();
        return newContact;
    }

    public updateContact(contact: EmergencyContact): void {
        if (!this.contacts.has(contact.id)) {
            throw new Error(`Contact with id ${contact.id} not found`);
        }
        this.contacts.set(contact.id, contact);
        this.saveToLocalStorage();
    }

    public deleteContact(id: string): void {
        if (!this.contacts.delete(id)) {
            throw new Error(`Contact with id ${id} not found`);
        }
        // Remove contact from all lists
        this.lists.forEach(list => {
            if (list.contacts.includes(id)) {
                list.contacts = list.contacts.filter(cid => cid !== id);
            }
        });
        this.saveToLocalStorage();
    }

    public getContact(id: string): EmergencyContact | undefined {
        return this.contacts.get(id);
    }

    public getAllContacts(): EmergencyContact[] {
        return Array.from(this.contacts.values());
    }

    public getContactsByPriority(priority: EmergencyContact['priority']): EmergencyContact[] {
        return this.getAllContacts().filter(c => c.priority === priority);
    }

    // Group Management
    public addGroup(group: Omit<ContactGroup, 'id'>): ContactGroup {
        const newGroup: ContactGroup = {
            ...group,
            id: Date.now().toString() + Math.random().toString(36).substring(2)
        };
        this.groups.set(newGroup.id, newGroup);
        this.saveToLocalStorage();
        return newGroup;
    }

    public updateGroup(group: ContactGroup): void {
        if (!this.groups.has(group.id)) {
            throw new Error(`Group with id ${group.id} not found`);
        }
        this.groups.set(group.id, group);
        this.saveToLocalStorage();
    }

    public deleteGroup(id: string): void {
        if (!this.groups.delete(id)) {
            throw new Error(`Group with id ${id} not found`);
        }
        // Remove group from all contacts
        this.contacts.forEach(contact => {
            if (contact.groups.includes(id)) {
                contact.groups = contact.groups.filter(gid => gid !== id);
            }
        });
        this.saveToLocalStorage();
    }

    public getGroup(id: string): ContactGroup | undefined {
        return this.groups.get(id);
    }

    public getAllGroups(): ContactGroup[] {
        return Array.from(this.groups.values());
    }

    public getContactsByGroup(groupId: string): EmergencyContact[] {
        return this.getAllContacts().filter(c => c.groups.includes(groupId));
    }

    // Emergency List Management
    public addList(list: Omit<EmergencyList, 'id'>): EmergencyList {
        const newList: EmergencyList = {
            ...list,
            id: Date.now().toString() + Math.random().toString(36).substring(2)
        };
        this.lists.set(newList.id, newList);
        this.saveToLocalStorage();
        return newList;
    }

    public updateList(list: EmergencyList): void {
        if (!this.lists.has(list.id)) {
            throw new Error(`List with id ${list.id} not found`);
        }
        this.lists.set(list.id, list);
        this.saveToLocalStorage();
    }

    public deleteList(id: string): void {
        if (!this.lists.delete(id)) {
            throw new Error(`List with id ${id} not found`);
        }
        this.saveToLocalStorage();
    }

    public getList(id: string): EmergencyList | undefined {
        return this.lists.get(id);
    }

    public getAllLists(): EmergencyList[] {
        return Array.from(this.lists.values());
    }

    public getContactsFromList(listId: string): EmergencyContact[] {
        const list = this.lists.get(listId);
        if (!list) {
            throw new Error(`List with id ${listId} not found`);
        }

        const contacts = list.contacts.map(id => this.contacts.get(id)).filter((c): c is EmergencyContact => c !== undefined);
        
        if (list.groups) {
            const groupContacts = list.groups.flatMap(groupId => {
                const group = this.groups.get(groupId);
                return group ? this.getContactsByGroup(group.id) : [];
            });
            
            // Merge and deduplicate contacts
            const allContacts = [...contacts, ...groupContacts];
            return Array.from(new Map(allContacts.map(c => [c.id, c])).values());
        }

        return contacts;
    }

    // Utility Methods
    public exportData(): string {
        const data = {
            contacts: Array.from(this.contacts.values()),
            groups: Array.from(this.groups.values()),
            lists: Array.from(this.lists.values())
        };
        return JSON.stringify(data, null, 2);
    }

    public importData(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            if (data.contacts) {
                this.contacts = new Map(data.contacts.map((c: EmergencyContact) => [c.id, c]));
            }
            if (data.groups) {
                this.groups = new Map(data.groups.map((g: ContactGroup) => [g.id, g]));
            }
            if (data.lists) {
                this.lists = new Map(data.lists.map((l: EmergencyList) => [l.id, l]));
            }
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Invalid import data format');
        }
    }

    public clearAllData(): void {
        this.contacts.clear();
        this.groups.clear();
        this.lists.clear();
        this.saveToLocalStorage();
    }
}
