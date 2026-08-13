import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'levels/house.js']);

test('house is a daytime level that ends with Mayra', () => {
  const level = Billy.Levels.createHouse();
  assert.ok(level.width > 8000);
  assert.ok(level.checkpoint);
  assert.ok(!level.dayEndX);
  assert.ok(!level.night);
  assert.equal(level.music, 'day');
  assert.equal(level.bossKind, 'mayra');
  assert.ok(level.bossArena);
  assert.ok(level.bossArena.left > level.checkpoint.x);
  assert.ok(level.bossArena.right >= level.width - 20);
  assert.ok(!level.mayraArena);
  assert.ok(!level.decos.some((d) => d.kind === 'bed'));
  assert.ok(level.steaks.length >= 40);
  assert.ok(level.critters.length >= 3);
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'cat'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal((level.hearts || []).length, 0);
  assert.ok(level.platforms.length > 10);
  assert.ok(level.spawn.x >= 200);
  assert.ok(level.decos.some((d) => d.kind === 'sofa' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'door' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'fridge' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'plant' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'shower' && d.pee));
  const pees = level.decos.filter((d) => d.pee);
  assert.ok(pees.length >= 8);
  assert.ok(Math.max(...pees.map((d) => d.x)) - Math.min(...pees.map((d) => d.x)) > 4000);
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss && d.clearKiss));
});

test('night is its own phase after the day house', () => {
  const level = Billy.Levels.createNight();
  assert.equal(level.id, 'night');
  assert.equal(level.night, true);
  assert.equal(level.music, 'night');
  assert.equal(level.introBanner, 'Sozinho em casa à noite...');
  assert.equal(level.bossKind, 'bed');
  assert.ok(level.bossArena);
  assert.ok(level.checkpoint);
  assert.ok(level.checkpoint.x < level.bossArena.left);
  assert.ok(level.width > 4000);
  assert.ok(level.decos.some((d) => d.kind === 'bed' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'sofa' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss && d.clearKiss));
  assert.ok(level.critters.length >= 2);
});
