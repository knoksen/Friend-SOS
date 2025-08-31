import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, checked, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only" // Hide the default checkbox
        />
        <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-red-500' : 'bg-gray-600'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
            checked ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
