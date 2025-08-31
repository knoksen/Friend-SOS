interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    formattedAddress: string;
}

interface EmergencyService {
    name: string;
    type: 'police' | 'hospital' | 'fire' | 'pharmacy';
    address: string;
    distance: number;
    coordinates: Coordinates;
    phone?: string;
    openNow?: boolean;
}

export class LocationService {
    private static instance: LocationService;
    private watchId: number | null = null;
    private lastLocation: Coordinates | null = null;
    private locationUpdateCallbacks: Set<(location: Coordinates) => void>;

    private constructor() {
        this.locationUpdateCallbacks = new Set();
    }

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    public async getCurrentLocation(): Promise<Coordinates> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.lastLocation = coordinates;
                    resolve(coordinates);
                },
                (error) => {
                    reject(new Error(`Failed to get location: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    public startLocationTracking(callback: (location: Coordinates) => void): void {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by your browser');
        }

        this.locationUpdateCallbacks.add(callback);

        if (this.watchId === null) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.lastLocation = coordinates;
                    this.locationUpdateCallbacks.forEach(cb => cb(coordinates));
                },
                (error) => {
                    console.error('Location tracking error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }

    public stopLocationTracking(callback?: (location: Coordinates) => void): void {
        if (callback) {
            this.locationUpdateCallbacks.delete(callback);
        } else {
            this.locationUpdateCallbacks.clear();
        }

        if (this.locationUpdateCallbacks.size === 0 && this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    public getLastLocation(): Coordinates | null {
        return this.lastLocation;
    }

    public async reverseGeocode(coordinates: Coordinates): Promise<LocationAddress> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}&format=json`,
                {
                    headers: {
                        'Accept-Language': 'en-US'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to get address');
            }

            const data = await response.json();
            
            return {
                street: data.address.road || data.address.street,
                city: data.address.city || data.address.town || data.address.village,
                state: data.address.state,
                country: data.address.country,
                postalCode: data.address.postcode,
                formattedAddress: data.display_name
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw new Error('Failed to get address from coordinates');
        }
    }

    public async findNearbyEmergencyServices(
        coordinates: Coordinates,
        types: Array<'police' | 'hospital' | 'fire' | 'pharmacy'> = ['police', 'hospital', 'fire'],
        radiusKm: number = 5
    ): Promise<EmergencyService[]> {
        try {
            // Using Overpass API to query OpenStreetMap data
            const query = `
                [out:json][timeout:25];
                (
                ${types.map(type => `
                    way(around:${radiusKm * 1000},${coordinates.latitude},${coordinates.longitude})
                        ["amenity"="${type === 'police' ? 'police' : type === 'hospital' ? 'hospital' : type === 'fire' ? 'fire_station' : 'pharmacy'}"];
                    node(around:${radiusKm * 1000},${coordinates.latitude},${coordinates.longitude})
                        ["amenity"="${type === 'police' ? 'police' : type === 'hospital' ? 'hospital' : type === 'fire' ? 'fire_station' : 'pharmacy'}"];
                `).join('')}
                );
                out body;
                >;
                out skel qt;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            if (!response.ok) {
                throw new Error('Failed to fetch emergency services');
            }

            const data = await response.json();
            const services: EmergencyService[] = [];

            data.elements.forEach((element: any) => {
                if (element.tags) {
                    const type = element.tags.amenity === 'police' ? 'police' :
                               element.tags.amenity === 'hospital' ? 'hospital' :
                               element.tags.amenity === 'fire_station' ? 'fire' : 'pharmacy';

                    services.push({
                        name: element.tags.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Service`,
                        type,
                        address: element.tags['addr:street'] ? 
                                `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}` :
                                'Address not available',
                        distance: this.calculateDistance(
                            coordinates,
                            { latitude: element.lat, longitude: element.lon }
                        ),
                        coordinates: {
                            latitude: element.lat,
                            longitude: element.lon
                        },
                        phone: element.tags.phone,
                        openNow: element.tags.opening_hours ? this.isOpenNow(element.tags.opening_hours) : undefined
                    });
                }
            });

            return services.sort((a, b) => a.distance - b.distance);
        } catch (error) {
            console.error('Error finding emergency services:', error);
            throw new Error('Failed to find nearby emergency services');
        }
    }

    private calculateDistance(point1: Coordinates, point2: Coordinates): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(point2.latitude - point1.latitude);
        const dLon = this.toRad(point2.longitude - point1.longitude);
        const lat1 = this.toRad(point1.latitude);
        const lat2 = this.toRad(point2.latitude);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private isOpenNow(openingHours: string): boolean {
        // Basic implementation - can be enhanced for more complex opening hours
        try {
            const now = new Date();
            const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
            const time = now.getHours() * 100 + now.getMinutes();

            const parts = openingHours.toLowerCase().split(';');
            const todayHours = parts.find(p => p.includes(day));

            if (!todayHours) return false;

            const timeRanges = todayHours.match(/\d{2}:\d{2}-\d{2}:\d{2}/g);
            if (!timeRanges) return false;

            return timeRanges.some(range => {
                const [start, end] = range.split('-')
                    .map(t => parseInt(t.replace(':', '')));
                return time >= start && time <= end;
            });
        } catch {
            return false;
        }
    }

    public getGoogleMapsUrl(coordinates: Coordinates): string {
        return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    }

    public getStaticMapUrl(coordinates: Coordinates, zoom: number = 15): string {
        // Using OpenStreetMap static map
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${coordinates.latitude},${coordinates.longitude}&zoom=${zoom}&size=600x400&markers=${coordinates.latitude},${coordinates.longitude},red`;
    }
}
