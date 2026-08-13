var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function patrolX(e, dt) {
    e.x += e.dir * (e.speed || 80) * dt;
    if (e.x < e.x1) { e.x = e.x1; e.dir = 1; }
    if (e.x > e.x2) { e.x = e.x2; e.dir = -1; }
  }

  function updateCritters(list, dt, platforms) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (h.dead) continue;
      h.t = (h.t || 0) + dt;
      if (h.x1 != null) patrolX(h, dt);
      h.vy = (h.vy || 0) + C.GRAVITY * dt;
      var body = { x: h.x, y: h.y, w: h.w, h: h.h, vx: 0, vy: h.vy, onGround: false };
      P.moveAndCollide(body, platforms, dt);
      h.y = body.y;
      h.vy = body.vy;
    }
  }

  function updateVacuum(v, dt) {
    patrolX(v, dt);
  }

  function updateBroom(b, dt) {
    b.phase = (b.phase || 0) + dt * b.speed;
    b.x = b.cx + Math.sin(b.phase) * b.amp;
  }

  function updateList(list, dt, extra) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.dead) continue;
      e.t = (e.t || 0) + dt;
      if (e.x1 != null) patrolX(e, dt);
      if (extra) extra(e, dt);
    }
  }

  function updateWaves(list, dt) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var w = list[i];
      w.t = (w.t || 0) + dt;
      var wave = (Math.sin(w.t * (w.period || 1.8)) + 1) * 0.5;
      w.h = 10 + wave * 28;
      w.y = C.GROUND - w.h + 4;
    }
  }

  function updateYardDogs(list, player, dt) {
    if (!list) return;
    var range = C.BARK_RANGE || 200;
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      d.t = (d.t || 0) + dt;
      if (d.x1 != null) patrolX(d, dt);
      if (d.barkT > 0) d.barkT -= dt;
      if (d.barkCd > 0) d.barkCd -= dt;
      var near = false;
      if (player) {
        var px = player.x + player.w / 2;
        var py = player.y + player.h / 2;
        var cx = d.x + d.w / 2;
        var cy = d.y + d.h / 2;
        var dx = px - cx;
        var dy = py - cy;
        near = dx * dx + dy * dy <= range * range;
      }
      if (near && d.barkCd <= 0) {
        d.barking = true;
        d.barkT = 0.16;
        d.barkCd = 0.36;
        if (Billy.Audio && Billy.Audio.bark) Billy.Audio.bark();
      } else {
        d.barking = d.barkT > 0;
      }
    }
  }

  function updateSeagulls(list, dt) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var g = list[i];
      g.t = (g.t || 0) + dt;
      patrolX(g, dt);
      g.y = (g.baseY || g.y) + Math.sin(g.t * 2.2) * 18;
    }
  }

  function bodyOf(kind, e) {
    if (kind === 'critter' || kind === 'skater' || kind === 'cat' || kind === 'crab' || kind === 'gull' || kind === 'yarn' || kind === 'vase' || kind === 'yardDog') {
      return { x: e.x, y: e.y, w: e.w, h: e.h };
    }
    if (kind === 'vacuum') return { x: e.x - C.VACUUM_W / 2, y: e.y - C.VACUUM_H / 2, w: C.VACUUM_W, h: C.VACUUM_H };
    if (kind === 'broom') return { x: e.x - C.BROOM_W / 2, y: e.y - C.BROOM_H / 2, w: C.BROOM_W, h: C.BROOM_H };
    if (kind === 'car') return { x: e.x - C.CAR_W / 2, y: e.y - C.CAR_H / 2, w: C.CAR_W, h: C.CAR_H };
    if (kind === 'manhole') return { x: e.x, y: e.y, w: e.w, h: e.h };
    if (kind === 'wave') return { x: e.x, y: e.y, w: e.w, h: e.h };
    if (kind === 'needle') return { x: e.x - C.NEEDLE_W / 2, y: e.y - C.NEEDLE_H / 2, w: C.NEEDLE_W, h: C.NEEDLE_H };
    return e;
  }

  Billy.Enemies = {
    updateCritters: updateCritters,
    updateVacuum: updateVacuum,
    updateBroom: updateBroom,
    updateList: updateList,
    updateWaves: updateWaves,
    updateYardDogs: updateYardDogs,
    updateSeagulls: updateSeagulls,
    bodyOf: bodyOf,
  };
})();
