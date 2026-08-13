import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly();
const P = Billy.Physics;
const C = Billy.CONFIG;

test('aabb detects overlap', () => {
  assert.equal(P.aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }), true);
  assert.equal(P.aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 }), false);
});

test('stomp only when falling onto the head', () => {
  const enemy = { x: 100, y: 200, w: 28, h: 26 };
  const falling = { x: 104, y: 170, w: 30, h: 38, vy: 400 };
  const side = { x: 90, y: 200, w: 30, h: 38, vy: 10 };
  assert.equal(P.isStomp(falling, enemy), true);
  assert.equal(P.isStomp(side, enemy), false);
});

test('hit spends steaks before a life', () => {
  const withSteaks = P.applyHit(23, C.STEAKS_ON_HIT);
  assert.equal(withSteaks.loseLife, false);
  assert.equal(withSteaks.steaks, 13);
  const empty = P.applyHit(0, C.STEAKS_ON_HIT);
  assert.equal(empty.loseLife, true);
});

test('50 steaks grant an extra life', () => {
  assert.equal(P.extraLivesFromSteaks(49, 50, C.STEAKS_PER_LIFE), 1);
  assert.equal(P.extraLivesFromSteaks(0, 49, C.STEAKS_PER_LIFE), 0);
});

test('walking on a wide floor does not eject sideways', () => {
  const floor = { x: 0, y: 460, w: 1600, h: 90 };
  const body = { x: 80, y: 422, w: 30, h: 38, vx: 200, vy: 40, onGround: false };
  P.moveAndCollide(body, [floor], 0.016);
  assert.ok(body.x > 80 && body.x < 90, 'x=' + body.x);
  assert.equal(body.onGround, true);
  assert.equal(body.y, 422);
});

test('thin sofa seats do not block walking on the ground', () => {
  const floor = { x: 0, y: C.GROUND, w: 800, h: 90 };
  const sofa = { x: 140, y: C.GROUND - 36, w: 100, h: 12 };
  const body = {
    x: 100,
    y: C.GROUND - C.PLAYER_H,
    w: C.PLAYER_W,
    h: C.PLAYER_H,
    vx: 220,
    vy: 0,
    onGround: true,
  };
  const before = body.x;
  P.moveAndCollide(body, [floor, sofa], 0.016);
  assert.ok(body.x > before, 'x=' + body.x);
});

test('version is semver', () => {
  assert.match(Billy.APP_VERSION, /^\d+\.\d+\.\d+$/);
});
