import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'display.js']);

test('portrait playfield is letterboxed so Billy is not on the sides', () => {
  const view = Billy.Display.playSize({ w: 390, h: 844 });
  assert.ok(view.width >= Billy.CONFIG.MIN_VIEW_WIDTH);
  assert.ok(view.top > 80);
  assert.ok(Math.abs(view.left) < 1);
  assert.ok(view.cssW <= 390 + 0.5);
  assert.ok(view.cssH < 844 - 80);
});

test('landscape playfield still fills the screen', () => {
  const view = Billy.Display.playSize({ w: 960, h: 540 });
  assert.equal(view.width, 960);
  assert.equal(view.height, 540);
  assert.ok(Math.abs(view.left) < 1);
  assert.ok(Math.abs(view.top) < 1);
});
