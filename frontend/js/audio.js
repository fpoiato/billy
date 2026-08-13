var Billy = Billy || {};

(function () {
  var ctx = null;
  var muted = false;
  var musicOff = false;
  var musicTimer = null;
  var musicKind = null;
  var startedAt = 0;

  try {
    musicOff = localStorage.getItem('billy-music-off') === '1';
  } catch (e) {}

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, gain, slide) {
    var a = ac();
    if (!a || muted) return;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), a.currentTime + dur);
    g.gain.setValueAtTime(gain || 0.08, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  }

  function noise(dur, gain) {
    var a = ac();
    if (!a || muted) return;
    var n = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
    var d = n.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = a.createBufferSource();
    var g = a.createGain();
    var f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    src.buffer = n;
    g.gain.setValueAtTime(gain || 0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    src.connect(f);
    f.connect(g);
    g.connect(a.destination);
    src.start();
  }

  var TUNES = {
    day: [
      [0, 523], [0.22, 659], [0.44, 784], [0.66, 659],
      [0.88, 587], [1.1, 659], [1.32, 784], [1.54, 880],
    ],
    night: [
      [0, 392], [0.3, 466], [0.6, 523], [0.9, 466],
      [1.2, 349], [1.5, 392],
    ],
    boss: [
      [0, 196], [0.2, 233], [0.4, 196], [0.6, 247],
      [0.8, 196], [1.0, 175],
    ],
    street: [
      [0, 392], [0.18, 523], [0.36, 587], [0.54, 784],
      [0.72, 659], [0.9, 587], [1.08, 523], [1.26, 659],
    ],
    beach: [
      [0, 587], [0.24, 659], [0.48, 784], [0.72, 880],
      [0.96, 784], [1.2, 659],
    ],
    grandma: [
      [0, 349], [0.28, 440], [0.56, 523], [0.84, 494],
      [1.12, 440], [1.4, 392],
    ],
  };

  function playTune(kind) {
    var a = ac();
    if (!a || muted || musicOff) return;
    var notes = TUNES[kind] || TUNES.day;
    var t0 = a.currentTime;
    for (var i = 0; i < notes.length; i++) {
      var freq = notes[i][1];
      if (!freq) continue;
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = kind === 'boss' ? 'sawtooth' : 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.035, t0 + notes[i][0]);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + notes[i][0] + 0.28);
      o.connect(g);
      g.connect(a.destination);
      o.start(t0 + notes[i][0]);
      o.stop(t0 + notes[i][0] + 0.3);
    }
  }

  function startMusic(kind) {
    musicKind = kind;
    stopMusic();
    if (musicOff) return;
    playTune(kind);
    var period = kind === 'night' || kind === 'grandma' ? 2100 : kind === 'boss' ? 1400 : kind === 'beach' ? 1900 : 1800;
    musicTimer = setInterval(function () {
      playTune(musicKind);
    }, period);
  }

  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  Billy.Audio = {
    unlock: function () { ac(); },
    toggleMute: function () {
      muted = !muted;
      if (muted) stopMusic();
      else if (musicKind && !musicOff) startMusic(musicKind);
      return muted;
    },
    toggleMusic: function () {
      musicOff = !musicOff;
      try { localStorage.setItem('billy-music-off', musicOff ? '1' : '0'); } catch (e) {}
      if (musicOff) stopMusic();
      else if (musicKind && !muted) startMusic(musicKind);
      Billy.Audio.syncButton();
      return musicOff;
    },
    isMuted: function () { return muted; },
    isMusicOff: function () { return musicOff; },
    syncButton: function () {
      var el = document.getElementById('btn-music');
      if (!el) return;
      var off = musicOff;
      el.classList.toggle('is-off', off);
      el.setAttribute('aria-pressed', off ? 'true' : 'false');
      el.setAttribute('aria-label', off ? 'Ligar música' : 'Desligar música');
      el.querySelector('.label').textContent = off ? 'Música off' : 'Música';
    },
    jump: function () { beep(620, 0.12, 'square', 0.07, 420); },
    stomp: function () { beep(180, 0.16, 'triangle', 0.1, 90); },
    steak: function () { beep(880, 0.09, 'sine', 0.07); },
    hurt: function () { beep(220, 0.28, 'sawtooth', 0.08, 80); },
    extraLife: function () {
      beep(523, 0.12, 'square', 0.08);
      setTimeout(function () { beep(659, 0.12, 'square', 0.08); }, 90);
      setTimeout(function () { beep(784, 0.18, 'square', 0.08); }, 180);
    },
    win: function () {
      beep(523, 0.15, 'triangle', 0.09);
      setTimeout(function () { beep(659, 0.15, 'triangle', 0.09); }, 120);
      setTimeout(function () { beep(784, 0.15, 'triangle', 0.09); }, 240);
      setTimeout(function () { beep(1046, 0.28, 'triangle', 0.1); }, 360);
    },
    tally: function () { beep(988, 0.05, 'sine', 0.045); },
    tallyDone: function () {
      beep(659, 0.1, 'triangle', 0.08);
      setTimeout(function () { beep(880, 0.16, 'triangle', 0.09); }, 90);
      setTimeout(function () { beep(1175, 0.22, 'triangle', 0.1); }, 180);
    },
    bark: function () { noise(0.18, 0.16); beep(140, 0.2, 'sawtooth', 0.06, 90); },
    yip: function () {
      noise(0.08, 0.11);
      beep(640, 0.09, 'square', 0.075, 340);
    },
    squeak: function () {
      beep(520, 0.12, 'square', 0.07, 880);
      setTimeout(function () { beep(700, 0.18, 'square', 0.06, 1100); }, 80);
    },
    kiss: function () {
      beep(659, 0.1, 'sine', 0.06);
      setTimeout(function () { beep(784, 0.12, 'sine', 0.07); }, 90);
      setTimeout(function () { beep(988, 0.16, 'sine', 0.06); }, 180);
    },
    pee: function () { noise(0.2, 0.05); beep(160, 0.22, 'sine', 0.035, 80); },
    music: startMusic,
    stopMusic: stopMusic,
    startedAt: function () { return startedAt; },
    markStart: function () { startedAt = Date.now(); },
  };
})();
