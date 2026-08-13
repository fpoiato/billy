import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'levels/house.js']);

test('house level has day, checkpoint, night and boss arena', () => {
  const level = Billy.Levels.createHouse();
  assert.ok(level.width > 8000);
  assert.ok(level.checkpoint);
  assert.ok(level.dayEndX > 0);
  assert.ok(level.mayraArena);
  assert.equal(level.mayraArena.left, level.dayEndX);
  assert.ok(level.dayEndX < level.bossArena.left);
  assert.ok(level.mayraArena.right < level.bossArena.left);
  assert.ok(level.steaks.length >= 50);
  assert.ok(level.critters.length >= 3);
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'cat'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal((level.hearts || []).length, 0);
  assert.ok(level.platforms.length > 10);
  assert.equal(level.spawn.x > 0, true);
  assert.ok(level.decos.some((d) => d.kind === 'sofa' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'bed' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'door' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'fridge' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'plant' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'shower' && d.pee));
  const pees = level.decos.filter((d) => d.pee);
  assert.ok(pees.length >= 10);
  assert.ok(Math.max(...pees.map((d) => d.x)) - Math.min(...pees.map((d) => d.x)) > 4000);
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss && d.clearKiss));
});
