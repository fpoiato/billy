var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function create() {
    return { x: 0, y: 0, shake: 0 };
  }

  function follow(cam, player, level, dt, lock) {
    var target = lock ? lock.x : player.x + player.w / 2 - C.WIDTH * 0.35;
    var max = Math.max(0, level.width - C.WIDTH);
    target = Billy.Physics.clamp(target, 0, max);
    cam.x += (target - cam.x) * Math.min(1, dt * 8);
    if (lock) cam.x = Billy.Physics.clamp(lock.x, 0, max);
    if (cam.shake > 0) {
      cam.shake -= dt;
      cam.x += (Math.random() - 0.5) * 10;
    }
  }

  Billy.Camera = { create: create, follow: follow };
})();
