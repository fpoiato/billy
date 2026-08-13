var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function create(x, y) {
    return {
      x: x,
      y: y,
      w: C.PLAYER_W,
      h: C.PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      coyote: 0,
      jumpBuf: 0,
      invuln: 0,
      lives: C.START_LIVES,
      steaks: 0,
      animT: 0,
    };
  }

  function update(p, input, level, dt) {
    p.animT += dt;
    if (p.invuln > 0) p.invuln -= dt;

    if (p.onGround) p.coyote = C.COYOTE;
    else p.coyote -= dt;

    if (input.jumpPressed) p.jumpBuf = C.JUMP_BUFFER;
    else p.jumpBuf -= dt;

    var accel = p.onGround ? C.ACCEL : C.AIR_ACCEL;
    if (input.dir !== 0) {
      if (p.onGround && Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== input.dir && Math.abs(p.vx) > C.SKID_THRESHOLD) {
        p.vx += input.dir * accel * 1.6 * dt;
      } else {
        p.vx += input.dir * accel * dt;
      }
      p.facing = input.dir;
    } else if (p.onGround) {
      var rug = onRug(p, level.rugs);
      var fr = rug ? C.RUG_FRICTION : C.FRICTION;
      p.vx *= Math.pow(fr, dt * 60);
      if (Math.abs(p.vx) < 8) p.vx = 0;
    }

    var max = p.onGround ? C.MAX_SPEED : C.MAX_AIR_SPEED;
    if (onRug(p, level.rugs) && p.onGround) max *= 1.25;
    p.vx = P.clamp(p.vx, -max, max);

    if (p.jumpBuf > 0 && p.coyote > 0) {
      p.vy = C.JUMP_V;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuf = 0;
      Billy.Audio.jump();
    }

    p.vy += C.GRAVITY * dt;
    P.moveAndCollide(p, level.platforms, dt);

    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    if (p.x + p.w > level.width) {
      p.x = level.width - p.w;
      p.vx = 0;
    }
  }

  function onRug(p, rugs) {
    if (!rugs) return false;
    var feet = { x: p.x, y: p.y + p.h - 4, w: p.w, h: 8 };
    for (var i = 0; i < rugs.length; i++) {
      if (P.aabb(feet, rugs[i])) return true;
    }
    return false;
  }

  function hit(p, scatterAt) {
    if (p.invuln > 0) return null;
    var res = P.applyHit(p.steaks, C.STEAKS_ON_HIT);
    p.steaks = res.steaks;
    p.invuln = C.INVULN;
    p.vy = -240;
    p.vx *= -0.4;
    Billy.Audio.hurt();
    if (res.loseLife) {
      p.lives -= 1;
    }
    return {
      loseLife: res.loseLife,
      steaksLost: res.steaksLost,
      x: scatterAt ? scatterAt.x : p.x,
      y: scatterAt ? scatterAt.y : p.y,
    };
  }

  function addSteaks(p, n) {
    var prev = p.steaks;
    p.steaks += n;
    var extra = P.extraLivesFromSteaks(prev, p.steaks, C.STEAKS_PER_LIFE);
    if (extra > 0) {
      p.lives += extra;
      Billy.Audio.extraLife();
    } else {
      Billy.Audio.steak();
    }
    return extra;
  }

  Billy.Player = {
    create: create,
    update: update,
    hit: hit,
    addSteaks: addSteaks,
    onRug: onRug,
  };
})();
