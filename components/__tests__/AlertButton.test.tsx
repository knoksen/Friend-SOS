import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlertButton from '../AlertButton';
import { playSound } from '../../services/soundService';

// Mock the soundService
jest.mock('../../services/soundService', () => ({
  playSound: jest.fn()
}));

describe('AlertButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the alert button', () => {
    render(<AlertButton onPress={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should call onPress when clicked', async () => {
    const onPress = jest.fn();
    render(<AlertButton onPress={onPress} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onPress).toHaveBeenCalled();
  });

  it('should play sound when pressed', async () => {
    render(<AlertButton onPress={() => {}} soundEnabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(playSound).toHaveBeenCalledWith('alert', expect.any(Number));
    });
  });

  it('should not play sound when disabled', async () => {
    render(<AlertButton onPress={() => {}} soundEnabled={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(playSound).not.toHaveBeenCalled();
  });

  it('should show loading state while processing', async () => {
    const onPress = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<AlertButton onPress={onPress} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});
