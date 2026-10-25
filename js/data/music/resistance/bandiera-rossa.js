/* Bandiera rossa: a song of the resistance playlist and the variants made from it
   (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* Bandiera rossa, in F major, from the score arranged by Bruno Bizzarri:
     bars 3 to 18, with the upbeat of bar 2 at the end of the last bar so
     the loop runs on */
  var BR_A = [[69, 0.75], [69, 0.25], [69, 1.75], [67, 0.25], [65, 0.75], [67, 0.25]];
  var BR_B = [[69, 1], [69, 1], [null, 0.5], [69, 0.5], [70, 0.75], [69, 0.25]];
  var BR_C = [[69, 1], [69, 0.75], [69, 0.25], [69, 0.5], [65, 0.5], [67, 0.5], [69, 0.5]];
  var BANDIERA = [].concat(BR_A, BR_B,
    [[69, 1], [67, 1.75], [67, 0.25], [69, 0.75], [67, 0.25]],
    [[67, 1], [65, 1.75], [60, 0.25], [65, 0.75], [67, 0.25]],
    BR_A, BR_B,
    [[69, 1], [67, 1.75], [70, 0.25], [69, 0.75], [67, 0.25]],
    [[65, 1], [null, 3]],
    BR_C, [[70, 1], [69, 1], [67, 2]],
    [[67, 1], [67, 0.75], [67, 0.25], [67, 0.5], [64, 0.5], [65, 0.5], [67, 0.5]],
    [[69, 1], [67, 1], [65, 2]],
    BR_C, [[70, 1], [72, 1], [74, 1.75], [74, 0.25]],
    [[74, 0.5], [74, 0.5], [74, 0.5], [74, 0.5], [72, 0.5], [72, 0.5], [72, 0.5], [72, 0.5]],
    [[76, 1], [76, 1], [77, 0.5], [60, 0.5], [65, 0.75], [67, 0.25]]);
  var C7 = [48, 60, 64, 70], BB = [46, 62, 65, 70], FMA = [41, 60, 65, 69];
  var BANDIERA_BARS = [FMA, FMA, C7, FMA, FMA, FMA, C7, FMA, FMA, C7, C7, FMA, FMA, BB, BB, C7];
  M.song("bandiera", { mel: BANDIERA, bars: BANDIERA_BARS, tonic: 65 });
  M.resist("draghi", M.variant("bandiera", { name: "Bandiera rossa (Draghi)", stands: "draghi", by: 0, bpm: 84, arp: [0, 2, 1, 2, 0, 2, 1, 2] }));
  M.resist("finally", M.variant("bandiera", { name: "Bandiera rossa (Finally)", stands: "finally", by: 2, bpm: 92, arp: [0, 1, 2, 1, 2, 1, 2, 1] }));
  M.resist("popular", M.variant("bandiera", { name: "Bandiera rossa (Subsidiarity)", stands: "popular", by: 5, bpm: 72, bell: true, arp: [-1, -1, -1, -1, -1, -1, -1, -1], bass: [1, 0, 0, 0, 0, 0, 0, 0] }));
  M.resist("renew", M.variant("bandiera", { name: "Bandiera rossa (Ever Closer)", stands: "renew", by: -2, bpm: 116, wave: "sawtooth", arp: [0, 1, 2, 1, 2, 1, 0, 2], bass: [1, 0, 0, 1, 0, 0, 1, 0], drum: [1, 0, 2, 0, 1, 1, 2, 0] }));
})();
