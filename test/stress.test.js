/* Stress test of the irregular paths: endings and everything that is not
   a regular year (the end of each period, a bad ending, a succession in
   an ending year, debug jumps into an ending, keys and clicks during the
   year transition, the true ending with its time-lapse, a finished run
   loaded from a save). Each scenario starts a fresh game in a fresh page,
   records sounds, dialogs, overlays and errors, and checks what must
   hold: an ending takes over at once, the page under the film keeps still
   until the film covers it, the film's title waits for Continue and makes
   no sound by itself, required screens stay and come back, nothing under
   them reacts, and no decision goes through after the end.

     node test/stress.test.js [scenario] */
"use strict";
var path = require("path"), fs = require("fs"), http = require("http"), pw;
try { pw = require("playwright"); } catch (e) {
  try { pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright"); } catch (e2) { pw = null; }
}
if (!pw) { console.log("stress: skipped (Playwright is not installed)"); process.exit(0); }
var ROOT = path.join(__dirname, ".."), only = process.argv[2];
var OUT = path.join(require("os").tmpdir(), "ecb-simulator-shots");
fs.mkdirSync(OUT, { recursive: true });
var server = http.createServer(function (req, res) { var p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { p = path.join(ROOT, "index.html"); } res.writeHead(200, { "Content-Type": { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml", ".woff2": "font/woff2" }[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res); });
var fails = [], b;
function fail(sc, m) { fails.push(sc + ": " + m); console.log("  FAIL " + m); }
async function fresh(mode, begin, phone) {
  var ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 860 } });
  var p = await ctx.newPage(); p.errors = [];
  p.on("pageerror", function (e) { p.errors.push(e.message); });
  await p.goto("http://127.0.0.1:" + server.address().port + "/index.html?debug");
  await p.evaluate(function () {
    var S = window.ECBSIM; S.settings.tourDone = true; S.settings.fast = true; S.settings.debugMode = true; S.saveSettings();
    window.log = [];
    var play = S.sound.play; S.sound.play = function (n) { window.log.push("sound:" + n); return play.apply(this, arguments); };
    var dlg = S.ui.dialog; S.ui.dialog = function (o) { window.log.push("dialog:" + o.title); return dlg.apply(this, arguments); };
    var cin = S.ui.cinema; S.ui.cinema = function (G, k, t) { window.log.push("film:" + (k || S.ui.endingKind(G))); return cin.apply(this, arguments); };
    var fx = S.ui.yearFx; S.ui.yearFx = function (y, d) { window.log.push("yearfx:" + y); return fx.apply(this, arguments); };
  });
  await p.click(".title-menu .btn:has-text('Start a new game')");
  if (mode === "post") { await p.click("input[name=period][value=post]"); await p.waitForTimeout(200); }
  await p.evaluate(function () { var c = document.querySelector(".guided input"); if (c) { c.checked = false; } });
  if (begin) { await p.fill(".dbg-begin input", String(begin)); }
  await p.click(".start .btn.primary:has-text('Start')"); await p.waitForTimeout(800);
  await p.evaluate(function () { window.ECBSIM.debugHidden = true; window.ECBSIM.applyDebug(); window.log = []; });
  return p;
}
async function state(p) {
  return p.evaluate(function () {
    var S = window.ECBSIM, G = S.G;
    return { year: G && G.year, over: G && G.over, finished: G && G.finished, pend: !!(G && G.pendingSuccession), overlays: document.querySelectorAll(".overlay").length,
      titles: Array.from(document.querySelectorAll(".overlay .dhead span")).map(function (e) { return e.textContent; }), film: !!document.querySelector(".cine"), crash: !!document.querySelector(".crash"),
      yearfx: !!document.querySelector(".yearfx"), screen: (document.querySelector(".crash") || {}).className || "", log: window.log.slice() };
  });
}
async function decideAll(p) { await p.evaluate(function () { var S = window.ECBSIM; S.auto.decideAll(S.G, "realistic"); S.ui.render(); }); }
/* The film comes back when removed with the inspector; its title stays
   until Show summary, silent; Enter then leads on */
async function titleWaits(p, sc) {
  await p.evaluate(function () { document.querySelector(".cine").remove(); }); await p.waitForTimeout(100);
  if (!await p.$(".cine")) { fail(sc, "the film does not come back after removal"); }
  if (!await p.$(".cine .cine-title.in")) { await p.keyboard.press("Escape"); }
  await p.waitForTimeout(1200);
  var s = await state(p);
  if (!s.film || s.screen) { fail(sc, "the film's title went on by itself"); }
  if (!await p.$(".cine .cine-title.in .btn:has-text('Show summary')")) { fail(sc, "the film's title has no Show summary"); }
  if (s.log.some(function (l) { return l === "sound:gavel" || l === "sound:bad"; })) { fail(sc, "the film's title makes a sound by itself: " + s.log.join(", ")); }
  await p.keyboard.press("Enter"); await p.waitForTimeout(400);
}
async function skipFilm(p) { for (var i = 0; i < 6 && await p.$(".cine:not(.timelapse)"); i++) { await p.keyboard.press("Escape"); await p.waitForTimeout(150); await p.keyboard.press("Enter"); await p.waitForTimeout(400); } }
var SC = {
  /* The last year of the period ends into the Federation */
  periodEnd: async function () {
    var p = await fresh("pre", 2040); await decideAll(p);
    await p.evaluate(function () { var U = window.ECBSIM.ui; U.cardIndex = 1; U.render(); });
    await p.click("#end-year"); await p.waitForTimeout(600);
    var s = await state(p);
    /* The agenda keeps its item until the film covers the window */
    var card = await p.evaluate(function () { return window.ECBSIM.ui.cardIndex; });
    if (card !== 1) { fail("periodEnd", "the agenda changed under the film's fade-in"); }
    if (s.log.some(function (l) { return l === "sound:turn"; })) { fail("periodEnd", "the turn sound plays into the ending: " + s.log.join(", ")); }
    if (s.log.some(function (l) { return /^dialog:.*in review/.test(l); })) { fail("periodEnd", "the year report opens into the ending"); }
    if (s.log.some(function (l) { return /^yearfx/.test(l); })) { fail("periodEnd", "the year transition plays into the ending"); }
    if (!s.film) { fail("periodEnd", "no film"); }
    /* The film comes first; the Federation screen waits for its Continue */
    if (s.screen) { fail("periodEnd", "the end screen shows before or under the film"); }
    await p.waitForTimeout(700);
    card = await p.evaluate(function () { return window.ECBSIM.ui.cardIndex; });
    if (card !== 0) { fail("periodEnd", "the page did not move on once the film covered it"); }
    await titleWaits(p, "periodEnd"); await skipFilm(p); s = await state(p);
    if (s.screen.indexOf("federation") < 0) { fail("periodEnd", "no Federation screen: " + s.screen); }
    if (s.overlays) { fail("periodEnd", "a dialog shows over the Federation screen: " + s.titles); }
    /* Required: Escape and a click do nothing; removed with the inspector, it comes back */
    await p.keyboard.press("Escape"); await p.mouse.click(5, 400); await p.waitForTimeout(300);
    s = await state(p); if (s.screen.indexOf("federation") < 0) { fail("periodEnd", "the Federation screen closed with Escape or a click"); }
    await p.evaluate(function () { document.querySelector(".crash").remove(); }); await p.waitForTimeout(100);
    s = await state(p); if (s.screen.indexOf("federation") < 0) { fail("periodEnd", "the Federation screen does not come back after removal"); }
    var before = await p.evaluate(function () { return window.ECBSIM.ui.view; });
    await p.click(".sidebar .sideitem >> nth=2", { force: true }).catch(function () {}); await p.waitForTimeout(200);
    var after = await p.evaluate(function () { return window.ECBSIM.ui.view; });
    if (before !== after) { fail("periodEnd", "the page under the Federation screen took a click"); }
    await p.click(".crash .btn:has-text('Continue into the Federation')"); await p.waitForTimeout(600);
    s = await state(p); if (s.finished || s.year !== 2041 || s.overlays || s.screen) { fail("periodEnd", "continuing did not start 2041 cleanly: " + JSON.stringify(s)); }
    return p;
  },
  /* A bad ending at the end of a year */
  badEnd: async function () {
    var p = await fresh("pre", 2012); await decideAll(p);
    await p.evaluate(function () { var S = window.ECBSIM, e = S.game.endYear; S.game.endYear = function (G) { var r = e.apply(this, arguments); G.over = { reason: "trust", year: r.year }; return r; }; });
    await p.click("#end-year"); await p.waitForTimeout(600);
    var s = await state(p);
    if (s.log.some(function (l) { return l === "sound:turn" || /^yearfx/.test(l) || /in review/.test(l); })) { fail("badEnd", "year steps play into a bad ending: " + s.log.join(", ")); }
    /* The film comes first; the crash screen waits until the film leads into it */
    if (!s.film || s.crash) { fail("badEnd", "the crash screen shows before or under the film"); }
    await titleWaits(p, "badEnd"); await skipFilm(p); s = await state(p);
    if (!s.crash) { fail("badEnd", "no crash screen"); }
    if (s.overlays) { fail("badEnd", "a dialog shows over the crash screen: " + s.titles); }
    /* The crash screen comes back after removal; keys do nothing under it */
    await p.evaluate(function () { document.querySelector(".crash").remove(); }); await p.waitForTimeout(100);
    s = await state(p); if (!s.crash) { fail("badEnd", "the crash screen does not come back after removal"); }
    await p.keyboard.press("e"); await p.keyboard.press("1"); await p.waitForTimeout(200);
    s = await state(p); if (s.year !== 2012 && s.year !== 2013) { fail("badEnd", "keys moved the run"); }
    return p;
  },
  /* A run that ends in its first year: its chart names the year once and shows the figure */
  firstYear: async function () {
    var p = await fresh("pre", 0);
    await p.evaluate(function () { var S = window.ECBSIM; S.G.over = { reason: "trust", year: S.G.year }; S.ui.playEnding(function () { S.ui.render(); }); });
    await p.waitForTimeout(600); await skipFilm(p);
    var r = await p.evaluate(function () { var c = document.querySelector(".crash-panel svg"); return c ? { years: Array.from(c.querySelectorAll("text:not(.value)")).map(function (t) { return t.textContent; }), dots: c.querySelectorAll("circle.point").length, value: !!c.querySelector("text.value") } : null; });
    if (!r) { fail("firstYear", "no chart on the crash screen"); return p; }
    if (r.years.length !== 1) { fail("firstYear", "the year is not named once: " + r.years.join(" | ")); }
    if (!r.dots || !r.value) { fail("firstYear", "the figure of the only year is not shown"); }
    return p;
  },
  /* A key bound to another action works in its place, and a taken key swaps */
  rebind: async function () {
    var p = await fresh("pre", 0);
    var r = await p.evaluate(function () { var S = window.ECBSIM; var a = S.keyBind("views.next", "k"), b = S.keyBind("window.save", "m"); S.saveSettings(); S.ui.build(); S.ui.render(); document.activeElement.blur(); return [a.ok, b.swapped && b.swapped[0], S.keyFor("window.sound"), S.keyBind("views.prev", "5").ok]; });
    if (!r[0] || r[1] !== "window.sound" || r[2] !== "s") { fail("rebind", "binding or swapping failed: " + JSON.stringify(r)); }
    if (r[3]) { fail("rebind", "a digit was bound in the game, where 1 to 9 choose options"); }
    await p.keyboard.press("k"); await p.waitForTimeout(200);
    var v = await p.evaluate(function () { return window.ECBSIM.ui.view; });
    await p.keyboard.press("]"); await p.waitForTimeout(200);
    var v2 = await p.evaluate(function () { return window.ECBSIM.ui.view; });
    if (v !== "council" || v2 !== "council") { fail("rebind", "the new key does not act, or the old one still does: " + v + ", " + v2); }
    await p.evaluate(function () { window.ECBSIM.keyReset(); window.ECBSIM.saveSettings(); });
    return p;
  },
  /* A succession falls in the year the period ends */
  successionAtEnd: async function () {
    var p = await fresh("pre", 2040); await decideAll(p);
    await p.evaluate(function () { var S = window.ECBSIM, e = S.game.endYear; S.game.endYear = function (G) { var r = e.apply(this, arguments); G.pendingSuccession = { accepted: true, chance: 1 }; return r; }; });
    await p.click("#end-year"); await p.waitForTimeout(500); await skipFilm(p);
    var s = await state(p);
    if (s.titles.length || s.screen.indexOf("federation") < 0) { fail("successionAtEnd", "the end of the period is not its screen alone: " + JSON.stringify(s.titles) + " " + s.screen); }
    return p;
  },
  /* Debug: the jump into the end of the period asks, and stopping before it is clean */
  debugJump: async function () {
    var p = await fresh("pre", 2035);
    await p.evaluate(function () { var S = window.ECBSIM; S.settings.debugBarOn = true; S.saveSettings(); S.applyDebug(); S.ui.render(); });
    await p.waitForTimeout(300);
    await p.click(".dbg-bar .btn:has-text('End the period')"); await p.waitForTimeout(300);
    var s = await state(p); if (s.titles.indexOf("Play into the ending?") < 0) { fail("debugJump", "no question before the ending"); }
    await p.click(".overlay .btn:has-text('Play into the ending')"); await p.waitForTimeout(1500);
    s = await state(p); if (!s.finished) { fail("debugJump", "playing into the ending did not end the period: " + JSON.stringify(s)); }
    if (s.log.some(function (l) { return /in review/.test(l); })) { fail("debugJump", "a year report opened during the jump"); }
    await skipFilm(p); s = await state(p);
    if (s.screen.indexOf("federation") < 0) { fail("debugJump", "no Federation screen after the jump: " + s.screen); }
    /* An Enter pressed as the film ends does not act on the screen */
    await p.keyboard.press("Enter"); await p.waitForTimeout(300);
    s = await state(p); if (s.screen.indexOf("federation") < 0) { fail("debugJump", "an Enter after the film continued past the Federation screen"); }
    return p;
  },
  /* Keys and clicks during the year transition */
  transition: async function () {
    var p = await fresh("pre", 2015); await decideAll(p);
    await p.evaluate(function () { var S = window.ECBSIM; S.settings.fast = false; S.saveSettings(); });
    await p.evaluate(function () { var S = window.ECBSIM, d = S.game.decide; S.game.decide = function () { window.log.push("decide:" + new Error().stack.split("\n").slice(2, 5).join(" < ")); return d.apply(this, arguments); }; });
    await p.click("#end-year"); await p.waitForTimeout(100);
    var y = await p.evaluate(function () { return window.ECBSIM.G.year; });
    var d0 = await p.evaluate(function () { return window.ECBSIM.G.agenda.filter(function (e) { return e.done; }).length; });
    await p.keyboard.press("e"); await p.keyboard.press("y"); await p.keyboard.press("d"); await p.mouse.click(700, 500); await p.waitForTimeout(100);
    var y2 = await p.evaluate(function () { return [window.ECBSIM.G.year, window.ECBSIM.G.agenda.filter(function (e) { return e.done; }).length]; });
    if (y2[0] !== y || y2[1] !== d0) { fail("transition", "keys or a click acted during the year transition: " + JSON.stringify(y2) + " " + (await state(p)).log.filter(function (l) { return /^decide/.test(l); }).slice(0, 2).join(" || ")); }
    return p;
  },
  /* The true ending: the film fades into the finale, the time-lapse plays from its button, then review */
  trueEnd: async function () {
    var p = await fresh("post", 2069);
    await p.evaluate(function () { var S = window.ECBSIM; S.auto.playTo(S.G, 2070, "realistic", true); S.ui.render(); });
    var y = await p.evaluate(function () { return [window.ECBSIM.G.year, !!window.ECBSIM.G.over]; });
    if (y[1]) { console.log("  (the run ended early, skipped)"); return p; }
    await decideAll(p); await p.click("#end-year", { timeout: 5000 }); await p.waitForTimeout(600);
    var s = await state(p);
    if (s.log.some(function (l) { return l === "sound:turn" || /^yearfx/.test(l) || /in review/.test(l); })) { fail("trueEnd", "year steps play into the true ending: " + s.log.join(", ")); }
    await skipFilm(p); await p.waitForTimeout(500);
    /* The film fades into the finale; the time-lapse plays from its button only */
    s = await state(p);
    if (s.screen.indexOf("finale") < 0) { fail("trueEnd", "no finale screen after the film: " + s.screen); }
    if (await p.$(".timelapse")) { fail("trueEnd", "the time-lapse started by itself"); }
    await p.click(".crash .btn:has-text('Watch the time-lapse')"); await p.waitForTimeout(300);
    var tl = await p.$(".timelapse"); if (!tl) { fail("trueEnd", "the time-lapse button did not play it"); }
    /* Keys reach the time-lapse alone: Enter and Space do not press the finale's button again */
    await p.keyboard.press("Enter"); await p.keyboard.press(" "); await p.waitForTimeout(200);
    if ((await p.$$(".timelapse")).length !== 1) { fail("trueEnd", "a key started a second time-lapse"); }
    /* Speed plays it faster */
    await p.keyboard.press("f"); await p.waitForTimeout(100);
    var sp = await p.evaluate(function () { var b = document.querySelector(".timelapse .cine-ctl .btn[aria-pressed=true]"); return b ? b.textContent : ""; });
    if (sp.indexOf("2") < 0) { fail("trueEnd", "the speed control did not speed up: " + sp); }
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, "stress-timelapse.png") });
    /* Removed with the inspector, it comes back; Skip goes to the coda, which waits for Show summary */
    await p.evaluate(function () { document.querySelector(".timelapse").remove(); }); await p.waitForTimeout(100);
    if (!await p.$(".timelapse")) { fail("trueEnd", "the time-lapse does not come back after removal"); }
    await p.keyboard.press("Escape"); await p.waitForTimeout(1200);
    if (!await p.$(".timelapse .tl-end:not([hidden]) .btn:has-text('Show summary')")) { fail("trueEnd", "Skip did not lead to the coda with Show summary"); }
    var op = await p.evaluate(function () {
      /* A color as three channels from 0 to 255, from rgb() or color(srgb) */
      function rgb(v) { var n = (v.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(v) ? n.slice(0, 3).map(function (x) { return Math.round(x * 255); }) : n.slice(0, 3); }
      var m = document.querySelector(".timelapse .tl-draw path.stayed"); if (!m) { return "no member on the map"; }
      var c = getComputedStyle(m), a = rgb(c.stroke), b = rgb(c.fill);
      return a.length === 3 && a.every(function (x, i) { return Math.abs(x - b[i]) <= 1; }) ? "" : c.stroke + " on " + c.fill;
    });
    if (op) { fail("trueEnd", "the borders inside the Federation are not gone in the coda: " + op); }
    await p.screenshot({ path: path.join(OUT, "stress-coda.png") });
    await p.keyboard.press("Enter"); await p.waitForTimeout(900);
    var fin = await p.$(".crash.finale"); if (!fin || await p.$(".timelapse")) { fail("trueEnd", "the time-lapse did not return to the finale"); }
    await p.screenshot({ path: path.join(OUT, "stress-finale.png") });
    await p.click(".crash .btn:has-text('Review the run')"); await p.waitForTimeout(400);
    var rv = await p.$(".review-banner"); if (!rv) { fail("trueEnd", "no review banner"); }
    var dec = await p.evaluate(function () { var S = window.ECBSIM; return S.game.decide(S.G, 0, 0); });
    if (dec !== null) { fail("trueEnd", "a decision went through after the true ending"); }
    return p;
  },
  /* The playlist: a change switches the music at once, in a game and on
     the title screen, and a preview plays the chosen playlist's piece */
  playlist: async function () {
    var p = await fresh("pre", 0);
    var r = await p.evaluate(function () {
      var S = window.ECBSIM, out = [];
      S.settings.sound = true; S.settings.music = true; S.settings.playlist = "european"; S.music.update();
      out.push(S.music.playing());
      S.settings.playlist = "resistance"; S.music.update(); out.push(S.music.playing());
      S.music.preview("troika"); out.push(S.music.playing()); S.music.stopPreview();
      S.G = null; S.ui.render(); S.music.update(); out.push(S.music.playing());
      S.settings.playlist = "european"; S.music.update(); out.push(S.music.playing());
      return out;
    });
    if (r[0] && r[1] !== "r_" + r[0]) { fail("playlist", "a change of playlist waits: " + r.join(", ")); }
    if (r[2] && r[2] !== "r_troika") { fail("playlist", "a preview ignores the playlist: " + r[2]); }
    if (r[3] && r[3].indexOf("r_") !== 0) { fail("playlist", "the title screen ignores the playlist: " + r[3]); }
    if (r[4] && r[4].indexOf("r_") === 0) { fail("playlist", "the title screen keeps the resistance piece: " + r[4]); }
    if (!r[0]) { console.log("  (no audio in this browser, skipped)"); }
    return p;
  },
  /* A finished run loaded from a save opens on its required screen */
  loadEnded: async function () {
    var p = await fresh("pre", 2012);
    var id = await p.evaluate(function () { var S = window.ECBSIM; S.G.over = { reason: "breakup", year: 2012 }; var slot = S.saves.saveNew(S.G, "ended"); S.G = null; S.ui.render(); return slot.id; });
    await p.waitForTimeout(300);
    await p.evaluate(function (id) { var S = window.ECBSIM, slot = S.saves.get(id), saved = S.store.get("save-" + id); S.ui.loadGame(saved.game, slot); }, id).catch(function (e) { console.log("  (load)", e.message.split("\n")[0]); });
    await p.waitForTimeout(400);
    var s = await state(p);
    if (!s.crash) { fail("loadEnded", "a loaded broken-up run does not open on its crash screen"); }
    if (s.overlays) { fail("loadEnded", "a dialog opened over the crash screen: " + s.titles); }
    return p;
  }
};
(async function () {
  await new Promise(function (r) { server.listen(0, "127.0.0.1", r); });
  b = await pw.chromium.launch();
  for (var k in SC) {
    if (only && only !== k) { continue; }
    console.log(k);
    try { var p = await SC[k](); if (p.errors.length) { fail(k, "page errors: " + p.errors.join(" | ")); } await p.context().close(); }
    catch (e) { fail(k, "threw: " + e.message.split("\n")[0]); }
  }
  await b.close(); server.close();
  console.log(fails.length ? fails.length + " failures" : "stress: all paths pass");
  process.exit(fails.length ? 1 : 0);
})();
