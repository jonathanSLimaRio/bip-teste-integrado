import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv();

// mocks úteis p/ JSDOM (opcional)
Object.defineProperty(window, 'CSS', { value: undefined });
Object.defineProperty(document, 'doctype', { value: '<!DOCTYPE html>' });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
