import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'enemies.js', 'player.js']);
const C = Billy.CONFIG;

test('yard dogs bark when Billy is close but are not hazards', () => {
  const barks = [];
  Billy.Audio = { bark: function () { barks.push(1); } };
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  const dog = {
    x: 220,
    y: C.GROUND - C.PUP_H,
    w: C.PUP_W,
    h: C.PUP_H,
    x1: 200,
    x2: 280,
    dir: 1,
    speed: 70,
    t: 0,
    barking: false,
    barkT: 0,
    barkCd: 0,
  };
  Billy.Enemies.updateYardDogs([dog], p, 0.05);
  assert.equal(dog.barking, true);
  assert.equal(barks.length, 1);
});

test('yard dogs stay quiet when Billy is far away', () => {
  const barks = [];
  Billy.Audio = { bark: function () { barks.push(1); } };
  const p = Billy.Player.create(40, C.GROUND - C.PLAYER_H);
  const dog = {
    x: 700,
    y: C.GROUND - C.PUP_H,
    w: C.PUP_W,
    h: C.PUP_H,
    x1: 680,
    x2: 760,
    dir: 1,
    speed: 70,
    t: 0,
    barking: false,
    barkT: 0,
    barkCd: 0,
  };
  Billy.Enemies.updateYardDogs([dog], p, 0.05);
  assert.equal(dog.barking, false);
  assert.equal(barks.length, 0);
});

test('standing still by a hydrant starts a pee stop', () => {
  const p = Billy.Player.create(100, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.vx = 0;
  const level = {
    decos: [{ kind: 'hydrant', x: 96, y: C.GROUND, pee: true, peed: false }],
    puddles: [],
    rugs: [],
    platforms: [],
    width: 800,
  };
  const still = { dir: 0, jumpPressed: false };
  for (let i = 0; i < 40; i++) Billy.Player.updatePee(p, still, level, 0.02);
  assert.equal(p.peeing, true);
  assert.equal(level.decos[0].peed, true);
});
