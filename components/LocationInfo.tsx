import React, { useEffect, useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { LocationService } from '../services/locationService';

interface EmergencyService {
  name: string;
  type: 'police' | 'hospital' | 'fire' | 'pharmacy';
  address: string;
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  openNow?: boolean;
}

interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

interface LocationInfoProps {
  isLoading: boolean;
  location: { latitude: number; longitude: number; } | null;
  error: string | null;
  includeLocation: boolean;
  onToggleInclude: () => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ isLoading, location, error, includeLocation, onToggleInclude }) => {
  const [address, setAddress] = useState<LocationAddress | null>(null);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const locationService = LocationService.getInstance();

  useEffect(() => {
    if (location && includeLocation) {
      fetchLocationDetails();
    }
  }, [location, includeLocation]);

  const fetchLocationDetails = async () => {
    if (!location) return;

    try {
      setLoadingServices(true);
      const [addressData, services] = await Promise.all([
        locationService.reverseGeocode(location),
        locationService.findNearbyEmergencyServices(location)
      ]);

      setAddress(addressData);
      setEmergencyServices(services);
    } catch (error) {
      console.error('Error fetching location details:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const mapUrl = location ? locationService.getGoogleMapsUrl(location) : '#';
  const staticMapUrl = location ? locationService.getStaticMapUrl(location) : '';

  const renderStatus = () => {
    if (isLoading) {
      return <p className="text-sm text-gray-400">Fetching location...</p>;
    }
    if (error) {
      return <p className="text-sm text-red-400">{error}</p>;
    }
    if (location) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400">Location captured</p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-400 hover:text-red-300 hover:underline"
            >
              View on Map
            </a>
          </div>
          {address && (
            <div className="text-sm text-gray-300">
              <h3 className="font-semibold mb-1">Current Location:</h3>
              <p>{address.formattedAddress}</p>
            </div>
          )}
          {staticMapUrl && (
            <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden">
              <img
                src={staticMapUrl}
                alt="Current location map"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {loadingServices ? (
            <p className="text-sm text-gray-400">Finding nearby emergency services...</p>
          ) : (
            emergencyServices.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Nearby Emergency Services:</h3>
                <div className="space-y-2">
                  {emergencyServices.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex items-start p-2 bg-gray-800/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-300">{service.name}</p>
                        <p className="text-xs text-gray-400">{service.address}</p>
                        <p className="text-xs text-gray-400">
                          {service.distance.toFixed(1)}km away
                          {service.openNow !== undefined && (
                            <span className={service.openNow ? 'text-green-400' : 'text-red-400'}>
                              {' • '}{service.openNow ? 'Open' : 'Closed'}
                            </span>
                          )}
                        </p>
                      </div>
                      {service.phone && (
                        <a
                          href={`tel:${service.phone}`}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Call
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <ToggleSwitch
          id="include-location"
          label="Include Location in Alert"
          checked={includeLocation}
          onChange={onToggleInclude}
        />
        {includeLocation && location && (
          <button
            onClick={fetchLocationDetails}
            className="text-sm text-red-400 hover:text-red-300"
            disabled={loadingServices}
          >
            Refresh Services
          </button>
        )}
      </div>
      <div className="pt-2 border-t border-gray-700/50">
        {renderStatus()}
      </div>
    </div>
  );
};

export default LocationInfo;
