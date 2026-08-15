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
      critters: [],
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
      yardDogs: [],
      foodTrucks: [],
      decos: [],
      puddles: [],
      spawn: { x: Billy.spawnX ? Billy.spawnX() : (C.SPAWN_X || 300), y: C.GROUND - C.PLAYER_H - 2 },
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

  function critterSize(species) {
    if (species === 'dog') return { w: C.PUP_W, h: C.PUP_H };
    if (species === 'bird') return { w: C.BIRD_W, h: C.BIRD_H };
    return { w: C.CAT_W, h: C.CAT_H };
  }

  function critter(level, species, x, y, x1, x2) {
    var sz = critterSize(species);
    level.critters.push({
      species: species,
      x: x,
      y: y,
      w: sz.w,
      h: sz.h,
      x1: x1,
      x2: x2,
      dir: 1,
      vy: 0,
      dead: false,
      t: 0,
      speed: species === 'bird' ? 100 : species === 'cat' ? 85 : 70,
    });
  }

  function neighbor(level, x, opt) {
    opt = opt || {};
    deco(level, 'yard', x, C.GROUND, { beach: !!opt.beach, tone: opt.tone || 0 });
    if (!level.yardDogs) level.yardDogs = [];
    var x1 = x + 10;
    var x2 = x + 108;
    level.yardDogs.push({
      x: (x1 + x2) / 2,
      y: C.GROUND - C.PUP_H,
      w: C.PUP_W,
      h: C.PUP_H,
      x1: x1,
      x2: x2,
      postX: x + 22,
      dir: 1,
      speed: 72 + (opt.tone || 0) * 10,
      t: 0,
      barking: false,
      barkT: 0,
      barkCd: 0,
    });
  }

  function hydrant(level, x) {
    deco(level, 'hydrant', x, C.GROUND);
  }

  function shower(level, x) {
    deco(level, 'shower', x, C.GROUND);
  }

  function deco(level, kind, x, y, extra) {
    var pee = kind === 'sofa' || kind === 'bed' || kind === 'door' || kind === 'hydrant' || kind === 'shower' || kind === 'fridge' || kind === 'plant';
    var d = { kind: kind, x: x, y: y, pee: pee, peed: false };
    if (extra) {
      for (var k in extra) d[k] = extra[k];
    }
    level.decos.push(d);
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
    critter: critter,
    neighbor: neighbor,
    hydrant: hydrant,
    shower: shower,
    deco: deco,
    finish: finish,
  };
})();
