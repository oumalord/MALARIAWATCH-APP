export const DEFAULT_LOGO = '/malariawatch-logo.svg';
const LOGO_STORAGE_KEY = 'malariawatch-custom-logo';
export const LOGO_UPDATED_EVENT = 'malariawatch-logo-updated';

export function getStoredLogo(): string {
  if (typeof window === 'undefined') return DEFAULT_LOGO;
  return window.localStorage.getItem(LOGO_STORAGE_KEY) ?? DEFAULT_LOGO;
}

export function setStoredLogo(dataUrl: string | null) {
  if (typeof window === 'undefined') return;

  if (!dataUrl) {
    window.localStorage.removeItem(LOGO_STORAGE_KEY);
  } else {
    window.localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
  }

  window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
}
