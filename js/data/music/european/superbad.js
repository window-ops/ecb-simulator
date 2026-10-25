/* Superbad: a piece of the European playlist (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* A Troika and a Draghi measure at once: B diminished, square tones,
     bells and a slow kick */
  M.piece("superbad", { name: "Superbad", bpm: 60, arp: [0, -1, 2, -1, 1, -1, 2, -1], wave: "square", bell: true, bass: [1, 0, 0, 0, 3, 0, 0, 0], drum: [1, 0, 0, 0, 1, 0, 0, 0],
    bars: [[47, 59, 62, 65], [48, 60, 63, 67], [47, 59, 62, 65], [44, 60, 63, 68], [47, 59, 62, 65], [41, 59, 62, 68], [42, 58, 61, 66], [47, 59, 62, 65]] });
})();
