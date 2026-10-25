/* The model without a browser: whole runs with several strategies, in both
   periods and continued from one into the other. Checks that every card
   has options, that forecasts and figures stay finite, that a run taking
   every historical choice stays close to the record, that the quieter
   items and the crisis items follow their rules, and that the intended
   path can keep Greece in the euro.

     node test/model.test.js */
"use strict";
var S = require("./load")(), T = require("./check"), check = T.check;

function play(mode, strategy, seed, initiatives, continueToFed, scope, accession, seenIds) {
  var G = S.game.create({ mode: mode, seed: seed, scope: scope, accession: accession, advisors: ["ordo", "postk", "eurocom"], president: { name: "Test", country: "FR", background: "central" } });
  var guard = 0, seen = {};
  while (!G.over && guard++ < 80) {
    if (G.finished === "pre" && continueToFed) { S.game.toFederation(G); }
    if (G.finished) { break; }
    if (G.pendingSuccession) { S.game.succeed(G, { name: "Next " + G.year, country: "IT", background: "academic" }); }
    G.agenda.forEach(function (e) {
      if (seenIds) { seenIds.push(e.id + ":" + ((e.args && e.args.code) || "") + ":" + G.year); }
      var def = S.CARDS[e.id], filler = S.game.FILLERS.indexOf(e.id) >= 0, crisis = S.game.CRISIS.indexOf(e.id) >= 0;
      /* An item marked once never repeats, one with variants comes back only
         as often as it has variants, and a settled matter never returns.
         The quieter items come only in calm years, crisis items only in
         crisis years. */
      if (filler || crisis) {
        seen[e.id] = (seen[e.id] || 0) + 1;
        check(seen[e.id] <= (def.once ? 1 : def.variants.length), e.id + " comes back no more often than it has variants (" + G.year + ")");
        check(!(def.settled && def.settled(G)), e.id + " is not on the agenda once settled (" + G.year + ")");
        check(filler ? !G.kinds.any : G.kinds.any, e.id + (filler ? " only in a calm year" : " only in a crisis year") + " (" + G.year + ")");
      }
      var card = S.game.card(G, e);
      check(G.agenda.length <= 6, "at most six items in " + G.year);
      check(card.options.length > 0, e.id + " has options");
      card.options.forEach(function (o) { var y = o.done && G.flags["done:" + o.done]; check(!y || y >= G.year, e.id + ": a measure already taken is not offered again"); });
      card.options.forEach(function (o, i) {
        var f = S.advise.forecast(G, G.advisors[0], card, i);
        check(f && isFinite(f.u) && isFinite(f.p), "forecast " + e.id + " " + G.year);
      });
    });
    /* No essential item of the year's pool is left out while there is room, whatever the area of responsibility */
    if (G.agenda.length < 6) {
      (G.kinds.any ? S.game.CRISIS : S.game.FILLERS).forEach(function (id) {
        if (S.CARDS[id].essential) { check(!S.game.itemArgs(G, id), id + " is essential and comes when it is due (" + G.year + ", " + (G.scope || "standard") + ")"); }
      });
    }
    S.auto.decideAll(G, strategy);
    if (initiatives) { S.auto.useInitiatives(G); }
    check(S.game.endYear(G), "end of " + G.year);
    ["u", "p", "d", "g", "trust", "fr"].forEach(function (k) { check(isFinite(G.ea.v[k]), "finite " + k + " in " + G.year); });
  }
  return G;
}
function at(G, k, key, y) { var s = G.series[k]; return s && s[key] && s[key][y]; }

/* The area of responsibility: Narrow and Broad play whole runs, and the
   calm years hold the number of items each sets */
["narrow", "broad"].forEach(function (scope) {
  var R = play("post", "random", 4, true, false, scope), sc = S.game.scope(R);
  check(R.scope === scope, "the run keeps its area of responsibility: " + scope);
  check(sc.calm === (scope === "narrow" ? 2 : 4), scope + " fills a calm year to " + sc.calm);
});

/* EU enlargement: with every candidate chosen, each state's items come in
   their years, each joins the EU then, Scotland after its referendum, and
   by 2041 every state in the EU has a date for the currency */
var ALL = S.CANDIDATES.map(function (c) { return c.code; }), ids = [];
var E = play("pre", "realistic", 5, false, true, null, ALL, ids);
check(E.accession.length === ALL.length, "the run keeps the candidates chosen");
ALL.forEach(function (k) {
  var a = S.ACCESSION[k], c = E.c[k];
  if (E.over && E.over.year < a.eu) { return; }
  check(ids.indexOf("eu-accession:" + k + ":" + a.eu) >= 0, k + " comes up for accession in " + a.eu);
  check(c.eu === a.eu, k + " joins the EU in " + a.eu + " (" + c.eu + ")");
  if (a.euro === "unilateral") { check(ids.indexOf("unilateral-euro:" + k + ":" + (a.eu - 2)) >= 0, k + " has its euro item in " + (a.eu - 2)); }
  if (a.independent) { check(c.independent === a.independent && ids.indexOf("scotland-referendum:" + k + ":" + a.referendum) >= 0, k + " votes in " + a.referendum + " and is independent from " + a.independent); }
  if (!E.over || E.over.year > 2041) { check(c.joined != null && c.joined <= 2045, k + " has a date for the currency (" + c.joined + ")"); }
});
var P = play("post", "random", 6, false, false, null, ALL, ids = []);
ALL.forEach(function (k) {
  var a = S.ACCESSION[k], c = P.c[k];
  if (a.eu <= 2041) { check(c.eu === 2041 && c.joined === 2041, k + " starts the Federation as a member"); }
  else if (!P.over || P.over.year >= a.eu) { check(c.eu === a.eu && c.joined > a.eu, k + " joins the Federation in " + a.eu + ", the currency after"); }
});
var N = S.game.create({ mode: "pre", advisors: ["ordo", "postk", "eurocom"], president: { name: "Test", country: "FR", background: "central" } });
check(N.accession.length === 0 && !ALL.some(function (k) { return N.c[k]; }), "with none chosen, no candidate is in the run");

/* A run from a file: the runs played here pass the import check, and
   malformed or hostile data is refused */
function copy(x) { return JSON.parse(JSON.stringify(x)); }
[E, P].forEach(function (R) { check(S.game.validate(copy(R)) === null, "a played run passes the import check (" + S.game.validate(copy(R)) + ")"); });
[["an unknown card", function (g) { g.agenda[0].id = "nope"; }],
  ["a prototype key", function (g) { return JSON.parse(JSON.stringify(g).replace("{", "{\"__proto__\":{\"polluted\":1},")); }],
  ["a year out of range", function (g) { g.year = 1e9; }],
  ["an unknown state", function (g) { g.c.ZZ = {}; }],
  ["a long name", function (g) { g.president.name = new Array(200).join("x"); }],
  ["a text too long", function (g) { g.log.push({ t: new Array(6000).join("y") }); }],
  ["a function-like value", function (g) { g.pol.rate = "1e999"; }],
  ["no agenda", function (g) { delete g.agenda; }],
  ["another save format", function (g) { g.v = 2; }]].forEach(function (t) {
  var g = copy(E), r = t[1](g) || g;
  check(S.game.validate(r) !== null, "the import check refuses " + t[0]);
});
check(S.game.validate(null) !== null && S.game.validate([1]) !== null && S.game.validate("x") !== null, "the import check refuses what is not a game");
check(({}).polluted === undefined, "no import touches the base object");

/* An export file: several games with their saves pass; a file with an
   unknown key, two autosaves in a game, a bad date or a bad run is refused;
   a file of the first format reads as one game */
function save(G, kind, extra) { var x = { kind: kind, save: { at: "2026-10-24T12:00:00.000Z", game: copy(G) } }; Object.keys(extra || {}).forEach(function (k) { x[k] = extra[k]; }); return x; }
var file = { app: "ecb-simulator", games: [{ saves: [save(E, "automatic"), save(E, "manual", { number: 2, name: "Before" })] }, { saves: [save(P, "manual", { number: 1 })] }] };
check(!S.game.validateExport(copy(file)).error, "an export of two games passes (" + S.game.validateExport(copy(file)).error + ")");
check(!S.game.validateExport(Object.assign(copy(file), { v: 2 })).error, "an export made before, with v: 2, passes");
[["an unknown key", function (f) { f.extra = 1; }],
  ["two autosaves", function (f) { f.games[0].saves.push(save(E, "automatic")); }],
  ["a bad date", function (f) { f.games[0].saves[0].save.at = "yesterday"; }],
  ["a bad number", function (f) { f.games[0].saves[1].number = 0.5; }],
  ["a long name", function (f) { f.games[0].saves[1].name = new Array(60).join("n"); }],
  ["a bad run", function (f) { f.games[1].saves[0].save.game.year = 3000; }],
  ["no games", function (f) { f.games = []; }],
  ["another version", function (f) { f.v = 3; }]].forEach(function (t) {
  var f = copy(file); t[1](f);
  check(!!S.game.validateExport(f).error, "an export with " + t[0] + " is refused");
});
var one = S.game.validateExport({ app: "ecb-simulator", v: 1, game: copy(E) });
check(!one.error && one.games.length === 1 && one.games[0].saves[0].kind === "automatic", "a file of the first format reads as one game");

/* Fair achievements: a run marked by debug earns none; a run from a file
   earns none it met before the import, and counts only years played after it */
var A = copy(E);
check(S.earnedBy(A).length > 0, "a run as played earns achievements");
S.taint(A, "Decide all with Realistic");
check(S.earnedBy(A).join() === "manipulator" && S.game.validate(A) === null, "a run marked by debug earns only Market manipulator, and its mark passes the import check");
check(S.earnedBy(E).indexOf("manipulator") < 0, "a run without debug does not earn Market manipulator");
var B = copy(E), had = S.earnedBy(B);
S.sandbox(B);
check(S.earnedBy(B).length === 0 && B.sandbox.met.length === had.length, "a run from a file earns none of what it met before the import");
check(S.game.validate(copy(B)) === null, "a sandbox passes the import check");
var C = S.game.create({ mode: "pre", advisors: ["ordo", "postk", "eurocom"], president: { name: "Test", country: "FR", background: "central" } });
S.auto.playTo(C, 2012, "history");
S.sandbox(C);
var prices = S.ACHIEVEMENTS.filter(function (a) { return a.id === "prices"; })[0];
C.series.EA = C.series.EA || {}; C.series.EA.p = C.series.EA.p || {};
[2008, 2009, 2010, 2011].forEach(function (y) { C.series.EA.p[y] = 2; });
C.year = 2013; C.series.EA.p[2012] = 2;
check(!prices.test(C), "years before the import do not count toward a streak (" + C.sandbox.year + ")");

/* History: close to the record */
var H = play("pre", "history", 1, false);
check(!H.over, "the history run reaches 2041 (" + (H.over && H.over.reason) + ")");
[["GR", 2013], ["ES", 2013], ["IT", 2012], ["IE", 2011], ["DE", 2015]].forEach(function (p) {
  var run = at(H, p[0], "u", p[1]), rec = S.model.base(p[0], "u", p[1]);
  check(run != null && Math.abs(run - rec) < 1.5, p[0] + " unemployment " + p[1] + ": run " + run + ", record " + rec);
});
var gs = at(H, "GR", "s", 2012), gr = S.model.baseSpread("GR", 2012);
check(gs != null && Math.abs(gs - gr) < 2, "Greek spread 2012: run " + gs + ", record " + gr.toFixed(1));
var hg = S.game.grades(H);
check(["B", "C", "D"].indexOf(hg.welfare.l) >= 0 && ["B", "C", "D"].indexOf(hg.greece.l) >= 0, "history grades near C: " + hg.welfare.l + ", " + hg.greece.l);

/* The intended path with proposals pressed: Greece stays */
var I = play("pre", "intended", 2, true);
check(!I.c.GR.exited, "the intended path keeps Greece in the euro");
check(Object.keys(I.used.draghi).length === 0 && Object.keys(I.used.troika).length === 0, "the intended path uses no Draghi measure and no Troika");

/* Random runs, the post-federative period, and a continued run */
for (var s = 3; s < 9; s++) { play("pre", "random", s, s % 2 === 0); }
var P = play("post", "intended", 11, true);
check(P.finished === "post" || P.over, "the post-federative run ends");
var C = play("pre", "intended", 12, true, true);
check(C.mode === "post", "a run continues into the Federation");

/* Every president type installs */
["central", "finance", "academic", "union", "minister", "banker", "euofficial", "climate"].forEach(function (b) {
  var G = S.game.create({ mode: "pre", seed: 5, advisors: ["ordo", "mon", "newk"], president: { name: "X", country: "DE", background: b } });
  check(G.president.background === b && G.agenda.length >= 3, "president type " + b);
});

/* Saved games are plain JSON and continue the same way */
var A = S.game.create({ mode: "pre", seed: 7, advisors: ["ordo", "mon", "newk"], president: { name: "X", country: "DE", background: "central" } });
S.auto.playTo(A, 2012, "history");
var B = JSON.parse(JSON.stringify(A));
S.auto.playTo(A, 2016, "history"); S.auto.playTo(B, 2016, "history");
check(JSON.stringify(A.series.EA) === JSON.stringify(B.series.EA), "a saved game continues as the original");

console.log("  history run: Greek unemployment 2013 " + at(H, "GR", "u", 2013) + " (record 27.5), grades " + JSON.stringify({ w: hg.welfare.l, g: hg.greece.l, s: hg.stability.l, d: hg.democracy.l }));
T.done("model");
