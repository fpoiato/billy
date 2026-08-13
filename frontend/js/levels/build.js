var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function base(opt) {
    opt = opt || {};
    return {
      id: opt.id,
      name: opt.name,
      theme: opt.theme || opt.id,
      music: opt.music || 'day',
      width: 0,
      platforms: [],
      rugs: [],
      steaks: [],
      hearts: [],
      vacuums: [],
      brooms: [],
      cars: [],
      skaters: [],
      cats: [],
      manholes: [],
      crabs: [],
      waves: [],
      seagulls: [],
      needles: [],
      yarns: [],
      vases: [],
      decos: [],
      puddles: [],
      spawn: { x: 80, y: C.GROUND - C.PLAYER_H - 2 },
      checkpoint: null,
      dayEndX: 0,
      bossArena: null,
      bossKind: opt.bossKind || null,
      bossBanner: opt.bossBanner || '',
      goal: null,
      intro: opt.intro || 1.2,
    };
  }

  function plat(level, x, y, w, h) {
    level.platforms.push({ x: x, y: y, w: w, h: h || 18 });
  }

  function steak(level, x, y) {
    level.steaks.push({ x: x, y: y, w: 18, h: 14, taken: false });
  }

  function steaksLine(level, x, y, n, gap) {
    for (var i = 0; i < n; i++) steak(level, x + i * (gap || 44), y);
  }

  function heart(level, x, y, x1, x2) {
    level.hearts.push({
      x: x,
      y: y,
      w: C.HEART_W,
      h: C.HEART_H,
      x1: x1,
      x2: x2,
      dir: 1,
      vy: 0,
      dead: false,
      t: 0,
    });
  }

  function deco(level, kind, x, y) {
    var pee = kind === 'sofa' || kind === 'bed' || kind === 'door';
    level.decos.push({ kind: kind, x: x, y: y, pee: pee, peed: false });
  }

  function finish(level, x) {
    level.platforms.push({ x: -400, y: C.GROUND, w: x + 800, h: 240, ground: true });
    level.width = x;
    return level;
  }

  Billy.LevelBuild = {
    base: base,
    plat: plat,
    steak: steak,
    steaksLine: steaksLine,
    heart: heart,
    deco: deco,
    finish: finish,
  };
})();
