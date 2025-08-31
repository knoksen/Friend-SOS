import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  isTextarea?: boolean;
  required?: boolean;
  voiceSupport?: boolean;
  isListening?: boolean;
  onVoiceClick?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  isTextarea = false, 
  required = false, 
  voiceSupport = false,
  isListening = false,
  onVoiceClick
}) => {
  const commonClasses = "w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 placeholder-gray-500";
  
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {isTextarea ? (
        <div className="relative w-full">
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className={`${commonClasses} resize-none pr-12`}
          />
          {voiceSupport && (
             <button
              type="button"
              onClick={onVoiceClick}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
              className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-gray-700/80 text-gray-300 hover:bg-red-600 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A6.984 6.984 0 013.1 9H1V7h2.1A7.002 7.002 0 0115.9 7H18v2h-2.1c-.464 2.306-2.288 4.223-4.8 4.93z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default InputField;