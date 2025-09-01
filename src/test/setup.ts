import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock CSS modules
vi.mock('*.css', () => ({
  default: {},
}));

afterEach(() => {
  cleanup();
});
