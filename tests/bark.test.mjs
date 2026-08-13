import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'enemies.js', 'player.js']);
const C = Billy.CONFIG;

function catAt(x) {
  return { x: x, y: C.GROUND - C.CAT_H, w: C.CAT_W, h: C.CAT_H };
}

function playerAt(x) {
  const p = Billy.Player.create(x, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  return p;
}

test('something nearby makes Billy yip', () => {
  const yips = [];
  Billy.Audio = { yip: function () { yips.push(1); } };
  const p = playerAt(200);
  const level = { cats: [catAt(240)], width: 800 };
  const near = Billy.Player.updateBark(p, level, [], 0.05);
  assert.equal(near, true);
  assert.equal(p.barking, true);
  assert.equal(yips.length, 1);
});

test('nothing nearby keeps Billy quiet', () => {
  const yips = [];
  Billy.Audio = { yip: function () { yips.push(1); } };
  const p = playerAt(80);
  const level = { cats: [catAt(700)], width: 800 };
  const near = Billy.Player.updateBark(p, level, [], 0.05);
  assert.equal(near, false);
  assert.equal(p.barking, false);
  assert.equal(yips.length, 0);
});

test('he keeps yapping while the thing stays close', () => {
  const yips = [];
  Billy.Audio = { yip: function () { yips.push(1); } };
  const p = playerAt(200);
  const level = { cats: [catAt(230)], width: 800 };
  for (let i = 0; i < 40; i++) Billy.Player.updateBark(p, level, [], 0.05);
  assert.ok(yips.length >= 5, 'expected lots of yips, got ' + yips.length);
});

test('a boss next to him also sets him off', () => {
  const yips = [];
  Billy.Audio = { yip: function () { yips.push(1); } };
  const p = playerAt(400);
  const monster = { x: 430, y: C.GROUND - 28, w: 36, h: 28 };
  Billy.Player.updateBark(p, { width: 800 }, [monster], 0.05);
  assert.equal(p.barking, true);
  assert.equal(yips.length, 1);
});

test('he does not bark while kissing the duck', () => {
  const yips = [];
  Billy.Audio = { yip: function () { yips.push(1); } };
  const p = playerAt(200);
  const duck = { kind: 'toy', x: 220, y: C.GROUND, kiss: true };
  p.kissing = true;
  p.kissDuck = duck;
  Billy.Player.updateBark(p, { cats: [catAt(210)], decos: [duck], width: 800 }, [], 0.05);
  assert.equal(p.barking, false);
  assert.equal(yips.length, 0);
});
