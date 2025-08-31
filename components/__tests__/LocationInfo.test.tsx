import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import LocationInfo from '../LocationInfo';

describe('LocationInfo', () => {
  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10,
    timestamp: new Date().getTime()
  };

  it('should render location information', async () => {
    const mockFetch = jest.fn();
    
    mockFetch.mockImplementation(async (url: string | URL | Request) => {
      if (url.toString().includes('reverse')) {
        return {
          ok: true,
          json: () => Promise.resolve({
            road: 'Test Street',
            city: 'Test City',
            country: 'Test Country',
            postcode: '12345'
          })
        } as Response;
      }

      return {
        ok: true,
        json: () => Promise.resolve([{
          name: 'Test Hospital',
          type: 'hospital',
          distance: 1000,
          coordinates: [0, 0]
        }])
      } as Response;
    });

    // Override the global fetch
    (global as any).fetch = mockFetch;

    render(<LocationInfo location={mockLocation} includeLocation={true} onToggleInclude={() => {}} isLoading={false} error={null} />);

    // Wait for location details to be fetched
    await screen.findByText('Location captured');

    expect(screen.getByText('Location captured')).toBeInTheDocument();
    expect(screen.getByText('View on Map')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Current location map/i })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<LocationInfo location={null} includeLocation={true} onToggleInclude={() => {}} isLoading={true} error={null} />);
    expect(screen.getByText('Fetching location...')).toBeInTheDocument();
  });

  it('should show error message when there is a location error', () => {
    render(<LocationInfo location={null} includeLocation={true} onToggleInclude={() => {}} isLoading={false} error="Location access denied" />);
    expect(screen.getByText('Location access denied')).toBeInTheDocument();
  });

  it('should handle precise coordinates correctly', () => {
    const preciseLocation = {
      latitude: 40.71284532,
      longitude: -74.00602345,
    };

    render(<LocationInfo location={preciseLocation} includeLocation={true} onToggleInclude={() => {}} isLoading={false} error={null} />);
    const mapLink = screen.getByRole('link', { name: /View on Map/i });
    expect(mapLink).toHaveAttribute('href', expect.stringContaining('40.71284532,-74.00602345'));
  });
});
