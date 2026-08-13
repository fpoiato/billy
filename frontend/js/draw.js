var Billy = Billy || {};

(function () {
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r || 8, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function paint(ctx, fill, stroke, lw) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke || '#2b1b12';
    ctx.lineWidth = lw == null ? 3 : lw;
    ctx.fill();
    ctx.stroke();
  }

  function drawBilly(ctx, x, y, opt) {
    opt = opt || {};
    var t = opt.t || 0;
    var facing = opt.facing == null ? 1 : opt.facing;
    var run = !!opt.run;
    var air = !!opt.air;
    var hurt = !!opt.hurt;
    var scared = !!opt.scared;
    var blink = hurt && Math.floor(t * 16) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    var bob = air ? 0 : Math.sin(t * (run ? 18 : 6)) * (run ? 2.4 : 1.2);
    ctx.translate(0, bob);

    var leg = air ? -6 : run ? Math.sin(t * 18) * 7 : 0;
    ctx.strokeStyle = '#8a4b1f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(-11, 18 + leg);
    ctx.moveTo(6, 10);
    ctx.lineTo(10, 18 - leg);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 12, 0, 0, Math.PI * 2);
    paint(ctx, '#e6b17a', '#7a4a24', 3);

    ctx.beginPath();
    ctx.ellipse(12, -10, 12, 11, 0.15, 0, Math.PI * 2);
    paint(ctx, '#e6b17a', '#7a4a24', 3);

    ctx.beginPath();
    ctx.ellipse(4, -20, 7, 11, -0.5, 0, Math.PI * 2);
    paint(ctx, '#8b5a2b', '#5a3516', 3);
    ctx.beginPath();
    ctx.ellipse(16, -18, 6, 10, 0.35, 0, Math.PI * 2);
    paint(ctx, '#8b5a2b', '#5a3516', 3);

    var stripeY = -1;
    roundRect(ctx, -10, stripeY, 22, 7, 3);
    paint(ctx, '#2b6cff', '#163a8a', 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-4, stripeY + 1, 5, 5);
    ctx.fillRect(6, stripeY + 1, 5, 5);

    ctx.beginPath();
    ctx.arc(8, 6, 5, 0, Math.PI * 2);
    paint(ctx, '#ffd24a', '#b8860b', 2);
    ctx.fillStyle = '#5a3516';
    ctx.font = 'bold 7px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.scale(facing, 1);
    ctx.fillText('B', 8 * facing, 6);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(15, -12, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(16, scared ? -11 : -12, scared ? 2.2 : 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(22, -8, 3.2, 2.2, 0, 0, Math.PI * 2);
    paint(ctx, '#3a2414', '#3a2414', 1);

    ctx.strokeStyle = '#3a2414';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (scared) {
      ctx.arc(18, -4, 4, 0.15, Math.PI - 0.15);
    } else {
      ctx.arc(18, -5, 4, 0.15, Math.PI - 0.15, true);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.quadraticCurveTo(-22, air ? -6 : 0, -16, 8);
    ctx.strokeStyle = '#c48a4a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }

  function drawDuck(ctx, x, y, t, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 6) * 2);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    paint(ctx, '#ffe14a', '#c79212', 3);
    ctx.beginPath();
    ctx.arc(12, -8, 8, 0, Math.PI * 2);
    paint(ctx, '#ffe14a', '#c79212', 3);
    ctx.beginPath();
    ctx.ellipse(20, -6, 7, 3.5, 0.1, 0, Math.PI * 2);
    paint(ctx, '#ff8a1a', '#c45a00', 2);
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(14, -10, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-2, 2, 7, 5, -0.4, 0, Math.PI * 2);
    paint(ctx, '#ffd24a', '#c79212', 2);
    ctx.restore();
  }

  function drawSteak(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 6 + x) * 3);
    ctx.rotate(Math.sin(t * 3) * 0.15);
    roundRect(ctx, -9, -6, 18, 12, 4);
    paint(ctx, '#c45c3a', '#6b2416', 3);
    ctx.fillStyle = '#f2c9b0';
    ctx.fillRect(-6, -3, 12, 6);
    ctx.restore();
  }

  function drawHeart(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 8) * 1.5);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-16, -2, -10, -16, 0, -8);
    ctx.bezierCurveTo(10, -16, 16, -2, 0, 8);
    paint(ctx, '#ff5a7a', '#a31d3a', 3);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(-4, -4, 3, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawVacuum(ctx, x, y, facing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing || 1, 1);
    roundRect(ctx, -24, -10, 40, 22, 8);
    paint(ctx, '#6b7380', '#2b3038', 3);
    ctx.beginPath();
    ctx.arc(18, 0, 10, 0, Math.PI * 2);
    paint(ctx, '#4aa3ff', '#163a8a', 3);
    ctx.strokeStyle = '#2b3038';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.quadraticCurveTo(-40, -18, -48, 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawBroom(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.fillStyle = '#d4a017';
    ctx.strokeStyle = '#7a4a24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -10);
    ctx.lineTo(34, 0);
    ctx.lineTo(14, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawMonster(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 10) * 2);
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
    paint(ctx, '#2a2048', '#120c22', 3);
    var glow = 0.6 + Math.sin(t * 8) * 0.3;
    ctx.fillStyle = 'rgba(255, 240, 120,' + glow + ')';
    ctx.beginPath();
    ctx.arc(-6, -2, 4, 0, Math.PI * 2);
    ctx.arc(6, -2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-6, -2, 1.6, 0, Math.PI * 2);
    ctx.arc(6, -2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSparkles(ctx, parts) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawBone(ctx, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#fff6d8';
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    roundRect(ctx, -8, -3, 16, 6, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8, -4, 4, 0, Math.PI * 2);
    ctx.arc(-8, 4, 4, 0, Math.PI * 2);
    ctx.arc(8, -4, 4, 0, Math.PI * 2);
    ctx.arc(8, 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawCheckpoint(ctx, x, y, on, t) {
    ctx.save();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 70);
    ctx.stroke();
    ctx.fillStyle = on ? '#3cb46a' : '#ff8a1a';
    ctx.strokeStyle = '#2b1b12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 70);
    ctx.lineTo(x + 34, y - 54 + Math.sin(t * 4) * 2);
    ctx.lineTo(x, y - 38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawBed(ctx, x, y) {
    roundRect(ctx, x - 90, y - 28, 180, 28, 8);
    paint(ctx, '#6b4a2b', '#3a2414', 3);
    roundRect(ctx, x - 80, y - 48, 160, 24, 10);
    paint(ctx, '#f4e8ff', '#8a6bb0', 3);
    roundRect(ctx, x - 90, y - 78, 24, 50, 6);
    paint(ctx, '#6b4a2b', '#3a2414', 3);
    roundRect(ctx, x + 66, y - 64, 24, 36, 6);
    paint(ctx, '#6b4a2b', '#3a2414', 3);
  }

  function drawSofa(ctx, x, y) {
    roundRect(ctx, x, y - 36, 110, 36, 8);
    paint(ctx, '#e85d4c', '#8a2a22', 3);
    roundRect(ctx, x - 8, y - 28, 16, 28, 6);
    roundRect(ctx, x + 102, y - 28, 16, 28, 6);
    ctx.fillStyle = '#e85d4c';
    ctx.strokeStyle = '#8a2a22';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
  }

  function drawFridge(ctx, x, y) {
    roundRect(ctx, x, y - 90, 44, 90, 6);
    paint(ctx, '#dfe7f2', '#4a5568', 3);
    ctx.fillStyle = '#9aa7b8';
    ctx.fillRect(x + 6, y - 82, 32, 36);
    ctx.fillRect(x + 6, y - 40, 32, 32);
  }

  function drawPlant(ctx, x, y) {
    roundRect(ctx, x, y - 18, 28, 18, 4);
    paint(ctx, '#c45c3a', '#6b2416', 3);
    ctx.fillStyle = '#3cb46a';
    ctx.strokeStyle = '#1f6b3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 34, 10, 16, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 22, y - 36, 10, 16, 0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 14, y - 48, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawDoor(ctx, x, y) {
    roundRect(ctx, x, y - 110, 54, 110, 6);
    paint(ctx, '#8b5a2b', '#3a2414', 3);
    ctx.beginPath();
    ctx.arc(x + 42, y - 50, 5, 0, Math.PI * 2);
    paint(ctx, '#ffd24a', '#b8860b', 2);
  }

  function drawRug(ctx, rug) {
    ctx.fillStyle = '#e85d4c';
    ctx.strokeStyle = '#8a2a22';
    ctx.lineWidth = 3;
    roundRect(ctx, rug.x, rug.y - 2, rug.w, 10, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd24a';
    for (var i = 8; i < rug.w - 8; i += 18) {
      ctx.fillRect(rug.x + i, rug.y + 1, 8, 4);
    }
  }

  function drawHouseSky(ctx, cam, night, brightness, w, h, groundY) {
    groundY = groundY == null ? h - 80 : groundY;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    if (night) {
      var b = brightness == null ? 0.22 : brightness;
      g.addColorStop(0, 'rgb(' + Math.floor(18 + 40 * b) + ',' + Math.floor(22 + 30 * b) + ',' + Math.floor(48 + 40 * b) + ')');
      g.addColorStop(1, 'rgb(' + Math.floor(40 + 50 * b) + ',' + Math.floor(36 + 40 * b) + ',' + Math.floor(70 + 40 * b) + ')');
    } else {
      g.addColorStop(0, '#7ec8ff');
      g.addColorStop(1, '#ffe7b8');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-cam.x * 0.15, 0);
    ctx.fillStyle = night ? 'rgba(255,255,220,0.7)' : '#fff6c8';
    for (var i = 0; i < 8; i++) {
      var cx = i * 420 + 80;
      ctx.beginPath();
      ctx.arc(cx, night ? 70 : 90, night ? 10 : 46, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cam.x * 0.35, 0);
    var wallH = Math.max(40, groundY - 120);
    ctx.fillStyle = night ? '#2a2450' : '#f3d2b3';
    for (var j = 0; j < 12; j++) {
      roundRect(ctx, j * 280 - 40, 120, 240, wallH, 12);
      ctx.fill();
      ctx.fillStyle = night ? '#ffd27a' : '#8ecfff';
      for (var wy = 0; wy < 3; wy++) {
        var wyY = 160 + wy * 70;
        if (wyY + 36 > groundY - 8) continue;
        ctx.fillRect(j * 280 + 20, wyY, 36, 36);
        ctx.fillRect(j * 280 + 90, wyY, 36, 36);
      }
      ctx.fillStyle = night ? '#2a2450' : '#f3d2b3';
    }
    ctx.restore();
  }

  function drawFloor(ctx, cam, night, groundY, width, height) {
    ctx.fillStyle = night ? '#3d2a4a' : '#c48a4a';
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, width, height - groundY);
    ctx.clip();
    var offset = -((cam.x % 56) + 56) % 56;
    ctx.strokeStyle = night ? 'rgba(20,10,28,0.35)' : 'rgba(90,40,16,0.35)';
    ctx.lineWidth = 3;
    for (var x = offset; x < width + 56; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = night ? '#6b4e7a' : '#8b5a2b';
    ctx.fillRect(0, groundY, width, 14);
    ctx.fillStyle = night ? '#2a1a38' : '#5a3516';
    ctx.fillRect(0, groundY, width, 4);
    ctx.fillStyle = night ? '#8a6a9a' : '#e8c48a';
    ctx.fillRect(0, groundY + 14, width, 3);
  }

  function drawShadow(ctx, x, y, air) {
    ctx.save();
    ctx.fillStyle = 'rgba(40, 22, 10, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y, air ? 9 : 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  Billy.Draw = {
    roundRect: roundRect,
    paint: paint,
    billy: drawBilly,
    duck: drawDuck,
    steak: drawSteak,
    heart: drawHeart,
    vacuum: drawVacuum,
    broom: drawBroom,
    monster: drawMonster,
    sparkles: drawSparkles,
    bone: drawBone,
    checkpoint: drawCheckpoint,
    bed: drawBed,
    sofa: drawSofa,
    fridge: drawFridge,
    plant: drawPlant,
    door: drawDoor,
    rug: drawRug,
    houseSky: drawHouseSky,
    floor: drawFloor,
    shadow: drawShadow,
  };
})();
