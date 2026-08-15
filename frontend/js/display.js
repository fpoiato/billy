var Billy = Billy || {};

(function () {
  var C = Billy.CONFIG;

  function viewSize() {
    var vv = window.visualViewport;
    return {
      w: Math.max(1, (vv && vv.width) || window.innerWidth || 960),
      h: Math.max(1, (vv && vv.height) || window.innerHeight || 540),
    };
  }

  function cssPx(name) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    var n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  }

  function playSize(view) {
    var height = 540;
    var width = Math.round(height * (view.w / Math.max(1, view.h)));
    var minW = C.MIN_VIEW_WIDTH || 560;
    if (width < minW) width = minW;
    if (width > 1920) width = 1920;
    var scale = Math.min(view.w / width, view.h / height);
    var cssW = width * scale;
    var cssH = height * scale;
    return {
      width: width,
      height: height,
      scale: scale,
      cssW: cssW,
      cssH: cssH,
      left: (view.w - cssW) / 2,
      top: (view.h - cssH) / 2,
    };
  }

  Billy.Display = {
    dpr: 1,
    gen: 0,
    playSize: playSize,
    fit: function (canvas) {
      var view = viewSize();
      var play = playSize(view);
      var prevW = C.WIDTH;
      C.HEIGHT = play.height;
      C.WIDTH = play.width;

      var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.style.left = play.left + 'px';
      canvas.style.top = play.top + 'px';
      canvas.style.width = play.cssW + 'px';
      canvas.style.height = play.cssH + 'px';
      canvas.width = Math.max(1, Math.round(C.WIDTH * dpr));
      canvas.height = Math.max(1, Math.round(C.HEIGHT * dpr));
      this.dpr = canvas.width / C.WIDTH;

      var letterboxed = play.top > 8 || play.left > 8;
      this.safeTop = letterboxed ? 0 : cssPx('--sa-top') * (C.HEIGHT / Math.max(1, play.cssH));
      this.safeBottom = letterboxed ? 0 : cssPx('--sa-bottom') * (C.HEIGHT / Math.max(1, play.cssH));
      if (prevW !== C.WIDTH) this.gen += 1;
    },
    apply: function (ctx) {
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },
    requestFullscreen: function () {
      var el = document.getElementById('wrap') || document.documentElement;
      var req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen;
      if (req) {
        try {
          var p = req.call(el);
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      }
      try { window.scrollTo(0, 1); } catch (e2) {}
    },
  };
})();
