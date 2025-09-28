import { StorageService } from './storage-service.js';

class DeckManager {
  constructor({ themes, storageService = new StorageService() } = {}) {
    if (!Array.isArray(themes) || themes.length === 0) {
      throw new Error('themes must be a non-empty array');
    }
    this.storageService = storageService;
    this.themeMap = new Map();
    for (const theme of themes) {
      if (!theme || typeof theme.id !== 'string' || typeof theme.text !== 'string') {
        throw new TypeError('theme entries must include string id and text');
      }
      this.themeMap.set(theme.id, { ...theme });
    }
    const state = this.storageService.loadUsedThemes();
    this.usedIds = new Set(state.usedIds.filter((id) => this.themeMap.has(id)));
    this.availableIds = Array.from(this.themeMap.keys()).filter((id) => !this.usedIds.has(id));
  }

  hasRemaining() {
    return this.availableIds.length > 0;
  }

  get remainingCount() {
    return this.availableIds.length;
  }

  drawNext() {
    if (!this.hasRemaining()) {
      return null;
    }
    const index = Math.floor(Math.random() * this.availableIds.length);
    const [id] = this.availableIds.splice(index, 1);
    this.usedIds.add(id);
    this.storageService.addUsedTheme(id);
    return this.themeMap.get(id);
  }

  reset() {
    this.usedIds.clear();
    this.availableIds = Array.from(this.themeMap.keys());
    this.storageService.clear();
  }
}

export { DeckManager };
