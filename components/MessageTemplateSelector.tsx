import React from 'react';
import type { MessageTemplate } from '../types';

interface MessageTemplateSelectorProps {
  templates: MessageTemplate[];
  onSelect: (message: string) => void;
}

const MessageTemplateSelector: React.FC<MessageTemplateSelectorProps> = ({ templates, onSelect }) => {
  if (templates.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMessage = e.target.value;
    if (selectedMessage) {
      onSelect(selectedMessage);
    }
  };

  return (
    <div>
      <label htmlFor="template-select" className="block mb-2 text-sm font-medium text-gray-300">
        Message Template (Optional)
      </label>
      <div className="relative">
        <select
          id="template-select"
          onChange={handleChange}
          defaultValue=""
          className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 appearance-none"
        >
          <option value="" disabled>
            Select a pre-written template...
          </option>
          {templates.map((template) => (
            <option key={template.id} value={template.message}>
              {template.title}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplateSelector;