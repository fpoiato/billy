var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function rect(x, y, w, h) {
    return { x: x, y: y, w: w, h: h };
  }

  /**
   * Move um corpo AABB contra plataformas sólidas.
   * Resolve eixo X e depois Y (arcade clássico).
   * Quem está em cima da plataforma não colide em X — senão o chão
   * largo vira "parede" e o personagem é teletransportado.
   */
  function moveAndCollide(body, platforms, dt) {
    var prevBottom = body.y + body.h;

    body.x += body.vx * dt;
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (!aabb(body, p)) continue;
      if (prevBottom <= p.y + 3) continue;
      if (body.vx > 0) body.x = p.x - body.w;
      else if (body.vx < 0) body.x = p.x + p.w;
      body.vx = 0;
    }

    body.y += body.vy * dt;
    body.onGround = false;
    for (var j = 0; j < platforms.length; j++) {
      var q = platforms[j];
      if (!aabb(body, q)) continue;
      if (body.vy > 0) {
        body.y = q.y - body.h;
        body.vy = 0;
        body.onGround = true;
      } else if (body.vy < 0) {
        body.y = q.y + q.h;
        body.vy = 0;
      }
    }
  }

  /**
   * Pisão estilo Goomba: caindo, pés perto do topo do inimigo.
   */
  function isStomp(player, enemy) {
    if (player.vy <= 80) return false;
    var feet = player.y + player.h;
    var head = enemy.y + Math.min(12, enemy.h * 0.45);
    return feet <= head + 10 && player.y < enemy.y;
  }

  /**
   * Dano: se tem bifinhos, perde alguns; senão perde vida.
   */
  function applyHit(steaks, steaksOnHit) {
    var lost = Math.min(steaks, steaksOnHit);
    if (steaks > 0) {
      return { steaks: steaks - lost, steaksLost: lost, loseLife: false };
    }
    return { steaks: 0, steaksLost: 0, loseLife: true };
  }

  function extraLivesFromSteaks(prev, next, perLife) {
    return Math.floor(next / perLife) - Math.floor(prev / perLife);
  }

  Billy.Physics = {
    aabb: aabb,
    rect: rect,
    moveAndCollide: moveAndCollide,
    isStomp: isStomp,
    applyHit: applyHit,
    extraLivesFromSteaks: extraLivesFromSteaks,
    clamp: function (v, a, b) {
      return Math.max(a, Math.min(b, v));
    },
  };

  Billy.CONFIG = C;
})();
