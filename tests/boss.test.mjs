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

test('stomping Mayra three times wins the fight', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'mayra');
  assert.notEqual(boss.clearsPhase, false);
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
});

test('bosses spawn in the center of the arena, not at the gate', () => {
  const arena = { left: 2000, right: 2960, gateX: 2870 };
  const mid = (arena.left + arena.right) / 2;
  const camila = Billy.Boss.create(arena, 'camila');
  assert.ok(Math.abs(camila.monster.x + camila.monster.w / 2 - mid) < 40);
  const mayra = Billy.Boss.create(arena, 'mayra');
  assert.ok(Math.abs(mayra.monster.x + mayra.monster.w / 2 - mid) < 40);

  const dogs = Billy.Boss.create(arena, 'dogs');
  const player = Billy.Player.create(mid - 80, C.GROUND - C.PLAYER_H);
  Billy.Boss.update(dogs, player, 1, [floor]);
  assert.ok(dogs.monster);
  assert.equal(dogs.monster.kind, 'dog');
  assert.ok(Math.abs(dogs.monster.x + dogs.monster.w / 2 - mid) < 40);
  assert.ok(dogs.monster.x + dogs.monster.w < arena.gateX);
});

test('falling on the big dog head stomps even while it barks', () => {
  const arena = { left: 0, right: 960 };
  const boss = Billy.Boss.create(arena, 'dogs');
  const player = Billy.Player.create(400, C.GROUND - C.PLAYER_H);
  Billy.Boss.update(boss, player, 1, [floor]);
  const d = boss.monster;
  assert.equal(d.mode, 'bark');
  player.x = d.x + 10;
  player.y = d.y - player.h + 10;
  player.vy = 420;
  player.invuln = 0;
  const ev = Billy.Boss.update(boss, player, 0.016, [floor]);
  assert.equal(ev && ev.stomped, true);
  assert.equal(boss.defeated, 1);
});

test('the fight band keeps bosses away from the jump-button edge', () => {
  const arena = { left: 0, right: 960 };
  const band = Billy.Boss.fightBand(arena, C.DOG_W);
  assert.ok(band.left > 150);
  assert.ok(band.right + C.DOG_W < 820);
});
