import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  it('renders the header component', () => {
    render(<App />);
    expect(screen.getByText('Friend SOS')).toBeInTheDocument();
  });

  it('renders the name input field', () => {
    render(<App />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
  });

  it('renders the contacts input field', () => {
    render(<App />);
    expect(screen.getByLabelText(/add contacts/i)).toBeInTheDocument();
  });

  it('renders the sound selector', () => {
    render(<App />);
    expect(screen.getByLabelText(/alert sound/i)).toBeInTheDocument();
  });

  it('renders the message input field', () => {
    render(<App />);
    expect(screen.getByLabelText(/what's the emergency/i)).toBeInTheDocument();
  });

  it('renders the alert button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /send alert/i })).toBeInTheDocument();
  });
});
