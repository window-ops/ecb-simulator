/* Advisor recommendations and forecasts. A recommendation scores each
   option of a card by the school's weights; a forecast runs one year of
   the model on a copy of the game with the option applied and the
   school's own parameters. */
(function () {
  var S = window.ECBSIM, A = S.advise = {};

  function attrs(opt) {
    var a = {};
    Object.keys(opt.attr || {}).forEach(function (k) { a[k] = opt.attr[k]; });
    a.hawk = opt.lean || 0;
    a.novelty = opt.novelty || 0;
    return a;
  }
  function weightsFor(G, id) {
    var sch = S.ADVISORS[id], w = {};
    Object.keys(sch.weights).forEach(function (k) { w[k] = sch.weights[k]; });
    if (sch.dynamic) { w = sch.dynamic(G, w); }
    return w;
  }
  /* The reason is the attribute that adds most to the score; for the rate
     stance a dovish option speaks with the school's "dove" line */
  /* On cards other than the rate decision, the reason is never the rate
     stance itself, since those lines speak of inflation and rates */
  A.score = function (G, id, opt, rateCard) {
    var w = weightsFor(G, id), a = attrs(opt), s = 0, top = null, topV = 0;
    Object.keys(a).forEach(function (k) {
      var v = (w[k] || 0) * a[k];
      s += v;
      if (k === "hawk" && !rateCard) { return; }
      if (v > topV) { topV = v; top = k === "hawk" && a.hawk < 0 ? "dove" : k; }
    });
    return { score: s, reason: top, sign: topV };
  };
  /* The rate the school wants: a simple rule on inflation and the change
     in unemployment, with the school's bias */
  function rateRec(G, id, card) {
    var sch = S.ADVISORS[id], v = G.ea.v || {}, prev = (G.series.EA && G.series.EA.u && G.series.EA.u[G.year - 2]);
    var du = prev != null && v.u != null ? v.u - prev : 0;
    var want = Math.max(0, G.pol.rate + 0.5 * ((v.p || 2) - 2) - sch.rule.u * du + sch.rule.bias);
    var best = -1, bd = 1e9;
    card.options.forEach(function (o, i) {
      if (o.disabled || o.rateTo == null) { return; }
      var d = Math.abs(o.rateTo - want);
      if (d < bd - 1e-9) { bd = d; best = i; }
    });
    var ch = best >= 0 ? card.options[best].rateTo - G.pol.rate : 0;
    var key = ch > 0.01 ? "hawk" : ch < -0.01 ? "dove" : "other";
    return { index: best, line: sch.lines[key] || sch.lines.other };
  }
  /* The school's line on the year's situation: the first of the year's
     kinds of crisis it has a line for, or the calm year's. Figures and the
     state concerned fill its blanks. */
  function situation(G, id, card) {
    var ctx = S.ADVISORS[id].context; if (!ctx) { return ""; }
    var k = G.kinds || (S.game.crisisKinds ? S.game.crisisKinds(G) : {}), v = G.ea.v || {};
    var code = card && card.args && card.args.code;
    var order = ["debt", "banks", "prices", "deflation", "slump", "climate"], key = null, i, x;
    for (i = 0; i < order.length; i++) {
      x = order[i];
      if (!k[x] || !ctx[x]) { continue; }
      if (x === "debt" && !code && G.year < 2041) {
        var best = -1; S.model.members(G).forEach(function (c) { var sp = S.model.expectedSpread(G, c); if (sp > best) { best = sp; code = c; } });
      }
      if (x === "debt" && !code) { continue; }
      key = x;
      break;
    }
    /* A crisis year without a matching line (a crisis item of another kind,
       or a state's debt with no state to name) never takes the calm wording:
       it takes another of the school's crisis lines, debt only with a state,
       or no line at all */
    if (!key && k.any) {
      key = ["banks", "slump", "prices", "deflation", "climate", "debt"].filter(function (x) { return ctx[x] && (x !== "debt" || code); })[0];
      if (!key) { return ""; }
    }
    if (!key) { key = "calm"; }
    var spread = code && G.year < 2041 ? S.model.expectedSpread(G, code) : 0;
    return (ctx[key] || "").replace("{state}", code ? S.COUNTRY[code].name : "").replace("{s}", spread.toFixed(1))
      .replace("{p}", v.p != null ? v.p.toFixed(1) : "2.0").replace("{u}", v.u != null ? v.u.toFixed(1) : "7.0");
  }
  A.situation = situation;
  /* The option the advisor recommends, and the line that explains it,
     opened by what the school says of the year */
  A.recommend = function (G, id, card) {
    var r = recommendOnly(G, id, card), lead = situation(G, id, card);
    if (lead && r.line) { r.line = lead + " " + r.line; }
    return r;
  };
  function recommendOnly(G, id, card) {
    if (card.id === "rate") { return rateRec(G, id, card); }
    var best = -1, bestS = -1e9, info = null;
    card.options.forEach(function (o, i) {
      if (o.disabled) { return; }
      var r = A.score(G, id, o, false);
      if (r.score > bestS + 1e-9) { bestS = r.score; best = i; info = r; }
    });
    var sch = S.ADVISORS[id];
    var line = (info && info.reason && sch.lines[info.reason]) || sch.lines.other;
    return { index: best, line: line };
  }

  /* A one-year forecast with the advisor's parameters: euro area
     unemployment and inflation, and the spread and unemployment of the
     card's focus country */
  A.forecast = function (G, id, card, optIndex) {
    var params = id ? S.ADVISORS[id].params : S.model.TRUE;
    var copy = JSON.parse(JSON.stringify(G));
    copy.preview = true;
    try {
      var o = card.options[optIndex];
      if (o.apply) { o.apply(copy, S.game.quietRng()); }
      S.model.step(copy, params);
    } catch (e) {
      return null;
    }
    var f = card.focus && copy.c[card.focus] && copy.c[card.focus].v ? copy.c[card.focus].v : null;
    return {
      u: copy.ea.v.u, p: copy.ea.v.p,
      fu: f ? f.u : null, fs: f ? f.s : null, focus: card.focus || null
    };
  };
})();
