import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const files = [
  'version.js',
  'config.js',
  'physics.js',
  'levels/build.js',
  'levels/house.js',
  'levels/papai.js',
  'levels/street.js',
  'levels/beach.js',
  'levels/grandma.js',
  'campaign.js',
];
const Billy = loadBilly(files);

test('all five phases are playable in order', () => {
  assert.equal(Billy.Campaign.get('house').playable, true);
  assert.equal(Billy.Campaign.next('house').id, 'papai');
  assert.equal(Billy.Campaign.next('papai').id, 'street');
  assert.equal(Billy.Campaign.next('street').id, 'beach');
  assert.equal(Billy.Campaign.next('beach').id, 'grandma');
  assert.equal(Billy.Campaign.next('grandma'), null);
  assert.equal(Billy.Campaign.createLevel('papai').id, 'papai');
  assert.equal(Billy.Campaign.createLevel('street').id, 'street');
  assert.equal(Billy.Campaign.createLevel('beach').id, 'beach');
  assert.equal(Billy.Campaign.createLevel('grandma').id, 'grandma');
});

test('street has cars, manholes, a checkpoint and a dog boss arena', () => {
  const level = Billy.Levels.createStreet();
  assert.ok(level.width > 7000);
  assert.ok(level.cars.length >= 2);
  assert.ok(level.manholes.length >= 2);
  assert.ok(level.skaters.length >= 1);
  assert.ok(level.cats.length >= 1);
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal((level.hearts || []).length, 0);
  assert.ok(level.checkpoint);
  assert.equal(level.bossKind, 'dogs');
  assert.ok(level.bossArena.gateX > level.bossArena.left);
  assert.ok(level.steaks.length >= 40);
  assert.ok(level.decos.some((d) => d.kind === 'yard'));
  assert.ok(level.decos.some((d) => d.kind === 'hydrant' && d.pee));
  assert.ok(level.yardDogs.length >= 3);
  assert.ok(!level.decos.some((d) => d.kind === 'door'));
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss && d.clearKiss));
});

test('beach has crabs, waves, seagulls and a reunion goal', () => {
  const level = Billy.Levels.createBeach();
  assert.ok(level.width > 7000);
  assert.ok(level.crabs.length >= 2);
  assert.ok(level.waves.length >= 2);
  assert.ok(level.seagulls.length >= 1);
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal((level.hearts || []).length, 0);
  assert.ok(level.checkpoint);
  assert.ok(level.goal.x > level.checkpoint.x);
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss));
  assert.ok(level.decos.some((d) => d.kind === 'yard' && d.beach));
  assert.ok(level.decos.some((d) => d.kind === 'shower' && d.pee));
  assert.ok(!level.decos.some((d) => d.kind === 'door'));
  assert.equal(level.bossArena, null);
});

test('grandma has yarn, needles, vases, cat and Camila as boss', () => {
  const level = Billy.Levels.createGrandma();
  assert.ok(level.width > 7000);
  assert.ok(level.yarns.length >= 2);
  assert.ok(level.needles.length >= 1);
  assert.ok(level.vases.length >= 2);
  assert.ok(level.cats.length >= 1);
  assert.ok(level.critters.some((c) => c.species === 'dog'));
  assert.ok(level.critters.some((c) => c.species === 'bird'));
  assert.equal((level.hearts || []).length, 0);
  assert.equal(level.goal, null);
  assert.equal(level.bossKind, 'camila');
  assert.ok(level.bossArena);
  assert.ok(level.decos.some((d) => d.kind === 'grandma'));
  assert.ok(level.decos.some((d) => d.kind === 'sofa' && d.pee));
  assert.ok(level.decos.some((d) => d.kind === 'toy' && d.kiss && d.clearKiss));
});
