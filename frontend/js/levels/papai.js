/**
 * Fase 2 — Passear com o Papai.
 * Billy na coleira puxa o papai (mais lento). Food truck à direita
 * faz o papai disparar, parar, pagar e comer um hambúrguer.
 */
(function () {
  var C = Billy.CONFIG;
  var B = Billy.LevelBuild;

  function truck(level, x) {
    B.deco(level, 'foodtruck', x, C.GROUND, { visited: false, w: C.FOODTRUCK_W || 196 });
  }

  function park(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    B.deco(level, 'tree', x0 + 70, C.GROUND);
    B.hydrant(level, x0 + 260);
    B.steaksLine(level, x0 + 300, C.GROUND - 28, 5, 48);
    B.deco(level, 'bench', x0 + 560, C.GROUND);
    B.deco(level, 'plant', x0 + 720, C.GROUND);
    B.plat(level, x0 + 880, C.GROUND - 80, 140, 16);
    B.steaksLine(level, x0 + 910, C.GROUND - 114, 3, 40);
    B.deco(level, 'tree', x0 + 1200, C.GROUND);
    B.critter(level, 'bird', x0 + 1400, C.GROUND - 40, x0 + 1280, x0 + 1600);
    return 1700;
  }

  function lane(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.neighbor(level, x0 + 40, { tone: 0 });
    B.steaksLine(level, x0 + 280, C.GROUND - 28, 4, 44);
    B.deco(level, 'tree', x0 + 500, C.GROUND);
    B.critter(level, 'dog', x0 + 780, C.GROUND - 40, x0 + 680, x0 + 980);
    B.hydrant(level, x0 + 1100);
    B.steaksLine(level, x0 + 1200, C.GROUND - 28, 4, 44);
    B.deco(level, 'plant', x0 + 1480, C.GROUND);
    return 1600;
  }

  function snack(level, x0) {
    B.plat(level, x0, C.GROUND, 1500, 90);
    B.deco(level, 'tree', x0 + 80, C.GROUND);
    B.steaksLine(level, x0 + 200, C.GROUND - 28, 4, 48);
    truck(level, x0 + 720);
    B.steaksLine(level, x0 + 980, C.GROUND - 90, 3, 40);
    B.deco(level, 'bench', x0 + 1280, C.GROUND);
    return 1500;
  }

  function grove(level, x0) {
    B.plat(level, x0, C.GROUND, 1700, 90);
    B.plat(level, x0 + 180, C.GROUND - 70, 130, 16);
    B.plat(level, x0 + 420, C.GROUND - 120, 130, 16);
    B.plat(level, x0 + 680, C.GROUND - 70, 130, 16);
    B.steaksLine(level, x0 + 200, C.GROUND - 104, 3, 40);
    B.steaksLine(level, x0 + 440, C.GROUND - 154, 3, 40);
    B.steaksLine(level, x0 + 700, C.GROUND - 104, 3, 40);
    B.deco(level, 'tree', x0 + 980, C.GROUND);
    level.cats.push({
      x: x0 + 1100,
      y: C.GROUND - C.CAT_H,
      w: C.CAT_W,
      h: C.CAT_H,
      x1: x0 + 1000,
      x2: x0 + 1500,
      dir: -1,
      speed: 80,
      t: 0,
    });
    B.hydrant(level, x0 + 1560);
    return 1700;
  }

  function snackTwo(level, x0) {
    B.plat(level, x0, C.GROUND, 1600, 90);
    B.neighbor(level, x0 + 40, { tone: 1 });
    B.steaksLine(level, x0 + 280, C.GROUND - 28, 5, 46);
    truck(level, x0 + 820);
    B.deco(level, 'tree', x0 + 1180, C.GROUND);
    B.steaksLine(level, x0 + 1320, C.GROUND - 28, 4, 44);
    B.deco(level, 'plant', x0 + 1500, C.GROUND);
    return 1600;
  }

  function stretch(level, x0) {
    B.plat(level, x0, C.GROUND, 1500, 90);
    B.deco(level, 'bench', x0 + 80, C.GROUND);
    B.steaksLine(level, x0 + 200, C.GROUND - 28, 6, 48);
    B.critter(level, 'bird', x0 + 700, C.GROUND - 40, x0 + 580, x0 + 980);
    B.deco(level, 'tree', x0 + 1100, C.GROUND);
    B.hydrant(level, x0 + 1320);
    return 1500;
  }

  function reunion(level, x0) {
    var w = 1200;
    B.plat(level, x0, C.GROUND, w, 90);
    B.deco(level, 'tree', x0 + 80, C.GROUND);
    B.deco(level, 'bench', x0 + 280, C.GROUND);
    B.steaksLine(level, x0 + 80, C.GROUND - 28, 5, 48);
    B.deco(level, 'plant', x0 + 520, C.GROUND);
    B.deco(level, 'toy', x0 + 980, C.GROUND, { kiss: true });
    level.goal = { x: x0 + 960, banner: 'O Patinho Amarelo!' };
    return w;
  }

  Billy.Levels = Billy.Levels || {};
  Billy.Levels.createPapai = function () {
    var level = B.base({
      id: 'papai',
      name: 'Passear com o Papai',
      music: 'papai',
    });
    level.leash = true;
    level.introBanner = 'Passeio com o papai!';
    var x = 0;
    x += park(level, x);
    x += lane(level, x);
    x += snack(level, x);
    level.checkpoint = { x: x + 80, y: C.GROUND, used: false };
    x += grove(level, x);
    x += snackTwo(level, x);
    x += stretch(level, x);
    x += reunion(level, x);
    return B.finish(level, x);
  };
})();
