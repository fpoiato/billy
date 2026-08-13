var Billy = Billy || {};

(function () {
  var canvas = document.getElementById('game');

  function fit() {
    Billy.Display.fit(canvas);
  }

  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () {
    setTimeout(fit, 80);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fit);
  }
  Billy.Game.start(canvas);

  var musicBtn = document.getElementById('btn-music');
  if (musicBtn) {
    musicBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      Billy.Audio.toggleMusic();
    });
  }
  Billy.Audio.syncButton();
})();
