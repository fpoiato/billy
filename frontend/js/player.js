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
      grabbed: false,
      bulge: 0,
      kissing: false,
      kissDuck: null,
      kissHearts: [],
      kissSpawn: 0,
      barking: false,
      barkT: 0,
      barkCd: 0,
    };
  }

  var PEE_ZONE = {
    sofa: { ox: 0, w: 110 },
    bed: { ox: -90, w: 180 },
    door: { ox: 0, w: 54 },
    hydrant: { ox: 0, w: 22 },
    shower: { ox: -4, w: 24 },
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

  function nearKissDuck(p, level) {
    var decos = level.decos || [];
    var cx = p.x + p.w / 2;
    for (var i = 0; i < decos.length; i++) {
      var d = decos[i];
      if (d.kind !== 'toy' || !d.kiss) continue;
      if (d.clearKiss && !d.kissReady) continue;
      if (Math.abs(cx - d.x) <= C.KISS_RANGE) return d;
    }
    return null;
  }

  function spawnKissHeart(p, duck) {
    var mid = (p.x + p.w / 2 + duck.x) / 2;
    p.kissHearts.push({
      x: mid + (Math.random() - 0.5) * 28,
      y: C.GROUND - 10 - Math.random() * 8,
      vx: (Math.random() - 0.5) * 18,
      vy: -40 - Math.random() * 50,
      life: 1,
      s: 0.6 + Math.random() * 0.5,
    });
    if (p.kissHearts.length > 18) p.kissHearts.shift();
  }

  function updateKiss(p, input, level, dt) {
    if (!p.kissHearts) p.kissHearts = [];
    for (var i = p.kissHearts.length - 1; i >= 0; i--) {
      var h = p.kissHearts[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.life -= dt * 0.7;
      if (h.life <= 0) p.kissHearts.splice(i, 1);
    }

    if (p.grabbed || p.peeing) {
      p.kissing = false;
      p.kissDuck = null;
      return;
    }

    var duck = nearKissDuck(p, level);
    var near = duck && p.onGround && Math.abs(p.vx) < 80 && !input.jumpPressed;
    if (near) {
      if (!p.kissing && Billy.Audio && Billy.Audio.kiss) Billy.Audio.kiss();
      p.kissing = true;
      p.kissDuck = duck;
      p.facing = duck.x >= p.x + p.w / 2 ? 1 : -1;
      p.kissSpawn -= dt;
      if (p.kissSpawn <= 0) {
        spawnKissHeart(p, duck);
        p.kissSpawn = 0.11;
      }
    } else {
      p.kissing = false;
      p.kissDuck = null;
      p.kissSpawn = 0;
    }
  }

  var BARK_LISTS = [
    ['critters', 'critter'],
    ['vacuums', 'vacuum'],
    ['brooms', 'broom'],
    ['cars', 'car'],
    ['skaters', 'skater'],
    ['cats', 'cat'],
    ['manholes', 'manhole'],
    ['crabs', 'crab'],
    ['waves', 'wave'],
    ['seagulls', 'gull'],
    ['needles', 'needle'],
    ['yarns', 'yarn'],
    ['vases', 'vase'],
    ['yardDogs', 'yardDog'],
  ];

  function entityBody(kind, e) {
    if (Billy.Enemies && Billy.Enemies.bodyOf) return Billy.Enemies.bodyOf(kind, e);
    return { x: e.x, y: e.y, w: e.w || 20, h: e.h || 20 };
  }

  function nearBody(p, body, range) {
    if (!body || body.dead) return false;
    var w = body.w || 20;
    var h = body.h || 20;
    var px = p.x + p.w / 2;
    var py = p.y + p.h / 2;
    var nx = Math.max(body.x, Math.min(px, body.x + w));
    var ny = Math.max(body.y, Math.min(py, body.y + h));
    var dx = px - nx;
    var dy = py - ny;
    return dx * dx + dy * dy <= range * range;
  }

  function nearBarkThing(p, level, extras) {
    var range = C.BARK_RANGE;
    var i;
    for (i = 0; i < BARK_LISTS.length; i++) {
      var list = (level && level[BARK_LISTS[i][0]]) || [];
      var kind = BARK_LISTS[i][1];
      for (var j = 0; j < list.length; j++) {
        if (list[j].dead) continue;
        if (nearBody(p, entityBody(kind, list[j]), range)) return true;
      }
    }
    var decos = (level && level.decos) || [];
    for (i = 0; i < decos.length; i++) {
      var d = decos[i];
      if (d.kind !== 'toy') continue;
      if (p.kissing && p.kissDuck === d) continue;
      if (nearBody(p, { x: d.x - 16, y: d.y - 30, w: 32, h: 24 }, range)) return true;
    }
    extras = extras || [];
    for (i = 0; i < extras.length; i++) {
      if (nearBody(p, extras[i], range)) return true;
    }
    return false;
  }

  function updateBark(p, level, extras, dt) {
    if (p.barkT > 0) p.barkT -= dt;
    if (p.barkCd > 0) p.barkCd -= dt;

    if (p.kissing) {
      p.barking = false;
      p.barkT = 0;
      return false;
    }

    var near = nearBarkThing(p, level, extras);
    if (near && p.barkCd <= 0) {
      p.barking = true;
      p.barkT = C.BARK_TIME;
      p.barkCd = C.BARK_GAP;
      if (Billy.Audio && Billy.Audio.yip) Billy.Audio.yip();
    } else {
      p.barking = p.barkT > 0;
    }
    return near;
  }

  function update(p, input, level, dt) {
    p.animT += dt;
    if (p.invuln > 0) p.invuln -= dt;

    if (p.grabbed) {
      p.vx = 0;
      p.vy = 0;
      p.kissing = false;
      return;
    }

    updatePee(p, input, level, dt);
    updateKiss(p, input, level, dt);
    var dir = p.peeing || p.kissing ? 0 : input.dir;

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
    updateKiss: updateKiss,
    nearPeeSpot: nearPeeSpot,
    nearKissDuck: nearKissDuck,
    nearBarkThing: nearBarkThing,
    updateBark: updateBark,
    peeZone: peeZone,
    hit: hit,
    addSteaks: addSteaks,
    onRug: onRug,
  };
})();
