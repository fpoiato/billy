import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'player.js', 'levels/house.js']);
const C = Billy.CONFIG;

test('standing still by a sofa starts a pee stop', () => {
  const p = Billy.Player.create(100, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 0;
  const level = {
    decos: [{ kind: 'sofa', x: 90, y: C.GROUND, pee: true, peed: false }],
    puddles: [],
    rugs: [],
    platforms: [],
    width: 800,
  };
  const still = { dir: 0, jumpPressed: false };
  for (let i = 0; i < 40; i++) Billy.Player.updatePee(p, still, level, 0.02);
  assert.equal(p.peeing, true);
  assert.equal(level.decos[0].peed, true);
  assert.equal(level.puddles.length, 1);
});

test('standing still by a fridge or plant starts a pee stop', () => {
  const still = { dir: 0, jumpPressed: false };
  for (const kind of ['fridge', 'plant']) {
    const p = Billy.Player.create(100, C.GROUND - C.PLAYER_H);
    p.onGround = true;
    p.vx = 0;
    const level = {
      decos: [{ kind, x: 90, y: C.GROUND, pee: true, peed: false }],
      puddles: [],
    };
    for (let i = 0; i < 30; i++) Billy.Player.updatePee(p, still, level, 0.02);
    assert.equal(p.peeing, true, kind);
    assert.equal(level.decos[0].peed, true, kind);
  }
});

test('running past a door does not pee', () => {
  const p = Billy.Player.create(40, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 80;
  const level = {
    decos: [{ kind: 'door', x: 30, y: C.GROUND, pee: true, peed: false }],
    puddles: [],
  };
  Billy.Player.updatePee(p, { dir: 1, jumpPressed: false }, level, 1);
  assert.equal(p.peeing, false);
  assert.equal(level.decos[0].peed, false);
});

test('each sofa, bed or door can be used once', () => {
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  const sofa = { kind: 'sofa', x: 180, y: C.GROUND, pee: true, peed: false };
  const level = { decos: [sofa], puddles: [] };
  Billy.Player.updatePee(p, { dir: 0, jumpPressed: false }, level, 0.7);
  assert.equal(p.peeing, true);
  p.peeing = false;
  p.peeCooldown = 0;
  p.stillT = 0;
  Billy.Player.updatePee(p, { dir: 0, jumpPressed: false }, level, 0.7);
  assert.equal(p.peeing, false);
  assert.equal(level.puddles.length, 1);
});

test('standing still at the house fridge starts a pee stop', () => {
  const level = Billy.Levels.createHouse();
  const fridge = level.decos.find((d) => d.kind === 'fridge');
  assert.ok(fridge && fridge.pee);
  const p = Billy.Player.create(fridge.x + 6, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 0;
  for (let i = 0; i < 30; i++) {
    Billy.Player.updatePee(p, { dir: 0, jumpPressed: false }, level, 0.02);
  }
  assert.equal(p.peeing, true);
  assert.equal(fridge.peed, true);
});
