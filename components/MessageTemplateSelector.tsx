import React, { useState } from 'react';
import MessageTemplateEditor from './MessageTemplateEditor';
import { TemplateService } from '../services/templateService';

interface MessageTemplateSelectorProps {
  contactId?: string;
  onSelect: (message: string) => void;
  location?: string;
  medicalConditions?: string;
}

const MessageTemplateSelector: React.FC<MessageTemplateSelectorProps> = ({
  contactId,
  onSelect,
  location,
  medicalConditions
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const templateService = TemplateService.getInstance();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    const variables: { [key: string]: string } = {
      location: location || '[Location not available]',
      conditions: medicalConditions || '[No medical conditions specified]',
      duration: '30 minutes' // Default check-in duration
    };

    try {
      const message = templateService.processTemplate(templateId, variables);
      onSelect(message);
    } catch (error) {
      console.error('Error processing template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <MessageTemplateEditor
        contactId={contactId}
        onTemplateSelect={handleTemplateSelect}
        selectedTemplateId={selectedTemplateId}
      />
    </div>
  );
};

export default MessageTemplateSelector;