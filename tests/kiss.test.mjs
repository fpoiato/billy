import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'player.js']);
const C = Billy.CONFIG;

test('standing near the girlfriend duck starts a censored kiss', () => {
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 0;
  const duck = { kind: 'toy', x: 220, y: C.GROUND, kiss: true };
  const level = { decos: [duck], rugs: [], platforms: [], width: 800 };
  Billy.Player.updateKiss(p, { dir: 0, jumpPressed: false }, level, 0.2);
  assert.equal(p.kissing, true);
  assert.equal(p.kissDuck, duck);
  assert.ok(p.kissHearts.length >= 1);
});

test('a toy duck without kiss does not trigger namoro', () => {
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  const level = {
    decos: [{ kind: 'toy', x: 220, y: C.GROUND }],
    rugs: [],
    platforms: [],
    width: 800,
  };
  Billy.Player.updateKiss(p, { dir: 0, jumpPressed: false }, level, 0.2);
  assert.equal(p.kissing, false);
});

test('running past the duck does not start a kiss', () => {
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 200;
  const level = {
    decos: [{ kind: 'toy', x: 220, y: C.GROUND, kiss: true }],
  };
  Billy.Player.updateKiss(p, { dir: 1, jumpPressed: false }, level, 0.2);
  assert.equal(p.kissing, false);
});
