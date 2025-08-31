import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertButton from '../AlertButton';

// Mock the uiSounds module
jest.mock('../../utils/uiSounds', () => ({
  playUISound: jest.fn(),
  resumeAudioContext: jest.fn()
}));

// Mock the haptics module
jest.mock('../../utils/haptics', () => ({
  vibrate: jest.fn(),
  HAPTIC_PATTERNS: {
    ALERT_TRIGGER: [200],
    BUTTON_PRESS: [50]
  }
}));

describe('AlertButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the alert button', () => {
    render(<AlertButton onClick={() => {}} disabled={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('SEND URGENT ALERT');
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<AlertButton onClick={onClick} disabled={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  it('should handle pressed state correctly', () => {
    render(<AlertButton onClick={() => {}} disabled={false} />);

    const button = screen.getByRole('button');
    fireEvent.mouseDown(button);
    expect(button.className).toContain('scale-95');

    fireEvent.mouseUp(button);
    expect(button.className).not.toContain('scale-95');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AlertButton onClick={() => {}} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:bg-red-800/50');
  });
});
