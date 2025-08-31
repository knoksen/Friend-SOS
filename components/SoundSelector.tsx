import React from 'react';

interface SoundSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPreview: () => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SoundSelector: React.FC<SoundSelectorProps> = ({ value, onChange, onPreview, volume, onVolumeChange }) => {
  return (
    <div>
      <label htmlFor="sound-select" className="block mb-2 text-sm font-medium text-gray-300">
        Alert Sound & Volume
      </label>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <select
              id="sound-select"
              value={value}
              onChange={onChange}
              className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 appearance-none"
            >
              <option value="default">Default Beep</option>
              <option value="siren">Siren</option>
              <option value="chime">Chime</option>
              <option value="vibration">Vibration (No Volume)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <button
            type="button"
            onClick={onPreview}
            aria-label="Preview sound"
            className="flex-shrink-0 p-3 bg-gray-700/80 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path d="M10 3.167A.833.833 0 0110.833 4v12a.833.833 0 11-1.666 0V4A.833.833 0 0110 3.167zM4.167 9.167a.833.833 0 01.833-.834h2.5a.833.833 0 110 1.667h-2.5a.833.833 0 01-.833-.833zm11.666 0a.833.833 0 00-.833.833v2.5a.833.833 0 101.666 0v-2.5a.833.833 0 00-.833-.833z" /><path fillRule="evenodd" d="M10 18.333A8.333 8.333 0 1010 1.667a8.333 8.333 0 000 16.666zM1.667 10a8.333 8.333 0 1116.666 0A8.333 8.333 0 011.667 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 10a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 10zM3.5 10a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5H4.25A.75.75 0 013.5 10z" />
              <path fillRule="evenodd" d="M2.25 10a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5H3A.75.75 0 012.25 10zM10 2a8 8 0 100 16 8 8 0 000-16zM1.5 10a8.5 8.5 0 1117 0 8.5 8.5 0 01-17 0z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={onVolumeChange}
              disabled={value === 'vibration'}
              aria-label="Volume"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
      </div>
    </div>
  );
};

export default SoundSelector;