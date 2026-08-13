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

  function freshPlay() {
    var level = Billy.Levels.createHouse();
    var player = Billy.Player.create(level.spawn.x, level.spawn.y);
    return {
      screen: 'playing',
      level: level,
      player: player,
      cam: Billy.Camera.create(),
      fx: Billy.Fx.create(),
      boss: null,
      t: 0,
      elapsed: 0,
      showTimer: true,
      intro: 2.8,
      nightIntro: 0,
      night: false,
      banner: '',
      bannerT: 0,
      duckX: 140,
      clearT: 0,
      spawn: { x: level.spawn.x, y: level.spawn.y },
    };
  }

  function goMenu() {
    state = {
      screen: 'menu',
      t: 0,
      level: { name: 'Casa', width: C.WIDTH },
      player: { lives: C.START_LIVES, steaks: 0 },
      showTimer: false,
      elapsed: 0,
    };
    Billy.Audio.stopMusic();
    setTouch(false);
  }

  function startGame() {
    Billy.Audio.unlock();
    Billy.Audio.markStart();
    state = freshPlay();
    Billy.Audio.music('day');
    setTouch(true);
    Billy.Display.requestFullscreen();
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
    if (state.boss && !state.boss.done) {
      p.x = state.level.bossArena.left + 60;
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
    var hearts = state.level.hearts;
    for (var i = 0; i < hearts.length; i++) {
      var h = hearts[i];
      if (h.dead) continue;
      if (!P.aabb(p, h)) continue;
      if (P.isStomp(p, h)) {
        h.dead = true;
        p.vy = C.STOMP_BOUNCE;
        Billy.Audio.stomp();
        Billy.Fx.sparkleBurst(state.fx.sparkles, h.x + h.w / 2, h.y, '#ffd24a');
      } else {
        hurtPlayer(h);
      }
    }

    var vs = state.level.vacuums;
    for (var v = 0; v < vs.length; v++) {
      var body = Billy.Enemies.bodyOf('vacuum', vs[v]);
      if (!P.aabb(p, body)) continue;
      if (P.isStomp(p, body)) p.vy = C.STOMP_BOUNCE;
      else hurtPlayer(body);
    }
    var bs = state.level.brooms;
    for (var b = 0; b < bs.length; b++) {
      var bb = Billy.Enemies.bodyOf('broom', bs[b]);
      if (!P.aabb(p, bb)) continue;
      if (P.isStomp(p, bb)) p.vy = C.STOMP_BOUNCE;
      else hurtPlayer(bb);
    }
  }

  function updateWorld(dt, input) {
    var level = state.level;
    var p = state.player;
    Billy.Player.update(p, input, level, dt);
    Billy.Enemies.updateHearts(level.hearts, dt, level.platforms);
    for (var i = 0; i < level.vacuums.length; i++) Billy.Enemies.updateVacuum(level.vacuums[i], dt);
    for (var j = 0; j < level.brooms.length; j++) Billy.Enemies.updateBroom(level.brooms[j], dt);
    Billy.Fx.update(state.fx, dt);
    collectSteaks(dt);
    collideHazards();

    if (level.checkpoint && !level.checkpoint.used && p.x + p.w > level.checkpoint.x) {
      level.checkpoint.used = true;
      state.spawn = { x: level.checkpoint.x, y: C.GROUND - p.h };
      Billy.Fx.sparkleBurst(state.fx.sparkles, level.checkpoint.x + 10, C.GROUND - 50, '#3cb46a');
    }

    if (!state.night && p.x > level.dayEndX) {
      state.night = true;
      state.nightIntro = 2.4;
      state.banner = 'Sozinho em casa à noite...';
      Billy.Audio.music('night');
    }

    var arena = level.bossArena;
    if (arena && p.x > arena.left + 40) {
      if (!state.boss) {
        state.boss = Billy.Boss.create(arena);
        Billy.Audio.music('boss');
        state.banner = 'Monstros debaixo da cama!';
        state.bannerT = 1.6;
      }
    }

    if (state.boss && !state.boss.done) {
      var ev = Billy.Boss.update(state.boss, p, dt, level.platforms);
      if (ev && ev.stomped) {
        Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#ffe14a');
        Billy.Fx.sparkleBurst(state.fx.sparkles, ev.x, ev.y, '#fff');
      } else if (ev && ev.hit) {
        hurtPlayer(state.boss.monster);
      }
    } else if (state.boss && state.boss.done) {
      state.clearT += dt;
      if (state.clearT > 1.4) {
        state.screen = 'clear';
        Billy.Audio.stopMusic();
        setTouch(false);
      }
    }

    if (state.boss) {
      p.x = P.clamp(p.x, arena.left + 10, arena.right - p.w - 10);
    }

    if (p.y > C.HEIGHT + 80) {
      hurtPlayer(p);
      if (state.screen === 'playing') respawn();
    }
  }

  function update(dt, input) {
    state.t += dt;
    buttons = [];
    if (state.screen === 'menu' || state.screen === 'gameover' || state.screen === 'clear') return;
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
    if (state.boss) lock = { x: state.level.bossArena.left };
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
    if (d.kind === 'bed') D.bed(ctx, x, d.y);
    if (d.kind === 'toy') D.duck(ctx, x, d.y - 18, state.t, 0.7);
  }

  function drawWorld() {
    var level = state.level;
    var night = state.night;
    var bright = state.boss ? state.boss.brightness : night ? 0.28 : 1;
    D.houseSky(ctx, state.cam, night, bright, C.WIDTH, C.HEIGHT, C.GROUND);
    D.floor(ctx, state.cam, night, C.GROUND, C.WIDTH, C.HEIGHT);

    for (var r = 0; r < level.rugs.length; r++) {
      var rug = { x: worldX(level.rugs[r].x), y: level.rugs[r].y, w: level.rugs[r].w, h: level.rugs[r].h };
      D.rug(ctx, rug);
    }

    for (var i = 0; i < level.platforms.length; i++) {
      var p = level.platforms[i];
      var sx = worldX(p.x);
      if (sx + p.w < -20 || sx > C.WIDTH + 20) continue;
      if (p.ground || p.y >= C.GROUND - 1) continue;
      D.roundRect(ctx, sx, p.y, p.w, p.h, 6);
      D.paint(ctx, night ? '#6b5a7a' : '#e8c48a', '#5a3516', 3);
    }

    for (var d = 0; d < level.decos.length; d++) drawDeco(level.decos[d]);

    if (level.checkpoint) {
      D.checkpoint(ctx, worldX(level.checkpoint.x), C.GROUND, level.checkpoint.used, state.t);
    }

    for (var s = 0; s < level.steaks.length; s++) {
      var st = level.steaks[s];
      if (st.taken) continue;
      D.steak(ctx, worldX(st.x), st.y, state.t);
    }
    for (var b = 0; b < state.fx.bits.length; b++) {
      D.steak(ctx, worldX(state.fx.bits[b].x), state.fx.bits[b].y, state.t);
    }
    for (var h = 0; h < level.hearts.length; h++) {
      var ht = level.hearts[h];
      if (ht.dead) continue;
      D.heart(ctx, worldX(ht.x + ht.w / 2), ht.y + ht.h / 2, state.t);
    }
    for (var v = 0; v < level.vacuums.length; v++) {
      var vac = level.vacuums[v];
      D.vacuum(ctx, worldX(vac.x), vac.y, vac.dir);
    }
    for (var br = 0; br < level.brooms.length; br++) {
      D.broom(ctx, worldX(level.brooms[br].x), level.brooms[br].y);
    }

    if (state.boss && state.boss.monster) {
      var m = state.boss.monster;
      D.monster(ctx, worldX(m.x + m.w / 2), m.y + m.h / 2, state.t);
    }

    var pl = state.player;
    D.shadow(ctx, worldX(pl.x + pl.w / 2), C.GROUND + 4, !pl.onGround);
    D.billy(ctx, worldX(pl.x + pl.w / 2), pl.y + pl.h, {
      t: state.t,
      facing: pl.facing,
      run: Math.abs(pl.vx) > 40 && pl.onGround,
      air: !pl.onGround,
      hurt: pl.invuln > 0,
      scared: night && !(state.boss && state.boss.done),
    });

    if (state.intro > 0) {
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

  function drawEnd(kind) {
    D.houseSky(ctx, { x: 0 }, kind === 'gameover', 1, C.WIDTH, C.HEIGHT, C.GROUND);
    D.floor(ctx, { x: 0 }, kind === 'gameover', C.GROUND, C.WIDTH, C.HEIGHT);
    D.billy(ctx, C.WIDTH / 2 - 20, C.GROUND, {
      t: state.t,
      facing: 1,
      scared: kind === 'gameover',
      run: kind === 'clear',
    });
    if (kind === 'clear') D.duck(ctx, C.WIDTH / 2 + 50, C.GROUND - 4, state.t, 0.85);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 7;
    ctx.font = 'bold 40px Trebuchet MS, sans-serif';
    var title = kind === 'clear' ? 'Fase 1 concluída!' : 'Oh não!';
    var sub = kind === 'clear'
      ? 'Billy foi corajoso. O Patinho ainda está perdido...'
      : 'Billy precisa descansar um pouquinho.';
    ctx.strokeText(title, C.WIDTH / 2, 120);
    ctx.fillText(title, C.WIDTH / 2, 120);
    ctx.font = '18px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText(sub, C.WIDTH / 2, 168);
    ctx.fillText(sub, C.WIDTH / 2, 168);
    btn(C.WIDTH / 2 - 100, 340, 200, 54, kind === 'clear' ? 'Menu' : 'Tentar de novo');
    if (kind === 'gameover') btn(C.WIDTH / 2 - 100, 410, 200, 48, 'Menu');
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
      drawEnd('gameover');
      return;
    }
    if (state.screen === 'clear') {
      drawEnd('clear');
      return;
    }
    drawWorld();
    Billy.Hud.draw(ctx, state);
    if (state.nightIntro > 0) drawBanner('Sozinho em casa à noite...');
    else if (state.bannerT > 0 && state.banner) drawBanner(state.banner);
    else if (state.intro > 0.4) drawBanner('O Patinho Amarelo fugiu!');
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
        if (e.code === 'KeyM') Billy.Audio.toggleMute();
        if ((e.code === 'Enter' || e.code === 'Space') && state.screen === 'menu') {
          e.preventDefault();
          startGame();
        }
      });
      requestAnimationFrame(loop);
    },
  };
})();
