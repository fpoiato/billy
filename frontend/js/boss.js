var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function createBed(arena) {
    return {
      kind: 'bed',
      arena: arena,
      defeated: 0,
      monster: null,
      cooldown: 0.6,
      brightness: 0.18,
      done: false,
    };
  }

  function spawnMonster(boss, index) {
    var bed = boss.arena.bed;
    var dir = index === 1 ? 1 : -1;
    var pattern = index === 2 ? 'hop' : 'walk';
    boss.monster = {
      kind: 'monster',
      x: bed.x - 10,
      y: bed.y - 8 - C.MONSTER_H,
      w: C.MONSTER_W,
      h: C.MONSTER_H,
      vx: dir * 90,
      vy: 0,
      dir: dir,
      pattern: pattern,
      t: 0,
    };
    Billy.Audio.bark();
  }

  function updateBed(boss, player, dt, platforms) {
    if (boss.done) return;
    if (!boss.monster) {
      boss.cooldown -= dt;
      if (boss.cooldown <= 0 && boss.defeated < C.BOSS_MONSTERS) {
        spawnMonster(boss, boss.defeated);
      }
      return;
    }

    var m = boss.monster;
    m.t += dt;
    if (m.pattern === 'walk') {
      m.vx = m.dir * (90 + boss.defeated * 25);
      if (m.x < boss.arena.left + 20) m.dir = 1;
      if (m.x + m.w > boss.arena.right - 20) m.dir = -1;
    } else {
      m.vx = Math.sign(player.x - m.x) * 120;
      if (m.t > 0.7 && m.vy === 0) {
        m.vy = -420;
        m.t = 0;
      }
    }
    m.vy += C.GRAVITY * dt;
    P.moveAndCollide(m, platforms, dt);

    if (P.aabb(player, m)) {
      if (P.isStomp(player, m)) {
        player.vy = C.STOMP_BOUNCE;
        Billy.Audio.stomp();
        boss.defeated += 1;
        boss.brightness = 0.18 + boss.defeated * 0.28;
        boss.monster = null;
        boss.cooldown = 0.8;
        if (boss.defeated >= C.BOSS_MONSTERS) {
          boss.done = true;
          boss.brightness = 1;
          Billy.Audio.win();
        }
        return { stomped: true, x: m.x + m.w / 2, y: m.y + m.h / 2 };
      }
      return { hit: true };
    }
    return null;
  }

  function createDogs(arena) {
    return {
      kind: 'dogs',
      arena: arena,
      defeated: 0,
      monster: null,
      cooldown: 0.7,
      brightness: 1,
      done: false,
    };
  }

  function spawnDog(boss) {
    var gateX = boss.arena.gateX || (boss.arena.right - 90);
    boss.monster = {
      kind: 'dog',
      x: gateX - 30,
      y: C.GROUND - C.DOG_H,
      w: C.DOG_W,
      h: C.DOG_H,
      homeX: gateX - 30,
      vx: 0,
      vy: 0,
      mode: 'bark',
      modeT: 1.05,
      t: 0,
    };
    Billy.Audio.bark();
  }

  function updateDogs(boss, player, dt) {
    if (boss.done) return;
    if (!boss.monster) {
      boss.cooldown -= dt;
      if (boss.cooldown <= 0 && boss.defeated < C.BOSS_DOGS) spawnDog(boss);
      return;
    }

    var d = boss.monster;
    d.t += dt;
    d.modeT -= dt;
    if (d.mode === 'bark') {
      d.x = d.homeX;
      if (d.modeT <= 0) {
        d.mode = 'down';
        d.modeT = 0.95;
      }
    } else if (d.mode === 'down') {
      d.x = d.homeX;
      if (d.modeT <= 0) {
        d.mode = 'lunge';
        d.modeT = 0.55;
      }
    } else if (d.mode === 'lunge') {
      d.x -= (240 + boss.defeated * 30) * dt;
      if (d.x < boss.arena.left + 30 || d.modeT <= 0) {
        d.mode = 'back';
        d.modeT = 0.7;
      }
    } else {
      d.x += 280 * dt;
      if (d.x >= d.homeX) {
        d.x = d.homeX;
        d.mode = 'bark';
        d.modeT = 0.85;
      }
    }

    var body = { x: d.x, y: d.y, w: d.w, h: d.h };
    if (d.mode === 'down') {
      body.y = d.y + 12;
      body.h = d.h - 12;
    }

    if (P.aabb(player, body)) {
      if (d.mode === 'down' && P.isStomp(player, body)) {
        player.vy = C.STOMP_BOUNCE;
        Billy.Audio.stomp();
        boss.defeated += 1;
        boss.monster = null;
        boss.cooldown = 0.85;
        if (boss.defeated >= C.BOSS_DOGS) {
          boss.done = true;
          Billy.Audio.win();
        }
        return { stomped: true, x: d.x + d.w / 2, y: d.y };
      }
      if (d.mode !== 'down') return { hit: true };
    }
    return null;
  }

  function createCamila(arena) {
    return {
      kind: 'camila',
      arena: arena,
      defeated: 0,
      monster: {
        kind: 'camila',
        x: arena.right - 80 - C.CAMILA_W,
        y: C.GROUND - C.CAMILA_H,
        w: C.CAMILA_W,
        h: C.CAMILA_H,
        vx: 0,
        vy: 0,
        dir: -1,
        mode: 'chase',
        modeT: 0,
        t: 0,
      },
      cooldown: 0,
      brightness: 1,
      done: false,
    };
  }

  function stompCamila(boss, player, c) {
    player.grabbed = false;
    player.bulge = 0;
    player.vy = C.STOMP_BOUNCE;
    if (Billy.Audio && Billy.Audio.stomp) Billy.Audio.stomp();
    boss.defeated += 1;
    c.mode = 'tired';
    c.modeT = 0.35;
    if (boss.defeated >= C.BOSS_CAMILA) {
      boss.done = true;
      c.mode = 'happy';
      if (Billy.Audio && Billy.Audio.win) Billy.Audio.win();
    }
    return { stomped: true, x: c.x + c.w / 2, y: c.y };
  }

  function updateCamila(boss, player, dt, platforms) {
    if (boss.done) {
      player.grabbed = false;
      player.bulge = 0;
      return;
    }
    var c = boss.monster;
    if (!c) return;
    c.t += dt;
    var body = { x: c.x, y: c.y, w: c.w, h: c.h };

    if (c.mode === 'grab') {
      c.vx = 0;
      player.grabbed = true;
      player.bulge = Math.min(1, player.bulge + dt * 1.6);
      player.x = c.x + c.w / 2 - player.w / 2;
      player.y = c.y + 22;
      player.facing = c.dir;
      c.modeT -= dt;
      if (c.modeT <= 0) {
        player.grabbed = false;
        player.bulge = 0;
        player.vx = -c.dir * 280;
        player.vy = -320;
        c.mode = 'tired';
        c.modeT = 1.15;
        return { hit: true };
      }
      return null;
    }

    var toward = Math.sign((player.x + player.w / 2) - (c.x + c.w / 2)) || c.dir;
    if (c.mode === 'chase') {
      c.dir = toward;
      c.vx = c.dir * (C.CAMILA_SPEED + boss.defeated * 28);
    } else if (c.mode === 'tired') {
      c.vx = 0;
      c.modeT -= dt;
      if (c.modeT <= 0) c.mode = 'chase';
    } else if (c.mode === 'happy') {
      c.vx = 0;
    }

    c.vy += C.GRAVITY * dt;
    P.moveAndCollide(c, platforms, dt);
    c.x = P.clamp(c.x, boss.arena.left + 8, boss.arena.right - c.w - 8);
    body = { x: c.x, y: c.y, w: c.w, h: c.h };

    if (P.aabb(player, body) && !player.grabbed) {
      if (P.isStomp(player, body) && c.mode !== 'grab') {
        return stompCamila(boss, player, c);
      }
      if (c.mode === 'chase' && player.invuln <= 0) {
        c.mode = 'grab';
        c.modeT = 1.2;
        c.vx = 0;
        player.grabbed = true;
        player.bulge = 0.15;
        if (Billy.Audio && Billy.Audio.squeak) Billy.Audio.squeak();
        return { grab: true, x: c.x + c.w / 2, y: c.y + 20 };
      }
    }
    return null;
  }

  function create(arena, kind) {
    if (kind === 'dogs') return createDogs(arena);
    if (kind === 'camila') return createCamila(arena);
    return createBed(arena);
  }

  function update(boss, player, dt, platforms) {
    if (!boss) return null;
    if (boss.kind === 'dogs') return updateDogs(boss, player, dt);
    if (boss.kind === 'camila') return updateCamila(boss, player, dt, platforms);
    return updateBed(boss, player, dt, platforms);
  }

  Billy.Boss = {
    create: create,
    update: update,
  };
})();
