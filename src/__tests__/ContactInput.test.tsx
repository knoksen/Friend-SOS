import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactInput from "../../components/ContactInput";
import { isValidContact } from '../utils/validation';

vi.mock('../utils/validation', () => ({
  isValidContact: vi.fn()
}));

describe('ContactInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with empty contacts', () => {
    render(<ContactInput value={[]} onChange={() => {}} />);
    
    expect(screen.getByLabelText(/emergency contacts/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter phone number or email/i)).toBeInTheDocument();
  });

  it('displays entered contacts', () => {
    const contacts = ['test@example.com', '+1234567890'];
    render(<ContactInput value={contacts} onChange={() => {}} />);
    
    contacts.forEach(contact => {
      expect(screen.getByText(contact)).toBeInTheDocument();
    });
  });

  it('adds new contact when pressing Enter', () => {
    const handleChange = vi.fn();
    (isValidContact as jest.Mock).mockReturnValue(true);
    
    render(<ContactInput value={[]} onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText(/enter phone number or email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(handleChange).toHaveBeenCalledWith(['test@example.com']);
  });

  it('removes contact when clicking remove button', () => {
    const contacts = ['test@example.com', '+1234567890'];
    const handleChange = vi.fn();
    
    render(<ContactInput value={contacts} onChange={handleChange} />);
    
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    expect(handleChange).toHaveBeenCalledWith(['+1234567890']);
  });

  it('validates contacts before adding', () => {
    const handleChange = vi.fn();
    (isValidContact as jest.Mock).mockReturnValue(false);
    
    render(<ContactInput value={[]} onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText(/enter phone number or email/i);
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays validation state for each contact', () => {
    (isValidContact as jest.Mock).mockImplementation(contact => 
      contact === 'test@example.com'
    );
    
    render(
      <ContactInput 
        value={['test@example.com', 'invalid']} 
        onChange={() => {}} 
      />
    );
    
    const validContact = screen.getByText('test@example.com');
    const invalidContact = screen.getByText('invalid');
    
    expect(validContact.parentElement).toHaveClass('bg-green-100');
    expect(invalidContact.parentElement).toHaveClass('bg-red-100');
  });
});
