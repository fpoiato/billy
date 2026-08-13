import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly([
  'version.js',
  'config.js',
  'physics.js',
  'player.js',
  'dad.js',
  'levels/build.js',
  'levels/papai.js',
]);
const C = Billy.CONFIG;

function playerAt(x) {
  const p = Billy.Player.create(x, C.GROUND - C.PLAYER_H);
  p.onGround = true;
  p.facing = 1;
  p.vx = 0;
  return p;
}

function groundLevel(extra) {
  return Object.assign({
    platforms: [{ x: -400, y: C.GROUND, w: 9000, h: 240, ground: true }],
    rugs: [],
    decos: [],
    width: 8000,
    leash: true,
  }, extra);
}

test('dad is taller and wider than Camila and Mayra', () => {
  assert.ok(C.DAD_H > C.CAMILA_H);
  assert.ok(C.DAD_H > C.MAYRA_H);
  assert.ok(C.DAD_W > C.CAMILA_W);
  assert.ok(C.DAD_W > C.MAYRA_W);
});

test('on a leash Billy walks slower than usual', () => {
  const p = playerAt(300);
  const level = groundLevel();
  const input = { dir: 1, jumpPressed: false };
  for (let i = 0; i < 40; i++) Billy.Player.update(p, input, level, 0.05);
  assert.ok(Math.abs(p.vx) > 40);
  assert.ok(Math.abs(p.vx) <= C.MAX_SPEED * C.LEASH_SPEED + 1);
});

test('Billy has to pull: dad stays behind and only walks when Billy moves', () => {
  const p = playerAt(400);
  const dad = Billy.Dad.create(300);
  const level = groundLevel();
  Billy.Dad.update(dad, p, level, { x: 0 }, 0.2);
  assert.equal(dad.mode, 'walk');
  assert.equal(dad.vx, 0);

  p.vx = 90;
  p.facing = 1;
  Billy.Dad.update(dad, p, level, { x: 0 }, 0.2);
  assert.ok(dad.x + dad.w / 2 < p.x + p.w / 2);
  assert.ok(dad.run || Math.abs(dad.vx) > 0);
  assert.ok(Math.abs(dad.vx) <= C.DAD_WALK_SPEED + 1);
});

test('a food truck on the right of the screen makes dad run faster than Billy', () => {
  const truck = { kind: 'foodtruck', x: 700, y: C.GROUND, visited: false };
  assert.equal(Billy.Dad.truckOnRight(truck, { x: 0 }), true);

  const p = playerAt(220);
  p.vx = C.MAX_SPEED * C.LEASH_SPEED;
  const dad = Billy.Dad.create(120);
  const level = groundLevel({ decos: [truck] });
  Billy.Dad.update(dad, p, level, { x: 0 }, 0.05);
  assert.equal(dad.mode, 'rush');
  assert.ok(Math.abs(dad.vx) >= C.DAD_RUSH_SPEED - 1);
  assert.ok(Math.abs(dad.vx) > C.MAX_SPEED * C.LEASH_SPEED);
});

test('dad stops at the truck, pays, grabs a burger and eats', () => {
  const truck = { kind: 'foodtruck', x: 400, y: C.GROUND, visited: false };
  const p = playerAt(360);
  const dad = Billy.Dad.create(400 + 78 - C.DAD_W / 2 - 8);
  dad.mode = 'rush';
  dad.truck = truck;
  const level = groundLevel({ decos: [truck] });
  const cam = { x: 0 };

  Billy.Dad.update(dad, p, level, cam, 0.05);
  assert.equal(dad.mode, 'stop');

  Billy.Dad.update(dad, p, level, cam, C.DAD_STOP_TIME + 0.05);
  assert.equal(dad.mode, 'pay');
  Billy.Dad.update(dad, p, level, cam, 0.25);
  assert.equal(dad.mode, 'pay');
  assert.ok(dad.money > 0.1);

  Billy.Dad.update(dad, p, level, cam, C.DAD_PAY_TIME + 0.05);
  assert.equal(dad.mode, 'take');

  Billy.Dad.update(dad, p, level, cam, C.DAD_TAKE_TIME + 0.05);
  assert.equal(dad.mode, 'eat');
  assert.ok(dad.burger > 0);

  Billy.Dad.update(dad, p, level, cam, C.DAD_EAT_TIME + 0.05);
  assert.equal(dad.mode, 'walk');
  assert.equal(truck.visited, true);
});

test('the leash keeps Billy and dad close', () => {
  const p = playerAt(900);
  const dad = Billy.Dad.create(100);
  Billy.Dad.applyLeash(p, dad);
  const dist = Math.abs((p.x + p.w / 2) - (dad.x + dad.w / 2));
  assert.ok(dist <= C.LEASH_LEN + 1);
});

test('papai phase has food trucks, a leash walk and the duck at the end', () => {
  const level = Billy.Levels.createPapai();
  assert.equal(level.id, 'papai');
  assert.equal(level.leash, true);
  assert.ok(level.width > 7000);
  assert.ok(level.checkpoint);
  assert.ok(level.goal.x > level.checkpoint.x);
  const trucks = level.decos.filter((d) => d.kind === 'foodtruck');
  assert.ok(trucks.length >= 2);
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss));
  assert.ok(level.decos.some((d) => d.kind === 'hydrant' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'tree'));
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal(level.bossArena, null);
  assert.ok(level.steaks.length >= 40);
});
