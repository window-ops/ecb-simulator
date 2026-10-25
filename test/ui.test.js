/* The game in a real browser: starts runs, decides items, opens every view
   and dialog, checks the map, footnotes, debug panel, storage page, table
   heads and flush margins, and takes screenshots in light and dark themes
   and at phone width. Fails on any console error or page error.

     node test/ui.test.js [screenshot folder] [years to play]

   It serves the game itself on a free port. It needs Playwright with
   Chromium (npm install -g playwright, then npx playwright install
   chromium); without Playwright it reports that it was skipped. */
"use strict";
var path = require("path"), fs = require("fs"), http = require("http");
var pw = null;
try { pw = require("playwright"); } catch (e) {
  try { pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright"); } catch (e2) { pw = null; }
}
if (!pw) { console.log("ui: skipped, Playwright is not installed"); process.exit(0); }
var ROOT = path.join(__dirname, "..");
var OUT = process.argv[2] || path.join(require("os").tmpdir(), "ecb-simulator-shots");
var YEARS = Number(process.argv[3] || 3);
fs.mkdirSync(OUT, { recursive: true });
var TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".json": "application/json" };
var server = http.createServer(function (req, res) {
  var p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (p.indexOf(ROOT) !== 0 || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { p = path.join(ROOT, "index.html"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

(async function () {
  await new Promise(function (r) { server.listen(0, "127.0.0.1", r); });
  var URL = "http://127.0.0.1:" + server.address().port + "/index.html";
  var browser = await pw.chromium.launch();
  var errors = [];
  async function page(opts) {
    var ctx = await browser.newContext(opts);
    var p = await ctx.newPage();
    p.on("console", function (m) { if (m.type() === "error") { errors.push("console: " + m.text()); } });
    p.on("pageerror", function (e) { errors.push("page: " + e.message + "\n" + e.stack); });
    await p.goto(URL);
    /* The title screen comes first; its menu opens the form for a new game */
    await p.waitForSelector(".title-screen");
    await p.click(".title-menu .btn:has-text('Start a new game')");
    await p.waitForSelector(".start");
    return p;
  }
  /* Layout rules, checked in the page: headings have equal space above
     and below unless a flush edge removes one; the first and last visible
     text child of a box has no outer margin; column heads stay on one line */
  async function layout(p, where) {
    var bad = await p.evaluate(function () {
      var out = [];
      var BOX = ".page, .group, .dbody, .pane, .advcard, .adv, .histbox, .result, .grade, .popover, .coach, .toast-text, .notes li, .start, .dbg-body";
      function visible(e) { return !e.hidden && e.getClientRects().length > 0; }
      document.querySelectorAll(BOX).forEach(function (box) {
        if (!visible(box)) { return; }
        var kids = Array.prototype.filter.call(box.children, function (c) { return !c.hidden && c.tagName !== "SCRIPT"; });
        if (!kids.length) { return; }
        var first = kids[0], last = kids[kids.length - 1];
        if (/^(H[1-4]|P|UL|OL|DL)$/.test(first.tagName) && parseFloat(getComputedStyle(first).marginTop) !== 0) { out.push("first child with a top margin in ." + box.className.split(" ")[0] + ": " + first.textContent.slice(0, 40)); }
        if (/^(H[1-4]|P|UL|OL|DL)$/.test(last.tagName) && parseFloat(getComputedStyle(last).marginBottom) !== 0) { out.push("last child with a bottom margin in ." + box.className.split(" ")[0] + ": " + last.textContent.slice(0, 40)); }
      });
      document.querySelectorAll("h1, h2, h3, h4").forEach(function (h) {
        if (!visible(h)) { return; }
        var cs = getComputedStyle(h), t = parseFloat(cs.marginTop), b = parseFloat(cs.marginBottom);
        var parent = h.parentElement, kids = Array.prototype.filter.call(parent.children, function (c) { return !c.hidden; });
        var isFirst = kids[0] === h, isLast = kids[kids.length - 1] === h;
        if (t !== b && !(isFirst && t === 0) && !(isLast && b === 0)) { out.push("heading with unequal margins (" + t + " and " + b + "): " + h.textContent.slice(0, 40)); }
      });
      document.querySelectorAll("th").forEach(function (th) {
        if (!visible(th)) { return; }
        var lh = parseFloat(getComputedStyle(th).lineHeight) || 20;
        if (th.getBoundingClientRect().height > lh * 2 + 14) { out.push("column head on several lines: " + th.textContent); }
      });
      return out;
    });
    bad.forEach(function (b) { errors.push(where + ": " + b); });
  }
  async function shot(p, name) { await p.screenshot({ path: path.join(OUT, name + ".png"), fullPage: false }); }
  async function skipTour(p) {
    try { await p.waitForSelector(".coach", { timeout: 3000 }); await p.click(".coach .btn:has-text('Skip the tour')"); } catch (e) {}
  }
  async function closeDialogs(p) {
    for (var i = 0; i < 4; i++) {
      /* A dialog fading out still holds its buttons; only open ones count */
      var d = await p.$(".overlay:not(.closing) .dfoot .btn.primary");
      if (!d) { break; }
      try { await d.click(); } catch (e) {}
      await p.waitForTimeout(250);
    }
  }
  async function playYear(p, k) {
    for (var guard = 0; guard < 8; guard++) {
      var next = await p.$(".aitem:not(.done)");
      if (!next) { break; }
      await next.click();
      var opts = await p.$$(".opt:not(.disabled)");
      if (!opts.length) { throw new Error("no options"); }
      await opts[(k + guard) % opts.length].click({ position: { x: 12, y: 12 } });
      await p.click("[data-tour=decide]");
      await p.waitForTimeout(2600);
    }
    var push = await p.$(".initiatives .btn:not([disabled])");
    if (push) { await push.click(); await p.waitForTimeout(100); }
    await p.click("#end-year");
    await p.waitForTimeout(1500);
  }

  /* Desktop, light */
  var p = await page({ viewport: { width: 1366, height: 860 }, colorScheme: "light" });
  await shot(p, "01-start-light");
  await p.click(".start .btn.primary:has-text('Start')");
  await p.waitForSelector(".coach");
  await shot(p, "02-tour");
  await p.click(".coach .btn:has-text('Skip the tour')");
  await shot(p, "03-agenda-2008");
  await p.click(".aitem:has-text('Ireland guarantees its banks')");
  await p.waitForTimeout(200);
  var notes = await p.$$eval(".notes li", function (l) { return l.length; });
  if (notes < 2) { errors.push("the Irish guarantee card has " + notes + " notes"); }
  await p.click(".text .fnref");
  await p.waitForTimeout(100);
  await shot(p, "03b-footnotes");
  await layout(p, "agenda");
  await p.click(".aitem:has-text('Interest rates')");
  var opt = await p.$(".opt:not(.disabled)"); await opt.click();
  await shot(p, "04-option-selected");
  await p.click("[data-tour=decide]");
  await p.waitForTimeout(800);
  await shot(p, "05-vote");
  await p.waitForTimeout(2200);
  for (var y = 0; y < YEARS; y++) {
    await playYear(p, y);
    if (y === 0) { await shot(p, "06-report"); }
    var succ = await p.$(".overlay:has-text('A new president')");
    if (succ) { await shot(p, "succession"); }
    await closeDialogs(p);
  }
  await shot(p, "07-agenda-later");
  /* Saves: Save makes a named save at once; Load lists every save in the
     order chosen, with headings spaced evenly */
  await p.click("#save-game");
  await p.waitForTimeout(300);
  await layout(p, "save dialog");
  await p.fill(".save-name input", "First");
  await p.click(".save-go");
  await p.waitForTimeout(400);
  var saved = await p.evaluate(function () { var S = window.ECBSIM; return S.saves.list().map(function (x) { return S.saves.label(x.slot) + " " + (x.slot.name || ""); }); });
  if (saved.indexOf("1A-1M First") < 0) { errors.push("Save does not make a named save at once: " + saved.join(", ")); }
  await p.click("#load-game");
  await p.waitForTimeout(300);
  await p.selectOption(".save-sort select", "name");
  await p.waitForTimeout(100);
  var order = await p.$$eval(".slot-name > span:first-child", function (l) { return l.map(function (e) { return e.textContent; }); });
  if (order.join(",") !== "Autosave,First") { errors.push("saves sorted by name come in the order " + order.join(", ")); }
  await shot(p, "07b-saves");
  await layout(p, "load dialog");
  await p.selectOption(".save-order select >> nth=1", "kind");
  await p.waitForTimeout(100);
  var groups = await p.$$eval(".save-group > h4", function (l) { return l.map(function (e) { return e.textContent; }); });
  if (groups.join(",") !== "Autosaves (1),Manual saves (1)") { errors.push("saves grouped by kind show the groups " + groups.join(", ")); }
  await layout(p, "grouped saves");
  await p.selectOption(".save-order select >> nth=1", "none");
  await p.click(".overlay:not(.closing) .dfoot .btn:has-text('Close')");
  await p.waitForTimeout(300);
  var views = ["Governing Council", "Countries", "Advisors", "Parliament", "Proposals and treaties", "Archive", "Glossary"];
  for (var i = 0; i < views.length; i++) {
    await p.click(".sidebar .sideitem:has-text('" + views[i] + "')");
    await p.waitForTimeout(400);
    await shot(p, "08-view-" + i);
  }
  await p.click(".sidebar .sideitem:has-text('Countries')");
  await p.click("td .btn:has-text('Greece')");
  await p.waitForTimeout(1000);
  await shot(p, "09-greece");
  var states = await p.$$eval(".map path.st", function (l) { return l.length; });
  if (states < 15) { errors.push("the map shows only " + states + " states"); }
  await layout(p, "countries");
  await p.dispatchEvent(".map path[aria-label='Spain']", "click");
  await p.waitForTimeout(300);
  var head = await p.textContent(".page .section h2");
  if (head.indexOf("Spain") < 0) { errors.push("clicking Spain on the map does not open its charts"); }
  await p.selectOption(".map-tools select", "u");
  await p.waitForTimeout(200);
  await shot(p, "09b-map-unemployment");
  if (!(await p.$$(".map text.code")).length) { errors.push("the map shows no state codes"); }
  await p.click(".map-tools .check input");
  await p.waitForTimeout(200);
  await p.$eval(".map-tools", function (e) { e.scrollIntoView(); });
  await shot(p, "09c-map-no-codes");
  if ((await p.$$(".map text.code")).length) { errors.push("the state codes stay on the map when switched off"); }
  await p.click(".map-tools .check input");
  for (var vi = 0; vi < views.length; vi++) {
    await p.click(".sidebar .sideitem:has-text('" + views[vi] + "')");
    await p.waitForTimeout(200);
    await layout(p, views[vi]);
  }
  await p.click(".toolbar .btn[title^='Settings']");
  await p.waitForTimeout(300);
  await shot(p, "10-settings");
  await layout(p, "settings");
  await p.click(".settings .sideitem:has-text('Sound')");
  await shot(p, "11-settings-sound");
  await p.click(".settings .sideitem:has-text('Storage')");
  await p.click(".settings label:has-text('This computer') input");
  await p.waitForTimeout(200);
  var local = await p.evaluate(function () { return localStorage.getItem("ecbsim-save-local"); });
  if (local !== "1") { errors.push("choosing This computer does not keep the game in localStorage"); }
  await shot(p, "11b-storage");
  await layout(p, "storage");
  /* Wipe data on refresh, in Debug > Testing, with This computer: both pages warn */
  await p.click(".settings .sideitem:has-text('Debug')");
  await p.click(".settings label.switch:has-text('Start fresh') .track");
  await p.waitForTimeout(150);
  if (!(await p.$(".set-warn"))) { errors.push("Debug gives no warning when This computer and Wipe data on refresh are both on"); }
  await p.click(".settings .sideitem:has-text('Storage')");
  if (!(await p.$(".set-warn"))) { errors.push("Storage gives no warning when This computer and Wipe data on refresh are both on"); }
  await p.click(".settings .sideitem:has-text('Debug')");
  await p.click(".settings label.switch:has-text('Start fresh') .track");
  /* The tools are disabled until Debug mode grants them */
  if (!(await p.$(".settings .row.off label.switch:has-text('movable panel')"))) { errors.push("the debug tools are not disabled while debug mode is off"); }
  await p.click(".settings label.switch:has-text('Allow the debug tools') .track");
  await p.waitForTimeout(150);
  await p.click(".settings label.switch:has-text('movable panel') .track");
  await p.waitForTimeout(200);
  if (!(await p.$(".dbg"))) { errors.push("the debug panel does not open"); }
  await shot(p, "11c-debug");
  await p.click(".settings .sideitem:has-text('Bank name')");
  await p.selectOption(".settings select", "Greek");
  await p.waitForTimeout(200);
  await shot(p, "12-bank-name");
  await p.click(".settings .sideitem:has-text('Appearance')");
  await p.click(".swatch[aria-label='Purple']");
  await p.click(".settings label:has-text('Breeze Dark') input");
  await p.waitForTimeout(200);
  await shot(p, "13-dark-purple");
  await p.keyboard.press("Escape");
  await p.click(".sidebar .sideitem:has-text('Agenda')");
  await shot(p, "14-agenda-dark");
  await p.click(".dbg .dbg-tab:has-text('Time')");
  await p.fill(".dbg .dbg-time input[type=number]", "2016");
  await p.click(".dbg .dbg-time .btn:has-text('Go to')");
  await p.waitForTimeout(500);
  await closeDialogs(p);
  var yr = await p.evaluate(function () { return window.ECBSIM.G.year; });
  if (yr < 2016) { errors.push("Play to year stopped at " + yr); }
  await shot(p, "15-debug-2016");
  await p.close();

  /* Phone, dark */
  var m = await page({ viewport: { width: 390, height: 844 }, colorScheme: "dark", isMobile: true, hasTouch: true });
  await shot(m, "20-phone-start");
  await m.click(".start .btn.primary:has-text('Start')");
  await skipTour(m);
  await m.waitForTimeout(300);
  await shot(m, "21-phone-agenda");
  var sw = await m.evaluate(function () { return document.documentElement.scrollWidth - window.innerWidth; });
  if (sw > 0) { errors.push("horizontal overflow at phone width: " + sw + "px"); }
  await m.click(".bottomnav button:has-text('Countries')");
  await m.waitForTimeout(400);
  await shot(m, "22-phone-countries");
  await m.evaluate(function () { var S = window.ECBSIM, play = S.sound.play; window.played = []; S.sound.play = function (n) { window.played.push(n); return play.apply(this, arguments); }; });
  await m.click(".bottomnav button:has-text('More')");
  await shot(m, "23-phone-more");
  await m.click(".bottomnav button:has-text('More')");
  await m.click(".tool-menu");
  await m.keyboard.press("Escape");
  var sounds = await m.evaluate(function () { return window.played.join(","); });
  if (sounds !== "pop,close,pop,close") { errors.push("the phone's menus sound " + sounds + " as they open and close"); }
  await m.close();

  /* Post-federative start */
  var q = await page({ viewport: { width: 1280, height: 800 }, colorScheme: "light", reducedMotion: "reduce" });
  await q.click(".choice label:has-text('Post-federative') input");
  await q.click(".start .btn.primary:has-text('Start')");
  await skipTour(q);
  await shot(q, "30-post-agenda");
  await playYear(q, 1); await closeDialogs(q);
  await q.click(".sidebar .sideitem:has-text('Parliament')");
  await q.waitForTimeout(300);
  await shot(q, "31-post-parliament");
  await q.close();

  /* A whole run, fast-forwarded in the page: succession and ending */
  var f = await page({ viewport: { width: 1280, height: 860 }, colorScheme: "light" });
  await f.click(".start .btn.primary:has-text('Start')");
  await skipTour(f);
  await f.evaluate(function () {
    var S = window.ECBSIM, G = S.G;
    function decideAll() {
      G.agenda.forEach(function (e, i) {
        if (e.done) { return; }
        var c = S.game.card(G, e), k = 0;
        c.options.forEach(function (o, j) { if (!o.disabled && (o.tags || []).indexOf("intended") >= 0 && k === 0) { k = j; } });
        if (c.options[k].disabled) { k = c.options.findIndex(function (o) { return !o.disabled; }); }
        S.game.decide(G, i, k);
      });
      while (G.initiatives > 0 && S.game.initiative(G, "push", Object.keys(G.proposals).filter(function (k) { return !G.proposals[k].passed && G.year >= S.PROPOSALS[k].from; })[0] || "eibPlan")) {}
    }
    for (var n = 0; n < 7 && !G.over; n++) { decideAll(); S.game.endYear(G); }
  });
  await f.evaluate(function () { window.ECBSIM.ui.render(); if (window.ECBSIM.G.pendingSuccession) { window.ECBSIM.ui.successionDialog(); } });
  await f.waitForTimeout(400);
  await shot(f, "40-succession");
  await closeDialogs(f);
  await f.evaluate(function () {
    var S = window.ECBSIM, G = S.G;
    for (var n = 0; n < 40 && !G.over && !G.finished; n++) {
      if (G.pendingSuccession) { S.game.succeed(G, { name: "Next", country: "PT", background: "union" }); }
      G.agenda.forEach(function (e, i) {
        if (e.done) { return; }
        var c = S.game.card(G, e), k = 0;
        c.options.forEach(function (o, j) { if (!o.disabled && (o.tags || []).indexOf("intended") >= 0 && k === 0) { k = j; } });
        if (c.options[k].disabled) { k = c.options.findIndex(function (o) { return !o.disabled; }); }
        S.game.decide(G, i, k);
      });
      S.game.endYear(G);
    }
    S.ui.render();
  });
  await f.waitForTimeout(400);
  await shot(f, "41-ending");
  await layout(f, "ending");
  var cont = await f.$(".crash .btn:has-text('Continue into the Federation')");
  if (cont) { await cont.click(); await f.waitForTimeout(300); await shot(f, "42-federation"); }
  await f.close();

  await browser.close();
  server.close();
  if (errors.length) { console.log(errors.map(function (e) { return "  FAIL " + e; }).join("\n")); console.log("ui: " + errors.length + " problems"); process.exit(1); }
  console.log("ui: passed, screenshots in " + OUT);
})().catch(function (e) { console.error(e); server.close(); process.exit(1); });
