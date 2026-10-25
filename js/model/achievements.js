/* Achievements: milestones a player earns once and keeps across games.
   Each has a name, a line that says how to earn it, and a test on the run
   (and, for a vote, on the vote just cast). The tests only read the run;
   js/ui/achievements.js keeps what was earned and announces it.

   Two rules keep them fair. A run marked by debug (G.taint, an action of
   the debug tools that changed it) earns none, except Market
   manipulator, which says it was changed. A run imported from a file
   has a sandbox (G.sandbox, set by S.sandbox at the import): the
   achievements it already met then stay out of reach for good, and the
   years it counts are only those played after the import. */
(function () {
  var S = window.ECBSIM, Gm = S.game;

  /* The euro area's figure k in year y of the run */
  function ea(G, k, y) { var s = (G.series.EA || {})[k]; return s ? s[y] : null; }
  /* Years the run has completed, oldest first; in a sandbox, only those
     played after the import */
  function years(G) { var out = [], from = G.sandbox ? Math.max(G.startYear, G.sandbox.year) : G.startYear; for (var y = from; y < G.year; y++) { out.push(y); } return out; }
  /* A period that ended well: the treaty of 2041 or the last Greek payment of 2070 */
  function done(G, mode) { return G.finished === mode && !G.over; }

  S.ACHIEVEMENTS = [
    { id: "first", name: "First year in office", text: "Complete a year.",
      test: function (G) { return G.year > G.startYear; } },
    { id: "unanimous", name: "Unanimous", text: "Win a Governing Council vote with no member against.",
      test: function (G, vote) { return !!vote && vote.passed && vote.no === 0; } },
    { id: "notroika", name: "No men in black", text: "Reach 2016 in the first period without the bank in a Troika.",
      test: function (G) { return G.mode === "pre" && G.year >= 2016 && Gm.path(G).noTroika; } },
    { id: "nodraghi", name: "Whatever it did not take", text: "Reach 2021 in the first period without a Draghi measure.",
      test: function (G) { return G.mode === "pre" && G.year >= 2021 && Gm.path(G).noDraghi; } },
    { id: "greece", name: "Greece stays", text: "Reach 2021 in the first period with Greece in the euro.",
      test: function (G) { return G.mode === "pre" && G.year >= 2021 && !G.c.GR.exited; } },
    { id: "jobs", name: "Full employment", text: "End a year with unemployment in the euro area below 6%.",
      test: function (G) { var u = ea(G, "u", G.year - 1); return u != null && u < 6; } },
    { id: "prices", name: "Close to 2%", text: "Keep inflation in the euro area between 1.5% and 2.5% for five years in a row.",
      test: function (G) {
        var run = 0;
        return years(G).some(function (y) { var p = ea(G, "p", y); run = p != null && p >= 1.5 && p <= 2.5 ? run + 1 : 0; return run >= 5; });
      } },
    { id: "trust", name: "Trusted", text: "End a year with trust in the bank at 60% or more.",
      test: function (G) { var t = ea(G, "trust", G.year - 1); return t != null && t >= 60; } },
    { id: "eurobonds", name: "One debt", text: "Have governments adopt eurobonds before 2041.",
      test: function (G) { var p = G.proposals.eurobonds; return G.mode === "pre" && p && p.passed && p.year && p.year < 2041; } },
    { id: "treaty", name: "Treaty change", text: "Finish a treaty campaign.",
      test: function (G) { return G.treaty && G.treaty.done.length > 0; } },
    { id: "federation", name: "The Federal Treaty", text: "Reach 2041 and the Federation of Europe.",
      test: function (G) { return done(G, "pre"); } },
    { id: "other", name: "By other means", text: "Reach the Federation without the Troika and without a Draghi measure.",
      test: function (G) { var p = Gm.path(G); return done(G, "pre") && p.noTroika && p.noDraghi; } },
    { id: "record", name: "Better than the record", text: "End a period with no grade below C.",
      test: function (G) { if (!done(G, G.mode)) { return false; } var g = Gm.grades(G); return Object.keys(g).every(function (k) { return g[k].l <= "C"; }); } },
    { id: "honours", name: "Top marks", text: "End a period with every grade an A.",
      test: function (G) { if (!done(G, G.mode)) { return false; } var g = Gm.grades(G); return Object.keys(g).every(function (k) { return g[k].l === "A"; }); } },
    { id: "hard", name: "Against the odds", text: "Reach the Federation on Hard, played on Hard from the first year.",
      test: function (G) { return done(G, "pre") && G.difficulty === "hard" && (G.levelLog || []).every(function (l) { return l.d === "hard"; }); } },
    { id: "loans", name: "The last payment", text: "Reach 2070 and the end of the Greek loans.",
      test: function (G) { return done(G, "post"); } },
    { id: "lesson", name: "A lesson learned", text: "See a run end early.",
      test: function (G) { return !!G.over; } },
    /* The one achievement of a run changed by the debug tools: it says so */
    { id: "manipulator", name: "Market manipulator", text: "Change a run with the debug tools.", debug: true,
      test: function (G) { return S.tainted(G); } }
  ];

  /* What the tests find now, without the rules of fairness */
  function met(G, vote) {
    return S.ACHIEVEMENTS.filter(function (a) { try { return a.test(G, vote); } catch (e) { return false; } }).map(function (a) { return a.id; });
  }
  /* The achievements a run has earned now, by id: only Market manipulator
     when debug marked it, and in a sandbox none it had already met at the
     import */
  S.earnedBy = function (G, vote) {
    var blocked = G.sandbox && G.sandbox.met || [], tainted = S.tainted(G);
    return met(G, vote).filter(function (id) {
      var a = S.ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
      return blocked.indexOf(id) < 0 && (!tainted || a.debug);
    });
  };
  /* What the run meets by the rules alone, as if no debug tool had
     touched it (a file's sandbox still counts), for the debug tools:
     Achievement notices and the Situation tab */
  S.metBy = function (G, vote) {
    var blocked = G.sandbox && G.sandbox.met || [];
    return met(G, vote).filter(function (id) { return blocked.indexOf(id) < 0; });
  };
  S.tainted = function (G) { return !!(G && G.taint && G.taint.length); };
  /* Puts a run read from a file in a sandbox: from the year it is in, with
     every achievement it meets now (counted over the whole run) out of
     reach. A run imported again keeps what its earlier sandbox blocked. */
  S.sandbox = function (G, at) {
    var before = G.sandbox && G.sandbox.met || [], now = met(G, null);
    var keep = before.concat(now.filter(function (id) { return before.indexOf(id) < 0; }));
    G.sandbox = { at: at || new Date().toISOString(), year: G.year, met: keep };
    return G;
  };
  /* Marks a run as changed by the debug tools: the year, what was done,
     and when. The mark stays with the run in every save and export. */
  S.taint = function (G, what) {
    if (!G) { return; }
    G.taint = (G.taint || []).concat([{ y: G.year, a: String(what).slice(0, 200), at: new Date().toISOString() }]);
  };
})();
