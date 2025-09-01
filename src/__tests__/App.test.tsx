import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the service worker registration
vi.mock('virtual:pwa-register', () => ({
  registerSW: () => ({
    onNeedRefresh: vi.fn(),
    onOfflineReady: vi.fn(),
  }),
}));

// Mock local storage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation(success =>
    success({
      coords: {
        latitude: 51.507351,
        longitude: -0.127758,
      },
    })
  ),
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Friend SOS/i)).toBeInTheDocument();
  });

  it('allows entering a name', async () => {
    render(<App />);
    const nameInput = screen.getByLabelText(/Your Name/i);
    await userEvent.type(nameInput, 'John Doe');
    expect(nameInput).toHaveValue('John Doe');
  });

  it('validates contact input', async () => {
    render(<App />);
    const contactInput = screen.getByLabelText(/Emergency Contacts/i);
    
    // Test invalid contact
    await userEvent.type(contactInput, 'invalid{Enter}');
    expect(screen.getByText(/Please enter valid/i)).toBeInTheDocument();
    
    // Test valid contact
    await userEvent.clear(contactInput);
    await userEvent.type(contactInput, '+1234567890{Enter}');
    expect(screen.queryByText(/Please enter valid/i)).not.toBeInTheDocument();
  });

  it('loads and saves preferences to localStorage', () => {
    // Pre-set some preferences
    localStorage.setItem('sosDefaultName', 'John');
    localStorage.setItem('sosSound', 'alarm');
    localStorage.setItem('sosVolume', '0.8');
    
    render(<App />);
    
    // Verify preferences are loaded
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue('John');
    const soundSelect = screen.getByLabelText(/Alert Sound/i);
    expect(soundSelect).toHaveValue('alarm');
  });

  it('handles location toggling', async () => {
    render(<App />);
    
    // Wait for location to be fetched
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
    
    const locationToggle = screen.getByRole('switch', { name: /Include Location/i });
    expect(locationToggle).toBeChecked();
    
    // Toggle location off
    await userEvent.click(locationToggle);
    expect(locationToggle).not.toBeChecked();
  });

  it('disables send button when required fields are empty', () => {
    render(<App />);
    const sendButton = screen.getByRole('button', { name: /Send Emergency Alert/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when required fields are filled', async () => {
    render(<App />);
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/Your Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Emergency Contacts/i), '+1234567890{Enter}');
    
    const sendButton = screen.getByRole('button', { name: /Send Emergency Alert/i });
    expect(sendButton).toBeEnabled();
  });
});
