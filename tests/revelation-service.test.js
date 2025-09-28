import assert from 'node:assert';

export async function runRevelationServiceTests() {
  const { RevelationService } = await import('../scripts/revelation-service.js');

  const service = new RevelationService({ messages: ['A', 'B', 'C'] });
  const seen = new Set();
  for (let i = 0; i < 50; i += 1) {
    const message = service.getRandom();
    assert.ok(['A', 'B', 'C'].includes(message), 'returned message should be from the provided list');
    seen.add(message);
  }
  assert.ok(seen.size >= 2, 'random selection should produce variety over many calls');

  const emptyService = new RevelationService({ messages: [] });
  const fallback = emptyService.getRandom();
  assert.ok(typeof fallback === 'string' && fallback.length > 0, 'fallback message should be a non-empty string');
}
