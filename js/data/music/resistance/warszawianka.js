/* Warszawianka: a song of the resistance playlist and the variants made from it
   (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* Warszawianka 1905 (Józef Pławiński), in G minor: the verse, the refrain
     and its second ending */
  var WA_A = [[74, 1], [74, 0.75], [72, 0.25], [70, 1], [70, 0.75], [69, 0.25]];
  var WA_B = [[67, 1], [67, 0.75], [67, 0.25], [66, 1], [67, 1]];
  var WA_C = [[69, 1], [62, 0.75], [62, 0.25], [64, 1], [66, 1]];
  var WA_D = [[74, 1], [74, 0.75], [74, 0.25], [79, 1], [74, 0.75], [72, 0.25]];
  var WA_E = [[70, 1], [70, 0.75], [69, 0.25], [67, 1], [70, 1]];
  var WA_F = [[69, 1], [74, 0.75], [74, 0.25], [74, 0.5], [72, 0.5], [70, 0.5], [69, 0.5]];
  var WARSZAWIANKA = [].concat(WA_D, WA_E, WA_F,
    [[67, 1], [70, 0.75], [69, 0.25], [67, 1], [null, 1]],
    WA_A, WA_B, WA_C,
    [[67, 1], [67, 0.75], [69, 0.25], [70, 1], [72, 1]],
    WA_A, WA_B, WA_C,
    [[67, 1], [70, 0.75], [69, 0.25], [67, 1], [65, 1]],
    [[70, 1], [70, 0.75], [70, 0.25], [65, 1], [70, 1]],
    [[72, 1], [72, 0.75], [72, 0.25], [65, 1], [72, 1]],
    [[72, 1], [72, 0.75], [72, 0.25], [77, 0.5], [75, 0.5], [74, 0.5], [72, 0.5]],
    [[74, 1], [74, 0.75], [74, 0.25], [74, 1], [72, 1]],
    WA_D, WA_E, WA_F,
    [[67, 1], [70, 0.75], [69, 0.25], [67, 2]]);
  var GMI = [43, 62, 67, 70], DMA = [50, 62, 66, 69], FMA = [41, 60, 65, 69], BB = [46, 62, 65, 70];
  var WARSZAWIANKA_BARS = [GMI, GMI, DMA, GMI, GMI, GMI, DMA, GMI, GMI, GMI, DMA, GMI, BB, FMA, FMA, BB, GMI, GMI, DMA, GMI];
  M.song("warszawianka", { mel: WARSZAWIANKA, bars: WARSZAWIANKA_BARS, tonic: 67 });
  M.resist("bankrupt", M.variant("warszawianka", { name: "Warszawianka (Bankrupt)", stands: "bankrupt", by: -7, bpm: 54, arp: [0, -1, -1, -1, 2, -1, -1, -1] }));
  M.resist("october", M.variant("warszawianka", { name: "Warszawianka (October)", stands: "october", by: -3, bpm: 108, drum: [1, 0, 2, 0, 1, 0, 2, 0], bass: [1, 0, 2, 0, 1, 0, 2, 0], arp: [0, -1, 1, -1, 2, -1, 1, 2] }));
  M.resist("social", M.variant("warszawianka", { name: "Warszawianka (Solidarity)", stands: "social", by: 2, bpm: 108, wave: "square", leadWave: "square", arp: [-1, 0, -1, 1, -1, 0, -1, 2], bass: [1, 0, 2, 0, 1, 0, 2, 0], drum: [1, 0, 2, 0, 1, 0, 2, 0] }));
  M.resist("patriot", M.variant("warszawianka", { name: "Warszawianka (Borders)", stands: "patriot", by: -5, bpm: 100, wave: "square", leadWave: "square", arp: [0, -1, -1, -1, 0, -1, -1, -1], bass: [1, 0, 1, 0, 1, 0, 2, 0], drum: [1, 0, 2, 2, 1, 0, 2, 0] }));
})();
