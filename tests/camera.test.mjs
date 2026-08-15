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

test('narrow camera keeps Billy on screen instead of the sides', () => {
  const prev = C.WIDTH;
  C.WIDTH = 360;
  const cam = Billy.Camera.create();
  const player = { x: Billy.spawnX(), w: C.PLAYER_W };
  const level = { width: 8000 };
  Billy.Camera.follow(cam, player, level, 10);
  const sx = player.x + player.w / 2 - cam.x;
  assert.ok(sx > 60 && sx < C.WIDTH - 60);
  C.WIDTH = prev;
});

test('spawn stays inside a portrait-wide view', () => {
  const prev = C.WIDTH;
  C.WIDTH = 360;
  assert.ok(Billy.spawnX() < C.WIDTH - 40);
  assert.ok(Billy.spawnX() >= 90);
  C.WIDTH = 960;
  assert.equal(Billy.spawnX(), 300);
  C.WIDTH = prev;
});
