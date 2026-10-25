/* The economic model.

   From 2008 to 2025 every country figure has a recorded value (the
   baseline). The model computes only the change the player's choices cause
   and adds it to the baseline, so a player who repeats every historical
   decision sees the recorded history. After 2025 the baseline is a neutral
   projection with Selk's climate shocks, and the same relations apply.

   The relations, per member state and year (docs/design-model.md, section 13):
   output follows the real rate, spreads and fiscal tightening, with a
   multiplier that is high in a recession with rates near zero (Blanchard
   and Leigh, 2013); unemployment follows output by Okun's coefficient;
   inflation follows its past and the output gap; spreads have a calm and a
   panic component, and the panic component shrinks with the backstop (De
   Grauwe, 2011); debt follows deficits and nominal growth; bank stability
   falls with spreads and frozen liquidity; trust and the far-right share
   follow unemployment, inflation and tightening (Funke, Schularick and
   Trebesch, 2016; Gabriel, Klein and Pessoa, forthcoming). */
(function () {
  var S = window.ECBSIM, M = S.model = {};
  var H = S.HIST, FIRST = S.FIRST_YEAR, LAST = S.LAST_DATA_YEAR;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  M.clamp = clamp;

  /* ---------- Baseline ---------- */
  function histAt(c, key, year) {
    var arr = c.hist[key];
    if (!arr) { return null; }
    if (c.joined === null) { return arr[0]; }
    var i = year - FIRST;
    if (i < 0) { i = 0; }
    if (i >= arr.length) { return null; }
    return arr[i];
  }
  /* Trend growth after 2025: the average of 2015 to 2019, kept between 0.8
     and 3 */
  var trendCache = {};
  function trend(c) {
    if (trendCache[c.code] != null) { return trendCache[c.code]; }
    var g = c.hist.g, v;
    if (g.length > 11) {
      v = (g[7] + g[8] + g[9] + g[10] + g[11]) / 5;
    } else { v = g[0]; }
    v = clamp(v, 0.8, 3.0);
    if (c.code === "IE") { v = 2.5; }
    trendCache[c.code] = v; return v;
  }
  function climate(c, year) {
    var e = H.climate[year], g = 0, p = 0;
    if (!e) { return { g: 0, p: 0 }; }
    if (e.all) { g += e.all.g; p += e.all.p; }
    if (e.south && H.SOUTH.indexOf(c.code) >= 0) { g += e.south.g; p += e.south.p; }
    return { g: g, p: p };
  }
  M.climate = climate;
  var projCache = {};
  /* The projection after 2025 (or after the last recorded year of a state
     that joins later): unemployment drifts toward 95% of its last value,
     inflation toward 2%, growth to trend, debt follows a 2% deficit, and
     the yield is the German yield plus a spread for debt above 60%. */
  function project(c, year) {
    var key = c.code + year;
    if (projCache[key]) { return projCache[key]; }
    var last = c.joined === null ? 0 : LAST - FIRST;
    var u0 = c.hist.u[last], p0 = c.hist.p[last], d0 = c.hist.d[last];
    /* The projection runs forward from the last year of data only. A year
       before it (a state with no record of its own, or a gap in one) takes
       the figures of that last year: run backwards, the decay below would
       grow without bound (0.5 to the power -17 in 2008) */
    var t = Math.max(0, year - LAST), gT = trend(c);
    var uT = clamp(u0 * 0.95, 3, 10);
    var cl = climate(c, year);
    var prev = year - 1 > LAST ? project(c, year - 1) : { d: d0 };
    var g = gT * (year > 2040 ? 0.85 : 1) + cl.g;
    var p = 2 + (p0 - 2) * Math.pow(0.5, t) + cl.p;
    var d = prev.d + 2.0 - prev.d * (g + p) / 100;
    var u = uT + (u0 - uT) * Math.pow(0.8, t) - c.okun * cl.g * 0.6;
    var de = 2.6 + Math.min(0.4, t * 0.04);
    var y = de + fund(d) + 0.3;
    if (c.code === "DE") { y = de; }
    var r = { u: u, p: p, d: d, y: y, g: g };
    projCache[key] = r; return r;
  }
  /* The calm part of a spread: 3.5 basis points per point of debt above 60% */
  function fund(d) { return Math.max(0, 0.035 * (d - 60)); }
  M.fund = fund;
  M.base = function (code, key, year) {
    var c = S.COUNTRY[code];
    if (year <= LAST && c.joined !== null) {
      if (key === "y" && !c.hist.y) {
        return M.base("DE", "y", year) + 0.6;
      }
      var v = histAt(c, key, year);
      if (v != null) { return v; }
    }
    return project(c, year)[key];
  };
  M.baseSpread = function (code, year) {
    if (code === "DE") { return 0; }
    return M.base(code, "y", year) - M.base("DE", "y", year);
  };
  /* A state's figures from the record for a year, for a state that has
     just joined and has none from the game yet */
  M.recordFigures = function (code, year) {
    return { u: M.base(code, "u", year), p: M.base(code, "p", year), d: M.base(code, "d", year), g: M.base(code, "g", year),
      s: M.baseSpread(code, year), bank: M.baseBank(code, year), record: true };
  };
  M.baseBank = function (code, year) {
    var crisis = (S.BANK_CRISES[code] || {})[year] || 0;
    return clamp(88 - 3.2 * Math.max(0, M.baseSpread(code, year)) - crisis, 3, 95);
  };
  M.histRate = function (year) { return H.rate[year] != null ? H.rate[year] : (year < 2040 ? 2.25 : 2.5); };
  M.histTrust = function (year) { return H.trust[year] != null ? H.trust[year] : (year < 2008 ? 53 : 45); };
  M.histFarRight = function (year) {
    var best = 11.7, ys = Object.keys(H.farRight).map(Number).sort(function (a, b) { return a - b; });
    ys.forEach(function (y) { if (y <= year) { best = H.farRight[y]; } });
    return best;
  };
  M.histTightening = function (code, year) {
    return ((H.tightening[code] || {})[year]) || 0;
  };
  M.histProgram = function (code, year) {
    var p = H.programs[code];
    return !!(p && year >= p.start && year <= p.end);
  };

  /* ---------- Membership and weights ---------- */
  M.isMember = function (G, code) {
    var c = G.c[code];
    return !!(c && c.joined !== null && c.joined <= G.year && !c.exited);
  };
  M.members = function (G) {
    /* The candidates a run assumes to join take part once they are members (S.game.states) */
    return S.game.states(G).filter(function (c) { return M.isMember(G, c.code); }).map(function (c) { return c.code; });
  };
  M.weights = function (G, codes) {
    var tot = 0, w = {};
    codes.forEach(function (k) { tot += S.COUNTRY[k].weight; });
    codes.forEach(function (k) { w[k] = S.COUNTRY[k].weight / tot; });
    return w;
  };

  /* Labor force weights, for unemployment */
  M.laborWeights = function (codes) {
    var tot = 0, w = {};
    codes.forEach(function (k) { tot += S.COUNTRY[k].lf; });
    codes.forEach(function (k) { w[k] = S.COUNTRY[k].lf / tot; });
    return w;
  };

  /* ---------- Money flows ---------- */
  /* Output in billions of euros, the recorded TARGET2 balance (held at its
     2025 level and fading after, faster in the Federation) and the
     euro area's lending to banks; js/data/flows.js holds the record */
  M.gdp = function (code, year) {
    var g = S.EA_GDP, i = year - FIRST;
    var ea = i < g.length ? g[Math.max(0, i)] : g[g.length - 1] * Math.pow(1.03, i - g.length + 1);
    return ea * S.COUNTRY[code].weight / 100;
  };
  M.t2Record = function (code, year) {
    var r = S.HIST_T2[code];
    if (!r) { return 0; }
    var i = year - FIRST;
    if (i < r.length) { return r[Math.max(0, i)]; }
    var v = r[r.length - 1] * Math.pow(0.95, i - r.length + 1);
    return year > 2041 ? v * Math.pow(0.8, year - 2041) : v;
  };
  M.lendingRecord = function (year) {
    var l = S.EA_LENDING, i = year - FIRST;
    return i < l.length ? l[Math.max(0, i)] : 50;
  };
  /* The player's world moves money out of a state when its spread rises
     above the record or its banks weaken: 1.2% of output a year for each
     point of spread, 0.2% for each point of bank stability lost. The gap
     fades by 15% a year. Lending to banks follows the balances: a state
     whose banks lose deposits borrows from its central bank. */
  function flows(G, members, year) {
    var lend = M.lendingRecord(year) * (G.pol.ltro3y && !H.used.ltro3y[year] ? 1.3 : 1) * (G.pol.tltro && !H.used.tltro[year] ? 1.4 : 1);
    var liab = 0;
    members.forEach(function (code) {
      var c = G.c[code], v = c.v, gdp = M.gdp(code, year);
      var bankGap = Math.max(0, M.baseBank(code, year) - v.bank);
      c.dT2 = 0.85 * (c.dT2 || 0) - gdp * (0.012 * (c.dSpr || 0) + 0.002 * bankGap);
      var t2 = M.t2Record(code, year) + c.dT2;
      v.flight = c.t2prev == null ? t2 - M.t2Record(code, year - 1) : t2 - c.t2prev;
      v.t2 = t2; c.t2prev = t2;
      liab += Math.max(0, -t2);
    });
    var w = M.weights(G, members);
    members.forEach(function (code) {
      var v = G.c[code].v, gdp = M.gdp(code, year);
      var share = liab > 0 ? Math.max(0, -v.t2) / liab : 0;
      var ela = G.pol.ela[code] === "frozen" ? 0 : Math.max(0, 45 - v.bank) / 100 * gdp * 0.3;
      v.lend = lend * (w[code] + share) / 2 + ela;
    });
  }

  /* ---------- Backstop ---------- */
  function backstopSum(G, histYear) {
    var I = S.INSTRUMENTS, sum = S.BACKSTOP_BASE;
    /* Purchase programs announced during a year count half in that year */
    var HALF = { smp: 1, omt: 1, qe: 1, pepp: 1, tpi: 1 };
    if (histYear != null) {
      Object.keys(H.used).forEach(function (k) {
        if (H.used[k][histYear] && I[k]) { sum += I[k].weight * (HALF[k] && !H.used[k][histYear - 1] ? 0.5 : 1); }
      });
      Object.keys(H.waiver).forEach(function (k) { if (H.waiver[k][histYear]) { sum += I.waiver.weight / 2; } });
      if (histYear >= 2012) { sum += 0.08; }
      sum += I.broad.weight;
      if (histYear >= 2013) { sum += I.guidance.weight; }
      if (histYear >= 2020 && histYear <= 2026) { sum += 0.10; }
      if (histYear >= 2041) { sum += 0.5; }
      return sum;
    }
    var P = G.pol;
    var since = P.since || {};
    ["fullAllot", "ltro1y", "cbpp", "smp", "ltro3y", "omt", "neg", "tltro", "qe", "pepp", "tpi", "guidance"].forEach(function (k) {
      if (P[k]) { sum += I[k].weight * (HALF[k] && (since[k] == null || since[k] === G.year) && G.year > G.startYear ? 0.5 : 1); }
    });
    if (P.collateral === "broad") { sum += I.broad.weight; }
    if (P.collateral === "strict") { sum -= 0.05; }
    Object.keys(P.waiver).forEach(function (k) { if (P.waiver[k]) { sum += I.waiver.weight / 2; } });
    if (P.elaOpen) { sum += I.elaOpen.weight; }
    sum += I.eib.weight * (P.eib || 0);
    Object.keys(G.proposals).forEach(function (k) {
      if (G.proposals[k].passed) { sum += S.PROPOSALS[k].backstop; }
    });
    if (G.esm) { sum += 0.08; }
    if (G.ngeu) { sum += 0.10; }
    if (G.treaty.done.indexOf("art123") >= 0) { sum += 0.15; }
    if (G.treaty.done.indexOf("debt") >= 0) { sum += 0.10; }
    if (G.year >= 2041) { sum += 0.5; }
    sum += G.bonus.backstop || 0;
    return sum;
  }
  function toB(sum) { return clamp(1 - Math.exp(-1.3 * sum), 0, 1); }
  M.backstop = function (G) { return toB(backstopSum(G)); };
  M.histBackstop = function (year) { return toB(backstopSum(null, Math.min(year, 2026))); };

  /* ---------- Fiscal tightening in the player's world ---------- */
  var ROLE = { full: 1.0, advisory: 0.8, refuse: 0.7 };
  function relief(G) {
    var r = 1;
    Object.keys(G.proposals).forEach(function (k) {
      if (G.proposals[k].passed && S.PROPOSALS[k].relief) { r *= 1 - S.PROPOSALS[k].relief; }
    });
    if (G.treaty.done.indexOf("dual") >= 0) { r *= 0.9; }
    return r;
  }
  M.relief = relief;
  /* Tightening this year, % of GDP, and the share of it caused by a program */
  M.tightening = function (G, code, year) {
    var hist = M.histTightening(code, year), prog = G.programs[code];
    var inProg = prog && prog.active && year >= prog.start;
    var histProg = M.histProgram(code, year);
    var t;
    if (inProg) {
      var role = ROLE[prog.role] || 1;
      var size = histProg ? hist : 2.0 * (prog.size || 1);
      t = size * role * prog.terms;
    } else if (histProg) {
      t = hist * 0.45;
    } else {
      t = hist;
    }
    if (G.year >= 2045 && G.fedRulesRepealed) { t *= 0.5; }
    return t * relief(G) + (G.c[code].forcedCut || 0);
  };

  /* ---------- One year ---------- */
  /* params: the model's parameters; advisors forecast with their own
     (js/data/advisors.js). */
  M.TRUE = { mult: 1.2, multCalm: 0.6, panic: 1.6, infl: 0.25, rate: 0.5, confidence: 0 };

  M.spreadFor = function (G, code, year, params) {
    params = params || M.TRUE;
    var c = G.c[code];
    if (year >= 2041 || code === "DE") { return 0; }
    var hs = M.baseSpread(code, year);
    var dh = M.base(code, "d", year);
    var panicH = Math.max(0, hs - 0.4 - fund(dh));
    var B = M.backstop(G), Bh = M.histBackstop(year);
    var mult = clamp(1 - params.panic * (B - Bh), 0.15, 2.5);
    mult *= 1 + Math.max(0, G.ea.dFR) / 40;
    var s = hs + (fund(dh + c.dD) - fund(dh)) + panicH * (mult - 1);
    s += elaGap(G, code, year) * -0.08;
    s += waiverGap(G, code, year) * -0.6;
    s += Math.max(0, (c.exitRisk || 0) - (c.exitFloor || 0) - 0.1) * 10;
    s += G.contagion || 0;
    s -= params.confidence * Math.max(0, M.tightening(G, code, year) - M.histTightening(code, year));
    return Math.max(Math.min(hs, 0.2), s);
  };
  var ELA = { open: 0, capped: -15, frozen: -30 };
  function elaGap(G, code, year) {
    var h = ((H.ela[code] || {})[year]) || "open";
    var p = G.pol.ela[code] || (G.pol.elaOpen ? "open" : h);
    var stressed = M.baseBank(code, year) < 45;
    if (!stressed && p === h) { return 0; }
    return (ELA[p] || 0) - (ELA[h] || 0);
  }
  function waiverGap(G, code, year) {
    var h = H.waiver[code] && H.waiver[code][year] ? 1 : 0;
    var p = G.pol.waiver[code] ? 1 : 0;
    if (!G.programs[code] && !M.histProgram(code, year)) { return 0; }
    return p - h;
  }

  /* Runs the model for G.year, writing each member's figures for the year.
     params lets the advisors forecast with their own beliefs; a forecast
     runs on a copy of the state. */
  M.step = function (G, params) {
    params = params || M.TRUE;
    var year = G.year, P = G.pol, members = M.members(G);
    var dRnow = (P.rate - M.histRate(year)) + (P.neg ? -0.35 : 0) - (H.used.neg[year] ? -0.35 : 0);
    var dR = 0.6 * dRnow + 0.4 * (G.ea.dRprev || 0);
    var qeGap = (P.qe ? 1 : 0) + (P.pepp ? 1 : 0) - (H.used.qe[year] ? 1 : 0) - (H.used.pepp[year] ? 1 : 0);
    var w = M.weights(G, members), lw = M.laborWeights(members), ea = { u: 0, p: 0, d: 0, g: 0, s: 0, bank: 0, dU: 0, dP: 0, loose: 0, y: 0 };
    members.forEach(function (code) {
      var c = G.c[code], co = S.COUNTRY[code];
      var bu = M.base(code, "u", year), bp = M.base(code, "p", year), bd = M.base(code, "d", year), bg = M.base(code, "g", year);
      var periphery = S.PERIPHERY.indexOf(code) >= 0;
      var spread = M.spreadFor(G, code, year, params);
      var hs = year >= 2041 ? 0 : M.baseSpread(code, year);
      var dSpr = spread - hs;
      /* Tightening the player's world does beyond or short of history */
      var loosen = M.histTightening(code, year) - M.tightening(G, code, year);
      c.L = 0.9 * (c.L || 0) + loosen;
      var slack = bg < 0.5 && P.rate < 1.5;
      var m = slack ? params.mult : params.multCalm;
      var eib = (P.eib || 0) * (periphery ? 0.25 : 0.12);
      var shock = c.shock || 0;
      c.shockP = 0.6 * (c.shockP || 0) + shock;
      c.shock = 0;
      var dGap = m * c.L - params.rate * dR - 0.3 * dSpr + eib + 0.25 * qeGap + c.shockP + (G.bonus.gap || 0) + (c.bonusGap || 0);
      var dG = dGap - (c.dGap || 0);
      c.H = 0.9 * (c.H || 0) + 0.05 * Math.max(0, c.dU || 0);
      var dU = -co.okun * dGap + c.H;
      var dP = 0.55 * (c.dP || 0) + params.infl * dGap + (c.shockInfl || 0) + (G.bonus.infl || 0) + 0.15 * qeGap;
      c.shockInfl = 0;
      c.dIR = 0.85 * (c.dIR || 0) + 0.15 * (dSpr + dRnow);
      var dDef = c.L - 0.45 * dGap + c.dIR * bd / 100 + (c.rescue || 0);
      c.rescue = 0;
      var dD = (c.dD || 0) * (1 - (bg + bp) / 100) + dDef - bd * (dG + dP) / 100;
      c.dGap = dGap; c.dU = dU; c.dP = dP; c.dD = dD; c.dSpr = dSpr; c.dG = dG;
      /* Bank stability */
      var bank = M.baseBank(code, year) - 2.5 * dSpr + elaGap(G, code, year) * 0.8 + waiverGap(G, code, year) * 8;
      if (P.collateral === "standard" && year >= 2009) { bank -= 4; }
      if (P.collateral === "strict") { bank -= 10; }
      if (G.proposals.directRecap && G.proposals.directRecap.passed) { bank += 6; }
      if (G.proposals.depositInsurance && G.proposals.depositInsurance.passed) { bank += 4; }
      if (P.neg && !H.used.neg[year]) { bank -= 2; }
      if (P.ltro3y && !H.used.ltro3y[year]) { bank += 4; }
      bank += c.bankBonus || 0;
      var v = c.v = {
        u: clamp(bu + dU, 0.5, 60),
        p: bp + dP,
        d: Math.max(0, bd + dD),
        g: bg + dG,
        s: year >= 2041 ? 0 : spread,
        bank: clamp(bank, 0, 100)
      };
      v.y = year >= 2041 ? null : M.base("DE", "y", year) + dRnow * 0.5 + (code === "DE" ? 0 : spread);
      ea.u += lw[code] * v.u; ea.p += w[code] * v.p; ea.d += w[code] * v.d; ea.g += w[code] * v.g;
      ea.s += w[code] * v.s; ea.bank += w[code] * v.bank; ea.dU += w[code] * dU; ea.loose += w[code] * loosen;
      record(G, code, v);
      exitRisk(G, code);
    });
    G.ea.dRprev = dRnow;
    flows(G, members, year);
    /* Euro area: trust and the far-right share */
    /* The same members' recorded or projected figures, kept beside the
       run's for the comparisons in the ending */
    var hp = 0, hu = 0, hs = 0, hg = 0;
    members.forEach(function (code) {
      hp += w[code] * M.base(code, "p", year); hu += lw[code] * M.base(code, "u", year);
      hg += w[code] * M.base(code, "g", year); hs += w[code] * (year >= 2041 ? 0 : Math.max(0, M.baseSpread(code, year)));
    });
    var inflPain = Math.max(0, ea.p - 3) - Math.max(0, hp - 3);
    var troika = troikaGap(G, year);
    G.ea.dTrust = 0.75 * (G.ea.dTrust || 0) - 1.0 * ea.dU - 1.2 * inflPain - 2.0 * troika + (G.bonus.trust || 0) + G.cover * 0.5;
    var trust = clamp(M.histTrust(year) + G.ea.dTrust, 3, 90);
    G.ea.dFR = 0.85 * (G.ea.dFR || 0) + 0.5 * ea.dU - 0.4 * ea.loose - 0.08 * G.ea.dTrust + (G.bonus.far || 0);
    var fr = clamp(M.histFarRight(year) + G.ea.dFR, 0, 80);
    G.ea.v = { u: ea.u, p: ea.p, d: ea.d, g: ea.g, s: ea.s, bank: ea.bank, trust: trust, fr: fr, B: M.backstop(G),
      rate: P.rate, fy: year >= 2041 ? fedYield(G, ea) : null,
      hu: hu, hp: hp, hs: hs, hg: hg, ht: M.histTrust(year), hf: M.histFarRight(year) };
    record(G, "EA", G.ea.v);
    G.contagion = Math.max(0, (G.contagion || 0) * 0.5);
  };
  function fedYield(G, ea) {
    return Math.max(0, G.pol.rate + 0.9 + Math.max(0, (ea.d - 80) * 0.015) + Math.max(0, ea.p - 2) * 0.3 + (G.ea.v && G.ea.v.trust < 35 ? 0.4 : 0));
  }
  /* Full Troika membership the player chose beyond history (positive) or
     avoided (negative), in program-years */
  function troikaGap(G, year) {
    var p = 0, h = 0;
    Object.keys(G.programs).forEach(function (k) {
      var pr = G.programs[k];
      if (pr.active && year >= pr.start) { p += pr.role === "full" ? 1 : pr.role === "advisory" ? 0.5 : 0; }
    });
    Object.keys(H.programs).forEach(function (k) { if (M.histProgram(k, year)) { h += 1; } });
    return (p - h) * 0.6;
  }
  function record(G, code, v) {
    var s = G.series[code] = G.series[code] || {};
    Object.keys(v).forEach(function (k) {
      if (v[k] == null || typeof v[k] !== "number") { return; }
      (s[k] = s[k] || {})[G.year] = Math.round(v[k] * 100) / 100;
    });
  }

  /* A state's risk of leaving the euro, 0 to 1 */
  /* History sets a floor of risk in the crisis years (Greece came close in
     2012 and 2015 but stayed); the player's departures from history add to
     it. A risk above 0.75 can end in an exit (js/model/game.js). */
  function exitRisk(G, code) {
    var c = G.c[code], v = c.v, y = G.year;
    if (y >= 2041) { c.exitRisk = 0; return; }
    var hs = M.baseSpread(code, y), hb = M.baseBank(code, y), hu = M.base(code, "u", y);
    var sev = clamp((hs - 4) / 20 + (40 - hb) / 100, 0, 1) * 0.55;
    c.exitFloor = sev;
    var r = sev + (v.s - hs) / 12 + (hb - v.bank) / 60 + (v.u - hu) / 25 + Math.max(0, v.u - 30) / 30;
    var ela = G.pol.ela[code];
    if (ela === "frozen") { r += 0.25; }
    if (ela === "capped") { r += 0.1; }
    if (c.refusedProgram) { r += 0.2; }
    if (M.backstop(G) > 0.6) { r -= 0.3; }
    c.exitRisk = clamp(r, 0, 1);
  }

  /* ---------- Previews ---------- */
  /* The state before the year is run: last year's figures moved by this
     year's history, for cards that need a spread before the model runs */
  M.expectedSpread = function (G, code) {
    return M.spreadFor(G, code, G.year, M.TRUE);
  };
  M.expectedBank = function (G, code) {
    var c = G.c[code];
    return clamp(M.baseBank(code, G.year) - 2.5 * (M.expectedSpread(G, code) - M.baseSpread(code, G.year)), 0, 100);
  };

  /* Euro area figures in history, for the comparisons in the ending */
  M.histEA = function (year, codes) {
    var w = M.weights(null, codes), lw = M.laborWeights(codes), o = { u: 0, p: 0, d: 0, g: 0 };
    codes.forEach(function (k) {
      o.u += lw[k] * M.base(k, "u", year); o.p += w[k] * M.base(k, "p", year);
      o.d += w[k] * M.base(k, "d", year); o.g += w[k] * M.base(k, "g", year);
    });
    return o;
  };
  M.histMembers = function (year) {
    return S.COUNTRIES.filter(function (c) { return c.joined !== null && c.joined <= year; }).map(function (c) { return c.code; });
  };
})();
