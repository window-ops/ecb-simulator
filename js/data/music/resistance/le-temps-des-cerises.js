/* Le Temps des cerises: a song of the resistance playlist and the variants made from it
   (js/data/music/music.js) */
(function () {
  var M = window.ECBSIM.MUSIC;
  /* Le Temps des cerises (Antoine Renard), in A flat major and 3/8: the
     voice from "Quand nous chanterons" to "Seront tous en fête", which
     the song sings twice; the last bar's "Les" leads back to the start */
  var CERISES = [
    [68, 0.5], [68, 0.5], [68, 0.5], [68, 1], [68, 0.5],
    [70, 0.5], [70, 0.5], [70, 0.5], [70, 0.5], [70, 0.5], [70, 0.5],
    [72, 0.5], [72, 0.5], [72, 0.5], [72, 0.5], [null, 0.5], [72, 0.5],
    [73, 0.5], [73, 0.5], [73, 0.5], [73, 0.5], [null, 0.5], [72, 0.5],
    [72, 0.5], [72, 0.5], [73, 0.5], [72, 1.5], [70, 1.5],
    [68, 0.5], [null, 0.5], [68, 0.5]
  ];
  var ABM = [44, 60, 63, 68], EBM = [39, 58, 63, 67], EB7 = [46, 61, 63, 67];
  var CERISES_BARS = [ABM, ABM, EBM, EBM, ABM, ABM, EB7, EB7, ABM, EBM, EBM, ABM];
  M.song("cerises", { mel: CERISES, bars: CERISES_BARS, tonic: 68, len: 3, arp: [0, 1, 2], bass: [1, 0, 0] });
  M.resist("troika", M.variant("cerises", { name: "Le Temps des cerises (Troika)", stands: "troika", by: 1, mode: "minor", bpm: 64, bell: true }));
  M.resist("conservative", M.variant("cerises", { name: "Le Temps des cerises (Nations)", stands: "conservative", by: -3, bpm: 100, bell: true }));
  M.resist("sovereign", M.variant("cerises", { name: "Le Temps des cerises (Own Money)", stands: "sovereign", by: 4, mode: "minor", bpm: 66, wave: "sine", bell: true, noPad: true, arp: [2, 1, 0] }));
})();
