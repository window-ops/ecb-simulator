/* Bella ciao: a song of the resistance playlist and the variants made from it
   (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* Bella ciao, in A minor: the verse twice, the refrain, the last line */
  var BELLA = [
    [64, 0.5], [69, 0.5], [71, 0.5], [72, 0.5], [69, 2],
    [64, 0.5], [69, 0.5], [71, 0.5], [72, 0.5], [69, 2],
    [64, 0.5], [69, 0.5], [71, 0.5], [72, 1], [71, 0.5], [69, 0.5], [72, 0.5],
    [71, 0.5], [69, 0.5], [76, 1], [72, 0.5], [71, 0.5], [69, 1],
    [69, 0.5], [74, 0.5], [74, 0.5], [74, 0.5], [72, 0.5], [74, 0.5], [76, 1],
    [76, 0.5], [74, 0.5], [72, 0.5], [76, 0.5], [74, 0.5], [72, 0.5], [71, 0.5], [76, 0.5],
    [72, 1], [71, 1], [69, 2],
    [64, 0.5], [69, 0.5], [71, 0.5], [72, 0.5], [69, 2]
  ];
  var AM = [45, 60, 64, 69], EM = [40, 59, 64, 68], DM = [50, 62, 65, 69];
  var BELLA_BARS = [AM, AM, AM, EM, DM, AM, EM, AM];
  M.song("bella", { mel: BELLA, bars: BELLA_BARS, tonic: 69 });
  M.resist("eurocrisis", M.variant("bella", { name: "Bella ciao (Eurocrisis)", stands: "eurocrisis", by: 5, bpm: 72, arp: [0, 1, 2, 1, 2, 1, 0, 1] }));
  M.resist("superbad", M.variant("bella", { name: "Bella ciao (Superbad)", stands: "superbad", by: 2, bpm: 60, wave: "square", bell: true, bass: [1, 0, 0, 0, 3, 0, 0, 0], drum: [1, 0, 0, 0, 1, 0, 0, 0], arp: [0, -1, 2, -1, 1, -1, 2, -1] }));
  M.resist("green", M.variant("bella", { name: "Bella ciao (Green Deal)", stands: "green", by: -2, mode: "major", bpm: 80, wave: "sine", leadWave: "sine", arp: [0, -1, -1, 2, -1, -1, 1, -1], bass: [1, 0, 0, 0, 0, 0, 0, 0] }));
  /* The time-lapse of the true ending, in either playlist */
  M.pieces.timelapse = M.variant("bella", { name: "Bella ciao", stands: "finally", by: 0, bpm: 120, bass: [1, 0, 2, 0, 1, 0, 2, 0], drum: [1, 0, 2, 0, 1, 0, 2, 0], arp: [0, 1, 2, 1, 0, 1, 2, 1] });
})();
