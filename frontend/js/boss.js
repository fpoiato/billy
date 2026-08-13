var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function create(arena) {
    return {
      arena: arena,
      defeated: 0,
      monster: null,
      cooldown: 0.6,
      brightness: 0.18,
      done: false,
    };
  }

  function spawn(boss, index) {
    var bed = boss.arena.bed;
    var dir = index === 1 ? 1 : -1;
    var pattern = index === 2 ? 'hop' : 'walk';
    boss.monster = {
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

  function update(boss, player, dt, platforms) {
    if (boss.done) return;
    if (!boss.monster) {
      boss.cooldown -= dt;
      if (boss.cooldown <= 0 && boss.defeated < C.BOSS_MONSTERS) {
        spawn(boss, boss.defeated);
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

  Billy.Boss = {
    create: create,
    update: update,
  };
})();
