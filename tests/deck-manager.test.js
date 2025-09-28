import assert from 'node:assert';

class MemoryStorage {
  constructor(initial = {}) {
    this.map = new Map(Object.entries(initial));
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

export async function runDeckManagerTests() {
  const { StorageService } = await import('../scripts/storage-service.js');
  const { DeckManager } = await import('../scripts/deck-manager.js');
  const themes = [
    { id: 't1', text: 'Theme 1' },
    { id: 't2', text: 'Theme 2' },
    { id: 't3', text: 'Theme 3' }
  ];

  const memory = new MemoryStorage();
  const storageService = new StorageService({ storage: memory, storageKey: 'deck.test', version: 1 });
  const deck = new DeckManager({ themes, storageService });

  assert.strictEqual(deck.remainingCount, 3, 'initial remaining count should match themes length');
  assert.strictEqual(deck.hasRemaining(), true, 'deck should have remaining themes');

  const first = deck.drawNext();
  assert.ok(first, 'drawNext should return a theme');
  assert.ok(['t1', 't2', 't3'].includes(first.id));
  assert.strictEqual(deck.remainingCount, 2, 'remaining count should decrease');

  const second = deck.drawNext();
  assert.notStrictEqual(second.id, first.id, 'drawn themes should not duplicate');

  const third = deck.drawNext();
  assert.strictEqual(deck.hasRemaining(), false, 'should report no themes remaining');
  assert.strictEqual(deck.remainingCount, 0, 'remaining count should be zero');

  const fourth = deck.drawNext();
  assert.strictEqual(fourth, null, 'drawing with empty deck should return null');

  // Ensure persistence captured previously drawn IDs
  const storedState = storageService.loadUsedThemes();
  assert.deepStrictEqual(new Set(storedState.usedIds), new Set([first.id, second.id, third.id]), 'storage should record all used theme ids');

  deck.reset();
  assert.strictEqual(deck.hasRemaining(), true, 'after reset deck should have themes');
  assert.strictEqual(deck.remainingCount, 3, 'remaining count resets after reset');
  const stateAfterReset = storageService.loadUsedThemes();
  assert.deepStrictEqual(stateAfterReset.usedIds, [], 'reset should clear persisted used ids');

  // Pre-populate storage to simulate returning user
  storageService.saveUsedThemes(['t1']);
  const newDeck = new DeckManager({ themes, storageService });
  assert.strictEqual(newDeck.remainingCount, 2, 'pre-used themes should reduce remaining count at init');
  const drawn = newDeck.drawNext();
  assert.notStrictEqual(drawn.id, 't1', 'should not draw already used theme on init');
}
