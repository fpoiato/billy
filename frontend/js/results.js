var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function beepTally() {
    if (Billy.Audio && Billy.Audio.tally) Billy.Audio.tally();
  }

  function beepDone() {
    if (Billy.Audio && Billy.Audio.tallyDone) Billy.Audio.tallyDone();
  }

  function formatTime(sec) {
    sec = Math.max(0, sec | 0);
    var mm = String(Math.floor(sec / 60)).padStart(2, '0');
    var ss = String(sec % 60).padStart(2, '0');
    return mm + ':' + ss;
  }

  function create(opt) {
    opt = opt || {};
    var steaks = Math.max(0, opt.steaks | 0);
    if (Billy.Audio && Billy.Audio.kiss) Billy.Audio.kiss();
    return {
      phaseId: opt.phaseId || 'house',
      steaks: steaks,
      shownSteaks: 0,
      lastShown: 0,
      lives: opt.lives | 0,
      elapsed: opt.elapsed || 0,
      t: 0,
      step: 'title',
      ready: false,
      wipe: 0,
      finished: false,
      dingWait: 0,
      bits: [],
      sparkles: [],
      kissHearts: [],
      kissSpawn: 0,
      kissMid: 200,
    };
  }

  function spawnBit(r) {
    if (r.bits.length > 14) r.bits.shift();
    var w = C.WIDTH;
    r.bits.push({
      x: w / 2 - 200 + Math.random() * 50,
      y: 280 + Math.random() * 40,
      tx: w / 2 + 70,
      ty: 228,
      u: 0,
    });
  }

  function burst(r, x, y) {
    for (var i = 0; i < 10; i++) {
      var a = (Math.PI * 2 * i) / 10;
      r.sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * (70 + Math.random() * 90),
        vy: Math.sin(a) * (70 + Math.random() * 90) - 30,
        r: 2 + Math.random() * 3,
        life: 1,
        color: i % 2 ? '#ffe14a' : '#fff',
      });
    }
  }

  function finishCount(r) {
    r.shownSteaks = r.steaks;
    r.lastShown = r.steaks;
    r.step = 'showNext';
    r.ready = true;
    beepDone();
    burst(r, C.WIDTH / 2 + 70, 228);
  }

  function skip(r) {
    if (!r || r.finished || r.wipe > 0) return;
    if (r.step === 'showNext' || r.ready) return;
    finishCount(r);
  }

  function beginWipe(r) {
    if (!r || !r.ready || r.wipe > 0 || r.finished) return false;
    r.step = 'wipe';
    r.wipe = 0.01;
    return true;
  }

  function update(r, dt) {
    if (!r || r.finished) return;
    r.t += dt;
    r.dingWait -= dt;

    for (var i = r.bits.length - 1; i >= 0; i--) {
      var b = r.bits[i];
      b.u += dt * 2.4;
      if (b.u >= 1) r.bits.splice(i, 1);
    }
    for (var s = r.sparkles.length - 1; s >= 0; s--) {
      var sp = r.sparkles[s];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 380 * dt;
      sp.life -= dt * 1.6;
      if (sp.life <= 0) r.sparkles.splice(s, 1);
    }

    if (!r.kissHearts) r.kissHearts = [];
    for (var kh = r.kissHearts.length - 1; kh >= 0; kh--) {
      var h = r.kissHearts[kh];
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.life -= dt * 0.7;
      if (h.life <= 0) r.kissHearts.splice(kh, 1);
    }
    r.kissSpawn = (r.kissSpawn || 0) - dt;
    if (r.kissSpawn <= 0 && r.step !== 'wipe') {
      var mid = r.kissMid || 200;
      r.kissHearts.push({
        x: mid + (Math.random() - 0.5) * 28,
        y: C.GROUND - 10 - Math.random() * 8,
        vx: (Math.random() - 0.5) * 18,
        vy: -40 - Math.random() * 50,
        life: 1,
        s: 0.6 + Math.random() * 0.5,
      });
      if (r.kissHearts.length > 18) r.kissHearts.shift();
      r.kissSpawn = 0.11;
    }

    if (r.step === 'wipe') {
      r.wipe += dt * 1.15;
      if (r.wipe >= 1) r.finished = true;
      return;
    }

    if (r.step === 'title' && r.t >= 0.55) r.step = 'count';

    if (r.step === 'count') {
      var duration = Math.min(2.5, Math.max(0.7, r.steaks * 0.05));
      if (r.steaks <= 0) {
        finishCount(r);
        return;
      }
      r.shownSteaks += (r.steaks / duration) * dt;
      if (r.shownSteaks >= r.steaks) {
        finishCount(r);
        return;
      }
      var n = r.shownSteaks | 0;
      if (n > r.lastShown) {
        r.lastShown = n;
        spawnBit(r);
        if (r.dingWait <= 0) {
          beepTally();
          r.dingWait = r.steaks > 30 ? 0.055 : 0.04;
        }
      }
    }
  }

  function drawPanel(ctx, r) {
    var w = Math.min(560, C.WIDTH - 40);
    var x = (C.WIDTH - w) / 2;
    var y = 148;
    Billy.Draw.roundRect(ctx, x, y, w, 150, 22);
    Billy.Draw.paint(ctx, 'rgba(12,24,48,0.72)', '#1a3a6b', 5);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff6d8';
    ctx.strokeStyle = '#3a2414';
    ctx.lineWidth = 4;
    ctx.font = 'bold 22px Trebuchet MS, sans-serif';
    ctx.strokeText('Bifinhos', x + 88, y + 52);
    ctx.fillText('Bifinhos', x + 88, y + 52);
    ctx.strokeText('Tempo', x + 88, y + 108);
    ctx.fillText('Tempo', x + 88, y + 108);

    Billy.Draw.steak(ctx, x + 52, y + 52, r.t);
    ctx.textAlign = 'right';
    ctx.font = 'bold 44px Trebuchet MS, sans-serif';
    var n = String(r.shownSteaks | 0);
    ctx.strokeText(n, x + w - 28, y + 54);
    ctx.fillText(n, x + w - 28, y + 54);

    ctx.font = 'bold 32px Trebuchet MS, sans-serif';
    var clock = r.step === 'title' ? '--:--' : formatTime(r.elapsed);
    ctx.strokeText(clock, x + w - 28, y + 108);
    ctx.fillText(clock, x + w - 28, y + 108);
  }

  function draw(ctx, r) {
    var phase = Billy.Campaign.get(r.phaseId);
    var next = Billy.Campaign.next(r.phaseId);
    var D = Billy.Draw;

    D.scene(ctx, { x: r.t * 18 }, phase.id, false, 1, C.WIDTH, C.HEIGHT, C.GROUND);

    D.shadow(ctx, r.kissMid || 200, C.GROUND + 4, false);
    D.coupleKiss(ctx, r.kissMid || 200, C.GROUND, r.t, 1, r.kissHearts || []);

    var titlePx = C.WIDTH < 700 ? 28 : 40;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = C.WIDTH < 700 ? 5 : 7;
    ctx.font = 'bold ' + titlePx + 'px Trebuchet MS, sans-serif';
    ctx.strokeText(phase.clearTitle, C.WIDTH / 2, 64);
    ctx.fillText(phase.clearTitle, C.WIDTH / 2, 64);
    ctx.font = (C.WIDTH < 700 ? 14 : 18) + 'px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText(phase.clearLine, C.WIDTH / 2, 108);
    ctx.fillText(phase.clearLine, C.WIDTH / 2, 108);

    drawPanel(ctx, r);

    for (var i = 0; i < r.bits.length; i++) {
      var b = r.bits[i];
      var u = Math.min(1, b.u);
      var ease = 1 - (1 - u) * (1 - u);
      var x = b.x + (b.tx - b.x) * ease;
      var y = b.y + (b.ty - b.y) * ease - Math.sin(u * Math.PI) * 50;
      D.steak(ctx, x, y, r.t);
    }
    D.sparkles(ctx, r.sparkles);

    if (r.ready && next) {
      var pop = Math.min(1, (r.t - 0.2) * 4);
      var bw = Math.min(440, C.WIDTH - 40);
      ctx.save();
      ctx.globalAlpha = Math.max(0.2, pop);
      ctx.translate(0, (1 - Math.min(1, pop)) * 16);
      Billy.Draw.roundRect(ctx, C.WIDTH / 2 - bw / 2, 318, bw, 52, 16);
      Billy.Draw.paint(ctx, '#ffd24a', '#c79212', 4);
      ctx.fillStyle = '#1a3a6b';
      ctx.font = 'bold ' + (C.WIDTH < 500 ? 18 : 22) + 'px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Próxima fase: ' + next.name, C.WIDTH / 2, 346);
      ctx.restore();
    } else if (r.ready && phase.isFinale) {
      ctx.fillStyle = '#1a3a6b';
      ctx.font = 'bold 22px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Fim de jogo', C.WIDTH / 2, 346);
    }

    if (r.wipe > 0) {
      var nextPhase = next || phase;
      var cover = Math.min(1, r.wipe * 1.25);
      ctx.fillStyle = '#ffd24a';
      ctx.fillRect(0, 0, C.WIDTH * cover, C.HEIGHT);
      if (r.wipe > 0.28) {
        ctx.fillStyle = '#1a3a6b';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Trebuchet MS, sans-serif';
        ctx.fillText(next ? ('Fase ' + nextPhase.number) : 'Fim de jogo', C.WIDTH / 2, C.HEIGHT / 2 - 28);
        ctx.font = 'bold 42px Trebuchet MS, sans-serif';
        ctx.fillText(nextPhase.name, C.WIDTH / 2, C.HEIGHT / 2 + 18);
      }
    }
  }

  function drawComing(ctx, coming) {
    var phase = coming.phase;
    var t = coming.t;
    var D = Billy.Draw;
    D.citySky(ctx, { x: t * 40 }, C.WIDTH, C.HEIGHT, C.GROUND);
    D.floor(ctx, { x: t * 40 }, false, C.GROUND, C.WIDTH, C.HEIGHT);
    D.shadow(ctx, C.WIDTH / 2 - 30, C.GROUND + 4, false);
    D.billy(ctx, C.WIDTH / 2 - 30, C.GROUND, { t: t, facing: 1, run: true });
    D.duck(ctx, C.WIDTH / 2 + 90 + Math.sin(t * 2) * 8, C.GROUND - 8, t, 0.85);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 7;
    ctx.font = 'bold 36px Trebuchet MS, sans-serif';
    ctx.strokeText('Fase ' + phase.number + ' — ' + phase.name, C.WIDTH / 2, 110);
    ctx.fillText('Fase ' + phase.number + ' — ' + phase.name, C.WIDTH / 2, 110);
    ctx.font = '18px Trebuchet MS, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeText(phase.comingLine || 'Em breve!', C.WIDTH / 2, 158);
    ctx.fillText(phase.comingLine || 'Em breve!', C.WIDTH / 2, 158);

    ctx.font = '16px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#fff6d8';
    ctx.strokeStyle = '#3a2414';
    ctx.strokeText('Você levou ' + coming.steaks + ' bifinhos', C.WIDTH / 2, 210);
    ctx.fillText('Você levou ' + coming.steaks + ' bifinhos', C.WIDTH / 2, 210);
  }

  Billy.Results = {
    create: create,
    update: update,
    skip: skip,
    beginWipe: beginWipe,
    draw: draw,
    drawComing: drawComing,
    formatTime: formatTime,
  };
})();
