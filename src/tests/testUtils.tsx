import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import chordsSlice from '@/store/chordsSlice';
import songsSlice from '@/store/songsSlice';

// Keep originals so we can restore logger behavior
const _origConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

export function setTestLogLevel(level: 'silent' | 'error' | 'info' = 'info') {
  if (level === 'silent') {
    console.log = (() => {}) as any;
    console.info = (() => {}) as any;
    console.debug = (() => {}) as any;
    console.warn = (() => {}) as any;
    console.error = (() => {}) as any;
  } else if (level === 'error') {
    console.log = (() => {}) as any;
    console.info = (() => {}) as any;
    console.debug = (() => {}) as any;
    console.warn = _origConsole.warn as any;
    console.error = _origConsole.error as any;
  } else {
    // restore originals
    console.log = _origConsole.log as any;
    console.info = _origConsole.info as any;
    console.debug = _origConsole.debug as any;
    console.warn = _origConsole.warn as any;
    console.error = _origConsole.error as any;
  }
}

export const createTestStore = () => configureStore({
  reducer: {
    chords: chordsSlice,
    songs: songsSlice
  }
});

export const renderWithProviders = (component: React.ReactNode) => {
  const store = createTestStore();
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <GoogleOAuthProvider clientId="test-client-id">
        <Provider store={store}>{component}</Provider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export function getDriveMock(): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@/apps/songs/services/GoogleDriveServiceModern');
  return mod && mod.default ? mod.default : mod;
}

export function resetDriveMock(): void {
  const dm = getDriveMock();
  if (dm && typeof dm.resetMockState === 'function') dm.resetMockState();
}

export async function getInnerInputByTestId(testId: string): Promise<HTMLInputElement> {
  const container = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
  if (!container) throw new Error(`testUtils.getInnerInputByTestId: container not found for ${testId}`);
  const input = container.querySelector('input[role="combobox"], input, textarea') as HTMLInputElement | null;
  if (!input) throw new Error(`testUtils.getInnerInputByTestId: inner input not found for ${testId}`);
  return input;
}

export async function findInputByLabel(labelText: RegExp | string): Promise<HTMLInputElement> {
  const label = Array.from(document.querySelectorAll('label,div,span')).find(el => {
    const text = el.textContent || '';
    if (labelText instanceof RegExp) return labelText.test(text);
    return text.trim() === String(labelText).trim();
  });
  if (!label) throw new Error(`testUtils.findInputByLabel: label not found: ${labelText}`);
  const parent = label.parentElement as HTMLElement | null;
  if (!parent) throw new Error('testUtils.findInputByLabel: label parent not found');
  const input = parent.querySelector('input, textarea') as HTMLInputElement | null;
  if (input) return input;
  const gp = parent.parentElement as HTMLElement | null;
  const input2 = gp?.querySelector('input, textarea') as HTMLInputElement | null;
  if (input2) return input2;
  throw new Error(`testUtils.findInputByLabel: input not found adjacent to label ${labelText}`);
}

export async function findModalSubmitButton(): Promise<HTMLButtonElement> {
  const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
  if (dialog) {
    const btn = dialog.querySelector('button.ant-btn-primary') as HTMLButtonElement | null;
    if (btn) return btn;
  }
  const candidates = Array.from(document.querySelectorAll('button')).filter(b => /add song/i.test(b.textContent || '')) as HTMLButtonElement[];
  if (candidates.length > 0) return candidates[0];
  throw new Error('Modal submit button not found');
}

export default {
  renderWithProviders,
  getDriveMock,
  resetDriveMock,
  getInnerInputByTestId,
  findInputByLabel,
  findModalSubmitButton,
  setTestLogLevel
};
