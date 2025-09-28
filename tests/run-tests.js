import { runDataTests } from './data.test.js';
import { runStorageServiceTests } from './storage-service.test.js';
import { runDeckManagerTests } from './deck-manager.test.js';
import { runRevelationServiceTests } from './revelation-service.test.js';

const suites = [
  ['Data modules', runDataTests],
  ['StorageService', runStorageServiceTests],
  ['DeckManager', runDeckManagerTests],
  ['RevelationService', runRevelationServiceTests]
];

let failed = 0;

for (const [name, suite] of suites) {
  try {
    await suite();
    console.log(`✅ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`❌ ${name}`);
    console.error(error);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test suite(s) failed.`);
  process.exit(1);
}

console.log('\nAll test suites passed.');
