/* Automatic play, used by the debug panel and the tests: choose an option
   on every open item by a strategy, end years, and play to a chosen year.

   Strategies:
   - history: the historical choice where a card has one, else the option
     whose rate is closest to the historical rate, else the first option;
   - intended: the first option tagged as the intended path, else the option
     closest to a mildly dovish stance that is neither a Draghi measure nor
     the Troika;
   - first: the first option that is allowed;
   - random: any allowed option, from the run's own random numbers. */
(function () {
  var S = window.ECBSIM, Gm = S.game, A = S.auto = {};

  A.pick = function (G, card, strategy) {
    var ok = card.options.map(function (o, i) { return o.disabled ? -1 : i; }).filter(function (i) { return i >= 0; });
    if (!ok.length) { return -1; }
    if (strategy === "history") {
      for (var i = 0; i < card.options.length; i++) {
        if (card.options[i].hist && !card.options[i].disabled) { return i; }
      }
      if (card.id === "rate") {
        var h = S.model.histRate(G.year), best = ok[0], bd = 1e9;
        ok.forEach(function (j) { var d = Math.abs(card.options[j].rateTo - h); if (d < bd) { bd = d; best = j; } });
        return best;
      }
      return ok[0];
    }
    if (strategy === "intended") {
      for (var k = 0; k < ok.length; k++) {
        if ((card.options[ok[k]].tags || []).indexOf("intended") >= 0) { return ok[k]; }
      }
      var pick = ok[0], bl = 1e9;
      ok.forEach(function (j) {
        var o = card.options[j], tags = o.tags || [];
        if (tags.indexOf("draghi") >= 0 || tags.indexOf("troika") >= 0) { return; }
        var l = Math.abs((o.lean || 0) + 0.4);
        if (l < bl) { bl = l; pick = j; }
      });
      return pick;
    }
    /* Realistic: what a player would do, the historical choice while the
       record has one, then the advice of the first advisor whose option is
       open */
    if (strategy === "realistic") {
      for (var h = 0; h < card.options.length; h++) {
        if (card.options[h].hist && !card.options[h].disabled) { return h; }
      }
      for (var a = 0; a < (G.advisors || []).length; a++) {
        var rec = S.advise && S.advise.recommend ? S.advise.recommend(G, G.advisors[a], card) : null;
        if (rec && rec.index >= 0 && ok.indexOf(rec.index) >= 0) { return rec.index; }
      }
      return ok[0];
    }
    if (strategy === "random") {
      return ok[Math.floor(Gm.rng(G)() * ok.length)];
    }
    return ok[0];
  };

  /* Decides every open item; returns the number decided */
  A.decideAll = function (G, strategy) {
    var n = 0;
    G.agenda.forEach(function (e, i) {
      if (e.done) { return; }
      var k = A.pick(G, Gm.card(G, e), strategy);
      if (k >= 0) { Gm.decide(G, i, k); n++; }
    });
    return n;
  };

  /* Spends the year's initiatives on the first proposal not yet adopted */
  A.useInitiatives = function (G) {
    var order = ["modest", "directRecap", "eurobonds", "eibPlan", "conversion", "depositInsurance"];
    while (G.initiatives > 0) {
      var pick = null;
      order.forEach(function (k) { if (!pick && !G.proposals[k].passed && G.year >= S.PROPOSALS[k].from) { pick = k; } });
      if (!pick || !Gm.initiative(G, "push", pick)) {
        if (!Gm.initiative(G, "hearing")) { break; }
      }
    }
  };

  /* The next president's name: the first president's name with the number
     of the presidency, as A, A II, A III, so a name never stacks numerals */
  var ROMAN = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  function roman(n) { var out = ""; ROMAN.forEach(function (r) { while (n >= r[0]) { out += r[1]; n -= r[0]; } }); return out; }
  A.successorName = function (G) {
    var base = String(G.presidents[0] ? G.presidents[0].name : G.president.name).replace(/( [IVX]+)+$/, "");
    return base + " " + roman(G.presidents.length + 1);
  };
  /* Plays until the given year begins, the run ends, or a guard trips.
     A succession names the next president after the first one. */
  A.playTo = function (G, year, strategy, initiatives) {
    var guard = 0;
    while (!G.over && !G.finished && G.year < year && guard++ < 80) {
      if (G.pendingSuccession) {
        Gm.succeed(G, { name: A.successorName(G), country: G.president.country, background: G.president.background });
      }
      A.decideAll(G, strategy);
      if (initiatives) { A.useInitiatives(G); }
      Gm.endYear(G);
    }
    if (G.pendingSuccession && !G.over && !G.finished) {
      Gm.succeed(G, { name: A.successorName(G), country: G.president.country, background: G.president.background });
    }
    return G;
  };
})();
