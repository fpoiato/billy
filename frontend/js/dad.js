var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;
  var P = Billy.Physics;

  function create(x) {
    return {
      x: x,
      y: C.GROUND - C.DAD_H,
      w: C.DAD_W,
      h: C.DAD_H,
      vx: 0,
      facing: 1,
      mode: 'walk',
      t: 0,
      truck: null,
      money: 0,
      burger: 0,
      run: false,
      rush: false,
    };
  }

  function reset(dad, p) {
    if (!dad || !p) return;
    dad.x = p.x - C.LEASH_REST;
    dad.y = C.GROUND - dad.h;
    dad.vx = 0;
    dad.facing = p.facing || 1;
    dad.mode = 'walk';
    dad.t = 0;
    dad.truck = null;
    dad.money = 0;
    dad.burger = 0;
    dad.run = false;
    dad.rush = false;
  }

  function foodTrucks(level) {
    var list = [];
    var decos = (level && level.decos) || [];
    for (var i = 0; i < decos.length; i++) {
      if (decos[i].kind === 'foodtruck') list.push(decos[i]);
    }
    return list;
  }

  function truckOnRight(truck, cam) {
    if (!truck) return false;
    var sx = truck.x - (cam && cam.x || 0);
    return sx > C.WIDTH * 0.55 && sx < C.WIDTH - 8;
  }

  function windowX(truck) {
    return truck.x + 78;
  }

  function pickRushTruck(level, cam, dad) {
    var trucks = foodTrucks(level);
    var best = null;
    for (var i = 0; i < trucks.length; i++) {
      var truck = trucks[i];
      if (truck.visited) continue;
      if (dad.x > truck.x + 120) continue;
      var chasing = dad.truck === truck && (dad.mode === 'rush' || dad.mode === 'stop' || dad.mode === 'pay' || dad.mode === 'take' || dad.mode === 'eat');
      if (chasing || truckOnRight(truck, cam)) {
        if (!best || truck.x < best.x) best = truck;
      }
    }
    return best;
  }

  function applyLeash(p, dad) {
    var pcx = p.x + p.w / 2;
    var dcx = dad.x + dad.w / 2;
    var dx = pcx - dcx;
    var dist = Math.abs(dx);
    if (dist <= C.LEASH_LEN) return;
    var sign = dx > 0 ? 1 : -1;
    var excess = dist - C.LEASH_LEN;
    var dadLead = dad.mode !== 'walk';
    if (dadLead) {
      p.x -= sign * excess;
      if (p.x < 0) p.x = 0;
      if (Math.abs(dad.vx) > 8) p.vx = dad.vx;
    } else {
      dad.x += sign * excess;
      dad.vx = p.vx;
    }
  }

  function beginMode(dad, mode, time) {
    dad.mode = mode;
    dad.t = time;
    if (mode === 'walk') {
      dad.truck = null;
      dad.money = 0;
      dad.burger = 0;
      dad.rush = false;
    }
    if (mode === 'pay') dad.money = 0.08;
    if (mode === 'take') dad.burger = 0.15;
    if (mode === 'eat') dad.burger = 1;
  }

  function updateRitual(dad, dt) {
    dad.vx = 0;
    dad.run = false;
    dad.rush = false;
    dad.t -= dt;
    if (dad.mode === 'pay') {
      dad.money = P.clamp(1 - dad.t / C.DAD_PAY_TIME, 0, 1);
    }
    if (dad.mode === 'take') {
      dad.burger = P.clamp(1 - dad.t / C.DAD_TAKE_TIME, 0, 1);
    }
    if (dad.mode === 'eat') {
      dad.burger = P.clamp(dad.t / C.DAD_EAT_TIME, 0, 1);
    }
    if (dad.t > 0) return;

    if (dad.mode === 'stop') {
      beginMode(dad, 'pay', C.DAD_PAY_TIME);
      if (Billy.Audio && Billy.Audio.coin) Billy.Audio.coin();
      return;
    }
    if (dad.mode === 'pay') {
      beginMode(dad, 'take', C.DAD_TAKE_TIME);
      return;
    }
    if (dad.mode === 'take') {
      beginMode(dad, 'eat', C.DAD_EAT_TIME);
      if (Billy.Audio && Billy.Audio.eat) Billy.Audio.eat();
      return;
    }
    if (dad.mode === 'eat') {
      if (dad.truck) dad.truck.visited = true;
      beginMode(dad, 'walk', 0);
    }
  }

  function updateWalk(dad, p, dt) {
    dad.rush = false;
    var pulling = Math.abs(p.vx) > 14 || (!p.onGround && Math.abs(p.vx) > 6);
    var target = p.x + p.w / 2 - (p.facing || 1) * C.LEASH_REST - dad.w / 2;
    if (!pulling) {
      dad.vx *= Math.pow(0.78, dt * 60);
      if (Math.abs(dad.vx) < 8) dad.vx = 0;
      dad.run = false;
    } else {
      var dx = target - dad.x;
      var spd = C.DAD_WALK_SPEED;
      dad.vx = P.clamp(dx * 6.2, -spd, spd);
      dad.facing = p.facing || dad.facing;
      dad.run = Math.abs(dad.vx) > 18;
    }
    dad.x += dad.vx * dt;
  }

  function updateRush(dad, dt) {
    var truck = dad.truck;
    var target = windowX(truck) - dad.w / 2;
    var dx = target - dad.x;
    dad.facing = dx >= 0 ? 1 : -1;
    dad.vx = dad.facing * C.DAD_RUSH_SPEED;
    dad.run = true;
    dad.rush = true;
    if (Math.abs(dx) <= 16) {
      dad.x = target;
      dad.vx = 0;
      beginMode(dad, 'stop', C.DAD_STOP_TIME);
      dad.truck = truck;
      return;
    }
    dad.x += dad.vx * dt;
    if ((dad.facing > 0 && dad.x > target) || (dad.facing < 0 && dad.x < target)) {
      dad.x = target;
      dad.vx = 0;
      beginMode(dad, 'stop', C.DAD_STOP_TIME);
      dad.truck = truck;
    }
  }

  function update(dad, p, level, cam, dt) {
    if (!dad || !p) return;
    dad.y = C.GROUND - dad.h;

    if (dad.mode === 'stop' || dad.mode === 'pay' || dad.mode === 'take' || dad.mode === 'eat') {
      updateRitual(dad, dt);
      applyLeash(p, dad);
      return;
    }

    var truck = pickRushTruck(level, cam, dad);
    if (truck) {
      if (dad.mode !== 'rush' || dad.truck !== truck) {
        dad.mode = 'rush';
        dad.truck = truck;
        dad.t = 0;
      }
      updateRush(dad, dt);
    } else {
      dad.mode = 'walk';
      dad.truck = null;
      updateWalk(dad, p, dt);
    }

    applyLeash(p, dad);

    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    if (level && level.width && p.x + p.w > level.width) {
      p.x = level.width - p.w;
      p.vx = 0;
    }
    if (dad.x < 0) dad.x = 0;
    if (level && level.width && dad.x + dad.w > level.width) dad.x = level.width - dad.w;
  }

  Billy.Dad = {
    create: create,
    reset: reset,
    update: update,
    foodTrucks: foodTrucks,
    truckOnRight: truckOnRight,
    applyLeash: applyLeash,
  };
})();
