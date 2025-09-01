import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../../components/InputField';

describe('InputField Component', () => {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
    placeholder: 'Test placeholder',
  };

  it('renders correctly with basic props', () => {
    render(<InputField {...defaultProps} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('handles text input correctly', async () => {
    const onChange = vi.fn();
    render(<InputField {...defaultProps} onChange={onChange} />);
    
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    expect(onChange).toHaveBeenCalledTimes(5); // Once for each character
  });

  it('renders as textarea when isTextarea is true', () => {
    render(<InputField {...defaultProps} isTextarea={true} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows');
  });

  it('shows voice button when voiceSupport is true', () => {
    render(<InputField {...defaultProps} voiceSupport={true} />);
    expect(screen.getByRole('button', { name: /toggle voice/i })).toBeInTheDocument();
  });

  it('shows active state when isListening is true', () => {
    render(<InputField {...defaultProps} voiceSupport={true} isListening={true} />);
    const voiceButton = screen.getByRole('button', { name: /toggle voice/i });
    expect(voiceButton).toHaveClass('bg-red-600');
  });

  it('handles voice button click', async () => {
    const onVoiceClick = vi.fn();
    render(
      <InputField 
        {...defaultProps} 
        voiceSupport={true} 
        onVoiceClick={onVoiceClick}
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: /toggle voice/i }));
    expect(onVoiceClick).toHaveBeenCalled();
  });

  it('shows required indicator when required is true', () => {
    render(<InputField {...defaultProps} required={true} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
