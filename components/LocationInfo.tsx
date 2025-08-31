import React from 'react';
import ToggleSwitch from './ToggleSwitch';

type GeolocationCoords = {
  latitude: number;
  longitude: number;
};

interface LocationInfoProps {
  isLoading: boolean;
  location: GeolocationCoords | null;
  error: string | null;
  includeLocation: boolean;
  onToggleInclude: () => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ isLoading, location, error, includeLocation, onToggleInclude }) => {
  const mapUrl = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : '#';

  const renderStatus = () => {
    if (isLoading) {
      return <p className="text-sm text-gray-400">Fetching location...</p>;
    }
    if (error) {
      return <p className="text-sm text-red-400">{error}</p>;
    }
    if (location) {
      return (
        <div className="flex items-center justify-between">
           <p className="text-sm text-green-400">
            Location captured
          </p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-400 hover:text-red-300 hover:underline"
           >
            View on Map
           </a>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
      <ToggleSwitch
        id="include-location"
        label="Include Location in Alert"
        checked={includeLocation}
        onChange={onToggleInclude}
      />
      <div className="pt-2 border-t border-gray-700/50">
        {renderStatus()}
      </div>
    </div>
  );
};

export default LocationInfo;
