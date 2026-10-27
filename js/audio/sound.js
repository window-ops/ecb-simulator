/* Interface sounds, synthesized with the Web Audio API. Adapted from Selk
   (js/audio/sound.js and js/audio/sounds/interface.js): the audio context is
   made after the first gesture, the master chain runs through a high-pass
   filter and a compressor, the noise every burst is made of comes from a
   seeded generator (mulberry32), and every burst reads that noise from the
   same offset, rendered once into a buffer, so a control sounds the same
   each time.

   Six groups, each with its own level (Settings > Sound): clicks
   (buttons, choices, check boxes, lists, sliders, folding boxes, popovers,
   dialogs), alerts (warnings, results, notifications, refusals,
   achievements), votes, the end of a year, saves (saving, loading,
   importing, exporting, deleting) and typing (a key typed in a field, the
   pointer on a button; both off by default). A master switch and a master
   volume sit above them. Every sound (S.SOUND_LIST) has its own switch,
   volume and pitch (settings.sounds, kept only where they differ), and a
   seed (settings.soundSeed) reshapes the whole set: each seed gives every
   sound its own pitch, length and tone within set limits, the same each
   time; seed 0 is the set as designed. */
(function () {
  var S = window.ECBSIM;
  var ctx = null, master = null, out = null, bus = {}, noise = null, baked = {}, OFFSET = 0.5;
  var CATS = ["clicks", "alerts", "votes", "turn", "saves", "typing"];
  /* Every sound: [id, group, name, when it plays, on at first] */
  S.SOUND_LIST = [
    ["click", "clicks", "Click", "A button is pressed", true], ["select", "clicks", "Select", "A choice in a list, a tab or a radio button", true],
    ["open", "clicks", "Open", "A dialog opens", true], ["close", "clicks", "Close", "A dialog or a menu closes", true],
    ["check", "clicks", "Check", "A box is checked or a switch turned on", true], ["uncheck", "clicks", "Uncheck", "A box is cleared or a switch turned off", true],
    ["slide", "clicks", "Slide", "A slider moves", true], ["unfold", "clicks", "Unfold", "A folding box opens", true], ["fold", "clicks", "Fold", "A folding box closes", true],
    ["pop", "clicks", "Pop", "A definition or a popover opens, or goes back", true],
    ["notify", "alerts", "Notify", "A notification", true], ["alert", "alerts", "Alert", "A warning", true], ["good", "alerts", "Good", "A good result", true],
    ["bad", "alerts", "Bad", "A bad result", true], ["error", "alerts", "Error", "An action refused, such as a key that cannot be used or a file that is refused", true],
    ["achievement", "alerts", "Achievement", "An achievement unlocked", true],
    ["yes", "votes", "Yes", "A vote for", true], ["no", "votes", "No", "A vote against", true], ["gavel", "votes", "Gavel", "The result of a vote", true],
    ["turn", "turn", "End of a year", "A year ends", true],
    ["save", "saves", "Save", "A save is made or overwritten", true], ["load", "saves", "Load", "A save is loaded", true], ["import", "saves", "Import", "Saves are imported", true],
    ["export", "saves", "Export", "Saves are exported", true], ["delete", "saves", "Delete", "A save, an achievement or other data is deleted", true],
    ["type", "typing", "Typing", "A key typed in a text field", false], ["hover", "typing", "Pointer", "The pointer moves onto a button", false]
  ];
  var LIST = {};
  S.SOUND_LIST.forEach(function (x) { LIST[x[0]] = x; });
  /* How the sound now playing is shaped: its pitch, length, volume and
     tone colour, from its own settings and the seed (play sets it) */
  var shape = { p: 1, l: 1, v: 1, q: 1, wave: null, d: 0 };
  /* A number from 0 to 1 for a seed and a name, the same each time */
  function seeded(seed, name, n) {
    var h = (seed | 0) ^ 0x9e3779b9;
    for (var i = 0; i < name.length; i++) { h = Math.imul(h ^ name.charCodeAt(i), 0x85ebca6b); h ^= h >>> 13; }
    h = Math.imul(h ^ (n || 0), 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  /* The settings of one sound: on, volume (%) and pitch (semitones) */
  S.soundSetting = function (id) {
    var o = (S.settings.sounds || {})[id] || {}, d = LIST[id];
    return { on: o.on != null ? !!o.on : !!(d && d[4]), vol: o.vol != null ? o.vol : 100, pitch: o.pitch != null ? o.pitch : 0 };
  };
  function shapeFor(id) {
    var st = S.soundSetting(id), seed = S.settings.soundSeed | 0, p = Math.pow(2, st.pitch / 12), l = 1, q = 1, wave = null;
    if (seed) {
      /* Within limits: pitch from a fifth below to a fifth above in small
         steps, length from 80% to 125%, the filters a little wider or
         narrower, and some tones sine or triangle in place of the other */
      p *= Math.pow(2, (Math.round(seeded(seed, id, 1) * 14) - 7) / 12);
      l = 0.8 + seeded(seed, id, 2) * 0.45;
      q = 0.7 + seeded(seed, id, 3) * 0.7;
      wave = seeded(seed, id, 4) < 0.5 ? "sine" : "triangle";
    }
    return { p: p, l: l, v: st.vol / 100, q: q, wave: wave, d: 0 };
  }
  /* Whether the player has clicked, tapped or pressed a key yet. Before
     that the browser refuses to start an audio context and warns of it,
     so none is made until then */
  var gestured = !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
  function init(e) {
    if (e && e.isTrusted) { gestured = true; }
    if (ctx) { if (ctx.state === "suspended") { try { ctx.resume(); } catch (er) {} } return; }
    if (!gestured) { return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    /* A larger buffer than the default, which is made for the lowest
       latency: while the page is busy drawing at the start of a game, the
       default one ran dry and the sound crackled */
    try { ctx = new AC({ latencyHint: "balanced" }); } catch (e) { try { ctx = new AC(); } catch (e2) { ctx = null; return; } }
    master = ctx.createGain();
    var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 60; hp.Q.value = 0.7;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    master.connect(hp); hp.connect(comp); comp.connect(ctx.destination);
    out = comp;
    CATS.forEach(function (k) { bus[k] = ctx.createGain(); bus[k].connect(master); });
    noise = makeNoise(3436859, 1);
    apply();
    bake();
    if (ctx) {
      if (ctx.state === "suspended") {
        var resume = function () { if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} } };
        ["pointerdown", "keydown", "touchend", "pointerup", "click"].forEach(function (k) { document.addEventListener(k, resume, true); });
      }
      ctx.addEventListener("statechange", function () {
        if (ctx.state === "running" && S.music) { S.music.update(); }
      });
      /* The music waited for the context: it starts now */
      setTimeout(function () { if (S.music) { S.music.update(); } }, 0);
    }
  }
  ["pointerdown", "keydown", "touchend", "pointerup", "click"].forEach(function (k) { document.addEventListener(k, init, true); });
  init();
  /* The noise buffer: one second of pink-tinted noise from a fixed seed */
  function makeNoise(seed, seconds) {
    var len = Math.round(ctx.sampleRate * seconds), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), b0 = 0;
    function rnd() {
      seed = (seed + 0x6d2b79f5) | 0;
      var r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    }
    for (var i = 0; i < len; i++) { var w = rnd() * 2 - 1; b0 = 0.6 * b0 + 0.4 * w; d[i] = b0; }
    return buf;
  }
  function apply() {
    if (!ctx) { return; }
    var st = S.settings, t = ctx.currentTime;
    /* Sound (the toolbar button) silences everything; Interface sounds only these */
    master.gain.setValueAtTime(st.sound && st.uiSound !== false ? st.volume / 100 : 0, t);
    CATS.forEach(function (k) { bus[k].gain.setValueAtTime((st.levels[k] == null ? 70 : st.levels[k]) / 100, t); });
  }
  /* Every sound starts this far ahead of now. A note set to start at the
     very moment it is asked for begins in a block of audio already being
     made, and its first milliseconds are lost */
  var LEAD = 0.02;
  /* attack: the fade-in, 8 ms unless given */
  function tone(cat, freq, dur, type, vol, when, glideTo, attack) {
    if (baking) { return; }
    freq *= shape.p; dur *= shape.l; vol = (vol || 0.05) * shape.v; when = (when || 0) * shape.l + shape.d; if (glideTo) { glideTo *= shape.p; }
    /* A seed changes the soft tones only; sawtooth and square keep their edge */
    if (shape.wave && (!type || type === "sine" || type === "triangle")) { type = shape.wave; }
    if (vol < 0.0002) { return; }
    var t = ctx.currentTime + LEAD + when, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (glideTo) { o.frequency.exponentialRampToValueAtTime(glideTo, t + dur); }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.05, t + (attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus[cat]); o.start(t); o.stop(t + dur + 0.03);
  }
  /* The graph of a noise burst, in the audio context c, from time t */
  function burstGraph(c, dest, freq, q, vol, dur, t) {
    var s = c.createBufferSource(); s.buffer = noise;
    var f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.004, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, OFFSET, dur + 0.05);
  }
  /* A filtered noise burst, rendered once into a buffer so it plays whole
     even when the page is busy redrawing. Until the buffer is ready the
     burst plays from the same graph live, so it is never late or missing.
     baking renders the bursts of a sound without playing anything */
  var baking = false, onset = false;
  function burst(cat, freq, q, vol, dur, when) {
    freq = Math.min(16000, freq * shape.p); q *= shape.q; vol *= shape.v; dur *= shape.l; when = (when || 0) * shape.l + shape.d;
    if (vol < 0.0002) { return; }
    var key = [freq, q, vol, dur].join(" "), t = ctx.currentTime + LEAD + when;
    if (baking && when === 0) { onset = true; }
    if (!baking) {
      if (baked[key] instanceof AudioBuffer) { var b = ctx.createBufferSource(); b.buffer = baked[key]; b.connect(bus[cat]); b.start(t); }
      else { burstGraph(ctx, bus[cat], freq, q, vol, dur, t); }
    }
    if (baked[key] || !window.OfflineAudioContext) { return; }
    baked[key] = "pending";
    var off = new OfflineAudioContext(1, Math.ceil((dur + 0.06) * ctx.sampleRate), ctx.sampleRate);
    burstGraph(off, off.destination, freq, q, vol, dur, 0);
    off.startRendering().then(function (buf) { baked[key] = buf; }, function () { delete baked[key]; });
  }
  /* Renders every burst of the set as it is now set, so the first time a
     sound plays it already has its buffers; run when the context is made
     and when the sound settings change */
  var bakedOnce = false;
  function bake() {
    /* The context can be made before the set below is defined, when the
       page opens after a gesture; play then bakes first */
    if (!ctx || !SOUNDS) { return; }
    baking = true;
    S.SOUND_LIST.forEach(function (x) {
      shape = shapeFor(x[0]); onset = false;
      try { SOUNDS[x[0]](); } catch (e) {}
      ownClick[x[0]] = onset;
    });
    shape = shapeFor("click"); shape.v *= BLEND; try { tick(); } catch (e) {}
    baking = false; bakedOnce = true;
    shape = { p: 1, l: 1, v: 1, q: 1, wave: null, d: 0 };
  }
  /* A sound that comes from a button carries the button's click: the
     noise of Click alone (its tone could clash with the sound's notes),
     at 40% of its volume (BLEND), with the sound GAP after it, so the click leads and
     the sound keeps its own shape. A sound that begins with noise of its
     own (ownClick, found by bake), such as Open or Delete, already has one */
  var BLEND = 0.4, GAP = 0.012, ownClick = {};
  function tick() { burst("clicks", 2600, 1.4, 0.5, 0.03); }
  var SOUNDS = {
    click: function () { tick(); tone("clicks", 1800, 0.02, "triangle", 0.015); },
    select: function () { burst("clicks", 1900, 2, 0.35, 0.035); },
    open: function () { burst("clicks", 900, 0.8, 0.25, 0.09); },
    close: function () { burst("clicks", 650, 0.8, 0.2, 0.07); },
    check: function () { burst("clicks", 2200, 2, 0.3, 0.025); tone("clicks", 1400, 0.05, "sine", 0.02, 0.01, 1800); },
    uncheck: function () { burst("clicks", 1700, 2, 0.3, 0.025); tone("clicks", 1500, 0.05, "sine", 0.018, 0.01, 1100); },
    slide: function () { burst("clicks", 3200, 3, 0.12, 0.012); },
    unfold: function () { burst("clicks", 1200, 1, 0.22, 0.05); tone("clicks", 700, 0.09, "sine", 0.02, 0, 1000); },
    fold: function () { burst("clicks", 1000, 1, 0.22, 0.05); tone("clicks", 1000, 0.09, "sine", 0.02, 0, 700); },
    pop: function () { tone("clicks", 1250, 0.06, "sine", 0.025, 0, 1550); },
    notify: function () { tone("alerts", 990, 0.12, "sine", 0.035); tone("alerts", 1320, 0.16, "sine", 0.03, 0.08); },
    alert: function () { tone("alerts", 880, 0.16, "triangle", 0.06); tone("alerts", 660, 0.22, "triangle", 0.06, 0.15); },
    good: function () { tone("alerts", 660, 0.14, "sine", 0.06); tone("alerts", 830, 0.2, "sine", 0.05, 0.11); },
    bad: function () { tone("alerts", 440, 0.2, "sawtooth", 0.025); tone("alerts", 370, 0.3, "sawtooth", 0.025, 0.16); },
    yes: function () { tone("votes", 1320, 0.05, "sine", 0.04); burst("votes", 3000, 2, 0.15, 0.02); },
    no: function () { tone("votes", 520, 0.07, "triangle", 0.045); },
    gavel: function () { burst("votes", 300, 1, 0.8, 0.08); tone("votes", 180, 0.12, "sine", 0.08); },
    turn: function () {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone("turn", f, 0.6 - i * 0.08, "sine", 0.045, i * 0.12); });
      burst("turn", 600, 0.6, 0.12, 0.5);
    },
    /* A refusal: two short low notes, softer than a bad result */
    error: function () { tone("alerts", 330, 0.07, "square", 0.018); tone("alerts", 300, 0.09, "square", 0.018, 0.09); },
    /* An achievement: a bright rising chord with a high bell on top, both
       fading out cleanly */
    achievement: function () {
      [783.99, 987.77, 1174.66].forEach(function (f, i) { tone("alerts", f, 0.35, "sine", 0.035, i * 0.07); });
      tone("alerts", 2349.3, 0.6, "sine", 0.012, 0.21);
    },
    /* Saves: one sine tone each that glides, as Check and Unfold do, at the
       pitches of Notify. Save rises and load falls, as Check and Uncheck,
       Unfold and Fold. Each fades in over 20 ms, so it starts without a
       thump, and has no noise, so it holds no click */
    /* Save lasts longer than load: a tone that rises sounds shorter
       than one that falls, as its end is higher and fainter */
    save: function () { tone("saves", 990, 0.21, "sine", 0.035, 0, 1320, 0.02); },
    load: function () { tone("saves", 1320, 0.16, "sine", 0.035, 0, 990, 0.02); },
    /* Import and export: the same kind of glide, a fifth lower and in a
       triangle tone, so they are told apart from save and load. Import
       rises, export falls */
    import: function () { tone("saves", 660, 0.18, "triangle", 0.035, 0, 990, 0.02); },
    export: function () { tone("saves", 990, 0.18, "triangle", 0.035, 0, 660, 0.02); },
    delete: function () { burst("saves", 700, 0.7, 0.3, 0.14); tone("saves", 520, 0.16, "sine", 0.03, 0, 300); },
    /* Typing and the pointer: the softest ticks */
    type: function () { burst("typing", 4200, 2.5, 0.08, 0.012); },
    hover: function () { tone("typing", 2600, 0.025, "sine", 0.008); }
  };
  /* played: a sound played in the action now running, so a notification
     it raises adds no second sound (cleared when the action ends) */
  var pendingClick = null, played = false, playedReset = null;
  S.sound = {
    /* Settings > Sound > Speakers: levels suited to each kind of speaker.
       Small speakers need the interface louder and the music softer, since
       they lose the low notes; headphones need everything softer */
    PRESETS: {
      default: { name: "Default", volume: 70, musicVolume: 50, levels: { clicks: 60, alerts: 80, votes: 60, turn: 80, saves: 60, typing: 55 } },
      laptop: { name: "Laptop speakers", volume: 85, musicVolume: 45, levels: { clicks: 65, alerts: 75, votes: 65, turn: 80, saves: 65, typing: 60 } },
      headphones: { name: "Headphones", volume: 45, musicVolume: 40, levels: { clicks: 50, alerts: 65, votes: 50, turn: 65, saves: 50, typing: 45 } },
      phone: { name: "Phone speaker", volume: 95, musicVolume: 35, levels: { clicks: 75, alerts: 85, votes: 70, turn: 85, saves: 70, typing: 65 } },
      desktop: { name: "Desktop or TV speakers", volume: 60, musicVolume: 60, levels: { clicks: 55, alerts: 75, votes: 60, turn: 85, saves: 55, typing: 50 } }
    },
    /* Plays a sound, shaped by its own settings and the seed. A sound
       switched off stays silent, unless audition is set (its Play button
       in Settings). A sound that plays takes the click of the button that
       led to it into itself (see BLEND); one switched off leaves the click
       to play alone. An audition plays the sound alone */
    play: function (name, audition) {
      if (!S.settings.sound || S.settings.uiSound === false) { return; }
      if (!audition && LIST[name] && !S.soundSetting(name).on) { return; }
      init();
      if (!ctx || !SOUNDS[name]) { return; }
      if (!bakedOnce) { bake(); }
      var blend = false;
      if (pendingClick) {
        clearTimeout(pendingClick); pendingClick = null;
        if (name !== "click") {
          blend = !audition && !ownClick[name] && S.soundSetting("click").on;
        }
      }
      played = true;
      if (!playedReset) { playedReset = setTimeout(function () { played = false; playedReset = null; }, 0); }
      try {
        if (ctx.state === "suspended") { ctx.resume(); }
        if (blend) { shape = shapeFor("click"); shape.v *= BLEND; tick(); }
        shape = shapeFor(name); if (blend) { shape.d = GAP; }
        SOUNDS[name]();
      } catch (e) {}
      shape = { p: 1, l: 1, v: 1, q: 1, wave: null, d: 0 };
    },
    /* A new seed: a random whole number from 1 to 999 999 */
    randomSeed: function () { return 1 + Math.floor(Math.random() * 999999); },
    apply: function () { apply(); bake(); if (S.music) { S.music.apply(); } },
    /* For js/audio/music.js: the audio context, made after the first
       gesture, and the compressor that every sound ends in */
    /* A button's click, played after its action unless the action played a sound */
    click: function () {
      if (pendingClick) { clearTimeout(pendingClick); }
      init();
      pendingClick = setTimeout(function () { pendingClick = null; S.sound.play("click"); }, 0);
    },
    /* Whether a sound played in the action now running */
    played: function () { return played; },
    context: function () { init(); return ctx; },
    out: function () { return out; },
    CATS: CATS
  };
  /* Controls that sound without code of their own: check boxes and
     switches, drop-down lists, sliders (a tick at most every 70 ms) and
     folding boxes */
  var lastSlide = 0;
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.type === "checkbox") { S.sound.play(t.checked ? "check" : "uncheck"); }
    else if (t.tagName === "SELECT") { S.sound.play("select"); }
  }, true);
  document.addEventListener("input", function (e) {
    var now = Date.now();
    if (e.target.type === "range" && now - lastSlide > 70) { lastSlide = now; S.sound.play("slide"); }
  }, true);
  document.addEventListener("toggle", function (e) {
    if (e.target.tagName === "DETAILS") { S.sound.play(e.target.open ? "unfold" : "fold"); }
  }, true);
  /* Typing in a text field (a tick at most every 40 ms) and the pointer
     moving onto a button; both are off unless turned on */
  var lastType = 0, lastHover = 0;
  document.addEventListener("keydown", function (e) {
    var t = e.target, now = Date.now();
    if (!t || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Delete") { return; }
    if (!(t.tagName === "TEXTAREA" || t.tagName === "INPUT" && /^(text|search|number|email|url|password)$/.test(t.type) || t.isContentEditable)) { return; }
    if (now - lastType > 40 && S.soundSetting("type").on) { lastType = now; S.sound.play("type"); }
  }, true);
  document.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse") { return; }
    var b = e.target.closest && e.target.closest("button, .btn, [role=button]"), now = Date.now();
    if (!b || b.disabled || (e.relatedTarget && b.contains(e.relatedTarget))) { return; }
    if (now - lastHover > 60 && S.soundSetting("hover").on) { lastHover = now; S.sound.play("hover"); }
  }, true);
})();
