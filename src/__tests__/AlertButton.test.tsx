import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertButton from '../components/AlertButton';

describe('AlertButton', () => {
  it('renders correctly when enabled', () => {
    render(<AlertButton onClick={() => {}} disabled={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent(/send sos alert/i);
  });

  it('renders correctly when disabled', () => {
    render(<AlertButton onClick={() => {}} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<AlertButton onClick={handleClick} disabled={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation dialog on click', () => {
    const handleClick = vi.fn();
    render(<AlertButton onClick={handleClick} disabled={false} />);
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to send an SOS alert?');
    expect(handleClick).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });
});
