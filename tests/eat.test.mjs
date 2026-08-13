import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'player.js']);
const C = Billy.CONFIG;

function playerAt(x) {
  const p = Billy.Player.create(x, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 0;
  return p;
}

test('standing still by grandma makes Billy eat and get fat', () => {
  const p = playerAt(200);
  const level = {
    decos: [{ kind: 'grandma', x: 220, y: C.GROUND }],
    puddles: [],
    rugs: [],
    platforms: [],
    width: 800,
  };
  const still = { dir: 0, jumpPressed: false };
  for (let i = 0; i < 40; i++) Billy.Player.updateEat(p, still, level, 0.02);
  assert.equal(p.eating, true);
  assert.ok(p.fat > 0);
  Billy.Player.updateEat(p, still, level, 1);
  assert.equal(p.eating, false);
  assert.equal(p.fat, 1);
  assert.ok(p.fatT > 9);
});

test('running past grandma does not eat', () => {
  const p = playerAt(200);
  p.vx = 80;
  const level = {
    decos: [{ kind: 'grandma', x: 210, y: C.GROUND }],
    puddles: [],
  };
  Billy.Player.updateEat(p, { dir: 1, jumpPressed: false }, level, 1);
  assert.equal(p.eating, false);
  assert.equal(p.fat, 0);
});

test('after 10 seconds fat Billy stops, poops and goes back to normal', () => {
  const p = playerAt(200);
  p.fat = 1;
  p.fatT = 0.05;
  const level = { decos: [], puddles: [], rugs: [], platforms: [], width: 800 };
  Billy.Player.updateEat(p, { dir: 0, jumpPressed: false }, level, 0.06);
  assert.equal(p.pooping, true);
  assert.equal(level.puddles.length, 1);
  assert.equal(level.puddles[0].kind, 'coco');
  Billy.Player.updateEat(p, { dir: 0, jumpPressed: false }, level, 2);
  assert.equal(p.pooping, false);
  assert.equal(p.fat, 0);
});
