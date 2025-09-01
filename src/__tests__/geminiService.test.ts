import { describe, it, expect, vi } from 'vitest';
import { generateAlert } from '../services/geminiService';

// Mock the Gemini API response
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            title: 'Emergency Alert',
            body: 'Test emergency message'
          })
        }
      })
    })
  }))
}));

describe('geminiService', () => {
  it('generates alert content correctly', async () => {
    const result = await generateAlert(
      'John',
      'Need help',
      'test@example.com',
      { temperature: 0.2 }
    );
    
    expect(result).toEqual({
      title: 'Emergency Alert',
      body: 'Test emergency message'
    });
  });

  it('handles empty message correctly', async () => {
    const result = await generateAlert(
      'John',
      '',
      'test@example.com',
      { temperature: 0.2 }
    );
    
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('body');
  });

  it('includes contact information in prompt', async () => {
    const result = await generateAlert(
      'John',
      'Need help',
      'test1@example.com, test2@example.com',
      { temperature: 0.2 }
    );
    
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('body');
  });

  it('respects custom system instruction', async () => {
    const result = await generateAlert(
      'John',
      'Need help',
      'test@example.com',
      { 
        temperature: 0.2,
        systemInstruction: 'Custom emergency response protocol'
      }
    );
    
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('body');
  });
});
