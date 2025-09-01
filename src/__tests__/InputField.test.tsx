import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../../components/InputField';

describe('InputField', () => {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  };

  it('renders with label', () => {
    render(<InputField {...defaultProps} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('handles text input', () => {
    render(<InputField {...defaultProps} />);
    const input = screen.getByLabelText('Test Label');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('renders as textarea when isTextarea is true', () => {
    render(<InputField {...defaultProps} isTextarea />);
    expect(screen.getByLabelText('Test Label').tagName.toLowerCase()).toBe('textarea');
  });

  it('displays voice button when voiceSupport is true', () => {
    render(<InputField {...defaultProps} voiceSupport={true} onVoiceClick={() => {}} />);
    expect(screen.getByLabelText(/voice input/i)).toBeInTheDocument();
  });

  it('shows recording state when isListening is true', () => {
    render(<InputField {...defaultProps} voiceSupport={true} isListening={true} onVoiceClick={() => {}} />);
    expect(screen.getByLabelText(/stop recording/i)).toBeInTheDocument();
  });

  it('marks required fields appropriately', () => {
    render(<InputField {...defaultProps} required />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('required');
  });
});
