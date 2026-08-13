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
      stillT: 0,
      peeing: false,
      peeT: 0,
      peeCooldown: 0,
    };
  }

  var PEE_ZONE = {
    sofa: { ox: 0, w: 110 },
    bed: { ox: -90, w: 180 },
    door: { ox: 0, w: 54 },
  };

  function peeZone(d) {
    var z = PEE_ZONE[d.kind];
    if (!z) return null;
    return { x: d.x + z.ox, w: z.w };
  }

  function nearPeeSpot(p, level) {
    var decos = level.decos || [];
    var cx = p.x + p.w / 2;
    for (var i = 0; i < decos.length; i++) {
      var d = decos[i];
      if (d.peed) continue;
      var z = peeZone(d);
      if (!z) continue;
      if (cx >= z.x - 16 && cx <= z.x + z.w + 16) return d;
    }
    return null;
  }

  function updatePee(p, input, level, dt) {
    if (p.peeCooldown > 0) p.peeCooldown -= dt;
    if (p.peeing) {
      p.peeT -= dt;
      p.vx = 0;
      if (p.peeT <= 0 || input.jumpPressed) {
        p.peeing = false;
        p.peeCooldown = 0.45;
      }
      return;
    }
    var still = p.onGround && Math.abs(p.vx) < 14 && input.dir === 0 && !input.jumpPressed;
    var spot = still ? nearPeeSpot(p, level) : null;
    if (spot && p.peeCooldown <= 0) {
      p.stillT += dt;
      if (p.stillT >= C.PEE_STILL) {
        p.peeing = true;
        p.peeT = C.PEE_TIME;
        p.stillT = 0;
        spot.peed = true;
        if (!level.puddles) level.puddles = [];
        level.puddles.push({
          x: p.x + p.w / 2 - p.facing * 12,
          y: C.GROUND - 2,
          t: 0,
        });
        if (Billy.Audio && Billy.Audio.pee) Billy.Audio.pee();
      }
    } else {
      p.stillT = 0;
    }
  }

  function update(p, input, level, dt) {
    p.animT += dt;
    if (p.invuln > 0) p.invuln -= dt;

    updatePee(p, input, level, dt);
    var dir = p.peeing ? 0 : input.dir;

    if (p.onGround) p.coyote = C.COYOTE;
    else p.coyote -= dt;

    if (input.jumpPressed) p.jumpBuf = C.JUMP_BUFFER;
    else p.jumpBuf -= dt;

    var accel = p.onGround ? C.ACCEL : C.AIR_ACCEL;
    if (dir !== 0) {
      if (p.onGround && Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== dir && Math.abs(p.vx) > C.SKID_THRESHOLD) {
        p.vx += dir * accel * 1.6 * dt;
      } else {
        p.vx += dir * accel * dt;
      }
      p.facing = dir;
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
    updatePee: updatePee,
    nearPeeSpot: nearPeeSpot,
    peeZone: peeZone,
    hit: hit,
    addSteaks: addSteaks,
    onRug: onRug,
  };
})();
