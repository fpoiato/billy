/**
 * Fase 3 — A Praia.
 * Caranguejos, ondas, castelos, gaivotas. Reencontro com o Patinho, sem chefão.
 */
(function () {
  var C = Billy.CONFIG;
  var B = Billy.LevelBuild;

  function crab(level, x, x1, x2) {
    level.crabs.push({
      x: x,
      y: C.GROUND - C.CRAB_H,
      w: C.CRAB_W,
      h: C.CRAB_H,
      x1: x1,
      x2: x2,
      dir: 1,
      speed: 80,
      t: 0,
    });
  }

  function wave(level, x, w) {
    level.waves.push({
      x: x,
      y: C.GROUND - 8,
      w: w || C.WAVE_W,
      h: C.WAVE_H,
      t: Math.random() * 3,
      period: 1.8,
    });
  }

  function gull(level, x, y, x1, x2) {
    level.seagulls.push({
      x: x,
      y: y,
      w: C.GULL_W,
      h: C.GULL_H,
      x1: x1,
      x2: x2,
      dir: 1,
      speed: 90,
      baseY: y,
      t: 0,
    });
  }

  function boardwalk(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.deco(level, 'palm', x0 + 80, C.GROUND);
    B.deco(level, 'door', x0 + 220, C.GROUND);
    B.steaksLine(level, x0 + 320, C.GROUND - 28, 5, 48);
    B.deco(level, 'castle', x0 + 700, C.GROUND);
    B.critter(level, 'dog', x0 + 900, C.GROUND - 40, x0 + 780, x0 + 1100);
    B.steaksLine(level, x0 + 1200, C.GROUND - 28, 5, 44);
    return 1600;
  }

  function dunes(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    B.plat(level, x0 + 160, C.GROUND - 70, 160, 16);
    B.plat(level, x0 + 420, C.GROUND - 130, 160, 16);
    B.plat(level, x0 + 700, C.GROUND - 70, 160, 16);
    B.steaksLine(level, x0 + 180, C.GROUND - 104, 3, 40);
    B.steaksLine(level, x0 + 440, C.GROUND - 164, 3, 40);
    B.steaksLine(level, x0 + 720, C.GROUND - 104, 3, 40);
    crab(level, x0 + 1000, x0 + 900, x0 + 1400);
    B.deco(level, 'palm', x0 + 1500, C.GROUND);
    return 1700;
  }

  function surf(level, x0) {
    B.plat(level, x0, C.GROUND, 1800, 90);
    wave(level, x0 + 120, 160);
    wave(level, x0 + 520, 180);
    wave(level, x0 + 980, 160);
    wave(level, x0 + 1400, 180);
    B.steaksLine(level, x0 + 200, C.GROUND - 90, 4, 50);
    B.steaksLine(level, x0 + 800, C.GROUND - 90, 4, 50);
    crab(level, x0 + 700, x0 + 600, x0 + 900);
    B.deco(level, 'castle', x0 + 1200, C.GROUND);
    return 1800;
  }

  function sky(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    gull(level, x0 + 200, C.GROUND - 160, x0 + 80, x0 + 700);
    gull(level, x0 + 900, C.GROUND - 200, x0 + 760, x0 + 1400);
    B.plat(level, x0 + 300, C.GROUND - 90, 100, 16);
    B.plat(level, x0 + 560, C.GROUND - 150, 100, 16);
    B.plat(level, x0 + 820, C.GROUND - 90, 100, 16);
    B.steaksLine(level, x0 + 320, C.GROUND - 124, 2, 36);
    B.steaksLine(level, x0 + 580, C.GROUND - 184, 2, 36);
    B.steaksLine(level, x0 + 840, C.GROUND - 124, 2, 36);
    B.critter(level, 'bird', x0 + 1200, C.GROUND - 40, x0 + 1050, x0 + 1450);
    B.deco(level, 'palm', x0 + 1500, C.GROUND);
    return 1700;
  }

  function castles(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.deco(level, 'castle', x0 + 180, C.GROUND);
    B.plat(level, x0 + 200, C.GROUND - 50, 90, 12);
    B.deco(level, 'castle', x0 + 700, C.GROUND);
    B.plat(level, x0 + 720, C.GROUND - 50, 90, 12);
    crab(level, x0 + 500, x0 + 400, x0 + 900);
    wave(level, x0 + 1100, 200);
    B.steaksLine(level, x0 + 220, C.GROUND - 84, 2, 30);
    B.steaksLine(level, x0 + 740, C.GROUND - 84, 2, 30);
    B.steaksLine(level, x0 + 1300, C.GROUND - 28, 5, 44);
    return 1600;
  }

  function reunion(level, x0) {
    var w = 1400;
    B.plat(level, x0, C.GROUND, w, 90);
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 6, 48);
    B.deco(level, 'palm', x0 + 500, C.GROUND);
    B.deco(level, 'door', x0 + 700, C.GROUND);
    B.deco(level, 'toy', x0 + 1100, C.GROUND, { kiss: true });
    level.goal = { x: x0 + 1080, banner: 'O Patinho Amarelo!' };
    return w;
  }

  Billy.Levels = Billy.Levels || {};
  Billy.Levels.createBeach = function () {
    var level = B.base({
      id: 'beach',
      name: 'A Praia',
      music: 'beach',
    });
    var x = 0;
    x += boardwalk(level, x);
    x += dunes(level, x);
    x += surf(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += sky(level, x);
    x += castles(level, x);
    x += reunion(level, x);
    return B.finish(level, x);
  };
})();
