import assert from 'node:assert';

export async function runDataTests() {
  const module = await import('../topics.js');
  const topics = module.default;

  assert.ok(Array.isArray(topics), 'topics should be an array');
  assert.strictEqual(topics.length, 1000, 'topics should contain 1000 entries');

  const unique = new Set();
  for (const topic of topics) {
    assert.ok(typeof topic === 'string', 'each topic should be a string');
    const trimmed = topic.trim();
    assert.ok(trimmed.length > 0, 'topic text should not be empty');
    unique.add(trimmed);
  }

  assert.strictEqual(unique.size, topics.length, 'topics should be unique');
}
