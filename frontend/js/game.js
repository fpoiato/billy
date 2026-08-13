var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;
  var D = Billy.Draw;

  var canvas;
  var ctx;
  var state;
  var last = 0;
  var buttons = [];

  function setTouch(on) {
    var el = document.getElementById('touch');
    if (!el) return;
    el.hidden = !(on && Billy.Input.usesTouch());
  }

  function startPhase(phaseId, carry) {
    var level = Billy.Campaign.createLevel(phaseId);
    if (!level) return false;
    var player = Billy.Player.create(level.spawn.x, level.spawn.y);
    if (carry) {
      player.lives = carry.lives;
      player.steaks = carry.steaks;
    }
    state = {
      screen: 'playing',
      phaseId: level.id,
      level: level,
      player: player,
      cam: Billy.Camera.create(),
      fx: Billy.Fx.create(),
      boss: null,
      mayraDone: false,
      t: 0,
      elapsed: 0,
      showTimer: true,
      intro: level.intro != null ? level.intro : 1.2,
      nightIntro: 0,
      night: false,
      banner: '',
      bannerT: 0,
      duckX: (level.spawn && level.spawn.x || 80) + 80,
      clearT: 0,
      spawn: { x: level.spawn.x, y: level.spawn.y },
      results: null,
      coming: null,
      goalHit: false,
    };
    Billy.Audio.music(level.music || 'day');
    if (level.leash && Billy.Dad) {
      level.dad = Billy.Dad.create(player.x - (Billy.CONFIG.LEASH_REST || 96));
    }
    setTouch(true);
    return true;
  }

  function goMenu() {
    state = {
      screen: 'menu',
      t: 0,
      level: { name: 'Casa', width: C.WIDTH },
      player: { lives: C.START_LIVES, steaks: 0 },
      showTimer: false,
      elapsed: 0,
      coming: null,
      results: null,
    };
    Billy.Audio.stopMusic();
    setTouch(false);
  }

  function startGame() {
    Billy.Audio.unlock();
    Billy.Audio.markStart();
    startPhase('house');
    Billy.Display.requestFullscreen();
  }

  function endDuck(level) {
    var decos = (level && level.decos) || [];
    for (var i = 0; i < decos.length; i++) {
      var d = decos[i];
      if (d.kind === 'toy' && (d.kiss || d.clearKiss)) return d;
    }
    return null;
  }

  function reuniteDuck(dt) {
    var duck = endDuck(state.level);
    var p = state.player;
    if (!duck || !p) return;
    duck.kiss = true;
    duck.kissReady = true;
    var target = p.x + p.w / 2 + 22;
    if (state.clearT > 1.15 && Math.abs(duck.x - target) > 80) {
      duck.x = target;
    } else if (Math.abs(duck.x - target) > 6) {
      duck.x += Math.sign(target - duck.x) * 240 * dt;
    }
  }

  function beginResults() {
    state.screen = 'results';
    state.results = Billy.Results.create({
      phaseId: state.level.id,
      steaks: state.player.steaks,
      lives: state.player.lives,
      elapsed: state.elapsed,
    });
    Billy.Audio.stopMusic();
    setTouch(false);
  }

  function continueFromResults() {
    if (!state.results) return;
    Billy.Results.beginWipe(state.results);
  }

  function finishResults() {
    var r = state.results;
    var next = Billy.Campaign.next(r.phaseId);
    var carry = { lives: r.lives, steaks: r.steaks };
    if (next && next.playable && startPhase(next.id, carry)) return;
    if (next) {
      state.screen = 'coming';
      state.coming = { phase: next, t: 0, steaks: r.steaks, lives: r.lives };
      state.results = null;
      setTouch(false);
      return;
    }
    state.screen = 'victory';
    state.victory = { t: 0, steaks: r.steaks };
    state.results = null;
    setTouch(false);
  }

  function respawn() {
    var p = state.player;
    if (p.lives <= 0) {
      state.screen = 'gameover';
      Billy.Audio.stopMusic();
      setTouch(false);
      return;
    }
    p.x = state.spawn.x;
    p.y = state.spawn.y;
    p.vx = 0;
    p.vy = 0;
    p.invuln = 1.2;
    if (state.level.dad && Billy.Dad) Billy.Dad.reset(state.level.dad, p);
    if (state.boss && !state.boss.done && state.boss.arena) {
      p.x = state.boss.arena.left + 60;
      p.y = C.GROUND - p.h;
    }
  }

  function hurtPlayer(from) {
    var res = Billy.Player.hit(state.player, from);
    if (!res) return;
    state.cam.shake = 0.25;
    if (res.steaksLost > 0) {
      Billy.Fx.scatterSteaks(state.fx.bits, state.player.x, state.player.y, Math.min(6, res.steaksLost));
    }
    if (res.loseLife && state.player.lives <= 0) {
      state.screen = 'gameover';
      Billy.Audio.stopMusic();
      setTouch(false);
    }
  }

  function collectSteaks(dt) {
    var p = state.player;
    var list = state.level.steaks;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s.taken) continue;
      if (P.aabb(p, { x: s.x - 9, y: s.y - 7, w: 18, h: 14 })) {
        s.taken = true;
        Billy.Player.addSteaks(p, 1);
      }
    }
    for (var j = state.fx.bits.length - 1; j >= 0; j--) {
      var b = state.fx.bits[j];
      if (b.pickup > 0) continue;
      if (P.aabb(p, { x: b.x - 8, y: b.y - 6, w: 16, h: 12 })) {
        state.fx.bits.splice(j, 1);
        Billy.Player.addSteaks(p, 1);
      }
    }
  }

  function collideHazards() {
    var p = state.player;
    var level = state.level;

    function hitList(list, kind, opt) {
      opt = opt || {};
      if (!list) return;
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (e.dead) continue;
        var body = Billy.Enemies.bodyOf(kind, e);
        if (!P.aabb(p, body)) continue;
        if (opt.noStomp) {
          if (opt.groundOnly && !p.onGround) continue;
          hurtPlayer(body);
          continue;
        }
        if (P.isStomp(p, body)) {
          p.vy = C.STOMP_BOUNCE;
          Billy.Audio.stomp();
          if (opt.kill) {
            e.dead = true;
            Billy.Fx.sparkleBurst(state.fx.sparkles, body.x + body.w / 2, body.y, '#ffd24a');
          }
        } else {
          hurtPlayer(body);
        }
      }
    }

    hitList(level.critters, 'critter', { kill: true });
    hitList(level.vacuums, 'vacuum');
    hitList(level.brooms, 'broom');
    hitList(level.cars, 'car');
    hitList(level.skaters, 'skater', { kill: true });
    hitList(level.cats, 'cat', { kill: true });
    hitList(level.manholes, 'manhole', { noStomp: true, groundOnly: true });
    hitList(level.crabs, 'crab', { kill: true });
    hitList(level.waves, 'wave', { noStomp: true });
    hitList(level.seagulls, 'gull', { kill: true });
    hitList(level.needles, 'needle');
    hitList(level.yarns, 'yarn', { kill: true });
    hitList(level.vases, 'vase', { kill: true });
  }

  function updateWorld(dt, input) {
    var level = state.level;
    var p = state.player;
    Billy.Player.update(p, input, level, dt);
    if (level.dad && Billy.Dad) Billy.Dad.update(level.dad, p, level, state.cam, dt);
    if (level.dad && level.dad.mode === 'rush' && !level.dad.rushBanner) {
      level.dad.rushBanner = true;
      state.banner = 'Hambúrguer!!!';
      state.bannerT = 1.2;
    }
    if (level.dad && level.dad.mode === 'walk') level.dad.rushBanner = false;
    Billy.Enemies.updateCritters(level.critters || [], dt, level.platforms);
    var vs = level.vacuums || [];
    for (var i = 0; i < vs.length; i++) Billy.Enemies.updateVacuum(vs[i], dt);
    var bs = level.brooms || [];
    for (var j = 0; j < bs.length; j++) Billy.Enemies.updateBroom(bs[j], dt);
    Billy.Enemies.updateList(level.cars, dt);
    Billy.Enemies.updateList(level.skaters, dt);
    Billy.Enemies.updateList(level.cats, dt);
    Billy.Enemies.updateList(level.crabs, dt);
    Billy.Enemies.updateList(level.yarns, dt);
    var ns = level.needles || [];
    for (var n = 0; n < ns.length; n++) Billy.Enemies.updateBroom(ns[n], dt);
    Billy.Enemies.updateWaves(level.waves, dt);
    Billy.Enemies.updateSeagulls(level.seagulls, dt);
    Billy.Enemies.updateYardDogs(level.yardDogs || [], p, dt);
    Billy.Fx.update(state.fx, dt);
    collectSteaks(dt);
    if (!p.grabbed && !p.kissing && !p.bathing) collideHazards();

    if (level.checkpoint && !level.checkpoint.used && p.x + p.w > level.checkpoint.x) {
      level.checkpoint.used = true;
      state.spawn = { x: level.checkpoint.x, y: C.GROUND - p.h };
      Billy.Fx.sparkleBurst(state.fx.sparkles, level.checkpoint.x + 10, C.GROUND - 50, '#3cb46a');
    }

    if (level.dayEndX && !state.night && p.x > level.dayEndX) {
      state.night = true;
      state.nightIntro = 2.4;
      state.banner = 'Sozinho em casa à noite...';
      Billy.Audio.music('night');
    }

    if (!state.boss && level.mayraArena && !state.mayraDone && p.x > level.mayraArena.left + 40) {
      state.boss = Billy.Boss.create(level.mayraArena, 'mayra');
      Billy.Audio.music('boss');
      state.banner = level.mayraBanner || 'Mayra quer dar banho!';
      state.bannerT = 1.6;
    }

    var arena = level.bossArena;
    if (!state.boss && arena && p.x > arena.left + 40) {
      state.boss = Billy.Boss.create(arena, level.bossKind);
      Billy.Audio.music('boss');
      state.banner = level.bossBanner || 'Cuidado!';
      state.bannerT = 1.6;
    }

    if (state.boss && !state.boss.done) {
      var ev = Billy.Boss.update(state.boss, p, dt, level.platforms);
      if (ev && ev.stomped) {
        Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#ffe14a');
        Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#fff');
      }
      if (ev && ev.grab) {
        Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#ff5a7a');
      }
      if (ev && ev.bath) {
        if (Billy.Fx.splash) Billy.Fx.splash(state.fx.sparkles, ev.x, ev.y);
        else {
          Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#7ec8ff');
          Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#fff');
        }
        if (ev.puddle) {
          if (!level.puddles) level.puddles = [];
          level.puddles.push({ x: ev.x, y: C.GROUND - 2, t: 0, kind: 'soap' });
        }
      }
      if (ev && ev.hit) {
        hurtPlayer(state.boss.monster);
      }
    } else if (state.boss && state.boss.done) {
      if (state.boss.clearsPhase === false) {
        state.clearT += dt;
        p.grabbed = false;
        p.bathing = false;
        if (state.clearT > 1.15 && state.screen === 'playing') {
          state.spawn = {
            x: state.boss.arena.right - 90,
            y: C.GROUND - p.h,
          };
          state.mayraDone = true;
          state.boss = null;
          state.clearT = 0;
          Billy.Audio.music('night');
        }
      } else {
        reuniteDuck(dt);
        state.clearT += dt;
        var bossWait = p.kissing ? 3.2 : 4.2;
        if (state.clearT > bossWait && state.screen === 'playing') {
          beginResults();
        }
      }
    }

    if (level.goal && !state.goalHit && !state.boss && p.x + p.w > level.goal.x) {
      state.goalHit = true;
      state.banner = level.goal.banner || 'Muito bem!';
      state.bannerT = 1.6;
      state.clearT = 0.01;
      Billy.Audio.win();
    }
    if (state.goalHit && state.screen === 'playing') {
      reuniteDuck(dt);
      state.clearT += dt;
      if (state.clearT > (p.kissing ? 3.2 : 4.2)) beginResults();
    }

    var hold = state.boss && state.boss.arena;
    if (hold) {
      p.x = P.clamp(p.x, state.boss.arena.left + 10, state.boss.arena.right - p.w - 10);
    }

    var barkExtras = [];
    if (state.boss && state.boss.monster) barkExtras.push(state.boss.monster);
    if (state.intro > 0 && (level.theme || 'house') === 'house') {
      barkExtras.push({ x: state.duckX - 16, y: C.GROUND - 28, w: 32, h: 24 });
    }
    Billy.Player.updateBark(p, level, barkExtras, dt);

    if (p.y > C.HEIGHT + 80) {
      hurtPlayer(p);
      if (state.screen === 'playing') respawn();
    }
  }

  function update(dt, input) {
    state.t += dt;
    buttons = [];
    if (state.screen === 'coming' && state.coming) state.coming.t += dt;
    if (state.screen === 'victory' && state.victory) state.victory.t += dt;
    if (state.screen === 'menu' || state.screen === 'gameover' || state.screen === 'coming' || state.screen === 'victory') return;
    if (state.screen === 'results') {
      Billy.Results.update(state.results, dt);
      if (state.results.finished) finishResults();
      return;
    }
    if (state.nightIntro > 0) {
      state.nightIntro -= dt;
      return;
    }
    if (state.bannerT > 0) state.bannerT -= dt;
    if (state.intro > 0) {
      state.intro -= dt;
      state.duckX += 220 * dt;
    }
    state.elapsed += dt;
    var lock = null;
    if (state.boss && state.boss.arena) lock = Billy.Camera.lockOnArena(state.boss.arena);
    updateWorld(dt, input);
    Billy.Camera.follow(state.cam, state.player, state.level, dt, lock);
  }

  function worldX(x) {
    return x - state.cam.x;
  }

  function drawDeco(d) {
    var x = worldX(d.x);
    if (d.kind === 'sofa') D.sofa(ctx, x, d.y);
    if (d.kind === 'fridge') D.fridge(ctx, x, d.y);
    if (d.kind === 'plant') D.plant(ctx, x, d.y);
    if (d.kind === 'door') D.door(ctx, x, d.y);
    if (d.kind === 'yard') D.yard(ctx, x, d.y, { beach: d.beach, tone: d.tone, layer: 'house' });
    if (d.kind === 'hydrant') D.hydrant(ctx, x, d.y);
    if (d.kind === 'shower') D.shower(ctx, x, d.y);
    if (d.kind === 'bed') D.bed(ctx, x, d.y);
    if (d.kind === 'toy') {
      if (state.player.kissing && state.player.kissDuck === d) return;
      D.duck(ctx, x, d.y - 18, state.t, 0.7);
    }
    if (d.kind === 'palm') D.palm(ctx, x, d.y);
    if (d.kind === 'castle') D.castle(ctx, x, d.y);
    if (d.kind === 'gate') D.gate(ctx, x, d.y);
    if (d.kind === 'grandma') {
      D.granny(ctx, x, d.y, state.t, { feed: state.player.eating });
    }
    if (d.kind === 'tree') D.tree(ctx, x, d.y);
    if (d.kind === 'bench') D.bench(ctx, x, d.y);
    if (d.kind === 'foodtruck') {
      var dad = state.level.dad;
      var at = dad && dad.truck === d;
      D.foodTruck(ctx, x, d.y, state.t, {
        pay: at && dad.mode === 'pay' && dad.money > 0.55,
        give: at && (dad.mode === 'take' || dad.mode === 'eat'),
      });
    }
  }

  function drawWorld() {
    var level = state.level;
    var night = state.night;
    var theme = level.theme || 'house';
    var bright = state.boss ? state.boss.brightness : night ? 0.28 : 1;
    D.scene(ctx, state.cam, theme, night, bright, C.WIDTH, C.HEIGHT, C.GROUND);

    var rugs = level.rugs || [];
    for (var r = 0; r < rugs.length; r++) {
      var rug = { x: worldX(rugs[r].x), y: rugs[r].y, w: rugs[r].w, h: rugs[r].h };
      D.rug(ctx, rug);
    }

    var platFill = night ? '#6b5a7a' : theme === 'street' ? '#8a90a0' : theme === 'papai' ? '#d4c48a' : theme === 'beach' ? '#e8c48a' : '#e8c48a';
    var platStroke = night ? '#3a2414' : '#5a3516';
    for (var i = 0; i < level.platforms.length; i++) {
      var p = level.platforms[i];
      var sx = worldX(p.x);
      if (sx + p.w < -20 || sx > C.WIDTH + 20) continue;
      if (p.ground || p.y >= C.GROUND - 1) continue;
      D.roundRect(ctx, sx, p.y, p.w, p.h, 6);
      D.paint(ctx, platFill, platStroke, 3);
    }

    for (var d = 0; d < (level.decos || []).length; d++) drawDeco(level.decos[d]);

    var puddles = level.puddles || [];
    for (var pd = 0; pd < puddles.length; pd++) {
      D.puddle(ctx, worldX(puddles[pd].x), puddles[pd].y, state.t, puddles[pd].kind);
    }

    if (level.checkpoint) {
      D.checkpoint(ctx, worldX(level.checkpoint.x), C.GROUND, level.checkpoint.used, state.t);
    }

    for (var s = 0; s < (level.steaks || []).length; s++) {
      var st = level.steaks[s];
      if (st.taken) continue;
      D.steak(ctx, worldX(st.x), st.y, state.t);
    }
    for (var b = 0; b < state.fx.bits.length; b++) {
      D.steak(ctx, worldX(state.fx.bits[b].x), state.fx.bits[b].y, state.t);
    }
    for (var h = 0; h < (level.critters || []).length; h++) {
      var cr = level.critters[h];
      if (cr.dead) continue;
      var cx = worldX(cr.x + cr.w / 2);
      var cy = cr.y + cr.h / 2;
      if (cr.species === 'dog') D.pup(ctx, cx, cy, state.t, cr.dir);
      else if (cr.species === 'bird') D.bird(ctx, cx, cy, state.t, cr.dir);
      else D.cat(ctx, cx, cy, state.t, cr.dir);
    }
    for (var yd = 0; yd < (level.yardDogs || []).length; yd++) {
      var dog = level.yardDogs[yd];
      var dcx = worldX(dog.x + dog.w / 2);
      var dcy = dog.y + dog.h / 2;
      if (dog.postX != null) {
        ctx.strokeStyle = '#6b7380';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(worldX(dog.postX), C.GROUND - 10);
        ctx.lineTo(dcx, dcy + 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      D.pup(ctx, dcx, dcy, state.t, dog.dir, dog.barking);
    }
    for (var yf = 0; yf < (level.decos || []).length; yf++) {
      if (level.decos[yf].kind !== 'yard') continue;
      D.yard(ctx, worldX(level.decos[yf].x), level.decos[yf].y, {
        beach: level.decos[yf].beach,
        tone: level.decos[yf].tone,
        layer: 'fence',
      });
    }
    for (var v = 0; v < (level.vacuums || []).length; v++) {
      var vac = level.vacuums[v];
      D.vacuum(ctx, worldX(vac.x), vac.y, vac.dir);
    }
    for (var br = 0; br < (level.brooms || []).length; br++) {
      D.broom(ctx, worldX(level.brooms[br].x), level.brooms[br].y);
    }
    for (var c = 0; c < (level.cars || []).length; c++) {
      D.car(ctx, worldX(level.cars[c].x), level.cars[c].y, level.cars[c].dir);
    }
    for (var sk = 0; sk < (level.skaters || []).length; sk++) {
      var ska = level.skaters[sk];
      D.skater(ctx, worldX(ska.x + ska.w / 2), ska.y, state.t, ska.dir);
    }
    for (var ct = 0; ct < (level.cats || []).length; ct++) {
      var cat = level.cats[ct];
      D.cat(ctx, worldX(cat.x + cat.w / 2), cat.y + cat.h / 2, state.t, cat.dir);
    }
    for (var mh = 0; mh < (level.manholes || []).length; mh++) {
      D.manhole(ctx, worldX(level.manholes[mh].x), level.manholes[mh].y, level.manholes[mh].w);
    }
    for (var cr = 0; cr < (level.crabs || []).length; cr++) {
      var cb = level.crabs[cr];
      D.crab(ctx, worldX(cb.x + cb.w / 2), cb.y + cb.h / 2, state.t);
    }
    for (var wv = 0; wv < (level.waves || []).length; wv++) {
      var wa = level.waves[wv];
      D.wave(ctx, worldX(wa.x), wa.y, wa.w, wa.h);
    }
    for (var gu = 0; gu < (level.seagulls || []).length; gu++) {
      var gull = level.seagulls[gu];
      D.seagull(ctx, worldX(gull.x + gull.w / 2), gull.y + gull.h / 2, state.t);
    }
    for (var nd = 0; nd < (level.needles || []).length; nd++) {
      D.needle(ctx, worldX(level.needles[nd].x), level.needles[nd].y);
    }
    for (var yn = 0; yn < (level.yarns || []).length; yn++) {
      var yarn = level.yarns[yn];
      if (yarn.dead) continue;
      D.yarn(ctx, worldX(yarn.x + yarn.w / 2), yarn.y + yarn.h / 2, state.t);
    }
    for (var vs2 = 0; vs2 < (level.vases || []).length; vs2++) {
      var vase = level.vases[vs2];
      if (vase.dead) continue;
      D.vase(ctx, worldX(vase.x), vase.y);
    }

    if (state.boss && state.boss.monster) {
      var m = state.boss.monster;
      if (m.kind === 'dog') {
        D.bigDog(ctx, worldX(m.x + m.w / 2), m.y + m.h, state.t, {
          down: m.mode === 'down',
          bark: m.mode === 'bark',
          dir: (state.player.x + state.player.w / 2 >= m.x + m.w / 2) ? 1 : -1,
        });
      } else if (m.kind === 'camila') {
        D.camila(ctx, worldX(m.x + m.w / 2), m.y + m.h, state.t, {
          dir: m.dir,
          grab: m.mode === 'grab',
          tired: m.mode === 'tired',
          happy: m.mode === 'happy' || (state.boss && state.boss.done),
        });
      } else if (m.kind === 'mayra') {
        D.mayra(ctx, worldX(m.x + m.w / 2), m.y + m.h, state.t, {
          dir: m.dir,
          bath: m.mode === 'bath',
          tired: m.mode === 'tired',
          happy: m.mode === 'happy' || (state.boss && state.boss.done),
        });
      } else {
        D.monster(ctx, worldX(m.x + m.w / 2), m.y + m.h / 2, state.t);
      }
    }

    var pl = state.player;
    var dad = level.dad;
    if (dad && D.dad) {
      var dadCx = dad.x + dad.w / 2;
      var billyCollarX = pl.x + pl.w / 2 + pl.facing * 8;
      var dadHandX = dadCx + (pl.x + pl.w / 2 >= dadCx ? 18 : -18);
      D.leash(
        ctx,
        worldX(billyCollarX),
        pl.y + 12,
        worldX(dadHandX),
        dad.y + 52,
        state.t
      );
      D.shadow(ctx, worldX(dadCx), C.GROUND + 4, false);
      D.dad(ctx, worldX(dadCx), dad.y + dad.h, state.t, {
        dir: dad.facing,
        run: dad.run && dad.mode === 'walk',
        rush: dad.mode === 'rush' || dad.rush,
        pay: dad.mode === 'pay',
        eat: dad.mode === 'eat',
        hold: dad.mode === 'take',
        burger: dad.burger,
      });
      if (dad.mode === 'pay' && dad.truck) {
        var fromX = worldX(dadCx + dad.facing * 22);
        var fromY = dad.y + 44;
        var toX = worldX(dad.truck.x + 86);
        var toY = C.GROUND - 74;
        var u = dad.money || 0;
        var mx = fromX + (toX - fromX) * u;
        var my = fromY + (toY - fromY) * u - Math.sin(u * Math.PI) * 24;
        ctx.fillStyle = '#3cb46a';
        ctx.strokeStyle = '#1f6b3a';
        ctx.lineWidth = 1.6;
        D.roundRect(ctx, mx - 7, my - 4, 14, 8, 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    var kiss = pl.kissing && pl.kissDuck;
    var hearts = pl.kissHearts || [];
    var kissHearts = [];
    for (var kh = 0; kh < hearts.length; kh++) {
      kissHearts.push({
        x: worldX(hearts[kh].x),
        y: hearts[kh].y,
        s: hearts[kh].s,
        life: hearts[kh].life,
      });
    }

    var billyX = pl.x + pl.w / 2;
    var midX = billyX;
    if (kiss) {
      midX = (billyX + pl.kissDuck.x) / 2;
      billyX = midX - 16 * pl.facing;
    }
    D.shadow(ctx, worldX(pl.x + pl.w / 2), C.GROUND + 4, !pl.onGround && !pl.grabbed);
    if (kiss) {
      D.coupleKiss(ctx, worldX(midX), pl.y + pl.h, state.t, pl.facing, kissHearts);
    } else {
      D.billy(ctx, worldX(billyX), pl.y + pl.h, {
        t: state.t,
        facing: pl.facing,
        run: Math.abs(pl.vx) > 40 && pl.onGround && !pl.peeing && !pl.grabbed && !pl.eating && !pl.pooping,
        air: !pl.onGround && !pl.grabbed,
        hurt: pl.invuln > 0 && !pl.grabbed,
        scared: (night && !(state.boss && state.boss.done)) || pl.grabbed || pl.bathing,
        pee: pl.peeing && !pl.grabbed,
        poop: pl.pooping && !pl.grabbed,
        eat: pl.eating && !pl.grabbed,
        fat: pl.fat || 0,
        bulge: pl.bulge || 0,
        bark: pl.barking && !pl.eating && !pl.pooping && !pl.bathing,
        wet: !!(pl.bathing || pl.wet > 0),
      });
    }

    if (state.intro > 0 && theme === 'house') {
      D.duck(ctx, worldX(state.duckX), C.GROUND - 18, state.t, 1);
    }

    var sparks = state.fx.sparkles.map(function (sp) {
      return { x: worldX(sp.x), y: sp.y, r: sp.r, life: sp.life, color: sp.color };
    });
    D.sparkles(ctx, sparks);

    if (night && !(state.boss && state.boss.done)) {
      ctx.fillStyle = 'rgba(8, 10, 28,' + (state.boss ? 0.55 - state.boss.brightness * 0.4 : 0.38) + ')';
      ctx.fillRect(0, 0, C.WIDTH, C.GROUND);
    }
  }

  function btn(x, y, w, h, label) {
    D.roundRect(ctx, x, y, w, h, 18);
    D.paint(ctx, '#ffd24a', '#c79212', 4);
    ctx.fillStyle = '#1a3a6b';
    ctx.font = 'bold 22px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    buttons.push({ x: x, y: y, w: w, h: h, label: label });
  }

  function drawMenu() {
    D.houseSky(ctx, { x: state.t * 30 }, false, 1, C.WIDTH, C.HEIGHT, C.GROUND);
    D.floor(ctx, { x: state.t * 30 }, false, C.GROUND, C.WIDTH, C.HEIGHT);
    ctx.fillStyle = 'rgba(12,24,48,0.25)';
    ctx.fillRect(0, 0, C.WIDTH, C.HEIGHT);
    D.billy(ctx, C.WIDTH / 2 - 40, C.GROUND, { t: state.t, facing: 1, run: true });
    D.duck(ctx, C.WIDTH / 2 + 50, C.GROUND - 4, state.t, 1);
    var titlePx = C.WIDTH < 700 ? 28 : 48;
    var subPx = C.WIDTH < 700 ? 14 : 20;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = C.WIDTH < 700 ? 5 : 8;
    ctx.font = 'bold ' + titlePx + 'px Trebuchet MS, sans-serif';
    ctx.strokeText('Billy, the Crazy Dog', C.WIDTH / 2, 120);
    ctx.fillText('Billy, the Crazy Dog', C.WIDTH / 2, 120);
    ctx.font = subPx + 'px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText('Ajude o Yorkshire a achar o Patinho Amarelo!', C.WIDTH / 2, 168);
    ctx.fillText('Ajude o Yorkshire a achar o Patinho Amarelo!', C.WIDTH / 2, 168);
    btn(C.WIDTH / 2 - 90, 340, 180, 56, 'Jogar');
    ctx.font = '14px Trebuchet MS, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Setas / WASD para correr · Espaço para pular', C.WIDTH / 2, 430);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Trebuchet MS, sans-serif';
    ctx.fillText('v' + Billy.APP_VERSION, C.WIDTH / 2, C.HEIGHT - 16);
  }

  function drawBanner(text) {
    ctx.fillStyle = 'rgba(12,24,48,0.55)';
    ctx.fillRect(0, 200, C.WIDTH, 100);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 6;
    ctx.font = 'bold 32px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(text, C.WIDTH / 2, 258);
    ctx.fillText(text, C.WIDTH / 2, 258);
  }

  function drawEnd() {
    D.houseSky(ctx, { x: 0 }, true, 1, C.WIDTH, C.HEIGHT, C.GROUND);
    D.floor(ctx, { x: 0 }, true, C.GROUND, C.WIDTH, C.HEIGHT);
    D.billy(ctx, C.WIDTH / 2 - 20, C.GROUND, {
      t: state.t,
      facing: 1,
      scared: true,
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 7;
    ctx.font = 'bold 40px Trebuchet MS, sans-serif';
    ctx.strokeText('Oh não!', C.WIDTH / 2, 120);
    ctx.fillText('Oh não!', C.WIDTH / 2, 120);
    ctx.font = '18px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText('Billy precisa descansar um pouquinho.', C.WIDTH / 2, 168);
    ctx.fillText('Billy precisa descansar um pouquinho.', C.WIDTH / 2, 168);
    btn(C.WIDTH / 2 - 100, 340, 200, 54, 'Tentar de novo');
    btn(C.WIDTH / 2 - 100, 410, 200, 48, 'Menu');
  }

  function drawVictory() {
    var t = state.victory ? state.victory.t : state.t;
    D.scene(ctx, { x: t * 20 }, 'grandma', false, 1, C.WIDTH, C.HEIGHT, C.GROUND);
    D.billy(ctx, C.WIDTH / 2 - 40, C.GROUND, { t: t, facing: 1, run: true });
    D.duck(ctx, C.WIDTH / 2 + 50, C.GROUND - 4, t, 1);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 7;
    ctx.font = 'bold 36px Trebuchet MS, sans-serif';
    ctx.strokeText('Fim de jogo — Você venceu!', C.WIDTH / 2, 110);
    ctx.fillText('Fim de jogo — Você venceu!', C.WIDTH / 2, 110);
    ctx.font = '18px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText('Billy e o Patinho Amarelo estão juntos na casa da vovó.', C.WIDTH / 2, 160);
    ctx.fillText('Billy e o Patinho Amarelo estão juntos na casa da vovó.', C.WIDTH / 2, 160);
    if (state.victory) {
      ctx.font = '16px Trebuchet MS, sans-serif';
      ctx.strokeText('Bifinhos: ' + state.victory.steaks, C.WIDTH / 2, 210);
      ctx.fillText('Bifinhos: ' + state.victory.steaks, C.WIDTH / 2, 210);
    }
    btn(C.WIDTH / 2 - 100, 360, 200, 54, 'Menu');
  }

  function render() {
    Billy.Display.apply(ctx);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.clearRect(0, 0, C.WIDTH, C.HEIGHT);
    if (state.screen === 'menu') {
      drawMenu();
      return;
    }
    if (state.screen === 'gameover') {
      drawEnd();
      return;
    }
    if (state.screen === 'results') {
      Billy.Results.draw(ctx, state.results);
      if (state.results.ready && state.results.wipe <= 0) {
        btn(C.WIDTH / 2 - 110, 390, 220, 56, 'Continuar');
      }
      return;
    }
    if (state.screen === 'coming') {
      Billy.Results.drawComing(ctx, state.coming);
      btn(C.WIDTH / 2 - 100, 360, 200, 54, 'Menu');
      return;
    }
    if (state.screen === 'victory') {
      drawVictory();
      return;
    }
    drawWorld();
    Billy.Hud.draw(ctx, state);
    if (state.nightIntro > 0) drawBanner('Sozinho em casa à noite...');
    else if (state.bannerT > 0 && state.banner) drawBanner(state.banner);
    else if (state.intro > 0.4) drawBanner((state.level && state.level.introBanner) || 'O Patinho Amarelo fugiu!');
  }

  function loop(ts) {
    var dt = Math.min(0.033, (ts - last) / 1000 || 0.016);
    last = ts;
    var input = Billy.Input.snapshot();
    if (state.screen === 'playing' && input.jumpPressed && state.intro > 0) {
      // deixa o pulo funcionar no intro
    }
    update(dt, input);
    render();
    requestAnimationFrame(loop);
  }

  function hitBtn(x, y) {
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  }

  function canvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (C.WIDTH / rect.width),
      y: (e.clientY - rect.top) * (C.HEIGHT / rect.height),
    };
  }

  function onPointer(e) {
    var pos = canvasPos(e);
    if (state.screen === 'results' && state.results && state.results.wipe <= 0) {
      var hit = hitBtn(pos.x, pos.y);
      if (state.results.ready) {
        if (!hit || hit.label === 'Continuar') continueFromResults();
        return;
      }
      Billy.Results.skip(state.results);
      return;
    }
    var b = hitBtn(pos.x, pos.y);
    if (!b) return;
    if (b.label === 'Jogar' || b.label === 'Tentar de novo') startGame();
    if (b.label === 'Menu') goMenu();
  }

  Billy.Game = {
    start: function (c) {
      canvas = c;
      ctx = c.getContext('2d');
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      Billy.Input.setup();
      goMenu();
      canvas.addEventListener('pointerdown', onPointer);
      window.addEventListener('keydown', function (e) {
        if (e.code === 'KeyM') Billy.Audio.toggleMusic();
        if ((e.code === 'Enter' || e.code === 'Space') && state.screen === 'menu') {
          e.preventDefault();
          startGame();
        }
        if ((e.code === 'Enter' || e.code === 'Space') && state.screen === 'results') {
          e.preventDefault();
          if (state.results.ready) continueFromResults();
          else Billy.Results.skip(state.results);
        }
        if ((e.code === 'Enter' || e.code === 'Space') && (state.screen === 'coming' || state.screen === 'victory')) {
          e.preventDefault();
          goMenu();
        }
        if ((e.code === 'Enter' || e.code === 'Space') && state.screen === 'gameover') {
          e.preventDefault();
          startGame();
        }
      });
      requestAnimationFrame(loop);
    },
  };
})();
