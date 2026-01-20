const API_KEY_STORAGE_KEY = 'claude_api_key';

export class ApiKeyStorage {
  static save(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }

  static get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }

  static remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  static exists(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(API_KEY_STORAGE_KEY) !== null;
  }
}
