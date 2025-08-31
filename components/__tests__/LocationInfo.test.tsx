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

  it('should render location information', () => {
    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText(/Latitude:/)).toBeInTheDocument();
    expect(screen.getByText(/40.7128/)).toBeInTheDocument();
    expect(screen.getByText(/Longitude:/)).toBeInTheDocument();
    expect(screen.getByText(/-74.0060/)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy:/)).toBeInTheDocument();
    expect(screen.getByText(/10m/)).toBeInTheDocument();
  });

  it('should show "Acquiring location..." when no location is provided', () => {
    render(<LocationInfo location={null} />);
    expect(screen.getByText(/Acquiring location.../)).toBeInTheDocument();
  });

  it('should show error message when there is a location error', () => {
    render(<LocationInfo location={null} error="Location access denied" />);
    expect(screen.getByText(/Location access denied/)).toBeInTheDocument();
  });

  it('should format coordinates correctly', () => {
    const preciseLocation = {
      latitude: 40.71284532,
      longitude: -74.00602345,
      accuracy: 5.5,
      timestamp: new Date().getTime()
    };

    render(<LocationInfo location={preciseLocation} />);
    expect(screen.getByText(/40.7128/)).toBeInTheDocument(); // Should round to 4 decimal places
    expect(screen.getByText(/-74.0060/)).toBeInTheDocument();
    expect(screen.getByText(/5.5m/)).toBeInTheDocument();
  });
});
