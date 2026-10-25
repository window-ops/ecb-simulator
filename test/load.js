/* Loads the game's model and data files into a sandbox, without a browser,
   in the order index.html loads them. Returns ECBSIM. */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var ROOT = path.join(__dirname, "..");
/* The music: the shared file, then a file for each piece of the European
   playlist and for each song of the resistance playlist, as index.html
   loads them */
var MUSIC_EU = ["eurocrisis", "draghi", "troika", "superbad", "bankrupt", "ode", "finally", "october", "kremlin", "strasbourg", "popular", "social", "renew", "green", "conservative", "patriot", "sovereign", "left"];
var MUSIC_RS = ["bella-ciao", "internationale", "bandiera-rossa", "warszawianka", "le-temps-des-cerises"];
var FILES = [
  "js/core/i18n.js", "js/core/events.js", "js/data/countries.js", "js/data/history.js", "js/data/flows.js", "js/data/instruments.js",
  "js/data/proposals.js", "js/data/advisors.js", "js/data/glossary.js", "js/data/notes.js", "js/data/names.js", "js/data/people.js", "js/data/rules.js",
  "js/data/music/music.js"
].concat(MUSIC_EU.map(function (k) { return "js/data/music/european/" + k + ".js"; }), MUSIC_RS.map(function (k) { return "js/data/music/resistance/" + k + ".js"; }), [
  "js/data/map.js",
  "js/model/model.js", "js/model/council.js", "js/model/advisors.js", "js/model/game.js", "js/model/auto.js", "js/model/achievements.js",
  "js/data/cards-common.js", "js/data/cards-pre.js", "js/data/cards-later.js"
]);
module.exports = function load() {
  var ctx = { console: console, Math: Math, JSON: JSON };
  ctx.window = ctx;
  vm.createContext(ctx);
  FILES.forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f }); });
  return ctx.ECBSIM;
};
module.exports.ROOT = ROOT;
