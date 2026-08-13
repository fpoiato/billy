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

  function drawPaw(ctx, x, y) {
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 2.6, 0, 0, Math.PI * 2);
    paint(ctx, '#3d2918', '#24180e', 1.6);
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath();
    ctx.arc(x - 2.2, y - 1.2, 1.1, 0, Math.PI * 2);
    ctx.arc(x, y - 1.6, 1.1, 0, Math.PI * 2);
    ctx.arc(x + 2.2, y - 1.2, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLeg(ctx, hipX, hipY, swing, tuck) {
    var footX = hipX + swing;
    var footY = -1.5 + tuck;
    ctx.strokeStyle = '#d7a45c';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(hipX + swing * 0.25, (hipY + footY) * 0.55 + 4, footX, footY - 3);
    ctx.stroke();
    ctx.strokeStyle = '#c48a4a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(hipX + 0.5, hipY + 1);
    ctx.lineTo(footX, footY - 4);
    ctx.stroke();
    drawPaw(ctx, footX, footY);
  }

  function drawBilly(ctx, x, y, opt) {
    opt = opt || {};
    var t = opt.t || 0;
    var facing = opt.facing == null ? 1 : opt.facing;
    var run = !!opt.run;
    var air = !!opt.air;
    var hurt = !!opt.hurt;
    var scared = !!opt.scared;
    var bulge = opt.bulge || 0;
    var fat = bulge ? 0 : (opt.fat || 0);
    var blink = hurt && !bulge && Math.floor(t * 20) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    if (bulge) ctx.scale(1 - bulge * 0.22, 1 + bulge * 0.2);
    if (fat) ctx.scale(1 + fat * 0.7, 1 - fat * 0.12);

    var bob = air ? -3 : Math.sin(t * (run ? 16 : 5)) * (run ? 1.6 : 0.8);
    ctx.translate(0, bob);

    var gait = run ? t * 16 : t * 3;
    var amp = air ? 0 : run ? 7 : 1.4;
    var tuck = air ? -9 : 0;
    var backFar = Math.sin(gait) * amp;
    var backNear = Math.sin(gait + Math.PI) * amp;
    var frontFar = Math.sin(gait + Math.PI * 0.85) * amp;
    var frontNear = Math.sin(gait + Math.PI * 1.85) * amp;

    ctx.strokeStyle = '#c9a05a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, -16);
    ctx.quadraticCurveTo(-30, air ? -28 : -18, -26, air ? -22 : -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-26, air ? -22 : -8, 4.5, 3.2, -0.4, 0, Math.PI * 2);
    paint(ctx, '#e2b56a', '#8a5a28', 2);

    drawLeg(ctx, -12, -12, backFar, tuck);
    drawLeg(ctx, -7, -11, opt.pee ? 9 : backNear, tuck + (opt.pee ? -13 : 0));

    ctx.beginPath();
    ctx.ellipse(-2, -16, 20 + fat * 6, 13 + fat * 7, -0.12, 0, Math.PI * 2);
    paint(ctx, '#6d5b4a', '#3d2e22', 3);
    ctx.beginPath();
    ctx.ellipse(-6, -20, 14, 9, -0.2, 0, Math.PI * 2);
    paint(ctx, '#5a6a78', '#3a4450', 2);
    ctx.beginPath();
    ctx.ellipse(6, -16, 10, 8, 0.15, 0, Math.PI * 2);
    paint(ctx, '#e8c48a', '#a07840', 2);

    drawLeg(ctx, 8, -11, frontFar, tuck);
    drawLeg(ctx, 13, -10, frontNear, tuck);

    ctx.beginPath();
    ctx.ellipse(12, -22, 9, 8, 0.2, 0, Math.PI * 2);
    paint(ctx, '#e0b56a', '#8a5a28', 2.5);

    ctx.beginPath();
    ctx.ellipse(10, -36, 6, 11, -0.55, 0, Math.PI * 2);
    paint(ctx, '#c48a4a', '#6b3f1c', 2.5);
    ctx.beginPath();
    ctx.ellipse(22, -34, 5.5, 10, 0.45, 0, Math.PI * 2);
    paint(ctx, '#c48a4a', '#6b3f1c', 2.5);

    ctx.beginPath();
    ctx.ellipse(16, -28, 12, 11, 0.08, 0, Math.PI * 2);
    paint(ctx, '#e8c07a', '#8a5a28', 3);

    ctx.beginPath();
    ctx.ellipse(10, -35, 3, 6, -0.55, 0, Math.PI * 2);
    paint(ctx, '#f0c4b0', '#c48a4a', 1);
    ctx.beginPath();
    ctx.ellipse(22, -33, 2.8, 5.5, 0.45, 0, Math.PI * 2);
    paint(ctx, '#f0c4b0', '#c48a4a', 1);

    ctx.beginPath();
    ctx.ellipse(15, -38, 7, 5, -0.2, 0, Math.PI * 2);
    paint(ctx, '#d4a05a', '#8a5a28', 2);

    ctx.beginPath();
    ctx.ellipse(26, -24, 6.5, 5, 0.1, 0, Math.PI * 2);
    paint(ctx, '#f3d7b0', '#b08958', 2);

    roundRect(ctx, 6, -20, 16, 6, 3);
    paint(ctx, '#2b6cff', '#163a8a', 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(9, -18.5, 4, 3.2);
    ctx.fillRect(15, -18.5, 4, 3.2);
    ctx.beginPath();
    ctx.arc(14, -13, 5.2, 0, Math.PI * 2);
    paint(ctx, '#ffd24a', '#b8860b', 2);
    ctx.fillStyle = '#5a3516';
    ctx.font = 'bold 6px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.scale(facing, 1);
    ctx.fillText('Billy', 14 * facing, -13);
    ctx.restore();

    var eyeY = scared || bulge ? -29 : -30;
    var erx = 3.6 + bulge * 6.5;
    var ery = 4.2 + bulge * 7.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(20, eyeY, erx, ery, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2414';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.arc(21, eyeY + (scared ? 0.8 : 0.2), bulge ? 1.1 : scared ? 2.1 : 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(21.8, eyeY - 1 - bulge, bulge ? 0.5 : 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(31, -24, 2.6, 2, 0, 0, Math.PI * 2);
    paint(ctx, '#1a120c', '#1a120c', 1);

    var bark = !!opt.bark;
    ctx.strokeStyle = '#5a3516';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (bark) {
      ctx.ellipse(28, -20.5, 4.4, 3.6, 0.12, 0, Math.PI * 2);
      paint(ctx, '#3a1810', '#1a0c08', 1.4);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(36, -26, 7 + Math.sin(t * 28) * 1.6, -0.45, 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(40, -26, 11 + Math.sin(t * 28) * 1.6, -0.35, 0.35);
      ctx.stroke();
    } else if (opt.eat) {
      ctx.ellipse(28, -20.5, 3.8, 3.2 + Math.abs(Math.sin(t * 18)) * 2, 0.1, 0, Math.PI * 2);
      paint(ctx, '#3a1810', '#1a0c08', 1.2);
    } else if (bulge) {
      ctx.ellipse(26, -20, 3.2 + bulge * 2, 3.4 + bulge * 2.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (scared) {
      ctx.arc(26, -21, 3.2, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.arc(26, -22, 3.4, 0.15, Math.PI - 0.15, true);
      ctx.stroke();
    }
    if (!scared && !bulge && !bark && !opt.eat) {
      ctx.beginPath();
      ctx.ellipse(27, -20, 2.2, 2.6, 0.2, 0, Math.PI);
      paint(ctx, '#ff7a9a', '#c45a70', 1);
    }

    if (opt.poop) {
      ctx.fillStyle = 'rgba(110, 72, 32, 0.92)';
      var blob = 4 + Math.sin(t * 20) * 1.2;
      ctx.beginPath();
      ctx.ellipse(-18, -4, 3.2, blob, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opt.pee) {
      ctx.strokeStyle = 'rgba(255, 214, 70, 0.92)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      var len = 10 + Math.sin(t * 28) * 2;
      ctx.beginPath();
      ctx.moveTo(-15, -7);
      ctx.quadraticCurveTo(-24, 0, -20, len);
      ctx.stroke();
    }

    if (opt.wet) {
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.strokeStyle = 'rgba(160, 210, 230, 0.7)';
      ctx.lineWidth = 1.2;
      var bubbles = [
        [4, -22, 4.2],
        [-8, -18, 3.4],
        [16, -14, 3.8],
        [-2, -8, 2.8],
        [10, -28, 3.2],
        [22, -20, 2.6],
      ];
      for (var bi = 0; bi < bubbles.length; bi++) {
        var bu = bubbles[bi];
        var br = bu[2] + Math.sin(t * 10 + bi) * 0.5;
        ctx.beginPath();
        ctx.arc(bu[0], bu[1], br, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(90, 180, 255, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(6, 4 + Math.sin(t * 16) * 2);
      ctx.moveTo(18, -8);
      ctx.lineTo(20, 3 + Math.sin(t * 14) * 2);
      ctx.moveTo(-6, -10);
      ctx.lineTo(-8, 2 + Math.sin(t * 18) * 1.6);
      ctx.stroke();
    }

    ctx.restore();

    if (bark) {
      roundRect(ctx, x - 18, y - 64, 36, 18, 8);
      paint(ctx, '#fff', '#1a3a6b', 2);
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 46);
      ctx.lineTo(x + 1, y - 39);
      ctx.lineTo(x + 7, y - 46);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#1a3a6b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#1a3a6b';
      ctx.font = 'bold 11px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Au!', x, y - 55);
    }
  }

  function drawDuck(ctx, x, y, t, scale, facing) {
    scale = scale || 1;
    facing = facing == null ? 1 : facing;
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 6) * 2);
    ctx.scale(facing * scale, scale);
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

  function drawLoveHeart(ctx, x, y, s, a) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = a == null ? 1 : Math.max(0, a);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-12, -2, -8, -12, 0, -6);
    ctx.bezierCurveTo(8, -12, 12, -2, 0, 6);
    paint(ctx, '#ff5a7a', '#a31d3a', 2);
    ctx.restore();
  }

  function drawCensored(ctx, x, y, w) {
    w = w || 120;
    var h = 28;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CENSURADO', x, y + 1);
    ctx.restore();
  }

  function drawCoupleKiss(ctx, midX, feetY, t, facing, hearts) {
    facing = facing == null ? 1 : facing;
    hearts = hearts || [];
    var i;
    for (i = 0; i < hearts.length; i++) {
      drawLoveHeart(ctx, hearts[i].x, hearts[i].y, hearts[i].s, hearts[i].life);
    }
    drawBilly(ctx, midX - 16 * facing, feetY, {
      t: t,
      facing: facing,
      run: false,
      bark: false,
    });
    drawDuck(ctx, midX + 16 * facing, feetY - 16, t, 1, -facing);
    drawCensored(ctx, midX, feetY - 38, 128);
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

  function drawPup(ctx, x, y, t, facing, bark) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 12) * 1.2);
    ctx.scale(facing == null ? 1 : facing, 1);
    ctx.strokeStyle = '#8a5a28';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-20, -8 + Math.sin(t * 14) * 4, -16, -12);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-2, 2, 12, 8, -0.15, 0, Math.PI * 2);
    paint(ctx, '#e8dcc8', '#8a6a40', 2);
    ctx.beginPath();
    ctx.ellipse(-6, 2, 3.5, 2.5, 0, 0, Math.PI * 2);
    paint(ctx, '#c48a4a', '#8a5a28', 1);
    ctx.beginPath();
    ctx.ellipse(10, -4, 8, 7, 0.1, 0, Math.PI * 2);
    paint(ctx, '#e8dcc8', '#8a6a40', 2);
    roundRect(ctx, 4, -2, 12, 5, 2);
    paint(ctx, '#e85d4c', '#8a2a22', 1);
    ctx.beginPath();
    ctx.ellipse(6, -10, 4, 5, -0.5, 0, Math.PI * 2);
    paint(ctx, '#c48a4a', '#8a5a28', 1.5);
    ctx.beginPath();
    ctx.ellipse(14, -9, 3.2, 4.5, 0.4, 0, Math.PI * 2);
    paint(ctx, '#c48a4a', '#8a5a28', 1.5);
    ctx.beginPath();
    ctx.ellipse(16, -2, 4, 3, 0.1, 0, Math.PI * 2);
    paint(ctx, '#f3e6d0', '#c4a070', 1);
    ctx.beginPath();
    ctx.arc(18, -3, 1.4, 0, Math.PI * 2);
    paint(ctx, '#1a120c', '#1a120c', 1);
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(12, -5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    if (bark) {
      ctx.strokeStyle = '#1a3a6b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(24, -6, 7 + Math.sin(t * 28) * 1.4, -0.45, 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(28, -6, 11 + Math.sin(t * 28) * 1.4, -0.35, 0.35);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBird(ctx, x, y, t, facing) {
    ctx.save();
    var hop = Math.abs(Math.sin(t * 14)) * 3;
    ctx.translate(x, y - hop);
    ctx.scale(facing == null ? 1 : facing, 1);
    ctx.strokeStyle = '#c79212';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(-4, 10);
    ctx.moveTo(3, 6);
    ctx.lineTo(4, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 1, 8, 6, 0, 0, Math.PI * 2);
    paint(ctx, '#ffe14a', '#c79212', 2);
    ctx.beginPath();
    ctx.ellipse(-1, 2, 5, 3, -0.3, 0, Math.PI * 2);
    paint(ctx, '#ffd24a', '#c79212', 1);
    ctx.beginPath();
    ctx.arc(7, -3, 5, 0, Math.PI * 2);
    paint(ctx, '#ffe14a', '#c79212', 2);
    ctx.beginPath();
    ctx.moveTo(11, -3);
    ctx.lineTo(16, -1);
    ctx.lineTo(11, 0);
    ctx.closePath();
    paint(ctx, '#e85d4c', '#8a2a22', 1);
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(8, -4, 1.2, 0, Math.PI * 2);
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

  function drawYard(ctx, x, y, opt) {
    opt = opt || {};
    var beach = !!opt.beach;
    var tone = opt.tone || 0;
    var walls = beach
      ? ['#fff6e8', '#ffe7b8', '#f3d2b3']
      : ['#f3d2b3', '#ffe7b8', '#d4e8dc'];
    var roofs = beach
      ? ['#e85d4c', '#4aa3ff', '#c48a4a']
      : ['#e85d4c', '#4aa3ff', '#6b8f71'];
    var wall = walls[tone % walls.length];
    var roof = roofs[tone % roofs.length];
    var layer = opt.layer || 'all';

    if (layer !== 'fence') {
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 78);
      ctx.lineTo(x + 62, y - 118);
      ctx.lineTo(x + 132, y - 78);
      ctx.closePath();
      paint(ctx, roof, '#5a3516', 3);
      roundRect(ctx, x, y - 80, 124, 80, 4);
      paint(ctx, wall, '#5a3516', 3);
      roundRect(ctx, x + 14, y - 62, 22, 22, 3);
      paint(ctx, '#8ecfff', '#1a3a6b', 2);
      roundRect(ctx, x + 88, y - 62, 22, 22, 3);
      paint(ctx, '#8ecfff', '#1a3a6b', 2);
      roundRect(ctx, x + 48, y - 48, 22, 48, 3);
      paint(ctx, '#8b5a2b', '#3a2414', 2);
      ctx.beginPath();
      ctx.arc(x + 64, y - 24, 3, 0, Math.PI * 2);
      paint(ctx, '#ffd24a', '#b8860b', 1);
    }

    if (layer !== 'house') {
      ctx.fillStyle = '#c48a4a';
      ctx.strokeStyle = '#5a3516';
      ctx.lineWidth = 3;
      ctx.fillRect(x + 18, y - 12, 6, 12);
      ctx.strokeRect(x + 18, y - 12, 6, 12);
      ctx.fillStyle = '#e8dcc8';
      ctx.strokeStyle = '#8a6a40';
      ctx.lineWidth = 2;
      roundRect(ctx, x - 2, y - 34, 128, 22, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#8a6a40';
      ctx.lineWidth = 2;
      for (var i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 8 + i * 16, y - 32);
        ctx.lineTo(x + 8 + i * 16, y - 14);
        ctx.stroke();
      }
      roundRect(ctx, x + 50, y - 32, 24, 20, 2);
      paint(ctx, '#c48a4a', '#5a3516', 2);
      ctx.fillStyle = '#5a3516';
      ctx.fillRect(x + 60, y - 24, 5, 8);
    }
  }

  function drawHydrant(ctx, x, y) {
    roundRect(ctx, x + 4, y - 28, 14, 28, 4);
    paint(ctx, '#e85d4c', '#8a2a22', 2);
    ctx.fillStyle = '#c45c3a';
    ctx.fillRect(x, y - 18, 6, 8);
    ctx.fillRect(x + 16, y - 18, 6, 8);
    ctx.beginPath();
    ctx.arc(x + 11, y - 30, 8, 0, Math.PI * 2);
    paint(ctx, '#e85d4c', '#8a2a22', 2);
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(x + 8, y - 33, 6, 5);
  }

  function drawShower(ctx, x, y) {
    ctx.strokeStyle = '#6b7380';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 6, y);
    ctx.lineTo(x + 6, y - 70);
    ctx.lineTo(x + 22, y - 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 22, y - 66, 8, 4, 0, 0, Math.PI * 2);
    paint(ctx, '#9aa7b8', '#4a5568', 2);
    ctx.strokeStyle = 'rgba(74, 163, 255, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 18, y - 62);
    ctx.lineTo(x + 14, y - 40);
    ctx.moveTo(x + 22, y - 62);
    ctx.lineTo(x + 22, y - 36);
    ctx.moveTo(x + 26, y - 62);
    ctx.lineTo(x + 30, y - 40);
    ctx.stroke();
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

  function drawFloor(ctx, cam, theme, groundY, width, height) {
    if (theme === true) theme = 'night';
    if (!theme || theme === false) theme = 'house';
    var pal = {
      house: { fill: '#c48a4a', line: 'rgba(90,40,16,0.35)', top: '#8b5a2b', edge: '#5a3516', shine: '#e8c48a' },
      night: { fill: '#3d2a4a', line: 'rgba(20,10,28,0.35)', top: '#6b4e7a', edge: '#2a1a38', shine: '#8a6a9a' },
      street: { fill: '#4a4a58', line: 'rgba(20,20,28,0.4)', top: '#6a6a78', edge: '#2a2a32', shine: '#c4c4d0' },
      beach: { fill: '#e8c48a', line: 'rgba(160,110,50,0.35)', top: '#d4a05a', edge: '#a07840', shine: '#ffe7b8' },
      grandma: { fill: '#d4a074', line: 'rgba(120,70,30,0.3)', top: '#c48a5a', edge: '#8a5a2b', shine: '#f0d0a8' },
    }[theme] || {
      fill: '#c48a4a', line: 'rgba(90,40,16,0.35)', top: '#8b5a2b', edge: '#5a3516', shine: '#e8c48a',
    };

    ctx.fillStyle = pal.fill;
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, width, height - groundY);
    ctx.clip();
    var offset = -((cam.x % 56) + 56) % 56;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 3;
    for (var x = offset; x < width + 56; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = pal.top;
    ctx.fillRect(0, groundY, width, 14);
    ctx.fillStyle = pal.edge;
    ctx.fillRect(0, groundY, width, 4);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(0, groundY + 14, width, 3);
  }

  function drawCitySky(ctx, cam, w, h, groundY) {
    groundY = groundY == null ? h - 80 : groundY;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5eb0ff');
    g.addColorStop(1, '#ffe0a8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-cam.x * 0.12, 0);
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath();
    ctx.arc(180, 78, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-cam.x * 0.32, 0);
    var colors = ['#7aa0c8', '#8eb4d4', '#6b90b8', '#9bb8d8'];
    for (var i = 0; i < 14; i++) {
      var bx = i * 160 - 40;
      var bh = 90 + (i % 4) * 36;
      ctx.fillStyle = colors[i % colors.length];
      roundRect(ctx, bx, groundY - bh, 120 + (i % 3) * 18, bh, 6);
      ctx.fill();
      ctx.fillStyle = '#ffe27a';
      for (var wy = 0; wy < 4; wy++) {
        var yy = groundY - bh + 18 + wy * 28;
        if (yy + 14 > groundY - 10) continue;
        ctx.fillRect(bx + 16, yy, 12, 14);
        ctx.fillRect(bx + 40, yy, 12, 14);
        ctx.fillRect(bx + 64, yy, 12, 14);
      }
    }
    ctx.restore();
  }

  function drawBeachSky(ctx, cam, w, h, groundY) {
    groundY = groundY == null ? h - 80 : groundY;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7ec8ff');
    g.addColorStop(0.55, '#ffe7b8');
    g.addColorStop(1, '#4aa3ff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(-cam.x * 0.12, 0);
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath();
    ctx.arc(200, 70, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(-cam.x * 0.22, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (var i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 280 + 40, 90, 46, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#3d9ae8';
    ctx.fillRect(0, groundY - 36, w, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, groundY - 36, w, 6);
  }

  function drawGrandmaSky(ctx, cam, w, h, groundY) {
    groundY = groundY == null ? h - 80 : groundY;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f7d9b8');
    g.addColorStop(1, '#f3c4c8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(-cam.x * 0.3, 0);
    ctx.fillStyle = '#f8e6d2';
    for (var j = 0; j < 12; j++) {
      roundRect(ctx, j * 300 - 20, 80, 260, Math.max(40, groundY - 80), 10);
      ctx.fill();
      ctx.fillStyle = '#8ecfff';
      ctx.fillRect(j * 300 + 30, 130, 40, 44);
      ctx.fillRect(j * 300 + 100, 130, 40, 44);
      ctx.fillStyle = '#f8e6d2';
    }
    ctx.restore();
  }

  function drawScene(ctx, cam, theme, night, bright, w, h, groundY) {
    if (theme === 'street') drawCitySky(ctx, cam, w, h, groundY);
    else if (theme === 'beach') drawBeachSky(ctx, cam, w, h, groundY);
    else if (theme === 'grandma') drawGrandmaSky(ctx, cam, w, h, groundY);
    else drawHouseSky(ctx, cam, night, bright, w, h, groundY);
    drawFloor(ctx, cam, night ? 'night' : theme, groundY, w, h);
  }

  function drawPuddle(ctx, x, y, t, kind) {
    ctx.save();
    if (kind === 'coco') {
      ctx.fillStyle = '#6b3f1c';
      ctx.strokeStyle = '#3d2e22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 11, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x - 3, y - 5, 6, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x + 4, y - 8, 4.5, 4, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'soap') {
      ctx.fillStyle = 'rgba(170, 220, 255, 0.55)';
      ctx.strokeStyle = 'rgba(120, 180, 210, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 16 + Math.sin(t * 3) * 1.4, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(x - 6, y - 3, 3.2 + Math.sin(t * 8) * 0.4, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 4, 4 + Math.sin(t * 7) * 0.5, 0, Math.PI * 2);
      ctx.arc(x + 1, y - 1, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 214, 70, 0.55)';
      ctx.strokeStyle = 'rgba(196, 150, 40, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 15 + Math.sin(t * 2) * 1.2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCar(ctx, x, y, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir || 1, 1);
    roundRect(ctx, -40, -18, 80, 24, 8);
    paint(ctx, '#ff5a7a', '#a31d3a', 3);
    roundRect(ctx, -12, -32, 36, 16, 6);
    paint(ctx, '#8ecfff', '#1a3a6b', 3);
    ctx.beginPath();
    ctx.arc(-24, 8, 8, 0, Math.PI * 2);
    ctx.arc(26, 8, 8, 0, Math.PI * 2);
    paint(ctx, '#2b3038', '#111', 2);
    ctx.restore();
  }

  function drawSkater(ctx, x, y, t, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir || 1, 1);
    roundRect(ctx, -16, 22, 32, 6, 3);
    paint(ctx, '#ffd24a', '#c79212', 2);
    ctx.beginPath();
    ctx.arc(-10, 28, 4, 0, Math.PI * 2);
    ctx.arc(10, 28, 4, 0, Math.PI * 2);
    paint(ctx, '#2b3038', '#111', 2);
    roundRect(ctx, -8, -4, 16, 24, 6);
    paint(ctx, '#4aa3ff', '#163a8a', 3);
    ctx.beginPath();
    ctx.arc(0, -12, 8, 0, Math.PI * 2);
    paint(ctx, '#f3d7b0', '#b08958', 2);
    ctx.restore();
  }

  function drawCat(ctx, x, y, t, facing) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 10) * 1);
    ctx.scale(facing == null ? 1 : facing, 1);
    roundRect(ctx, -12, -6, 24, 14, 6);
    paint(ctx, '#c48a4a', '#6b3f1c', 2);
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-12, -16);
    ctx.lineTo(-2, -6);
    ctx.moveTo(2, -6);
    ctx.lineTo(8, -16);
    ctx.lineTo(10, -6);
    paint(ctx, '#c48a4a', '#6b3f1c', 2);
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(-4, -2, 1.4, 0, Math.PI * 2);
    ctx.arc(4, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawManhole(ctx, x, y, w) {
    ctx.save();
    ctx.fillStyle = '#2b3038';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 4, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawCrab(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    paint(ctx, '#e85d4c', '#8a2a22', 2);
    ctx.strokeStyle = '#8a2a22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-18, -6 + Math.sin(t * 12) * 2);
    ctx.moveTo(12, 0);
    ctx.lineTo(18, -6 + Math.cos(t * 12) * 2);
    ctx.stroke();
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(-4, -2, 1.4, 0, Math.PI * 2);
    ctx.arc(4, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWave(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(74, 163, 255, 0.7)';
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.25, y - 6, x + w * 0.5, y + 4);
    ctx.quadraticCurveTo(x + w * 0.75, y - 8, x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawSeagull(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    var flap = Math.sin(t * 10) * 8;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, flap);
    ctx.quadraticCurveTo(0, -6, 16, -flap);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    paint(ctx, '#fff', '#4a5568', 2);
    ctx.restore();
  }

  function drawPalm(ctx, x, y) {
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - 50, x, y - 100);
    ctx.stroke();
    ctx.fillStyle = '#3cb46a';
    ctx.strokeStyle = '#1f6b3a';
    ctx.lineWidth = 3;
    for (var i = 0; i < 5; i++) {
      var a = -1.2 + i * 0.6;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 28, y - 100 + Math.sin(a) * 10, 22, 8, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawCastle(ctx, x, y) {
    roundRect(ctx, x - 28, y - 36, 56, 36, 4);
    paint(ctx, '#f3d7b0', '#b08958', 3);
    ctx.fillStyle = '#e8c48a';
    ctx.fillRect(x - 28, y - 48, 12, 14);
    ctx.fillRect(x - 6, y - 48, 12, 14);
    ctx.fillRect(x + 16, y - 48, 12, 14);
    ctx.fillStyle = '#4aa3ff';
    ctx.fillRect(x - 8, y - 24, 16, 18);
  }

  function drawNeedle(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#9aa7b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.lineTo(28, 0);
    ctx.stroke();
    ctx.fillStyle = '#ff5a7a';
    ctx.beginPath();
    ctx.arc(-32, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawYarn(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 4);
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    paint(ctx, '#ff8a1a', '#c45a00', 3);
    ctx.strokeStyle = '#fff6d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0.2, 2.4);
    ctx.stroke();
    ctx.restore();
  }

  function drawVase(ctx, x, y) {
    roundRect(ctx, x, y, 22, 32, 8);
    paint(ctx, '#e85d4c', '#8a2a22', 3);
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(x + 6, y + 8, 10, 6);
  }

  function drawGate(ctx, x, y) {
    ctx.fillStyle = '#4a4a58';
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 4;
    ctx.fillRect(x, y - 130, 14, 130);
    ctx.fillRect(x + 70, y - 130, 14, 130);
    ctx.fillRect(x, y - 130, 84, 12);
    for (var i = 0; i < 5; i++) {
      ctx.fillRect(x + 8 + i * 14, y - 118, 5, 118);
    }
  }

  function drawBigDog(ctx, x, y, t, opt) {
    opt = opt || {};
    ctx.save();
    ctx.translate(x, y + (opt.down ? 10 : 0));
    ctx.scale(opt.dir || -1, 1);
    roundRect(ctx, -28, -28, 56, 32, 12);
    paint(ctx, '#6d5b4a', '#3d2e22', 3);
    ctx.beginPath();
    ctx.ellipse(22, opt.down ? -18 : -30, 16, 14, 0.1, 0, Math.PI * 2);
    paint(ctx, '#6d5b4a', '#3d2e22', 3);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(26, opt.down ? -16 : -32, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a120c';
    ctx.beginPath();
    ctx.arc(27, opt.down ? -16 : -32, 2, 0, Math.PI * 2);
    ctx.fill();
    if (opt.bark) {
      ctx.strokeStyle = '#1a3a6b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(36, -28, 8 + Math.sin(t * 20) * 2, -0.4, 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCamila(ctx, x, y, t, opt) {
    opt = opt || {};
    var dir = opt.dir == null ? -1 : opt.dir;
    var grab = !!opt.grab;
    var tired = !!opt.tired;
    var happy = !!opt.happy;
    ctx.save();
    ctx.translate(x, y + (tired ? 8 : Math.sin(t * (grab ? 18 : 12)) * (grab ? 2 : 1.4)));
    ctx.scale(dir, 1);

    ctx.strokeStyle = '#f3d7b0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(-10, -4);
    ctx.moveTo(10, -18);
    ctx.lineTo(10, -4);
    ctx.stroke();

    var armY = grab ? -36 : tired ? -28 : -40;
    var armX = grab ? 16 : tired ? 8 : 28;
    ctx.strokeStyle = '#f3d7b0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-8, -48);
    ctx.quadraticCurveTo(-armX, armY, grab ? -6 : -armX, grab ? -22 : -32);
    ctx.moveTo(8, -48);
    ctx.quadraticCurveTo(armX, armY, grab ? 6 : armX, grab ? -22 : -32);
    ctx.stroke();

    roundRect(ctx, -16, -58, 32, 36, 10);
    paint(ctx, '#ff6ba8', '#c44578', 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -50, 16, 8);

    ctx.beginPath();
    ctx.arc(0, -72, 14, 0, Math.PI * 2);
    paint(ctx, '#f3d7b0', '#b08958', 3);
    ctx.beginPath();
    ctx.ellipse(-2, -82, 16, 10, -0.2, 0, Math.PI * 2);
    paint(ctx, '#4a2a18', '#2a1810', 2);
    ctx.beginPath();
    ctx.ellipse(12, -78, 6, 10, 0.5, 0, Math.PI * 2);
    paint(ctx, '#4a2a18', '#2a1810', 2);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-5, -72, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.ellipse(5, -72, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.arc(-4, -72, 1.6, 0, Math.PI * 2);
    ctx.arc(6, -72, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c45a70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (grab) ctx.arc(0, -66, 5, 0.15, Math.PI - 0.15);
    else ctx.arc(0, -65, 4.5, 0.2, Math.PI - 0.2, true);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#c44578';
    ctx.lineWidth = 2;
    ctx.font = 'bold 8px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.scale(dir, 1);
    ctx.strokeText('Camila', 0, -42);
    ctx.fillText('Camila', 0, -42);
    ctx.restore();

    if (grab) {
      ctx.fillStyle = '#ff5a7a';
      ctx.font = 'bold 12px Trebuchet MS, sans-serif';
      ctx.fillText('♥', -22, -88);
      ctx.fillText('♥', 18, -90);
    }
    ctx.restore();
  }

  function drawMayra(ctx, x, y, t, opt) {
    opt = opt || {};
    var dir = opt.dir == null ? -1 : opt.dir;
    var bath = !!opt.bath;
    var tired = !!opt.tired;
    var happy = !!opt.happy;
    ctx.save();
    ctx.translate(x, y + (tired ? 8 : Math.sin(t * (bath ? 16 : 12)) * (bath ? 2.2 : 1.4)));
    ctx.scale(dir, 1);

    ctx.strokeStyle = '#f3d7b0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(-10, -6);
    ctx.moveTo(10, -18);
    ctx.lineTo(10, -6);
    ctx.stroke();
    ctx.fillStyle = '#f0d24a';
    ctx.strokeStyle = '#c4a012';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-10, -4, 7, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -4, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    var armY = bath ? -34 : tired ? -26 : -42;
    var armX = bath ? 14 : tired ? 8 : 26;
    ctx.strokeStyle = '#f3d7b0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -48);
    ctx.quadraticCurveTo(-armX, armY, bath ? -8 : -armX, bath ? -24 : -30);
    ctx.moveTo(8, -48);
    ctx.quadraticCurveTo(armX, armY, bath ? 10 : armX, bath ? -22 : tired ? -24 : -34);
    ctx.stroke();

    var mopX = bath ? 12 : tired ? 12 : 26;
    var mopY = bath ? -24 : tired ? -22 : -34;
    var mopTipX = bath ? 6 : tired ? 20 : 20;
    var mopTipY = bath ? -80 : tired ? -38 : -84;
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mopX, mopY);
    ctx.lineTo(mopTipX, mopTipY);
    ctx.stroke();
    ctx.strokeStyle = '#7a8794';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var s = -3; s <= 3; s++) {
      ctx.moveTo(mopTipX, mopTipY + 1);
      ctx.quadraticCurveTo(mopTipX + s * 3.2, mopTipY - 7, mopTipX + s * 5, mopTipY - 16);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(mopTipX, mopTipY, 8, 3.4, 0, 0, Math.PI * 2);
    paint(ctx, '#9aa7b8', '#5a6570', 1.6);

    if (!tired) {
      var soapX = bath ? -12 : -armX - 2;
      var soapY = bath ? -26 : -32;
      roundRect(ctx, soapX - 6, soapY - 4, 12, 8, 2);
      paint(ctx, '#ffb6d8', '#c45a88', 1.5);
    }

    roundRect(ctx, -16, -58, 32, 38, 10);
    paint(ctx, '#4ec4c4', '#2a7a7a', 3);
    ctx.fillStyle = '#e8f6f6';
    ctx.fillRect(-8, -50, 16, 8);
    ctx.fillStyle = '#2f9a9a';
    roundRect(ctx, -8, -38, 16, 12, 3);
    ctx.fill();

    ctx.fillStyle = '#f0d24a';
    ctx.strokeStyle = '#c4a012';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(bath ? -8 : -armX, bath ? -24 : -30, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mopX, mopY, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -72, 14, 0, Math.PI * 2);
    paint(ctx, '#f3d7b0', '#b08958', 3);
    ctx.beginPath();
    ctx.ellipse(0, -84, 8.5, 6.5, 0, 0, Math.PI * 2);
    paint(ctx, '#3d2416', '#1a1008', 2);
    ctx.beginPath();
    ctx.ellipse(0, -78, 15, 7, 0, 0, Math.PI * 2);
    paint(ctx, '#3d2416', '#1a1008', 2);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-5, -72, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.ellipse(5, -72, 3.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.arc(-4, bath ? -71.2 : -72, 1.6, 0, Math.PI * 2);
    ctx.arc(6, bath ? -71.2 : -72, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2414';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -78);
    ctx.lineTo(-2, -76);
    ctx.moveTo(8, -78);
    ctx.lineTo(2, -76);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 140, 150, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-8, -67, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -67, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c45a70';
    ctx.lineCap = 'round';
    ctx.lineWidth = bath || happy ? 2.4 : 2;
    ctx.beginPath();
    if (tired) ctx.arc(0, -65, 4.2, 0.3, Math.PI - 0.3, true);
    else if (bath || happy) ctx.arc(0, -67, 6, 0.12, Math.PI - 0.12);
    else ctx.arc(0, -66, 4.8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2a7a7a';
    ctx.lineWidth = 2;
    ctx.font = 'bold 8px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.scale(dir, 1);
    ctx.strokeText('Mayra', 0, -42);
    ctx.fillText('Mayra', 0, -42);
    ctx.restore();

    if (bath) {
      ctx.strokeStyle = 'rgba(90, 180, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -26);
      ctx.quadraticCurveTo(-4, -8, 2, 2 + Math.sin(t * 20) * 3);
      ctx.moveTo(8, -22);
      ctx.quadraticCurveTo(4, -6, -2, 4 + Math.sin(t * 18) * 2);
      ctx.moveTo(0, -30);
      ctx.lineTo(1, 6 + Math.sin(t * 22) * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(-14, -40, 4 + Math.sin(t * 12) * 0.8, 0, Math.PI * 2);
      ctx.arc(16, -48, 5 + Math.sin(t * 10) * 0.7, 0, Math.PI * 2);
      ctx.arc(0, -20, 3.6, 0, Math.PI * 2);
      ctx.arc(10, -8, 4.2, 0, Math.PI * 2);
      ctx.arc(-8, -6, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawShadow(ctx, x, y, air) {
    ctx.save();
    ctx.fillStyle = 'rgba(40, 22, 10, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y, air ? 9 : 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGranny(ctx, x, y, t, opt) {
    opt = opt || {};
    var feed = !!opt.feed;
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 3) * 1.2);

    ctx.strokeStyle = '#f3d7b0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(-8, -4);
    ctx.moveTo(8, -16);
    ctx.lineTo(8, -4);
    ctx.stroke();

    roundRect(ctx, -18, -52, 36, 40, 10);
    paint(ctx, '#9b7bb8', '#5a3d78', 3);
    ctx.fillStyle = '#e8c48a';
    ctx.fillRect(-10, -44, 20, 8);

    ctx.beginPath();
    ctx.arc(0, -64, 13, 0, Math.PI * 2);
    paint(ctx, '#f3d7b0', '#b08958', 3);
    ctx.beginPath();
    ctx.ellipse(0, -74, 14, 9, 0, 0, Math.PI * 2);
    paint(ctx, '#c8c4c0', '#8a8680', 2);
    ctx.beginPath();
    ctx.arc(0, -80, 6, 0, Math.PI * 2);
    paint(ctx, '#c8c4c0', '#8a8680', 2);

    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-5, -64, 4.2, 0, Math.PI * 2);
    ctx.arc(5, -64, 4.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1, -64);
    ctx.lineTo(1, -64);
    ctx.stroke();
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.arc(-5, -64, 1.4, 0, Math.PI * 2);
    ctx.arc(5, -64, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff7a9a';
    ctx.beginPath();
    ctx.ellipse(-8, -58, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -58, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c45a70';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -56, 3.2, 0.2, Math.PI - 0.2, true);
    ctx.stroke();

    var plateY = feed ? -28 : -36;
    ctx.beginPath();
    ctx.ellipse(22, plateY, 12, 4, 0.1, 0, Math.PI * 2);
    paint(ctx, '#fff6e8', '#b08958', 2);
    roundRect(ctx, 16, plateY - 10, 10, 8, 2);
    paint(ctx, '#ffb6c8', '#c45a70', 1.5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(18, plateY - 8, 6, 2);
    ctx.beginPath();
    ctx.ellipse(28, plateY - 5, 5, 2.4, 0.4, 0, Math.PI * 2);
    paint(ctx, '#e8a05a', '#8a5a28', 1);
    ctx.strokeStyle = '#e8dcc8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(31, plateY - 5);
    ctx.lineTo(36, plateY - 10);
    ctx.stroke();

    ctx.restore();
  }

  Billy.Draw = {
    roundRect: roundRect,
    paint: paint,
    billy: drawBilly,
    duck: drawDuck,
    loveHeart: drawLoveHeart,
    censored: drawCensored,
    coupleKiss: drawCoupleKiss,
    steak: drawSteak,
    pup: drawPup,
    bird: drawBird,
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
    yard: drawYard,
    hydrant: drawHydrant,
    shower: drawShower,
    rug: drawRug,
    houseSky: drawHouseSky,
    citySky: drawCitySky,
    beachSky: drawBeachSky,
    grandmaSky: drawGrandmaSky,
    scene: drawScene,
    floor: drawFloor,
    shadow: drawShadow,
    puddle: drawPuddle,
    car: drawCar,
    skater: drawSkater,
    cat: drawCat,
    manhole: drawManhole,
    crab: drawCrab,
    wave: drawWave,
    seagull: drawSeagull,
    palm: drawPalm,
    castle: drawCastle,
    needle: drawNeedle,
    yarn: drawYarn,
    vase: drawVase,
    gate: drawGate,
    bigDog: drawBigDog,
    camila: drawCamila,
    mayra: drawMayra,
    granny: drawGranny,
  };
})();
