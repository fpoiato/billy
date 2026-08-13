import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly([
  'version.js',
  'config.js',
  'physics.js',
  'enemies.js',
  'player.js',
  'aura.js',
]);
const C = Billy.CONFIG;

function steak(x, taken) {
  return { x: x, y: C.GROUND - 28, w: 18, h: 14, taken: !!taken };
}

function critter(x, dead) {
  return {
    x: x,
    y: C.GROUND - C.PUP_H,
    w: C.PUP_W,
    h: C.PUP_H,
    dead: !!dead,
  };
}

function playingState(level) {
  const p = Billy.Player.create(200, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  return {
    screen: 'playing',
    intro: 0,
    nightIntro: 0,
    goalHit: false,
    boss: null,
    cam: { x: 0 },
    player: p,
    aura: Billy.Aura.create(),
    level: level,
  };
}

test('clearing two steaks on screen farms aura', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const steaks = [steak(80, true), steak(120, true), steak(4000, false)];
  const info = Billy.Aura.steaksOnScreen(steaks, box);
  assert.equal(info.total, 2);
  assert.equal(info.left, 0);
  assert.equal(Billy.Aura.steaksCleared(info), true);
});

test('one leftover steak on screen does not farm aura', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const steaks = [steak(80, true), steak(120, false)];
  assert.equal(Billy.Aura.steaksCleared(Billy.Aura.steaksOnScreen(steaks, box)), false);
});

test('a single steak on screen is not enough unless it is the last in the level', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const oneOfMany = [steak(80, true), steak(4000, false)];
  assert.equal(Billy.Aura.steaksCleared(Billy.Aura.steaksOnScreen(oneOfMany, box)), false);
  const lastOne = [steak(80, true)];
  assert.equal(Billy.Aura.steaksCleared(Billy.Aura.steaksOnScreen(lastOne, box)), true);
});

test('stomping every killable enemy on screen farms aura', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const level = {
    critters: [critter(200, true), critter(260, true)],
    cats: [],
  };
  const info = Billy.Aura.enemiesOnScreen(level, box);
  assert.equal(info.total, 2);
  assert.equal(info.left, 0);
  assert.equal(Billy.Aura.enemiesCleared(info), true);
});

test('an enemy still alive on screen blocks the aura', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const level = { critters: [critter(200, true), critter(300, false)] };
  assert.equal(Billy.Aura.enemiesCleared(Billy.Aura.enemiesOnScreen(level, box)), false);
});

test('killing the last enemy in the level farms aura even if it is alone on screen', () => {
  const box = Billy.Aura.viewBox(0, C.WIDTH);
  const level = { critters: [critter(180, true)] };
  assert.equal(Billy.Aura.enemiesCleared(Billy.Aura.enemiesOnScreen(level, box)), true);
});

test('tryStart plays Farmou Aura when the steaks on screen are gone', () => {
  const state = playingState({
    steaks: [steak(90, true), steak(140, true)],
    critters: [],
  });
  assert.equal(Billy.Aura.tryStart(state, { steaks: true }), true);
  assert.equal(state.aura.active, true);
  assert.equal(state.aura.kind, 'steaks');
  assert.ok(state.aura.t > 1);
});

test('tryStart does not stack while aura is already going', () => {
  const state = playingState({
    steaks: [steak(90, true), steak(140, true)],
    critters: [],
  });
  assert.equal(Billy.Aura.tryStart(state, { steaks: true }), true);
  assert.equal(Billy.Aura.tryStart(state, { steaks: true }), false);
});

test('tryStart stays quiet during a boss or after the goal', () => {
  const level = { steaks: [steak(90, true), steak(140, true)], critters: [] };
  const bossy = playingState(level);
  bossy.boss = { done: false };
  assert.equal(Billy.Aura.tryStart(bossy, { steaks: true }), false);
  const done = playingState(level);
  done.goalHit = true;
  assert.equal(Billy.Aura.tryStart(done, { steaks: true }), false);
});

test('Billy queues the 67 dance in the air and stands up on landing', () => {
  const p = Billy.Player.create(120, 80);
  p.onGround = false;
  Billy.Player.startDance(p, 2);
  assert.equal(p.dancing, false);
  assert.equal(p.danceQueued, true);
  p.onGround = true;
  Billy.Player.updateDance(p, 0.016);
  assert.equal(p.dancing, true);
  assert.equal(p.danceQueued, false);
});

test('Billy starts the 67 dance immediately on the ground', () => {
  const p = Billy.Player.create(120, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  Billy.Player.startDance(p, 2);
  assert.equal(p.dancing, true);
  const input = { dir: 1, jumpPressed: true };
  Billy.Player.update(p, input, { platforms: [], width: 2000 }, 0.05);
  assert.equal(p.dancing, true);
  assert.equal(p.vx, 0);
  assert.ok(p.vy >= 0);
});

test('the dance ends after AURA_TIME', () => {
  const p = Billy.Player.create(120, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  Billy.Player.startDance(p, 0.1);
  Billy.Player.updateDance(p, 0.12);
  assert.equal(p.dancing, false);
});
