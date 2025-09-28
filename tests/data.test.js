import assert from 'node:assert';

export async function runDataTests() {
  const { themes } = await import('../data/themes.js');
  const { revelations } = await import('../data/revelations.js');

  assert.ok(Array.isArray(themes), 'themes should be an array');
  assert.ok(themes.length >= 1000, 'themes should contain at least 1000 entries');

  const ids = new Set();
  for (const theme of themes) {
    assert.ok(theme && typeof theme === 'object', 'theme should be an object');
    assert.ok(typeof theme.id === 'string', 'theme.id should be a string');
    assert.ok(theme.id.length > 0, 'theme.id should not be empty');
    assert.ok(typeof theme.text === 'string', 'theme.text should be a string');
    assert.ok(theme.text.length > 0, 'theme.text should not be empty');
    assert.ok(!ids.has(theme.id), `duplicate theme id detected: ${theme.id}`);
    ids.add(theme.id);
  }

  assert.ok(Array.isArray(revelations), 'revelations should be an array');
  assert.ok(revelations.length >= 50, 'revelations should contain at least 50 entries');
  for (const revelation of revelations) {
    assert.ok(typeof revelation === 'string', 'revelation should be a string');
    assert.ok(revelation.trim().length > 0, 'revelation should not be empty');
  }
}
