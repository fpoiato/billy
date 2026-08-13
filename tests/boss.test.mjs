import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly(['version.js', 'config.js', 'physics.js', 'player.js', 'boss.js']);
Billy.Audio = { stomp: function () {}, win: function () {}, squeak: function () {}, bark: function () {}, splash: function () {} };

const C = Billy.CONFIG;
const floor = { x: -200, y: C.GROUND, w: 2000, h: 90, ground: true };

test('Camila grabs Billy and squeezes, then gets tired', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'camila');
  const player = Billy.Player.create(boss.monster.x, C.GROUND - C.PLAYER_H);
  player.vy = 0;
  const grab = Billy.Boss.update(boss, player, 0.016, [floor]);
  assert.equal(grab.grab, true);
  assert.equal(player.grabbed, true);
  let ev = null;
  for (let i = 0; i < 80; i++) {
    ev = Billy.Boss.update(boss, player, 0.02, [floor]);
    if (ev && ev.hit) break;
  }
  assert.equal(ev.hit, true);
  assert.ok(player.bulge >= 0);
  assert.equal(player.grabbed, false);
  assert.equal(boss.monster.mode, 'tired');
});

test('stomping Camila three times wins the fight', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'camila');
  const player = Billy.Player.create(boss.monster.x, boss.monster.y - C.PLAYER_H + 8);
  player.vy = 400;
  player.invuln = 0;
  for (let n = 0; n < 3; n++) {
    boss.monster.mode = 'chase';
    player.grabbed = false;
    player.x = boss.monster.x;
    player.y = boss.monster.y - player.h + 8;
    player.vy = 400;
    const ev = Billy.Boss.update(boss, player, 0.016, [floor]);
    assert.equal(ev && ev.stomped, true, 'stomp ' + (n + 1));
  }
  assert.equal(boss.done, true);
});

test('Mayra catches Billy and bathes him, then gets tired', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'mayra');
  const player = Billy.Player.create(boss.monster.x, C.GROUND - C.PLAYER_H);
  player.vy = 0;
  const catchEv = Billy.Boss.update(boss, player, 0.016, [floor]);
  assert.equal(catchEv.bath, true);
  assert.equal(player.grabbed, true);
  assert.equal(player.bathing, true);
  assert.ok(player.wet > 0);
  let ev = null;
  for (let i = 0; i < 90; i++) {
    ev = Billy.Boss.update(boss, player, 0.02, [floor]);
    if (ev && ev.hit) break;
  }
  assert.equal(ev.hit, true);
  assert.equal(ev.bath, true);
  assert.equal(player.grabbed, false);
  assert.equal(player.bathing, false);
  assert.ok(player.wet > 0);
  assert.equal(boss.monster.mode, 'tired');
});

test('stomping Mayra three times wins without clearing the phase', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'mayra');
  assert.equal(boss.clearsPhase, false);
  const player = Billy.Player.create(boss.monster.x, boss.monster.y - C.PLAYER_H + 8);
  player.vy = 400;
  player.invuln = 0;
  for (let n = 0; n < 3; n++) {
    boss.monster.mode = 'chase';
    player.grabbed = false;
    player.bathing = false;
    player.x = boss.monster.x;
    player.y = boss.monster.y - player.h + 8;
    player.vy = 400;
    const ev = Billy.Boss.update(boss, player, 0.016, [floor]);
    assert.equal(ev && ev.stomped, true, 'stomp ' + (n + 1));
  }
  assert.equal(boss.done, true);
  assert.equal(boss.clearsPhase, false);
});
