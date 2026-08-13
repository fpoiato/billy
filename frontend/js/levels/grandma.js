/**
 * Fase 4 — Casa da Vó.
 * Agulha, novelos, vasos, gato da vovó. Final feliz com o Patinho.
 */
(function () {
  var C = Billy.CONFIG;
  var B = Billy.LevelBuild;

  function needle(level, cx, amp, speed) {
    level.needles.push({
      cx: cx,
      x: cx,
      y: C.GROUND - 10,
      amp: amp || 160,
      speed: speed || 1.5,
      phase: 0,
    });
  }

  function yarn(level, x, x1, x2) {
    level.yarns.push({
      x: x,
      y: C.GROUND - C.YARN_H,
      w: C.YARN_W,
      h: C.YARN_H,
      x1: x1,
      x2: x2,
      dir: 1,
      speed: 100,
      t: 0,
    });
  }

  function vase(level, x, y) {
    level.vases.push({
      x: x,
      y: y,
      w: C.VASE_W,
      h: C.VASE_H,
      dead: false,
    });
  }

  function hall(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.deco(level, 'door', x0 + 60, C.GROUND);
    B.deco(level, 'sofa', x0 + 200, C.GROUND);
    B.plat(level, x0 + 210, C.GROUND - 36, 100, 12);
    B.steaksLine(level, x0 + 230, C.GROUND - 70, 3, 36);
    B.deco(level, 'plant', x0 + 500, C.GROUND);
    B.steaksLine(level, x0 + 700, C.GROUND - 28, 5, 48);
    B.deco(level, 'door', x0 + 1100, C.GROUND);
    B.heart(level, x0 + 1300, C.GROUND - 40, x0 + 1180, x0 + 1500);
    return 1600;
  }

  function knitting(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    needle(level, x0 + 400, 180, 1.4);
    yarn(level, x0 + 800, x0 + 700, x0 + 1200);
    B.plat(level, x0 + 200, C.GROUND - 80, 120, 16);
    B.plat(level, x0 + 500, C.GROUND - 130, 120, 16);
    B.steaksLine(level, x0 + 220, C.GROUND - 114, 2, 36);
    B.steaksLine(level, x0 + 520, C.GROUND - 164, 2, 36);
    B.steaksLine(level, x0 + 1400, C.GROUND - 28, 4, 44);
    B.deco(level, 'bed', x0 + 1550, C.GROUND);
    return 1700;
  }

  function china(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.plat(level, x0 + 180, C.GROUND - 70, 90, 16);
    vase(level, x0 + 210, C.GROUND - 70 - C.VASE_H);
    B.plat(level, x0 + 420, C.GROUND - 120, 90, 16);
    vase(level, x0 + 450, C.GROUND - 120 - C.VASE_H);
    B.plat(level, x0 + 680, C.GROUND - 70, 90, 16);
    vase(level, x0 + 710, C.GROUND - 70 - C.VASE_H);
    B.steaksLine(level, x0 + 190, C.GROUND - 104, 2, 30);
    B.steaksLine(level, x0 + 430, C.GROUND - 154, 2, 30);
    B.steaksLine(level, x0 + 690, C.GROUND - 104, 2, 30);
    yarn(level, x0 + 1000, x0 + 900, x0 + 1400);
    B.deco(level, 'door', x0 + 1500, C.GROUND);
    return 1600;
  }

  function kitty(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    level.cats.push({
      x: x0 + 400,
      y: C.GROUND - C.CAT_H,
      w: C.CAT_W,
      h: C.CAT_H,
      x1: x0 + 200,
      x2: x0 + 800,
      dir: 1,
      speed: 85,
      t: 0,
    });
    level.cats.push({
      x: x0 + 1100,
      y: C.GROUND - C.CAT_H,
      w: C.CAT_W,
      h: C.CAT_H,
      x1: x0 + 900,
      x2: x0 + 1500,
      dir: -1,
      speed: 95,
      t: 0,
    });
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 6, 48);
    B.plat(level, x0 + 700, C.GROUND - 90, 160, 16);
    B.steaksLine(level, x0 + 730, C.GROUND - 124, 3, 40);
    B.heart(level, x0 + 1300, C.GROUND - 40, x0 + 1150, x0 + 1550);
    return 1700;
  }

  function parlor(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    needle(level, x0 + 500, 150, 1.7);
    vase(level, x0 + 200, C.GROUND - C.VASE_H);
    vase(level, x0 + 900, C.GROUND - C.VASE_H);
    yarn(level, x0 + 1100, x0 + 1000, x0 + 1400);
    B.deco(level, 'sofa', x0 + 300, C.GROUND);
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 4, 44);
    B.steaksLine(level, x0 + 700, C.GROUND - 90, 4, 44);
    B.deco(level, 'door', x0 + 1450, C.GROUND);
    return 1600;
  }

  function ending(level, x0) {
    var w = 960;
    B.plat(level, x0, C.GROUND, w, 90);
    B.deco(level, 'sofa', x0 + 80, C.GROUND);
    B.deco(level, 'plant', x0 + 280, C.GROUND);
    B.deco(level, 'toy', x0 + w - 160, C.GROUND, { kiss: true });
    level.bossArena = {
      left: x0,
      right: x0 + w,
    };
    return w;
  }

  Billy.Levels = Billy.Levels || {};
  Billy.Levels.createGrandma = function () {
    var level = B.base({
      id: 'grandma',
      name: 'Casa da Vó',
      music: 'grandma',
      bossKind: 'camila',
      bossBanner: 'Camila quer um abraço!',
    });
    var x = 0;
    x += hall(level, x);
    x += knitting(level, x);
    x += china(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += kitty(level, x);
    x += parlor(level, x);
    x += ending(level, x);
    return B.finish(level, x);
  };
})();
