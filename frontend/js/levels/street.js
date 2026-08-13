/**
 * Fase 2 — A Rua.
 * Carros, skatistas, gatos, bueiros; Chefão 2 no portão.
 */
(function () {
  var C = Billy.CONFIG;
  var B = Billy.LevelBuild;

  function car(level, x, x1, x2, dir, speed) {
    level.cars.push({
      x: x,
      y: C.GROUND - 14,
      x1: x1,
      x2: x2,
      dir: dir || 1,
      speed: speed || 140,
    });
  }

  function skater(level, x, x1, x2) {
    level.skaters.push({
      x: x,
      y: C.GROUND - C.SKATER_H,
      w: C.SKATER_W,
      h: C.SKATER_H,
      x1: x1,
      x2: x2,
      dir: 1,
      speed: 160,
      t: 0,
    });
  }

  function cat(level, x, x1, x2) {
    level.cats.push({
      x: x,
      y: C.GROUND - C.CAT_H,
      w: C.CAT_W,
      h: C.CAT_H,
      x1: x1,
      x2: x2,
      dir: -1,
      speed: 70,
      t: 0,
    });
  }

  function hole(level, x) {
    level.manholes.push({
      x: x,
      y: C.GROUND - 6,
      w: C.MANHOLE_W,
      h: C.MANHOLE_H,
    });
  }

  function suburb(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    B.neighbor(level, x0 + 80, { tone: 0 });
    B.deco(level, 'plant', x0 + 240, C.GROUND);
    B.steaksLine(level, x0 + 280, C.GROUND - 28, 5, 48);
    B.neighbor(level, x0 + 540, { tone: 1 });
    B.critter(level, 'dog', x0 + 800, C.GROUND - 40, x0 + 700, x0 + 980);
    B.steaksLine(level, x0 + 1000, C.GROUND - 28, 4, 44);
    B.neighbor(level, x0 + 1280, { tone: 2 });
    return 1700;
  }

  function skate(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.plat(level, x0 + 180, C.GROUND - 70, 140, 16);
    B.plat(level, x0 + 420, C.GROUND - 120, 140, 16);
    B.plat(level, x0 + 680, C.GROUND - 70, 140, 16);
    B.steaksLine(level, x0 + 200, C.GROUND - 104, 3, 40);
    B.steaksLine(level, x0 + 440, C.GROUND - 154, 3, 40);
    B.steaksLine(level, x0 + 700, C.GROUND - 104, 3, 40);
    skater(level, x0 + 900, x0 + 820, x0 + 1400);
    B.critter(level, 'bird', x0 + 1100, C.GROUND - 40, x0 + 980, x0 + 1300);
    return 1600;
  }

  function avenue(level, x0) {
    B.plat(level, x0, C.GROUND, 1800, 90);
    hole(level, x0 + 220);
    hole(level, x0 + 700);
    hole(level, x0 + 1280);
    car(level, x0 + 400, x0 + 80, x0 + 1700, 1, 150);
    B.steaksLine(level, x0 + 260, C.GROUND - 90, 4, 50);
    B.steaksLine(level, x0 + 760, C.GROUND - 90, 4, 50);
    B.hydrant(level, x0 + 980);
    B.steaksLine(level, x0 + 1500, C.GROUND - 28, 4, 44);
    return 1800;
  }

  function alley(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.neighbor(level, x0 + 40, { tone: 1 });
    cat(level, x0 + 300, x0 + 200, x0 + 700);
    cat(level, x0 + 900, x0 + 760, x0 + 1300);
    B.steaksLine(level, x0 + 240, C.GROUND - 28, 6, 46);
    B.plat(level, x0 + 1100, C.GROUND - 90, 180, 16);
    B.steaksLine(level, x0 + 1130, C.GROUND - 124, 3, 40);
    B.critter(level, 'dog', x0 + 1400, C.GROUND - 40, x0 + 1280, x0 + 1540);
    return 1600;
  }

  function traffic(level, x0) {
    B.plat(level, x0, C.GROUND, 1800, 90);
    car(level, x0 + 200, x0 + 40, x0 + 900, -1, 170);
    car(level, x0 + 1100, x0 + 950, x0 + 1700, 1, 130);
    hole(level, x0 + 500);
    hole(level, x0 + 1400);
    skater(level, x0 + 700, x0 + 600, x0 + 1000);
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 5, 48);
    B.steaksLine(level, x0 + 1000, C.GROUND - 100, 5, 48);
    B.hydrant(level, x0 + 1600);
    return 1800;
  }

  function approach(level, x0) {
    B.plat(level, x0, C.GROUND, 1500, 90);
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 8, 44);
    B.plat(level, x0 + 500, C.GROUND - 80, 120, 16);
    B.steaksLine(level, x0 + 520, C.GROUND - 114, 2, 36);
    cat(level, x0 + 800, x0 + 700, x0 + 1100);
    B.neighbor(level, x0 + 1160, { tone: 0 });
    return 1500;
  }

  function boss(level, x0) {
    var w = 960;
    B.plat(level, x0, C.GROUND, w, 90);
    level.bossArena = {
      left: x0,
      right: x0 + w,
      gateX: x0 + w - 90,
    };
    B.deco(level, 'gate', x0 + w - 70, C.GROUND);
    B.deco(level, 'toy', x0 + w - 240, C.GROUND, { kiss: true, clearKiss: true });
    return w;
  }

  Billy.Levels = Billy.Levels || {};
  Billy.Levels.createStreet = function () {
    var level = B.base({
      id: 'street',
      name: 'A Rua',
      music: 'street',
      bossKind: 'dogs',
      bossBanner: 'Cachorros grandes no portão!',
    });
    var x = 0;
    x += suburb(level, x);
    x += skate(level, x);
    x += avenue(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += alley(level, x);
    x += traffic(level, x);
    x += approach(level, x);
    x += boss(level, x);
    return B.finish(level, x);
  };
})();
