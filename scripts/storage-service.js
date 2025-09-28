const DEFAULT_STORAGE_KEY = 'talkfolkdance.usedThemes';
const DEFAULT_VERSION = 1;

class FallbackStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, value);
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

class StorageService {
  constructor({ storageKey = DEFAULT_STORAGE_KEY, version = DEFAULT_VERSION, storage } = {}) {
    this.storageKey = storageKey;
    this.version = version;
    if (storage) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = new FallbackStorage();
    }
  }

  loadUsedThemes() {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      return { usedIds: [], version: this.version, wasRecovered: false };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid storage payload');
      }
      if (parsed.version !== this.version || !Array.isArray(parsed.usedIds)) {
        this.storage.removeItem(this.storageKey);
        return { usedIds: [], version: this.version, wasRecovered: true };
      }
      return { usedIds: parsed.usedIds.slice(), version: this.version, wasRecovered: false };
    } catch (error) {
      this.storage.removeItem(this.storageKey);
      return { usedIds: [], version: this.version, wasRecovered: true };
    }
  }

  saveUsedThemes(usedIds) {
    if (!Array.isArray(usedIds)) {
      throw new TypeError('usedIds must be an array');
    }
    const payload = JSON.stringify({ version: this.version, usedIds: [...new Set(usedIds)] });
    this.storage.setItem(this.storageKey, payload);
  }

  addUsedTheme(themeId) {
    if (typeof themeId !== 'string' || themeId.length === 0) {
      throw new TypeError('themeId must be a non-empty string');
    }
    const state = this.loadUsedThemes();
    if (!state.usedIds.includes(themeId)) {
      state.usedIds.push(themeId);
      this.saveUsedThemes(state.usedIds);
    }
    return state.usedIds;
  }

  clear() {
    this.storage.removeItem(this.storageKey);
  }
}

export { StorageService };
