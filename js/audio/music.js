/* The soundtrack, synthesized like the interface sounds. Nine pieces, each
   a loop of chords with a soft pad, a bass and a quiet arpeggio, follow the
   state of the game:

     Eurocrisis  the default: D minor, steady and uneasy
     Draghi      for three years after a Draghi measure: F major, warmer
     Troika      while the bank sits in a Troika: A minor, slow and austere
     Superbad    a Troika and a Draghi measure at once: B, with a diminished
                 chord, square tones, bells and a slow kick
     Bankrupt    when a run ends badly: C minor, very slow
     Ode to Joy  when a period ends with no grade better than the record:
                 the status quo kept and the crisis no smaller. The
                 melody of the European anthem (Beethoven, 1824, public
                 domain) in D major, over plain chords
     October     the move into the Federation: the end of the first period
                 (when it did better than the status quo) and the year 2041:
                 a march in E minor
     Kremlin     every federal year from 2042 until the period ends: a slow
                 hymn with bells in G minor (the name is ironic)
     Finally     when a period ends well, and in calm years (a strong
                 backstop, unemployment at or below 8%, inflation between
                 0 and 3%, no loan program): G major, bright

   Every voice plays at a fixed level, so the music stays even, and the
   whole runs well below the interface sounds. Bankrupt, Superbad and
   Troika come first, then Ode to Joy, then October, then Finally, then Draghi, then
   Eurocrisis (or Kremlin in the Federation). A change of piece waits for
   the next downbeat (the next half bar in the slowest pieces), where the
   piece playing stops adding notes and fades quickly; the new piece swells
   in from zero over two seconds, its drums entering on its second bar. The
   time-lapse comes and goes more slowly: Bella ciao, or the piece after
   it, swells in over four.
   Settings > Sound turns
   the music on (it is off by default), sets its volume, and turns each
   piece on or off with its own volume; a piece that is off falls back to
   Eurocrisis. Music pauses while the tab is hidden or unfocused, unless Settings >
   Sound > General > In the background keeps it playing.

   Before a game, on the title screen and the form for a new game, nine
   more pieces play: Strasbourg by default (D major, stately, after the
   seat of the European Parliament), or, when Settings > Appearance asks
   for the title theme's own music, the piece of the chosen theme:
   Subsidiarity (Popular, a slow chorale with bells in B flat), Solidarity
   (Social, an oom-pah march with a brass tune in A minor), Ever Closer
   (Renew, bright and syncopated pop in E flat), Green Deal (Green, a
   pastoral flute over a drone in G), Nations (Conservative, a waltz with
   bells in F), Borders (Patriot, a drummed march with a bugle tune in D
   minor), Own Money (Sovereign, a sparse music box in C minor) and Another
   Europe (Left, a rising tune over pumping bass, offbeat stabs and soft
   drums in B minor). A theme's
   piece that is off defaults to Strasbourg. */
(function () {
  var S = window.ECBSIM;
  /* The pieces are data (js/data/music/) */
  var PIECES = S.MUSIC.pieces, TITLE = S.MUSIC.title, ORDER = S.MUSIC.order, TITLE_ORDER = S.MUSIC.titleOrder;
  var ctx = null, musicGain = null, pieceGain = null, filter = null;
  var current = null, timer = null, nextTime = 0, step = 0, forced = null, forcedTimer = null, gentle = false;
  var LOOKAHEAD = 0.25;

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  /* A variant of the resistance playlist, and the time-lapse, follow the
     switch and volume of the piece they stand for */
  function setting(k) { var b = PIECES[k] && PIECES[k].base; return (S.settings.tracks || {})[b || k] || { on: true, vol: 80 }; }

  /* A period that ended with no grade better than the record's C */
  var sqCache = { G: null, year: null, v: false };
  function statusQuo(G) {
    if (sqCache.G !== G || sqCache.year !== G.year) {
      var g = S.game.grades(G);
      sqCache = { G: G, year: G.year, v: Object.keys(g).every(function (k) { return !g[k] || !g[k].l || g[k].l >= "C"; }) };
    }
    return sqCache.v;
  }
  /* The piece of the chosen playlist: the resistance playlist plays each
     piece's variant, for the game, the title screen and a preview alike */
  function inList(k) { return k && S.settings.playlist === "resistance" && S.MUSIC.resistance[k] ? S.MUSIC.resistance[k] : k; }
  function isFocused() { return S.pageFocused(); }
  /* Unless playing in the background is on, the music pauses while the
     tab is hidden or the window has lost the focus (see pause) */
  function away() { return !isFocused() && !S.settings.musicHidden; }
  /* Which piece the game calls for now */
  function wanted() {
    /* The sound switch in the toolbar silences the music too */
    if (!S.settings.sound) { return null; }
    /* The soundtrack switch silences a preview and the song too */
    if (!S.settings.music) { return null; }
    if (forced) { return inList(forced); }
    var G = S.G, k = "eurocrisis";
    /* Before a game: Strasbourg, or the title theme's own piece */
    if (!G) {
      var th = S.settings.titleTheme;
      /* A custom theme plays the piece chosen for it */
      var own = th === "custom" || S.settings.titleMusic !== false;
      if (th === "custom") { th = (S.settings.titleCustom || {}).music; }
      k = th && PIECES[th] && own && setting(th).on ? th : "strasbourg";
      return setting(k).on ? inList(k) : null;
    }
    if (G && G.year >= 2041) { k = "kremlin"; }
    if (G) {
      var troika = Object.keys(G.programs || {}).some(function (c) { var p = G.programs[c]; return p && p.active && p.role === "troika"; });
      var draghi = Object.keys(G.used.draghi).some(function (m) { return G.year - G.used.draghi[m] < 3; });
      var ea = G.ea && G.ea.v, program = Object.keys(G.programs || {}).some(function (c) { return G.programs[c] && G.programs[c].active; });
      var calm = ea && ea.B >= 0.6 && ea.u <= 8 && ea.p >= 0 && ea.p <= 3 && !program;
      /* October marks the move into the Federation: the end of the first
         period (unless it kept the status quo) and the first federal year */
      var october = G.finished === "pre" ? !statusQuo(G) : G.year === 2041 && !G.finished;
      if (G.over) { k = "bankrupt"; } else if (troika && draghi) { k = "superbad"; } else if (troika) { k = "troika"; } else if (G.finished && statusQuo(G)) { k = "ode"; }
      else if (october) { k = "october"; } else if (G.finished) { k = "finally"; } else if (G.year >= 2041) { k = "kremlin"; }
      else if (calm) { k = "finally"; } else if (draghi) { k = "draghi"; }
    }
    if (!setting(k).on) { k = G && G.year >= 2041 && setting("kremlin").on ? "kremlin" : "eurocrisis"; }
    if (!setting(k).on) { return null; }
    return inList(k);
  }

  function build() {
    if (ctx) { return true; }
    ctx = S.sound.context();
    if (!ctx || !S.sound.out()) { ctx = null; return false; }
    musicGain = ctx.createGain();
    pieceGain = ctx.createGain(); pieceGain.gain.value = 0;
    filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 2400; filter.Q.value = 0.5;
    pieceGain.connect(filter); filter.connect(musicGain); musicGain.connect(S.sound.out());
    apply();
    return true;
  }
  function apply() {
    if (!ctx) { return; }
    /* At full volume the music peaks at about a fifth of a click */
    musicGain.gain.setTargetAtTime((S.settings.musicVolume == null ? 50 : S.settings.musicVolume) / 100 * 0.45, ctx.currentTime, 0.1);
    if (current) { pieceGain.gain.setTargetAtTime(Math.max(0.0001, setting(current).vol / 100), ctx.currentTime, 0.1); }
  }

  /* Voices, each at a fixed level */
  function env(t, a, hold, r, level) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + a);
    g.gain.setValueAtTime(level, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
    g.connect(pieceGain);
    return g;
  }
  function osc(type, f, t, end, to, detune) {
    var o = ctx.createOscillator();
    o.type = type; o.frequency.value = f; if (detune) { o.detune.value = detune; }
    o.connect(to); o.start(t); o.stop(end + 0.05);
  }
  function pad(notes, t, dur) {
    notes.forEach(function (m) {
      var g = env(t, 0.9, Math.max(0.1, dur - 0.9), 1.4, 0.022);
      osc("sine", hz(m), t, t + dur + 2.4, g);
      osc("triangle", hz(m), t, t + dur + 2.4, g, 5);
    });
  }
  /* Louder tones play softer, so every voice keeps its level */
  var SOFT = { square: 0.5, sawtooth: 0.5, sine: 1.2, triangle: 1 };
  function lead(m, t, dur, wave) {
    var g = env(t, 0.02, Math.max(0.05, dur * 0.75), 0.35, 0.03 * SOFT[wave || "triangle"]);
    osc(wave || "triangle", hz(m), t, t + dur + 0.5, g);
    osc("sine", hz(m + 12), t, t + dur + 0.5, env(t, 0.02, Math.max(0.05, dur * 0.6), 0.3, 0.008));
  }
  /* A bass of another tone (a piece's bassWave) plays softer, as the lead does */
  function bass(m, t, dur, wave) { osc(wave || "sine", hz(m), t, t + dur + 0.6, env(t, 0.03, dur * 0.6, 0.5, 0.07 * (wave ? SOFT[wave] * 0.6 : 1))); }
  function arp(m, t, wave) { osc(wave || "triangle", hz(m), t, t + 0.6, env(t, 0.01, 0.02, 0.45, 0.016 * SOFT[wave || "triangle"])); }
  /* A soft kick (a falling sine) or a short tick */
  function drum(kind, t) {
    var o = ctx.createOscillator(), g = kind === 1 ? env(t, 0.004, 0.02, 0.16, 0.08) : env(t, 0.002, 0.005, 0.04, 0.006);
    o.type = kind === 1 ? "sine" : "square";
    o.frequency.setValueAtTime(kind === 1 ? 110 : 1800, t);
    if (kind === 1) { o.frequency.exponentialRampToValueAtTime(45, t + 0.14); }
    o.connect(g); o.start(t); o.stop(t + 0.3);
  }
  function bell(m, t) {
    var g = env(t, 0.005, 0.01, 1.8, 0.012);
    osc("sine", hz(m), t, t + 2, g);
    osc("sine", hz(m) * 2.76, t, t + 1, env(t, 0.005, 0.01, 0.7, 0.004));
  }

  /* The scheduler: one step is an eighth note; eight steps make a bar.
     A change of piece waits for the next downbeat (pending), so the piece
     playing ends its bar and the next begins on the beat */
  var pending = null;
  function tick() {
    if (!current) { return; }
    var p = PIECES[current], eighth = 60 / p.bpm / 2, len = p.len || 8, bp = p.bass || [1, 0, 0, 0, 1, 0, 0, 0];
    /* A hidden tab runs timers less often, so notes are scheduled further ahead */
    while (nextTime < ctx.currentTime + (document.hidden ? 1.5 : LOOKAHEAD)) {
      if (pending && nextTime >= pending.at - 0.001) {
        var k = pending.k, slow = pending.slow; pending = null;
        if (!k) { stopAt(nextTime); return; }
        handOver(k, nextTime, false, slow);
        p = PIECES[current]; eighth = 60 / p.bpm / 2; len = p.len || 8; bp = p.bass || [1, 0, 0, 0, 1, 0, 0, 0];
      }
      var bar = p.bars[Math.floor(step / len) % p.bars.length], e = step % len;
      if (e === 0 && !p.noPad) { pad(bar.slice(1), nextTime, eighth * len); }
      if (bp[e]) {
        var hold = 1; while (e + hold < len && !bp[e + hold]) { hold++; }
        bass(bar[0] + [0, 0, 7, 12][bp[e]], nextTime, eighth * hold, p.bassWave);
      }
      var i = p.arp[e];
      if (i >= 0) { arp(bar[1 + i] + 12, nextTime, p.wave); }
      if (p.bell && (e === 0 || e === len / 2)) { bell(bar[3] + 12, nextTime); }
      /* The drums come in on the second bar, after the piece has entered */
      if (p.drum && p.drum[e] && step >= len) { drum(p.drum[e], nextTime); }
      if (p.notes) { var n = p.notes[step % (p.bars.length * len)]; if (n) { lead(n[0], nextTime, n[1] * eighth * 2, p.leadWave); } }
      nextTime += eighth;
      step++;
    }
  }
  /* Each piece plays through a gain of its own. At a change the piece
     before schedules no more notes, and its gain fades quickly so its last
     notes do not blur the change. The next piece swells in from zero over
     two seconds (four for the time-lapse). Because the next piece always
     fades in, no coda is played: the coda is only fitting when the next
     piece starts at full volume immediately. quick lets the piece before go
     at once and brings the next in sooner. */
  function handOver(k, t, quick, slow, cross) {
    var old = pieceGain;
    /* A change of playlist crossfades: the piece before fades out as the
       next fades in, both over about half a second */
    if (cross) {
      if (old) {
        old.gain.cancelScheduledValues(t);
        old.gain.setTargetAtTime(0.0001, t, 0.12);
        setTimeout(function () { old.disconnect(); }, (t - ctx.currentTime + 2) * 1000);
      }
      current = k; step = 0; nextTime = t;
      pieceGain = ctx.createGain(); pieceGain.connect(filter);
      pieceGain.gain.setValueAtTime(0.0001, t);
      pieceGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, setting(k).vol / 100), t + 0.5);
      return;
    }
    if (old) {
      old.gain.cancelScheduledValues(t);
      old.gain.setTargetAtTime(0.0001, t, quick ? 0.05 : 0.15);
      setTimeout(function () { old.disconnect(); }, (t - ctx.currentTime + 3) * 1000);
    }
    current = k; step = 0; nextTime = t;
    pieceGain = ctx.createGain(); pieceGain.connect(filter);
    if (!old) {
      pieceGain.gain.setValueAtTime(Math.max(0.0001, setting(k).vol / 100), t);
    } else {
      pieceGain.gain.setValueAtTime(0.0001, t);
      pieceGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, setting(k).vol / 100), t + (quick ? 1.5 : slow ? 4 : 2));
    }
  }
  /* The music ends: the last notes ring out as the gain fades */
  function stopAt(t, quick) {
    if (pieceGain) {
      var old = pieceGain;
      old.gain.cancelScheduledValues(t);
      old.gain.setTargetAtTime(0.0001, t, quick ? 0.02 : 0.5);
      setTimeout(function () { old.disconnect(); }, (t - ctx.currentTime + (quick ? 0.5 : 5)) * 1000);
      pieceGain = null;
    }
    current = null; pending = null; paused = false;
    if (timer) { clearInterval(timer); timer = null; }
  }
  function start(k) {
    handOver(k, ctx.currentTime + 0.1, false);
    if (!timer) { timer = setInterval(tick, 60); }
    tick();
  }
  /* The next downbeat of the piece playing, or the next half bar when a
     bar would keep the change waiting more than two seconds */
  function nextDownbeat() {
    var p = PIECES[current], eighth = 60 / p.bpm / 2, len = p.len || 8;
    var toBar = (len - step % len) % len;
    if (toBar * eighth > 2) { var half = Math.round(len / 2); toBar = (half - step % half) % half; }
    return nextTime + toBar * eighth;
  }
  /* Pausing the song hands the music back to the game's own soundtrack;
     resuming brings the song back where it stopped */
  var held = null, heldStep = 0;
  /* Leaving the tab or the window pauses the piece where it is, and
     coming back resumes it there, never from its start. The notes already
     scheduled ahead are let go with the gain they play through, and the
     step goes back to the note now sounding; on resume the piece comes in
     over 0.4 s, with the rest of its bar's chord */
  var paused = false;
  function pause() {
    if (!current || paused) { return; }
    var p = PIECES[current], eighth = 60 / p.bpm / 2, now = ctx.currentTime;
    step = Math.max(0, step - Math.round(Math.max(0, nextTime - now) / eighth));
    paused = true;
    if (timer) { clearInterval(timer); timer = null; }
    var old = pieceGain;
    old.gain.cancelScheduledValues(now);
    old.gain.setTargetAtTime(0.0001, now, 0.03);
    setTimeout(function () { old.disconnect(); }, 1000);
    pieceGain = ctx.createGain(); pieceGain.gain.value = 0.0001; pieceGain.connect(filter);
  }
  function resume() {
    if (!paused) { return; }
    paused = false;
    if (!current) { return; }
    var p = PIECES[current], eighth = 60 / p.bpm / 2, len = p.len || 8, t = ctx.currentTime + 0.05, e = step % len;
    nextTime = t;
    pieceGain.gain.setValueAtTime(0.0001, t);
    pieceGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, setting(current).vol / 100), t + 0.4);
    if (e && !p.noPad) { pad(p.bars[Math.floor(step / len) % p.bars.length].slice(1), t, eighth * (len - e)); }
    if (!timer) { timer = setInterval(tick, 60); }
    tick();
  }
  function pauseForced(value) {
    if (value && forced === "troikarun" && !held) {
      held = forced; heldStep = current === forced ? step : 0;
      forced = null;
      update();
    } else if (!value && held) {
      forced = held; held = null;
      update();
      if (current === forced) { step = heldStep; }
    }
    return !!held;
  }
  var lastForced = null, lastList = null;
  function update() {
    /* A gentle change (the time-lapse) is asked for once, by the call that sets it */
    var soft = gentle; gentle = false;
    var list = S.settings.playlist || "european", switched = lastList !== null && list !== lastList;
    lastList = list;
    var k = wanted();
    if (k && away()) { pause(); return; }
    if (paused) { if (!build()) { return; } resume(); }
    var target = pending ? pending.k : current;
    if (k === target) { return; }
    if (!build()) { return; }
    if (!current) { pending = null; if (k) { start(k); } return; }
    if (k === current) { pending = null; return; }
    /* Music turned off, or the tab hidden: the music stops now */
    if (!k) { stopAt(ctx.currentTime, true); return; }
    /* Leaving the title screen for a game, its piece stops at once, so none
       of it plays in the game; a preview from Settings starts at once too */
    var preview = forced !== lastForced;
    lastForced = forced;
    /* A change of playlist crossfades at once, with no coda */
    if (switched) {
      pending = null;
      handOver(k, ctx.currentTime + 0.05, false, false, true);
      return;
    }
    /* Entering or leaving the title screen, switching title themes, or a preview: switch at once */
    if (k && (TITLE[k] || TITLE[current] || (preview && !soft))) {
      pending = null;
      handOver(k, ctx.currentTime + 0.02, true);
      return;
    }
    pending = { k: k, at: nextDownbeat(), slow: soft };
  }

  S.music = {
    PIECES: PIECES, ORDER: ORDER, TITLE_ORDER: TITLE_ORDER,
    update: update,
    apply: function () { apply(); update(); },
    /* Plays one piece for 20 seconds, so its volume can be set */
    preview: function (k) { S.music.play(k, 20); },
    /* Plays one piece over whatever the game calls for: for sec seconds,
       or, without sec, in a loop until stopForced. With { gentle: true }
       it waits for the downbeat and comes in slowly, as at a change of
       piece, where a preview starts at once */
    play: function (k, sec, o) {
      forced = k; gentle = !!(o && o.gentle);
      if (forcedTimer) { clearTimeout(forcedTimer); forcedTimer = null; }
      if (sec) { forcedTimer = setTimeout(function () { forced = null; forcedTimer = null; update(); }, sec * 1000); }
      update();
    },
    /* Ends a piece played with play or preview; { gentle: true } lets it
       ring out slowly into the game's piece */
    stopForced: function (o) {
      held = null;
      if (!forced) { update(); return; }
      if (forcedTimer) { clearTimeout(forcedTimer); forcedTimer = null; }
      forced = null; gentle = !!(o && o.gentle);
      update();
    },
    /* Ends a preview, and leaves the song of the easter egg playing */
    stopPreview: function () {
      if (!forcedTimer) { return; }
      clearTimeout(forcedTimer); forcedTimer = null;
      forced = null;
      update();
    },
    pauseForced: pauseForced,
    forcedPaused: function () { return !!held; },
    /* One loop of a piece, in seconds */
    loopLength: function (k) { var p = PIECES[k]; return p.bars.length * (p.len || 8) * 30 / p.bpm; },
    playing: function () { return current; }
  };
  S.on("render", update);
  S.on("focus", update);
  /* The first gesture makes or resumes the audio context; the music starts then */
  ["pointerdown", "keydown", "touchend", "pointerup", "click"].forEach(function (k) {
    document.addEventListener(k, function () { update(); }, true);
  });
  update();
})();
