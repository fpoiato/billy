import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'levels/house.js']);

test('house level has day, checkpoint, night and boss arena', () => {
  const level = Billy.Levels.createHouse();
  assert.ok(level.width > 8000);
  assert.ok(level.checkpoint);
  assert.ok(level.dayEndX > 0);
  assert.ok(level.dayEndX < level.bossArena.left);
  assert.ok(level.steaks.length >= 50);
  assert.ok(level.hearts.length >= 3);
  assert.ok(level.platforms.length > 10);
  assert.equal(level.spawn.x > 0, true);
});
