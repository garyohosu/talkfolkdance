import assert from 'node:assert';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, value);
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

export async function runStorageServiceTests() {
  const module = await import('../scripts/storage-service.js');
  const StorageService = module.StorageService;

  const memory = new MemoryStorage();
  const service = new StorageService({ storage: memory, storageKey: 'test.key', version: 1 });

  let result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, [], 'initial usedIds should be empty');
  assert.strictEqual(result.wasRecovered, false, 'initial load should not report recovery');

  service.saveUsedThemes(['alpha', 'beta']);
  result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, ['alpha', 'beta'], 'saved ids should round-trip');
  assert.strictEqual(result.wasRecovered, false, 'clean data should not report recovery');

  service.addUsedTheme('gamma');
  result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, ['alpha', 'beta', 'gamma'], 'addUsedTheme should append new ids');

  // Duplicate add should not change the stored ids.
  service.addUsedTheme('beta');
  result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, ['alpha', 'beta', 'gamma'], 'duplicates should be ignored');

  // Simulate corrupted JSON.
  memory.setItem('test.key', '{this is not json');
  result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, [], 'corrupted storage should reset to empty');
  assert.strictEqual(result.wasRecovered, true, 'corrupted storage should trigger recovery flag');

  // setItem failure should be caught and surfaced.
  const failingStorage = new MemoryStorage();
  failingStorage.setItem = () => { throw new Error('quota exceeded'); };
  const failingService = new StorageService({ storage: failingStorage, storageKey: 'test.key', version: 1 });
  assert.throws(() => failingService.saveUsedThemes(['zeta']), /quota exceeded/, 'save should rethrow storage errors');

  service.saveUsedThemes(['delta']);
  service.clear();
  result = service.loadUsedThemes();
  assert.deepStrictEqual(result.usedIds, [], 'clear should remove stored ids');
}
