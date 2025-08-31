interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    contactId?: string; // Optional: template specific to a contact
    tags: string[]; // e.g., ['emergency', 'medical', 'general']
    lastUsed?: Date;
    usageCount: number;
}

interface TemplateVariables {
    [key: string]: string;
}

export class TemplateService {
    private static instance: TemplateService;
    private readonly STORAGE_KEY = 'friendsos_message_templates';
    private templates: MessageTemplate[] = [];

    private constructor() {
        this.loadTemplates();
    }

    public static getInstance(): TemplateService {
        if (!TemplateService.instance) {
            TemplateService.instance = new TemplateService();
        }
        return TemplateService.instance;
    }

    private loadTemplates(): void {
        const storedTemplates = localStorage.getItem(this.STORAGE_KEY);
        if (storedTemplates) {
            this.templates = JSON.parse(storedTemplates).map((template: MessageTemplate) => ({
                ...template,
                lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined
            }));
        } else {
            // Initialize with default templates
            this.templates = [
                {
                    id: 'default-emergency',
                    name: 'Emergency Alert',
                    content: 'Emergency! I need immediate assistance. {location}',
                    tags: ['emergency'],
                    usageCount: 0
                },
                {
                    id: 'default-medical',
                    name: 'Medical Emergency',
                    content: 'Medical emergency! Please help. I am at {location}. Medical conditions: {conditions}',
                    tags: ['emergency', 'medical'],
                    usageCount: 0
                },
                {
                    id: 'default-checkin',
                    name: 'Check-in Request',
                    content: 'Could you check on me in {duration}? If I don\'t respond, please contact emergency services.',
                    tags: ['general', 'check-in'],
                    usageCount: 0
                }
            ];
            this.saveTemplates();
        }
    }

    private saveTemplates(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templates));
    }

    public getAllTemplates(): MessageTemplate[] {
        return [...this.templates];
    }

    public getTemplatesByContact(contactId: string): MessageTemplate[] {
        return this.templates.filter(template => 
            template.contactId === contactId || !template.contactId
        );
    }

    public getTemplatesByTags(tags: string[]): MessageTemplate[] {
        return this.templates.filter(template =>
            tags.some(tag => template.tags.includes(tag))
        );
    }

    public getTemplate(id: string): MessageTemplate | undefined {
        return this.templates.find(template => template.id === id);
    }

    public addTemplate(template: Omit<MessageTemplate, 'id' | 'usageCount'>): MessageTemplate {
        const newTemplate: MessageTemplate = {
            ...template,
            id: crypto.randomUUID(),
            usageCount: 0
        };
        this.templates.push(newTemplate);
        this.saveTemplates();
        return newTemplate;
    }

    public updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Template not found');
        }

        const updatedTemplate = {
            ...this.templates[index],
            ...updates,
            id // Ensure ID doesn't change
        };

        this.templates[index] = updatedTemplate;
        this.saveTemplates();
        return updatedTemplate;
    }

    public deleteTemplate(id: string): void {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Template not found');
        }

        this.templates.splice(index, 1);
        this.saveTemplates();
    }

    public processTemplate(templateId: string, variables: TemplateVariables): string {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        let message = template.content;
        for (const [key, value] of Object.entries(variables)) {
            message = message.replace(`{${key}}`, value);
        }

        // Update usage statistics
        this.updateTemplate(templateId, {
            lastUsed: new Date(),
            usageCount: template.usageCount + 1
        });

        return message;
    }

    public getAvailableVariables(templateId: string): string[] {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        const matches = template.content.match(/{([^}]+)}/g);
        return matches ? matches.map(match => match.slice(1, -1)) : [];
    }

    public validateTemplate(content: string): boolean {
        // Check for matching curly braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            return false;
        }

        // Check for empty variable names
        const hasEmptyVariables = /{[^}]*}/g.test(content);
        if (hasEmptyVariables) {
            return false;
        }

        // Check for nested variables
        const hasNestedVariables = /{[^}]*{[^}]*}/g.test(content);
        if (hasNestedVariables) {
            return false;
        }

        return true;
    }
}
