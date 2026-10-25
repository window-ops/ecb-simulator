/* L'Internationale: a song of the resistance playlist and the variants made from it
   (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* L'Internationale, in C major: the first two lines of the verse, twice */
  var INTER = [
    [72, 1.5], [71, 0.5], [74, 0.5], [72, 0.5], [67, 0.5], [64, 0.5],
    [69, 2], [65, 1], [62, 1],
    [67, 1.5], [65, 0.5], [64, 0.5], [62, 0.5], [60, 0.5], [59, 0.5],
    [60, 3], [67, 1],
    [72, 1.5], [71, 0.5], [74, 0.5], [72, 0.5], [67, 0.5], [64, 0.5],
    [69, 2], [65, 1], [62, 1],
    [67, 1.5], [65, 0.5], [64, 0.5], [62, 0.5], [60, 0.5], [59, 0.5],
    [60, 4]
  ];
  var CMA = [48, 60, 64, 67], FMA = [41, 60, 65, 69], GMA = [43, 59, 62, 67], DMI = [50, 62, 65, 69];
  var INTER_BARS = [CMA, FMA, GMA, CMA, CMA, DMI, GMA, CMA];
  M.song("inter", { mel: INTER, bars: INTER_BARS, tonic: 60 });
  M.resist("ode", M.variant("inter", { name: "L'Internationale (Ode to Joy)", stands: "ode", by: 2, bpm: 96, arp: [-1, -1, -1, -1, -1, -1, -1, -1] }));
  M.resist("kremlin", M.variant("inter", { name: "L'Internationale (Kremlin)", stands: "kremlin", by: 7, bpm: 72, bell: true, arp: [0, -1, -1, -1, 1, -1, -1, -1] }));
  M.resist("strasbourg", M.variant("inter", { name: "L'Internationale (Strasbourg)", stands: "strasbourg", by: 2, bpm: 96, bass: [1, 0, 0, 0, 2, 0, 0, 0] }));
  M.resist("left", M.variant("inter", { name: "L'Internationale (Another Europe)", stands: "left", by: -1, mode: "minor", bpm: 120, wave: "sawtooth", arp: [-1, 0, -1, 1, -1, 2, -1, 1], bass: [1, 0, 1, 1, 1, 0, 1, 2], drum: [1, 0, 2, 0, 1, 0, 2, 0] }));
})();
