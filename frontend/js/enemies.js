var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function updateHearts(hearts, dt, platforms) {
    for (var i = 0; i < hearts.length; i++) {
      var h = hearts[i];
      if (h.dead) continue;
      h.t = (h.t || 0) + dt;
      if (h.x1 != null) {
        h.x += h.dir * C.HEART_SPEED * dt;
        if (h.x < h.x1) { h.x = h.x1; h.dir = 1; }
        if (h.x > h.x2) { h.x = h.x2; h.dir = -1; }
      }
      h.vy = (h.vy || 0) + C.GRAVITY * dt;
      var body = { x: h.x, y: h.y, w: h.w, h: h.h, vx: 0, vy: h.vy, onGround: false };
      P.moveAndCollide(body, platforms, dt);
      h.y = body.y;
      h.vy = body.vy;
    }
  }

  function updateVacuum(v, dt) {
    v.x += v.dir * v.speed * dt;
    if (v.x < v.x1) { v.x = v.x1; v.dir = 1; }
    if (v.x > v.x2) { v.x = v.x2; v.dir = -1; }
  }

  function updateBroom(b, dt) {
    b.phase = (b.phase || 0) + dt * b.speed;
    b.x = b.cx + Math.sin(b.phase) * b.amp;
  }

  function bodyOf(kind, e) {
    if (kind === 'heart') return { x: e.x, y: e.y, w: e.w, h: e.h };
    if (kind === 'vacuum') return { x: e.x - C.VACUUM_W / 2, y: e.y - C.VACUUM_H / 2, w: C.VACUUM_W, h: C.VACUUM_H };
    if (kind === 'broom') return { x: e.x - C.BROOM_W / 2, y: e.y - C.BROOM_H / 2, w: C.BROOM_W, h: C.BROOM_H };
    return e;
  }

  Billy.Enemies = {
    updateHearts: updateHearts,
    updateVacuum: updateVacuum,
    updateBroom: updateBroom,
    bodyOf: bodyOf,
  };
})();
