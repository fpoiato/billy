var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function draw(ctx, state) {
    var p = state.player;
    ctx.save();
    Billy.Display.apply(ctx);
    var top = (Billy.Display.safeTop || 0) + 12;

    ctx.fillStyle = 'rgba(12, 24, 48, 0.35)';
    round(ctx, 12, top, 250, 52, 12);
    ctx.fill();

    for (var i = 0; i < p.lives; i++) {
      Billy.Draw.bone(ctx, 32 + i * 34, top + 26, 1.05);
    }

    Billy.Draw.steak(ctx, 160, top + 26, state.t);
    ctx.fillStyle = '#fff6d8';
    ctx.strokeStyle = '#3a2414';
    ctx.lineWidth = 3;
    ctx.font = 'bold 22px Trebuchet MS, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.strokeText(String(p.steaks), 178, top + 26);
    ctx.fillText(String(p.steaks), 178, top + 26);

    ctx.font = 'bold 16px Trebuchet MS, sans-serif';
    ctx.textAlign = 'right';
    ctx.strokeText(state.level.name, C.WIDTH - 110, top + 16);
    ctx.fillText(state.level.name, C.WIDTH - 110, top + 16);

    if (state.showTimer) {
      var sec = Math.max(0, state.elapsed | 0);
      var mm = String(Math.floor(sec / 60)).padStart(2, '0');
      var ss = String(sec % 60).padStart(2, '0');
      ctx.strokeText(mm + ':' + ss, C.WIDTH - 110, top + 38);
      ctx.fillText(mm + ':' + ss, C.WIDTH - 110, top + 38);
    }

    ctx.font = '10px Trebuchet MS, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('v' + Billy.APP_VERSION, C.WIDTH / 2, C.HEIGHT - 10 - (Billy.Display.safeBottom || 0));
    ctx.restore();
  }

  function round(ctx, x, y, w, h, r) {
    Billy.Draw.roundRect(ctx, x, y, w, h, r);
  }

  Billy.Hud = { draw: draw };
})();
