/* The data and the sources: cards, notes, glossary, map, icons, page and
   stylesheets agree with each other.

     node test/data.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var load = require("./load"), S = load(), T = require("./check"), check = T.check, ROOT = load.ROOT;

/* Cards */
Object.keys(S.SCRIPT).forEach(function (y) {
  S.SCRIPT[y].forEach(function (id) { check(S.CARDS[id], "scripted card " + id + " (" + y + ") exists"); });
});
Object.keys(S.HIST_CHOICE).forEach(function (id) { check(S.CARDS[id], "historical choice for an existing card: " + id); });

/* Notes: every card's notes exist, and every [[link]] in a note leads to a note */
Object.keys(S.CARD_NOTES).forEach(function (id) {
  check(S.CARDS[id], "notes for an existing card: " + id);
  S.CARD_NOTES[id].forEach(function (n) { check(S.NOTES[n], "note " + n + " on " + id + " exists"); });
});
Object.keys(S.NOTES).forEach(function (id) {
  var n = S.NOTES[id];
  check(n.title && n.text && n.anchor && n.anchor.length, "note " + id + " has a title, a text and anchors");
  (n.text.match(/\[\[([a-z0-9-]+)(\|[^\]]+)?\]\]/g) || []).forEach(function (m) {
    var to = /\[\[([a-z0-9-]+)/.exec(m)[1];
    check(S.NOTES[to] && to !== id, "note " + id + " links to " + to);
  });
});

/* Glossary: no duplicate terms */
var seen = {};
S.GLOSSARY.forEach(function (g) {
  var k = g[0].toLowerCase();
  check(!seen[k], "glossary term once: " + g[0]);
  seen[k] = true;
});

/* Map: an outline for every state in the game */
var codes = {};
S.MAP.shapes.forEach(function (s) { codes[s.code] = true; });
S.COUNTRIES.forEach(function (c) { check(codes[c.code], "map outline for " + c.name); });

/* Icons used in the code exist */
var iconCtx = {};
iconCtx.window = iconCtx;
require("vm").runInNewContext(fs.readFileSync(path.join(ROOT, "js/ui/icons.js"), "utf8"), iconCtx);
var icons = iconCtx.ECBSIM.ICONS;
function walk(dir, out) {
  fs.readdirSync(dir).forEach(function (f) {
    var p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); } else if (/\.js$/.test(f)) { out.push(p); }
  });
  return out;
}
var used = {};
walk(path.join(ROOT, "js"), []).forEach(function (f) {
  var src = fs.readFileSync(f, "utf8");
  (src.match(/icon: "([a-z-]+)"/g) || []).concat(src.match(/S\.icon\("([a-z-]+)"/g) || []).forEach(function (m) { used[/"([a-z-]+)"/.exec(m)[1]] = true; });
});
/* The views and the settings pages name their icons in lists */
["agenda", "council", "countries", "advisor", "parliament", "proposals", "archive", "glossary", "palette", "volume", "chart", "storage", "debug"]
  .forEach(function (k) { used[k] = true; });
Object.keys(used).forEach(function (k) { check(icons[k], "icon " + k + " exists"); });

/* Every script in the page exists, and every file under js/ is loaded */
var html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
var scripts = (html.match(/src="([^"]+)"/g) || []).map(function (m) { return m.slice(5, -1); });
scripts.forEach(function (s) { check(fs.existsSync(path.join(ROOT, s)), "script " + s + " exists"); });
walk(path.join(ROOT, "js"), []).forEach(function (f) {
  var rel = path.relative(ROOT, f).split(path.sep).join("/");
  check(scripts.indexOf(rel) >= 0, rel + " is loaded by index.html");
});
check(!/\n\s*\n\s*<script/.test(html), "no empty line before the scripts");
/* The loading screen counts the files after it from the page itself, with no number written in it */
check(!/var TOTAL = [1-9]/.test(fs.readFileSync(path.join(ROOT, "js/core/loader.js"), "utf8")), "the loading screen has no file count written in it");
html.split("\n").forEach(function (line, i) {
  check(/^( {2})*\S/.test(line) || line === "", "index.html line " + (i + 1) + " is indented by two spaces");
});

/* Stylesheets: two-space indentation, one declaration per line */
fs.readdirSync(path.join(ROOT, "css")).forEach(function (f) {
  var lines = fs.readFileSync(path.join(ROOT, "css", f), "utf8").split("\n"), inComment = false;
  lines.forEach(function (line, i) {
    var where = f + ":" + (i + 1);
    if (/\/\*/.test(line) && !/\*\//.test(line)) { inComment = true; }
    if (inComment) { if (/\*\//.test(line)) { inComment = false; } return; }
    check(!/\t/.test(line), where + " has no tabs");
    check(/^( {2})*\S/.test(line) || line === "", where + " is indented by two spaces");
    check((line.match(/;/g) || []).length <= 1, where + " holds one declaration");
  });
});

/* Nothing is fetched from another site */
[html].concat(fs.readdirSync(path.join(ROOT, "css")).map(function (f) { return fs.readFileSync(path.join(ROOT, "css", f), "utf8"); }))
  .forEach(function (src, i) { check(!/(src|href|url)\(?=?["']?https?:/.test(src), "no remote file in source " + i); });

/* Plain text rules for the game's text: straight quotes, no long dashes */
walk(path.join(ROOT, "js"), []).forEach(function (f) {
  var src = fs.readFileSync(f, "utf8");
  check(!/[–—“”]/.test(src), path.basename(f) + " uses straight quotes and no long dashes");
});

/* No two empty lines in a row in the game's own files */
function walkAll(dir, out) {
  fs.readdirSync(dir).forEach(function (f) {
    var p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (f !== "vendor" && f !== "licenses" && f !== "node_modules") { walkAll(p, out); } }
    else if (/\.(js|css|html|md|py)$/.test(f)) { out.push(p); }
  });
  return out;
}
walkAll(ROOT, []).forEach(function (f) {
  check(!/\n[ \t]*\n[ \t]*\n/.test(fs.readFileSync(f, "utf8")), path.relative(ROOT, f) + " has no two empty lines in a row");
});

/* Every quieter item and crisis item exists, and either comes once in a run
   or has variants, so it reads differently each time it comes back */
S.game.FILLERS.concat(S.game.CRISIS).forEach(function (id) {
  var c = S.CARDS[id];
  check(c, "agenda item " + id + " exists");
  if (c) { check(c.once || (c.variants && c.variants.length > 1), id + " comes once or has variants"); }
});

/* President names: long lists for every member state, and a random name
   never takes an advisor's name or family name. The president comes from
   a member state of 2025, so the states a run may assume will join the EU
   need only governors. */
S.COUNTRIES.forEach(function (c) {
  var k = c.code;
  var p = S.PEOPLE[k];
  check(p && p.m.length >= 15 && p.f.length >= 15 && p.s.length >= 25, "names for " + k);
  check(S.STATE_LANG[k] && S.LANGS[S.STATE_LANG[k]], "a language for " + k);
});
S.CANDIDATES.forEach(function (c) { check(S.GOVERNORS[c.code] && S.GOVERNORS[c.code].length >= 3, "governors for " + c.code); });
var advisorNames = Object.keys(S.ADVISORS).map(function (k) { return S.ADVISORS[k].name; });
Object.keys(S.PEOPLE).forEach(function (k) {
  for (var i = 0; i < 200; i++) {
    var n = S.randomName(k);
    check(advisorNames.every(function (a) { return n !== a && n.indexOf(a.split(" ").slice(-1)[0]) < 0; }), "random name " + n + " is not an advisor's");
  }
});

/* Music: every tune fills its chords exactly, so the loop never drifts,
   and every pattern has one step for each eighth of a bar */
Object.keys(S.MUSIC.pieces).forEach(function (k) {
  var p = S.MUSIC.pieces[k], len = p.len || 8;
  if (p.lead) {
    var beats = p.lead.reduce(function (a, n) { return a + n[1]; }, 0);
    check(beats === p.bars.length * len / 2, k + ": the tune lasts " + beats + " beats, its chords " + p.bars.length * len / 2);
  }
  ["arp", "bass", "drum"].forEach(function (f) { check(!p[f] || p[f].length === len, k + ": the " + f + " pattern has " + len + " steps"); });
});
Object.keys(S.MUSIC.resistance).forEach(function (k) { check(S.MUSIC.pieces[S.MUSIC.resistance[k]].base === k, "the resistance variant of " + k + " keeps its settings"); });

T.done("data");
