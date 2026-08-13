import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBilly } from './helpers.mjs';

const Billy = loadBilly([
  'version.js',
  'config.js',
  'physics.js',
  'levels/build.js',
  'levels/house.js',
  'levels/street.js',
  'levels/beach.js',
  'levels/grandma.js',
  'campaign.js',
  'results.js',
]);

test('house is followed by the street', () => {
  const house = Billy.Campaign.get('house');
  const next = Billy.Campaign.next('house');
  assert.equal(house.playable, true);
  assert.equal(next.id, 'street');
  assert.equal(next.playable, true);
  assert.equal(Billy.Campaign.createLevel('street').id, 'street');
  const level = Billy.Campaign.createLevel('house');
  assert.equal(level.id, 'house');
});

test('results count steaks then become ready', () => {
  const r = Billy.Results.create({ phaseId: 'house', steaks: 12, elapsed: 95, lives: 3 });
  Billy.Results.update(r, 0.2);
  assert.equal(r.step, 'title');
  assert.equal(r.ready, false);
  Billy.Results.update(r, 0.5);
  assert.equal(r.step, 'count');
  assert.ok(r.shownSteaks > 0);
  assert.ok(r.shownSteaks < 12);
  Billy.Results.skip(r);
  assert.equal(r.shownSteaks, 12);
  assert.equal(r.ready, true);
  assert.equal(Billy.Results.beginWipe(r), true);
  Billy.Results.update(r, 2);
  assert.equal(r.finished, true);
});

test('zero steaks still finish the tally', () => {
  const r = Billy.Results.create({ phaseId: 'house', steaks: 0, elapsed: 10, lives: 2 });
  Billy.Results.update(r, 0.6);
  Billy.Results.update(r, 0.05);
  assert.equal(r.ready, true);
  assert.equal(r.shownSteaks, 0);
});

test('formatTime pads minutes and seconds', () => {
  assert.equal(Billy.Results.formatTime(0), '00:00');
  assert.equal(Billy.Results.formatTime(75), '01:15');
});
