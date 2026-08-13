var Billy = Billy || {};

(function () {
  var keys = Object.create(null);
  var jumpPressed = false;
  var jumpHeld = false;
  var left = false;
  var right = false;
  var touch = false;

  function isJumpKey(code) {
    return code === 'Space' || code === 'ArrowUp' || code === 'KeyW';
  }

  function isLeft(code) {
    return code === 'ArrowLeft' || code === 'KeyA';
  }

  function isRight(code) {
    return code === 'ArrowRight' || code === 'KeyD';
  }

  function bindHold(el, on, off) {
    if (!el) return;
    var down = function (e) {
      e.preventDefault();
      on();
    };
    var up = function (e) {
      e.preventDefault();
      off();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
  }

  Billy.Input = {
    setup: function () {
      window.addEventListener('keydown', function (e) {
        if (isJumpKey(e.code) || isLeft(e.code) || isRight(e.code)) e.preventDefault();
        if (!keys[e.code]) {
          keys[e.code] = true;
          if (isJumpKey(e.code)) jumpPressed = true;
        }
        if (isJumpKey(e.code)) jumpHeld = true;
        if (isLeft(e.code)) left = true;
        if (isRight(e.code)) right = true;
      });
      window.addEventListener('keyup', function (e) {
        keys[e.code] = false;
        if (isJumpKey(e.code)) jumpHeld = false;
        if (isLeft(e.code)) left = false;
        if (isRight(e.code)) right = false;
      });

      var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var touchRoot = document.getElementById('touch');
      if (touchRoot && (coarse || 'ontouchstart' in window)) {
        touch = true;
      }
      bindHold(document.getElementById('btn-left'), function () { left = true; }, function () { left = false; });
      bindHold(document.getElementById('btn-right'), function () { right = true; }, function () { right = false; });
      bindHold(document.getElementById('btn-jump'), function () {
        jumpPressed = true;
        jumpHeld = true;
      }, function () { jumpHeld = false; });
    },

    usesTouch: function () { return touch; },
    snapshot: function () {
      var s = {
        left: left,
        right: right,
        jump: jumpHeld,
        jumpPressed: jumpPressed,
        dir: (right ? 1 : 0) - (left ? 1 : 0),
        touch: touch,
      };
      jumpPressed = false;
      return s;
    },
  };
})();
