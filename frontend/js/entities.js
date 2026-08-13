var Billy = Billy || {};

(function () {
  function sparkleBurst(list, x, y, color) {
    for (var i = 0; i < 12; i++) {
      var a = (Math.PI * 2 * i) / 12;
      list.push({
        x: x,
        y: y,
        vx: Math.cos(a) * (80 + Math.random() * 80),
        vy: Math.sin(a) * (80 + Math.random() * 80) - 40,
        r: 2 + Math.random() * 3,
        life: 1,
        color: color || '#ffe14a',
      });
    }
  }

  function splash(list, x, y) {
    var colors = ['#7ec8ff', '#b8e8ff', '#fff', '#e8f6ff', '#9ad8ff'];
    for (var i = 0; i < 16; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      list.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: Math.cos(a) * (50 + Math.random() * 90),
        vy: Math.sin(a) * (70 + Math.random() * 90) - 40,
        r: 2 + Math.random() * 4.5,
        life: 0.9 + Math.random() * 0.4,
        color: colors[i % colors.length],
      });
    }
  }

  function scatterSteaks(list, x, y, n) {
    for (var i = 0; i < n; i++) {
      list.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y - 10,
        vx: (Math.random() - 0.5) * 220,
        vy: -180 - Math.random() * 120,
        w: 16,
        h: 12,
        life: 1.6,
        pickup: 0.45,
      });
    }
  }

  function updateFx(fx, dt) {
    for (var i = fx.sparkles.length - 1; i >= 0; i--) {
      var s = fx.sparkles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 400 * dt;
      s.life -= dt * 1.8;
      if (s.life <= 0) fx.sparkles.splice(i, 1);
    }
    for (var j = fx.bits.length - 1; j >= 0; j--) {
      var b = fx.bits[j];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 900 * dt;
      b.life -= dt;
      b.pickup -= dt;
      if (b.life <= 0) fx.bits.splice(j, 1);
    }
  }

  Billy.Fx = {
    create: function () {
      return { sparkles: [], bits: [] };
    },
    sparkleBurst: sparkleBurst,
    splash: splash,
    scatterSteaks: scatterSteaks,
    update: updateFx,
  };
})();
