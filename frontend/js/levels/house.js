/**
 * Fase 1 — Casa (de dia). Termina com a Mayra querendo dar banho.
 * A noite é a fase seguinte: Billy.Levels.createNight().
 * Cada room*() desenha um trecho e devolve a largura.
 * Para alongar a fase, chame mais rooms no createHouse().
 * Fases novas: copie este arquivo (street.js, beach.js, grandma.js).
 */

(function () {
  var C = Billy.CONFIG;

  function plat(level, x, y, w, h) {
    level.platforms.push({ x: x, y: y, w: w, h: h || 18 });
  }

  function steak(level, x, y) {
    level.steaks.push({ x: x, y: y, w: 18, h: 14, taken: false });
  }

  function steaksLine(level, x, y, n, gap) {
    for (var i = 0; i < n; i++) steak(level, x + i * (gap || 44), y);
  }

  function critter(level, species, x, y, x1, x2) {
    var sz = species === 'dog'
      ? { w: C.PUP_W, h: C.PUP_H }
      : species === 'bird'
        ? { w: C.BIRD_W, h: C.BIRD_H }
        : { w: C.CAT_W, h: C.CAT_H };
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

  function rug(level, x, w) {
    level.rugs.push({ x: x, y: C.GROUND - 6, w: w, h: 8 });
  }

  function deco(level, kind, x, y, extra) {
    var pee = kind === 'sofa' || kind === 'bed' || kind === 'door' || kind === 'hydrant' || kind === 'shower' || kind === 'fridge' || kind === 'plant';
    var d = { kind: kind, x: x, y: y, pee: pee, peed: false };
    if (extra) {
      for (var k in extra) d[k] = extra[k];
    }
    level.decos.push(d);
  }

  function roomLiving(level, x0) {
    plat(level, x0, C.GROUND, 1600, 90);
    deco(level, 'door', x0 + 40, C.GROUND);
    deco(level, 'sofa', x0 + 180, C.GROUND);
    plat(level, x0 + 190, C.GROUND - 36, 100, 12);
    steaksLine(level, x0 + 210, C.GROUND - 70, 3, 40);
    steaksLine(level, x0 + 520, C.GROUND - 28, 4, 48);
    plat(level, x0 + 780, C.GROUND - 90, 120, 16);
    steaksLine(level, x0 + 800, C.GROUND - 124, 3, 36);
    deco(level, 'plant', x0 + 1100, C.GROUND);
    steaksLine(level, x0 + 1300, C.GROUND - 28, 3, 44);
    deco(level, 'door', x0 + 1480, C.GROUND);
    return 1600;
  }

  function roomRugs(level, x0) {
    plat(level, x0, C.GROUND, 1500, 90);
    rug(level, x0 + 80, 280);
    rug(level, x0 + 520, 320);
    rug(level, x0 + 1000, 300);
    deco(level, 'plant', x0 + 40, C.GROUND);
    deco(level, 'sofa', x0 + 380, C.GROUND);
    steaksLine(level, x0 + 120, C.GROUND - 90, 5, 50);
    steaksLine(level, x0 + 560, C.GROUND - 110, 5, 50);
    critter(level, 'cat', x0 + 700, C.GROUND - 40, x0 + 540, x0 + 820);
    steaksLine(level, x0 + 1040, C.GROUND - 90, 4, 50);
    deco(level, 'plant', x0 + 1380, C.GROUND);
    return 1500;
  }

  function roomKitchen(level, x0) {
    plat(level, x0, C.GROUND, 1700, 90);
    plat(level, x0 + 160, C.GROUND - 70, 200, 18);
    plat(level, x0 + 420, C.GROUND - 130, 160, 18);
    plat(level, x0 + 680, C.GROUND - 70, 200, 18);
    steaksLine(level, x0 + 180, C.GROUND - 104, 4, 40);
    steaksLine(level, x0 + 440, C.GROUND - 164, 3, 40);
    steaksLine(level, x0 + 700, C.GROUND - 104, 4, 40);
    deco(level, 'fridge', x0 + 40, C.GROUND);
    deco(level, 'plant', x0 + 100, C.GROUND);
    level.vacuums.push({
      x: x0 + 900,
      y: C.GROUND - 14,
      x1: x0 + 860,
      x2: x0 + 1500,
      dir: 1,
      speed: 110,
    });
    critter(level, 'bird', x0 + 500, C.GROUND - 160, x0 + 420, x0 + 560);
    steaksLine(level, x0 + 1100, C.GROUND - 28, 6, 48);
    return 1700;
  }

  function roomBroom(level, x0) {
    plat(level, x0, C.GROUND, 1500, 90);
    deco(level, 'door', x0 + 40, C.GROUND);
    deco(level, 'shower', x0 + 110, C.GROUND);
    plat(level, x0 + 200, C.GROUND - 100, 90, 16);
    plat(level, x0 + 420, C.GROUND - 160, 90, 16);
    plat(level, x0 + 640, C.GROUND - 100, 90, 16);
    steaksLine(level, x0 + 210, C.GROUND - 134, 2, 36);
    steaksLine(level, x0 + 430, C.GROUND - 194, 2, 36);
    steaksLine(level, x0 + 650, C.GROUND - 134, 2, 36);
    level.brooms.push({
      cx: x0 + 1000,
      x: x0 + 1000,
      y: C.GROUND - 10,
      amp: 180,
      speed: 1.6,
      phase: 0,
    });
    critter(level, 'dog', x0 + 1100, C.GROUND - 40, x0 + 900, x0 + 1300);
    steaksLine(level, x0 + 880, C.GROUND - 80, 5, 50);
    return 1500;
  }

  function roomPlay(level, x0) {
    plat(level, x0, C.GROUND, 1600, 90);
    plat(level, x0 + 120, C.GROUND - 80, 80, 80);
    plat(level, x0 + 280, C.GROUND - 130, 80, 130);
    plat(level, x0 + 440, C.GROUND - 80, 80, 80);
    steaksLine(level, x0 + 130, C.GROUND - 114, 2, 30);
    steaksLine(level, x0 + 290, C.GROUND - 164, 2, 30);
    steaksLine(level, x0 + 450, C.GROUND - 114, 2, 30);
    critter(level, 'dog', x0 + 800, C.GROUND - 40, x0 + 700, x0 + 980);
    deco(level, 'sofa', x0 + 560, C.GROUND);
    plat(level, x0 + 1100, C.GROUND - 110, 220, 16);
    steaksLine(level, x0 + 1130, C.GROUND - 144, 4, 44);
    deco(level, 'plant', x0 + 1400, C.GROUND);
    return 1600;
  }

  function roomGallery(level, x0) {
    plat(level, x0, C.GROUND, 1600, 90);
    plat(level, x0 + 150, C.GROUND - 90, 70, 14);
    plat(level, x0 + 320, C.GROUND - 150, 70, 14);
    plat(level, x0 + 500, C.GROUND - 90, 70, 14);
    plat(level, x0 + 680, C.GROUND - 150, 70, 14);
    plat(level, x0 + 860, C.GROUND - 90, 70, 14);
    steaksLine(level, x0 + 160, C.GROUND - 124, 1, 40);
    steaksLine(level, x0 + 330, C.GROUND - 184, 1, 40);
    steaksLine(level, x0 + 510, C.GROUND - 124, 1, 40);
    steaksLine(level, x0 + 690, C.GROUND - 184, 1, 40);
    steaksLine(level, x0 + 870, C.GROUND - 124, 1, 40);
    critter(level, 'bird', x0 + 1200, C.GROUND - 40, x0 + 1050, x0 + 1400);
    steaksLine(level, x0 + 1100, C.GROUND - 28, 8, 44);
    deco(level, 'plant', x0 + 40, C.GROUND);
    deco(level, 'door', x0 + 1480, C.GROUND);
    return 1600;
  }

  function roomMayra(level, x0) {
    var w = 1000;
    plat(level, x0, C.GROUND, w, 90);
    plat(level, x0 + 220, C.GROUND - 90, 120, 16);
    plat(level, x0 + 660, C.GROUND - 90, 120, 16);
    steaksLine(level, x0 + 240, C.GROUND - 124, 2, 36);
    steaksLine(level, x0 + 680, C.GROUND - 124, 2, 36);
    deco(level, 'door', x0 + 36, C.GROUND);
    deco(level, 'shower', x0 + w / 2 - 12, C.GROUND);
    deco(level, 'plant', x0 + w - 220, C.GROUND);
    deco(level, 'toy', x0 + w - 120, C.GROUND, { kiss: true, clearKiss: true });
    level.bossArena = {
      left: x0,
      right: x0 + w,
    };
    return w;
  }

  function roomNightStart(level, x0) {
    plat(level, x0, C.GROUND, 1500, 90);
    deco(level, 'door', x0 + 40, C.GROUND);
    deco(level, 'sofa', x0 + 180, C.GROUND);
    plat(level, x0 + 190, C.GROUND - 36, 100, 12);
    steaksLine(level, x0 + 210, C.GROUND - 70, 3, 40);
    steaksLine(level, x0 + 520, C.GROUND - 28, 4, 48);
    plat(level, x0 + 780, C.GROUND - 90, 120, 16);
    steaksLine(level, x0 + 800, C.GROUND - 124, 3, 36);
    deco(level, 'plant', x0 + 1100, C.GROUND);
    steaksLine(level, x0 + 1300, C.GROUND - 28, 3, 44);
    deco(level, 'fridge', x0 + 1420, C.GROUND);
    return 1500;
  }

  function roomNightHall(level, x0) {
    plat(level, x0, C.GROUND, 1700, 90);
    deco(level, 'sofa', x0 + 40, C.GROUND);
    plat(level, x0 + 200, C.GROUND - 100, 100, 16);
    plat(level, x0 + 500, C.GROUND - 150, 100, 16);
    plat(level, x0 + 800, C.GROUND - 100, 100, 16);
    steaksLine(level, x0 + 220, C.GROUND - 134, 2, 36);
    steaksLine(level, x0 + 520, C.GROUND - 184, 2, 36);
    critter(level, 'cat', x0 + 400, C.GROUND - 40, x0 + 250, x0 + 620);
    critter(level, 'dog', x0 + 1100, C.GROUND - 40, x0 + 950, x0 + 1400);
    level.vacuums.push({
      x: x0 + 900,
      y: C.GROUND - 14,
      x1: x0 + 700,
      x2: x0 + 1500,
      dir: -1,
      speed: 130,
    });
    return 1700;
  }

  function roomNightToBoss(level, x0) {
    plat(level, x0, C.GROUND, 1400, 90);
    steaksLine(level, x0 + 80, C.GROUND - 28, 6, 48);
    plat(level, x0 + 500, C.GROUND - 90, 160, 16);
    steaksLine(level, x0 + 530, C.GROUND - 124, 3, 40);
    critter(level, 'bird', x0 + 900, C.GROUND - 40, x0 + 780, x0 + 1100);
    deco(level, 'plant', x0 + 300, C.GROUND);
    deco(level, 'door', x0 + 1280, C.GROUND);
    return 1400;
  }

  function roomBoss(level, x0) {
    var w = 960;
    plat(level, x0, C.GROUND, w, 90);
    level.bossArena = {
      left: x0,
      right: x0 + w,
      bed: { x: x0 + w / 2, y: C.GROUND },
    };
    deco(level, 'bed', x0 + w / 2, C.GROUND);
    deco(level, 'toy', x0 + w - 120, C.GROUND, { kiss: true, clearKiss: true });
    return w;
  }

  function blankHouse(opt) {
    opt = opt || {};
    return {
      id: opt.id,
      name: opt.name,
      theme: 'house',
      music: opt.music || 'day',
      width: 0,
      platforms: [],
      rugs: [],
      steaks: [],
      critters: [],
      vacuums: [],
      brooms: [],
      decos: [],
      puddles: [],
      spawn: { x: Billy.spawnX ? Billy.spawnX() : (C.SPAWN_X || 300), y: C.GROUND - C.PLAYER_H - 2 },
      checkpoint: null,
      dayEndX: 0,
      night: !!opt.night,
      mayraArena: null,
      bossKind: opt.bossKind || null,
      bossBanner: opt.bossBanner || '',
      intro: opt.intro != null ? opt.intro : 1.2,
      introBanner: opt.introBanner || '',
    };
  }

  Billy.Levels = Billy.Levels || {};
  Billy.Levels.createHouse = function () {
    var level = blankHouse({
      id: 'house',
      name: 'Casa',
      music: 'day',
      bossKind: 'mayra',
      bossBanner: 'Mayra quer dar banho!',
      intro: 2.8,
    });

    var x = 0;
    x += roomLiving(level, x);
    x += roomRugs(level, x);
    x += roomKitchen(level, x);
    x += roomBroom(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += roomPlay(level, x);
    x += roomGallery(level, x);
    x += roomMayra(level, x);
    level.platforms.push({ x: -400, y: C.GROUND, w: x + 800, h: 240, ground: true });
    level.width = x;
    return level;
  };

  Billy.Levels.createNight = function () {
    var level = blankHouse({
      id: 'night',
      name: 'À noite',
      music: 'night',
      night: true,
      bossKind: 'bed',
      bossBanner: 'Monstros debaixo da cama!',
      intro: 2.4,
      introBanner: 'Sozinho em casa à noite...',
    });

    var x = 0;
    x += roomNightStart(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += roomNightHall(level, x);
    x += roomNightToBoss(level, x);
    x += roomBoss(level, x);
    level.platforms.push({ x: -400, y: C.GROUND, w: x + 800, h: 240, ground: true });
    level.width = x;
    return level;
  };
})();
