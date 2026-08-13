var Billy = Billy || {};

(function () {
  var canvas = document.getElementById('game');
  var C = Billy.CONFIG;

  function fit() {
    canvas.width = C.WIDTH;
    canvas.height = C.HEIGHT;
  }

  fit();
  window.addEventListener('resize', fit);
  Billy.Game.start(canvas);
})();
