/**
 * "Farmou Aura": Billy dances 67 when the player clears the steaks
 * on screen, or stomps every killable enemy on screen.
 */
var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  var KILLABLE = [
    ['critters', 'critter'],
    ['skaters', 'skater'],
    ['cats', 'cat'],
    ['crabs', 'crab'],
    ['seagulls', 'gull'],
    ['yarns', 'yarn'],
    ['vases', 'vase'],
  ];

  function viewBox(camX, viewW) {
    var pad = 12;
    return { left: camX - pad, right: camX + (viewW || C.WIDTH) + pad };
  }

  function overlaps(x, w, box) {
    return x + (w || 0) > box.left && x < box.right;
  }

  function bodyOf(kind, e) {
    if (Billy.Enemies && Billy.Enemies.bodyOf) return Billy.Enemies.bodyOf(kind, e);
    return { x: e.x, y: e.y, w: e.w || 20, h: e.h || 20 };
  }

  function steaksOnScreen(steaks, box) {
    steaks = steaks || [];
    var total = 0;
    var left = 0;
    var allLeft = 0;
    for (var i = 0; i < steaks.length; i++) {
      var s = steaks[i];
      if (!s.taken) allLeft += 1;
      if (!overlaps(s.x - 9, 18, box)) continue;
      total += 1;
      if (!s.taken) left += 1;
    }
    return { total: total, left: left, allTotal: steaks.length, allLeft: allLeft };
  }

  function enemiesOnScreen(level, box) {
    var total = 0;
    var left = 0;
    var allTotal = 0;
    var allLeft = 0;
    for (var i = 0; i < KILLABLE.length; i++) {
      var list = (level && level[KILLABLE[i][0]]) || [];
      var kind = KILLABLE[i][1];
      for (var j = 0; j < list.length; j++) {
        var e = list[j];
        allTotal += 1;
        if (!e.dead) allLeft += 1;
        var body = bodyOf(kind, e);
        if (!overlaps(body.x, body.w, box)) continue;
        total += 1;
        if (!e.dead) left += 1;
      }
    }
    return { total: total, left: left, allTotal: allTotal, allLeft: allLeft };
  }

  function steaksCleared(info) {
    var min = C.AURA_MIN_STEAKS || 2;
    if (info.total >= min && info.left === 0) return true;
    if (info.allTotal > 0 && info.allLeft === 0) return true;
    return false;
  }

  function enemiesCleared(info) {
    var min = C.AURA_MIN_ENEMIES || 2;
    if (info.total >= min && info.left === 0) return true;
    if (info.allTotal > 0 && info.allLeft === 0) return true;
    return false;
  }

  function blocked(state) {
    if (!state || state.screen && state.screen !== 'playing') return true;
    if (state.intro > 0 || state.nightIntro > 0) return true;
    if (state.goalHit || state.boss) return true;
    var p = state.player;
    if (!p) return true;
    if (p.grabbed || p.kissing || p.peeing || p.eating || p.pooping || p.dancing) return true;
    return false;
  }

  function tryStart(state, reason) {
    reason = reason || {};
    if (!state) return false;
    if (state.aura && state.aura.active) return false;
    if (blocked(state)) return false;
    if (!reason.steaks && !reason.enemies) return false;

    var box = viewBox(state.cam && state.cam.x || 0, C.WIDTH);
    var ok = false;
    if (reason.steaks) ok = steaksCleared(steaksOnScreen(state.level && state.level.steaks, box));
    if (!ok && reason.enemies) ok = enemiesCleared(enemiesOnScreen(state.level, box));
    if (!ok) return false;

    var aura = state.aura || create();
    state.aura = aura;
    aura.active = true;
    aura.t = C.AURA_TIME || 2;
    aura.age = 0;
    aura.kind = reason.steaks && reason.enemies ? 'both' : reason.steaks ? 'steaks' : 'enemies';
    return true;
  }

  function create() {
    return { active: false, t: 0, age: 0, kind: '' };
  }

  function update(aura, dt) {
    if (!aura || !aura.active) return;
    aura.t -= dt;
    aura.age += dt;
    if (aura.t <= 0) {
      aura.active = false;
      aura.t = 0;
    }
  }

  Billy.Aura = {
    create: create,
    update: update,
    tryStart: tryStart,
    viewBox: viewBox,
    steaksOnScreen: steaksOnScreen,
    enemiesOnScreen: enemiesOnScreen,
    steaksCleared: steaksCleared,
    enemiesCleared: enemiesCleared,
  };
})();
