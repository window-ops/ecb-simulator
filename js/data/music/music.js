/* The soundtrack's pieces, as data for js/audio/music.js, which describes
   the format and when each piece plays. This file holds what the pieces
   share and S.MUSIC, which the files of the two playlists fill in:
   js/data/music/european/ has a file for each piece of the European
   playlist, and js/data/music/resistance/ a file for each song of the
   resistance playlist, with the variants made from it. index.html loads
   this file first, then the European pieces, then the songs. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  /* Note onsets in eighths from the start of the loop; a note with no
     pitch is a rest */
  function onsets(mel) {
    var map = {}, t = 0;
    mel.forEach(function (n) { if (n[0] != null) { map[Math.round(t * 2)] = n; } t += n[1]; });
    return map;
  }
  /* Moves a tune by semitones, and between major and minor: the third, the
     sixth and the seventh of the scale move by a semitone */
  function shiftNote(n, by, tonic, mode) {
    if (n == null) { return n; }
    var d = ((n - tonic) % 12 + 12) % 12;
    if (mode === "minor" && (d === 4 || d === 9 || d === 11)) { n -= 1; }
    if (mode === "major" && (d === 3 || d === 8 || d === 10)) { n += 1; }
    return n + by;
  }
  /* A piece: name, bpm, bars (the chords), arp (the arpeggio's pattern),
     and the voices it has besides its chords: len (eighths in a bar; 6
     makes a waltz), bass (a pattern of the bar: 1 root, 2 fifth, 3 octave,
     held to the next note), drum (1 a soft kick, 2 a tick), wave (the
     arpeggio's tone), bell, lead (a melody, as [note, beats]), leadWave,
     noPad (no held chords). Before a game the title screen plays its own
     pieces, one for each title theme. */
  var M = S.MUSIC = { pieces: {}, title: {}, songs: {}, resistance: {}, onsets: onsets,
    order: ["eurocrisis", "draghi", "troika", "superbad", "bankrupt", "ode", "finally", "october", "kremlin"],
    titleOrder: ["strasbourg", "popular", "social", "renew", "green", "conservative", "patriot", "sovereign", "left"] };
  /* A piece of the European playlist; title marks one of the title
     screen's pieces. A piece with a lead gets its note onsets. */
  M.piece = function (key, p, title) {
    if (p.lead) { p.notes = onsets(p.lead); }
    M.pieces[key] = p;
    if (title) { M.title[key] = p; }
  };
  /* ---------- The resistance playlist ----------
     Settings > Sound > Playlist can play, in place of each piece of the
     European playlist, a variant made from a public domain song of
     resistance: Bella ciao
     (Italian, traditional), L'Internationale (Pierre De Geyter, 1888),
     Bandiera rossa (Italian, traditional), Warszawianka (Józef Pławiński,
     1905) and Le Temps des cerises (Antoine Renard, 1868), each in the
     key, tempo and voices of the piece it stands for. The time-lapse of
     the true ending plays Bella ciao in either playlist. */
  /* Each song: its tune, its chords, its tonic, and the eighths in a bar */
  M.song = function (key, s) { M.songs[key] = s; };
  /* A variant: the song in the key, mode, tempo and voices of the piece it
     stands for */
  M.variant = variant;
  function variant(base, opts) {
    var song = M.songs[base], tonic = song.tonic;
    var lead = song.mel.map(function (x) { return [shiftNote(x[0], opts.by, tonic, opts.mode), x[1]]; });
    var p = { name: opts.name, base: opts.stands, bpm: opts.bpm, arp: opts.arp || song.arp || [0, -1, 1, -1, 2, -1, 1, -1],
      bars: song.bars.map(function (b) { return b.map(function (n) { return shiftNote(n, opts.by, tonic, opts.mode); }); }), lead: lead };
    if (song.len) { p.len = song.len; }
    if (song.bass && !opts.bass) { p.bass = song.bass; }
    ["bell", "wave", "leadWave", "bass", "drum", "noPad"].forEach(function (k) { if (opts[k] != null) { p[k] = opts[k]; } });
    p.notes = onsets(lead);
    return p;
  }
  /* The variant that stands for a piece; a title piece's variant is a
     title piece too */
  M.resist = function (k, p) {
    M.pieces["r_" + k] = p; M.resistance[k] = "r_" + k;
    if (M.title[k]) { M.title["r_" + k] = p; }
  };
  /* TROIKA.RUN, the chiptune of the minigame in Selk (its
     js/audio/sounds/troika.js), by the same designer: the hijaz mode on D
     at 132 beats a minute, a sine bass in a 3-3-2 rhythm on
     the roots D, E flat, C, D, G, C, G, D, a kick on the beat, a square
     arpeggio and the square melody. It is in no
     list: only the easter egg plays it (S.music.play, js/ui/shell.js) */
  var TR_MELODY = [
    7, "-", 8, 7, 4, "-", 5, 4, 1, "-", 0, "-", 1, 4, 5, "-",
    7, "-", 8, 10, 8, "-", 7, 5, 4, 5, 4, 1, 0, "-", "-", null,
    12, "-", 10, 8, 10, "-", 8, 7, 8, "-", 7, 5, 4, "-", 5, 7,
    8, 10, 8, 7, 5, 4, 5, 4, 1, "-", 4, 1, 0, "-", "-", null
  ];
  var trNotes = {};
  TR_MELODY.forEach(function (m, i) {
    if (typeof m !== "number") { return; }
    var len = 1; while (TR_MELODY[(i + len) % TR_MELODY.length] === "-") { len++; }
    trNotes[i] = [62 + m, len / 2];
  });
  M.pieces.troikarun = { name: "TROIKA.RUN", bpm: 132, noPad: true, wave: "square", leadWave: "square",
    arp: [0, -1, 1, -1, 2, -1, 1, -1], bass: [1, 0, 0, 1, 0, 0, 1, 0], drum: [1, 0, 0, 0, 1, 0, 0, 0],
    bars: [0, 1, -2, 0, 5, -2, 5, 0].map(function (r) { return [38 + r, 38 + r, 45 + r, 50 + r]; }), notes: trNotes };
})();
