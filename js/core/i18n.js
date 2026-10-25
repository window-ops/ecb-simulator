/* Localization, adapted from Selk (js/core/i18n.js). Each language is one
   file, js/lang/<code>.js, which calls ECBSIM.i18n.register(code, pack).
   The game ships in English, the source language, so English needs no pack
   entries: S.t returns its key. A new language adds its file and its code
   to AVAILABLE; TRANSLATING.md describes the format.

   Code calls S.t("English text {n}", { n: 3 }). */
(function () {
  "use strict";
  var S = window.ECBSIM = window.ECBSIM || {};
  var AVAILABLE = ["en"], packs = {}, current = "en";
  function sub(text, vars) {
    if (!vars) { return text; }
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  S.i18n = {
    register: function (code, pack) { packs[code] = pack; },
    use: function (code) { if (AVAILABLE.indexOf(code) >= 0) { current = code; } },
    current: function () { return current; },
    available: function () { return AVAILABLE.slice(); }
  };
  S.t = function (key, vars) {
    var p = packs[current], v = p && p.ui && p.ui[key] != null ? p.ui[key] : key;
    return sub(v, vars);
  };
})();
