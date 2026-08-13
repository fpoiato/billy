import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'camera.js']);
const C = Billy.CONFIG;

test('boss camera lock centers the arena on screen', () => {
  const arena = { left: 0, right: 1400 };
  const lock = Billy.Camera.lockOnArena(arena);
  assert.equal(lock.x, 700 - C.WIDTH / 2);
});

test('a screen-wide arena lock matches the left edge', () => {
  const arena = { left: 8000, right: 8000 + C.WIDTH };
  const lock = Billy.Camera.lockOnArena(arena);
  assert.equal(lock.x, 8000);
});
