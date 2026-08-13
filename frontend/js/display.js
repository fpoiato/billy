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

  Billy.Display = {
    dpr: 1,
    fit: function (canvas) {
      var view = viewSize();
      C.HEIGHT = 540;
      C.WIDTH = Math.round(C.HEIGHT * (view.w / view.h));
      if (C.WIDTH < 360) C.WIDTH = 360;
      if (C.WIDTH > 1920) C.WIDTH = 1920;

      var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.style.width = view.w + 'px';
      canvas.style.height = view.h + 'px';
      canvas.width = Math.max(1, Math.round(C.WIDTH * dpr));
      canvas.height = Math.max(1, Math.round(C.HEIGHT * dpr));
      this.dpr = canvas.width / C.WIDTH;

      var rectH = view.h;
      this.safeTop = cssPx('--sa-top') * (C.HEIGHT / rectH);
      this.safeBottom = cssPx('--sa-bottom') * (C.HEIGHT / rectH);
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
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function () {});
      }
      try { window.scrollTo(0, 1); } catch (e2) {}
    },
  };
})();
