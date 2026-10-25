/* The game: a new run, the year's agenda, decisions and their votes, the
   initiatives, the end of a year (elections, proposals, treaty, exits,
   successions, game over), and the endings with their grades.

   The whole run is one plain object, G, which saves as JSON. Cards are
   defined in js/data/cards-*.js and referred to by id, so G holds no
   functions. Randomness comes from a seeded generator kept in G.rng, so a
   saved run continues the same way. */
(function () {
  var S = window.ECBSIM, M = S.model, K = S.council, H = S.HIST, Gm = S.game = {};
  var clamp = M.clamp;

  /* ---------- Randomness ---------- */
  function mulberry(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  Gm.rng = function (G) {
    return function () {
      G.rng = (G.rng + 0x6d2b79f5) | 0;
      var t = Math.imul(G.rng ^ (G.rng >>> 15), 1 | G.rng);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  Gm.quietRng = function () { return mulberry(12345); };

  /* ---------- Log ---------- */
  Gm.log = function (G, text, kind) {
    if (G.preview) { return; }
    G.log.push({ y: G.year, t: text, k: kind || "info" });
  };

  /* ---------- A new run ---------- */
  Gm.TERM_ENDS = [2015, 2023, 2031, 2039];
  /* Canonical entry years of the states outside the euro, for a run that
     starts in 2041 */
  var CANON_JOIN = { PL: 2033, CZ: 2035, SE: 2036, RO: 2037, HU: 2038, DK: 2039 };

  /* The states that take part in a run: the EU states of S.COUNTRIES and
     the candidates the player chose to assume joining the EU (G.accession,
     S.CANDIDATES). A candidate takes part in the euro only once it is in
     the EU (Gm.inEU). */
  Gm.states = function (G) {
    return S.COUNTRIES.concat((S.CANDIDATES || []).filter(function (c) { return !!(G && G.c && G.c[c.code]); }));
  };
  /* Adds a state of S.CANDIDATES to the run (G.accession and G.c); in a
     run from 2041 (early), a state due to join by 2041 starts as a member.
     Debug > Events uses it too, for a state the run did not choose. */
  Gm.addCandidate = function (G, k, early) {
    var a = S.ACCESSION && S.ACCESSION[k];
    if (!a || !S.COUNTRY[k] || G.c[k]) { return false; }
    var member = !!early && a.eu <= 2041;
    G.c[k] = { joined: member ? 2041 : null, exited: null, L: 0, dGap: 0, dU: 0, dP: 0, dD: 0, dSpr: 0, dIR: 0, H: 0, v: null, exitRisk: 0, forcedCut: 0,
      cand: true, eu: member ? 2041 : null, independent: a.independent ? (member ? a.independent : null) : undefined };
    G.accession = (G.accession || []).concat([k]);
    return true;
  };
  Gm.inEU = function (G, code) {
    var c = G.c[code];
    return !!c && (!c.cand || (c.eu != null && c.eu <= G.year));
  };
  /* Difficulty and the area of responsibility (js/data/rules.js) */
  Gm.DIFFICULTY = S.DIFFICULTY;
  Gm.SCOPE = S.SCOPE;
  Gm.scope = function (G) { return Gm.SCOPE[(G && G.scope) || "standard"] || Gm.SCOPE.standard; };
  /* A custom difficulty sets the four values itself, each within the
     bounds below, which reach a little past Normal and Hard each way */
  Gm.CUSTOM_RANGE = { will: [0.4, 1], dist: [0.6, 1.2], rel: [60, 250], gain: [0.25, 1.5] };
  Gm.customLevel = function (c) {
    var out = { name: "Custom" }, n = Gm.DIFFICULTY.normal;
    Object.keys(Gm.CUSTOM_RANGE).forEach(function (k) {
      var r = Gm.CUSTOM_RANGE[k], v = c && typeof c[k] === "number" && isFinite(c[k]) ? c[k] : n[k];
      out[k] = Math.max(r[0], Math.min(r[1], v));
    });
    return out;
  };
  /* What a game hides, chosen on the form for a new game and kept with the
     run (G.hide); Settings > Game changes it for the open game. A game
     saved before it existed follows the choices kept for new games. */
  Gm.HIDE = ["history", "votes", "troika", "draghi", "forecasts"];
  Gm.hideKey = function (k) { return "hide" + k.charAt(0).toUpperCase() + k.slice(1); };
  Gm.hides = function (G, k) { return G && G.hide ? !!G.hide[k] : !!(S.settings && S.settings[Gm.hideKey(k)]); };
  Gm.level = function (G) {
    if (G && G.difficulty === "custom") { return Gm.customLevel(G.customLevel); }
    return Gm.DIFFICULTY[(G && G.difficulty) || "normal"] || Gm.DIFFICULTY.normal;
  };
  Gm.create = function (opts) {
    var post = opts.mode === "post";
    var G = {
      v: 1, mode: opts.mode, year: post ? 2041 : 2008, startYear: post ? 2041 : 2008,
      rng: (opts.seed || Math.floor(Math.random() * 1e9)) | 0,
      president: null, presidents: [], advisors: opts.advisors.slice(0, 3), swapYear: null,
      pol: {
        rate: post ? 2.5 : 4.0, neg: false, fullAllot: post, ltro1y: false, cbpp: false, smp: false, ltro3y: false,
        omt: post, tltro: false, qe: false, pepp: false, tpi: post, guidance: post, collateral: post ? "broad" : "standard",
        waiver: {}, ela: {}, elaOpen: false, eib: 0
      },
      used: { draghi: {}, troika: {}, intended: 0 },
      programs: {}, esm: post, ngeu: post,
      proposals: {}, treaty: { goal: null, stage: 0, progress: 0, done: [] },
      c: {}, ea: { dTrust: 0, dFR: 0, v: null, dRprev: 0 },
      council: [], parl: null,
      bonus: { backstop: 0, gap: 0, infl: 0, trust: 0, far: 0 }, cover: 0, ethics: 0,
      agenda: [], initiatives: 0, initUsed: [],
      log: [], reports: [], series: {}, counters: { trustLow: 0, inflHigh: 0, unempHigh: 0 },
      over: null, finished: null, fedRulesRepealed: false, pendingSuccession: null,
      tutorial: !!opts.tutorial, flags: {}, applicants: [], lastFiller: {}, fillerCount: {}, scope: Gm.SCOPE[opts.scope] ? opts.scope : "standard", difficulty: Gm.DIFFICULTY[opts.difficulty] || opts.difficulty === "custom" ? opts.difficulty : "normal"
    };
    if (G.difficulty === "custom") { G.customLevel = Gm.customLevel(opts.custom); delete G.customLevel.name; }
    G.hide = {};
    Gm.HIDE.forEach(function (k) { G.hide[k] = !!(opts.hide && opts.hide[k]); });
    Object.keys(S.PROPOSALS).forEach(function (k) {
      G.proposals[k] = { support: S.PROPOSALS[k].support, passed: post && k === "eurobonds", year: null };
    });
    S.COUNTRIES.forEach(function (c) {
      var j = c.joined;
      if (post && j === null) { j = CANON_JOIN[c.code]; }
      G.c[c.code] = { joined: j, exited: null, L: 0, dGap: 0, dU: 0, dP: 0, dD: 0, dSpr: 0, dIR: 0, H: 0, v: null, exitRisk: 0, forcedCut: 0 };
    });
    /* The candidates the player chose (Difficulty > EU enlargement): each
       joins the EU in its year (S.ACCESSION) through a required item, and
       the euro later. A Federation run starts with those due by 2041 in it. */
    G.accession = [];
    (opts.accession || []).forEach(function (k) { Gm.addCandidate(G, k, post); });
    G.council = K.build(G);
    Gm.installPresident(G, opts.president, false);
    if (post) {
      G.parl = { seats: transitionalSeats(G), conf: 58, refused: 0, complied: 0 };
      G.flags.greekLegacy = true;
    }
    /* Last year's recorded figures, so the first agenda can read them */
    seedValues(G);
    G.log = [];
    /* The game's id seeds the draw of its items (drawOrder), so it is set
       before the first year is drawn: every new game opens differently */
    if (opts.id) { G.id = opts.id; }
    Gm.startYear(G);
    return G;
  };
  function seedValues(G) {
    var y = G.year - 1, codes = M.members(G), w = M.weights(G, codes), ea = { u: 0, p: 0, d: 0, g: 0, s: 0, bank: 0 };
    codes.forEach(function (k) {
      var v = { u: M.base(k, "u", y), p: M.base(k, "p", y), d: M.base(k, "d", y), g: M.base(k, "g", y),
        s: y >= 2041 ? 0 : Math.max(0, M.baseSpread(k, y)), bank: M.baseBank(k, y) };
      G.c[k].v = v;
      Object.keys(ea).forEach(function (key) { ea[key] += w[k] * v[key]; });
    });
    ea.trust = M.histTrust(y); ea.fr = M.histFarRight(y); ea.B = M.histBackstop(y); ea.rate = G.pol.rate;
    ea.fy = y >= 2040 ? G.pol.rate + 1 : null;
    ea.seeded = true;
    G.ea.v = ea;
  }
  function transitionalSeats(G) {
    var fr = M.histFarRight(2039) + (G.ea.dFR || 0);
    var far = Math.round(800 * clamp(fr, 1, 60) / 100);
    var ela = Math.round(800 * 0.28), sdg = Math.round(800 * 0.26);
    return { ela: ela, sdg: sdg, lcb: 800 - far - ela - sdg, far: far };
  }

  Gm.installPresident = function (G, p, weak) {
    G.president = { name: p.name || "The president", country: p.country || "FR", background: p.background || "central",
      start: G.year, weak: !!weak };
    G.presidents.push({ name: G.president.name, country: G.president.country, background: G.president.background, start: G.year, weak: !!weak });
    /* The background sets starting relations with the blocs */
    var bg = G.president.background;
    var REL = {
      central: { hawks: 10, center: 10, periphery: 5, board: 15 },
      finance: { hawks: 5, center: 10, periphery: 0, board: 5 },
      academic: { hawks: 0, center: 5, periphery: 5, board: 10 },
      union: { hawks: -15, center: 0, periphery: 15, board: -5 },
      minister: { hawks: 0, center: 5, periphery: 5, board: -10 },
      banker: { hawks: 15, center: 5, periphery: -10, board: 5 },
      euofficial: { hawks: 5, center: 10, periphery: 5, board: 0 },
      climate: { hawks: -10, center: 0, periphery: 5, board: 0 }
    }[bg] || {};
    G.council.forEach(function (m) {
      m.rel = clamp((m.rel || 0) + (REL[K.bloc(m)] || 0) - (weak ? 20 : 0), -100, 100);
    });
    if (weak) { G.bonus.trust -= 4; }
    /* Beyond the Council: governments, the public and the Parliament */
    var PROP = { minister: 6, euofficial: 3 }[bg];
    if (PROP) { Object.keys(G.proposals).forEach(function (k) { if (!G.proposals[k].passed) { G.proposals[k].support += PROP; } }); }
    if (bg === "banker") { G.bonus.trust -= 2; G.bonus.backstop += 0.02; }
    if (bg === "climate") { G.flags.green = (G.flags.green || 0) + 1; if (G.parl) { G.parl.conf = clamp(G.parl.conf + 5, 0, 100); } }
  };

  /* ---------- The year's agenda ---------- */
  /* The quieter items that fill a calm year, and the crisis items that
     fill a crisis year. Both are drawn at random for each run and year from
     a seed of their own, so the game's random numbers, and with them the
     run, stay the same. */
  /* The pools of agenda items (js/data/rules.js) */
  var FILLERS = S.AGENDA.fillers;
  var CRISIS = S.AGENDA.crisis;
  Gm.FILLERS = FILLERS; Gm.CRISIS = CRISIS;
  function drawOrder(G, pool, salt) {
    var seed = G.year * salt, id = String(G.id || G.startYear);
    for (var c = 0; c < id.length; c++) { seed = (seed * 31 + id.charCodeAt(c)) >>> 0; }
    var r = mulberry(seed), order = pool.slice();
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
    return order;
  }
  /* Every item either comes once in a run (once) or reads differently each
     time it comes back (variants), and ends when its variants run out. An
     item comes back at most every three years, and not after a choice has
     settled the matter (settled). A crisis item picks the state it is
     about (pick); it is left out when no state fits. */
  Gm.itemArgs = function (G, f) { return itemArgs(G, f, S.CARDS[f]); };
  function itemArgs(G, f, fc) {
    if (!fc || (fc.when && !fc.when(G))) { return null; }
    /* Games saved before items were counted count each one seen as once */
    if (!G.fillerCount) { G.fillerCount = {}; Object.keys(G.lastFiller).forEach(function (k) { G.fillerCount[k] = 1; }); }
    var n = G.fillerCount[f] || 0;
    if (n && (fc.once || G.year - G.lastFiller[f] < 3)) { return null; }
    if (fc.variants && n >= fc.variants.length) { return null; }
    if (fc.settled && fc.settled(G)) { return null; }
    var args = fc.pick ? fc.pick(G) : {};
    if (!args) { return null; }
    args.v = n;
    return args;
  }
  /* The kinds of crisis in a year: a state's debt (a loan program, a high
     spread, a state close to leaving), its banks, a slump, prices far from
     the target, or a climate disaster (a scripted card marked crisis) */
  Gm.crisisKinds = function (G, list) {
    var ea = G.ea.v || {}, members = M.members(G), on = list || G.agenda || [], k = {};
    k.debt = on.some(function (e) { return e.id === "program" || e.id === "exit-crisis"; }) || members.some(function (c) {
      var pr = G.programs[c];
      return (pr && pr.active) || G.c[c].exitRisk > 0.4 || (G.year < 2041 && M.expectedSpread(G, c) > 4);
    });
    k.banks = members.some(function (c) { return (G.c[c].v || {}).bank < 45; });
    k.slump = ea.u > 10 || ea.g < -1;
    k.prices = ea.p > 4;
    k.deflation = ea.p < 0;
    k.climate = on.some(function (e) { var d = S.CARDS[e.id]; return d && d.crisis === "climate"; });
    k.any = k.debt || k.banks || k.slump || k.prices || k.deflation || k.climate ||
      on.some(function (e) { var d = S.CARDS[e.id]; return d && !!d.crisis; });
    return k;
  };
  Gm.crisis = function (G, list) { return Gm.crisisKinds(G, list).any; };
  function addItems(G, list, pool, salt, upTo) {
    /* Items not yet seen in this run come before those coming back with a
       new variant, each group in the run's own random order, so a run
       meets as many different items as the pool holds */
    var order = drawOrder(G, pool, salt), fresh = order.filter(function (f) { return !G.fillerCount[f]; });
    order = fresh.concat(order.filter(function (f) { return fresh.indexOf(f) < 0; }));
    for (var i = 0; i < order.length && list.length < upTo; i++) {
      var f = order[i], args = list.some(function (e) { return e.id === f; }) ? null : itemArgs(G, f, S.CARDS[f]);
      if (args) { list.push({ id: f, args: args }); G.lastFiller[f] = G.year; G.fillerCount[f] = args.v + 1; }
    }
  }
  /* A card that comes back later because of an earlier choice */
  Gm.followUp = function (G, id, inYears, args) {
    (G.followUps = G.followUps || []).push({ id: id, year: G.year + inYears, args: args || {}, from: G.year });
  };
  Gm.startYear = function (G) {
    G.cover = 0; G.initUsed = [];
    var list = [{ id: "rate" }];
    var script = (S.SCRIPT[G.year] || []).filter(function (id) {
      var c = S.CARDS[id];
      return c && (!c.when || c.when(G));
    }).map(function (id) { return { id: id }; });
    list = list.concat(script);
    /* The required items of the enlargement the run assumes (G.accession):
       Scotland's referendum and its currency, a state using the euro without
       an agreement two years before it joins, and each state's accession */
    (G.accession || []).forEach(function (k) {
      var a = S.ACCESSION[k], c = G.c[k];
      if (!a || !c || c.eu != null) { return; }
      if (a.referendum === G.year) { list.push({ id: "scotland-referendum", args: { code: k } }); }
      if (a.independent === G.year) { list.push({ id: "scotland-currency", args: { code: k } }); }
      if (a.euro === "unilateral" && a.eu - 2 === G.year) { list.push({ id: "unilateral-euro", args: { code: k } }); }
      if (a.eu === G.year && (!a.independent || c.independent != null)) { list.push({ id: "eu-accession", args: { code: k } }); }
    });
    if (G.year < 2041) {
      var scriptedFocus = {};
      script.forEach(function (e) { var c = S.CARDS[e.id]; if (c.focusCode) { scriptedFocus[c.focusCode] = true; } });
      var members = M.members(G).sort(function (a, b) { return S.COUNTRY[b].weight - S.COUNTRY[a].weight; });
      var crisis = members.filter(function (k) {
        var pr = G.programs[k];
        return !scriptedFocus[k] && !(pr && pr.active) && !G.c[k].declined && M.expectedSpread(G, k) > 5.5;
      });
      if (crisis.length) { list.push({ id: "program", args: { code: crisis[0] } }); }
      var exit = members.filter(function (k) { return G.c[k].exitRisk > 0.55; });
      if (exit.length) { list.push({ id: "exit-crisis", args: { code: exit[0] } }); }
      G.applicants.forEach(function (k) { list.push({ id: "apply-euro", args: { code: k } }); });
      G.applicants = [];
    }
    /* Follow-ups due this year come before the quieter items; one whose
       when no longer holds (the matter was settled meanwhile) is dropped */
    var due = (G.followUps || []).filter(function (f) { return f.year <= G.year && S.CARDS[f.id]; });
    G.followUps = (G.followUps || []).filter(function (f) { return due.indexOf(f) < 0; });
    due.forEach(function (f) {
      var a = f.args || {}, c = S.CARDS[f.id]; a.from = f.from;
      if (!c.when || c.when(G, a)) { list.push({ id: f.id, args: a }); }
    });
    /* A crisis year fills up with crisis items, a calm year with the quieter
       items, to the number the area of responsibility sets (four and three
       at Standard). The kinds of crisis are kept for the crisis items to test. */
    var sc = Gm.scope(G);
    G.kinds = Gm.crisisKinds(G, list);
    /* Essential items (emergency liquidity, a bank in trouble, a loss in the
       bank's accounts...) come whatever the area of responsibility; it
       sets only how many of the others fill the year */
    var pool = G.kinds.any ? CRISIS : FILLERS, salt = G.kinds.any ? 104729 : 7919;
    addItems(G, list, pool.filter(function (f) { return S.CARDS[f] && S.CARDS[f].essential; }), salt, 6);
    addItems(G, list, pool, salt, G.kinds.any ? sc.crisis : sc.calm);
    list = list.slice(0, 6);
    G.agenda = list.map(function (e) { return { id: e.id, args: e.args || {}, done: false, choice: null, vote: null, result: "" }; });
    G.initiatives = clamp(7 - G.agenda.length, 1, 3);
    (S.NEWS[G.year] || []).forEach(function (n) {
      if (!n.when || n.when(G)) { Gm.log(G, typeof n.text === "function" ? n.text(G) : n.text, "news"); if (n.apply) { n.apply(G); } }
    });
  };

  /* A card with its options built for this run */
  Gm.card = function (G, entry) {
    var def = S.CARDS[entry.id], args = entry.args || {};
    /* An item that comes back takes the variant for its turn */
    if (def.variants) {
      var vd = def.variants[Math.min(args.v || 0, def.variants.length - 1)], merged = {};
      Object.keys(def).forEach(function (k) { merged[k] = def[k]; });
      Object.keys(vd).forEach(function (k) { merged[k] = vd[k]; });
      def = merged;
    }
    var opts = (typeof def.options === "function" ? def.options(G, args) : def.options).map(function (o) {
      var c = {};
      Object.keys(o).forEach(function (k) { c[k] = o[k]; });
      var law = c.lawful ? c.lawful(G, args) : true;
      if (law !== true) { c.disabled = law; }
      if (c.needs && !c.disabled) {
        var need = c.needs(G, args);
        if (need !== true) { c.disabled = need; }
      }
      return c;
    });
    var hc = S.HIST_CHOICE && S.HIST_CHOICE[entry.id];
    if (hc != null && G.year <= 2025) {
      var hi = hc === "last" ? opts.length - 1 : hc;
      if (opts[hi]) { opts[hi].hist = true; }
    }
    if (entry.id === "rate" && G.year <= 2025) {
      var best = -1, bd = 1e9, h = M.histRate(G.year);
      opts.forEach(function (o, i) { var m = /(\d+\.\d+)%/.exec(o.label); if (m && Math.abs(Number(m[1]) - h) < bd) { bd = Math.abs(Number(m[1]) - h); best = i; } });
      if (best >= 0 && bd < 0.4) { opts[best].hist = true; }
    }
    /* An option with done: key is a measure taken once: after the year it was
       taken it is no longer offered. onFail indexes follow the shorter list. */
    var gone = opts.map(function (o) { var y = o.done && G.flags["done:" + o.done]; return !!y && y < G.year; });
    if (gone.indexOf(true) >= 0) {
      var at = [], n = 0;
      gone.forEach(function (g) { at.push(g ? null : n); if (!g) { n++; } });
      opts = opts.filter(function (o, i) { return !gone[i]; });
      opts.forEach(function (o) { if (o.onFail != null) { o.onFail = at[o.onFail]; } });
    }
    return {
      id: entry.id, args: args,
      title: typeof def.title === "function" ? def.title(G, args) : def.title,
      actor: typeof def.actor === "function" ? def.actor(G, args) : def.actor,
      date: typeof def.date === "function" ? def.date(G, args) : (def.date || String(G.year)),
      text: typeof def.text === "function" ? def.text(G, args) : def.text,
      history: typeof def.history === "function" ? def.history(G, args) : def.history,
      source: def.source || null,
      focus: typeof def.focus === "function" ? def.focus(G, args) : (def.focus || args.code || null),
      options: opts
    };
  };

  /* Decides a card. Returns the vote, if one was held. */
  /* A run that has ended, or a period that has, takes no more decisions;
     it can only be reviewed, or continued into the Federation */
  Gm.closed = function (G) { return !!(G && (G.over || G.finished)); };
  /* The year a finished run shows: the year it ended in, not the next one,
     which only begins when the player continues into the Federation */
  Gm.shownYear = function (G) { return G.over ? G.over.year : G.finished ? G.year - 1 : G.year; };
  /* Every bad ending crashes the run: it shows the crash screen, and the
     run can only be reviewed */
  Gm.crashed = function (G) { return !!(G && G.over); };
  Gm.decide = function (G, index, optIndex) {
    var entry = G.agenda[index];
    if (!entry || entry.done || Gm.closed(G)) { return null; }
    var card = Gm.card(G, entry), opt = card.options[optIndex];
    if (!opt || opt.disabled) { return null; }
    var rng = Gm.rng(G), vote = null, applied = opt, rateBefore = G.pol.rate;
    if (opt.vote) {
      vote = K.vote(G, opt, rng);
      if (!vote.passed) {
        applied = opt.onFail != null ? card.options[opt.onFail] : null;
      }
      K.react(G, opt);
    }
    if (applied && applied.apply) { applied.apply(G, rng, entry.args); }
    if (applied && applied.done && !G.flags["done:" + applied.done]) { G.flags["done:" + applied.done] = G.year; }
    if (applied) { tagUse(G, applied, entry.args); }
    if (applied && G.parl && G.year >= 2041) { parlReact(G, applied); }
    if (S.emit && !G.preview) { S.emit("vote", vote ? { card: entry.id, yes: vote.yes, no: vote.no, passed: vote.passed } : null); }
    /* The president's stance: the mean lean of the options chosen for a vote */
    if (vote && opt.lean != null) { G.tally = G.tally || { s: 0, n: 0 }; G.tally.s += opt.lean / 2; G.tally.n++; }
    /* The president's stance on new instruments: on a card that offers one,
       0 for choosing the newest option and 1 for choosing none that is new */
    var newest = card.options.reduce(function (mx, o) { return o.disabled ? mx : Math.max(mx, o.novelty || 0); }, 0);
    if (newest > 0) { G.tallyC = G.tallyC || { s: 0, n: 0 }; G.tallyC.s += 1 - Math.min(1, (opt.novelty || 0) / newest); G.tallyC.n++; }
    entry.done = true; entry.choice = optIndex;
    /* The decision as it was taken: options that depend on the state of the
       game (the rate card's are worked out from the current rate) read
       differently once it has changed */
    entry.label = opt.label; entry.applied = applied ? applied.label : null;
    if (opt.rateTo != null) { entry.rate = { from: rateBefore, to: G.pol.rate }; entry.args = entry.args || {}; entry.args.rateFrom = rateBefore; }
    entry.vote = vote ? { yes: vote.yes, no: vote.no, passed: vote.passed, rule: vote.rule,
      list: vote.voters.map(function (v) { return [v.member.id, v.yes]; }) } : null;
    entry.result = vote && !vote.passed ? "rejected" : "done";
    Gm.log(G, card.title + ": " + (vote && !vote.passed ? "the Governing Council rejected \"" + opt.label + "\"" +
      (applied ? "; " + applied.label.toLowerCase() : "") : opt.label) + ".", vote && !vote.passed ? "warn" : "decision");
    return vote;
  };
  function tagUse(G, opt, args) {
    (opt.tags || []).forEach(function (t) {
      if (t === "draghi" && opt.draghi) {
        if (G.used.draghi[opt.draghi] == null) { G.used.draghi[opt.draghi] = G.year; }
      }
      if (t === "troika") {
        var k = (args && args.code) || opt.troikaCode || "?";
        if (G.used.troika[k] == null) { G.used.troika[k] = G.year; }
      }
      if (t === "intended") { G.used.intended++; }
    });
  }
  Gm.allDone = function (G) { return G.agenda.every(function (e) { return e.done; }); };

  /* ---------- Parliament after 2041 ---------- */
  var PARL_W = {
    ela: { hawk: -1.2, democratic: 2, public: 2, green: 1.6, fiscal: 1.6, discipline: -1.4, troika: -2 },
    sdg: { hawk: -0.4, democratic: 1, green: 2, fiscal: 1, public: 0.6 },
    lcb: { hawk: 1.4, discipline: 1.6, public: -1.6, fiscal: -1, green: -0.2 },
    far: { hawk: 0.8, democratic: -1, green: -1.6, public: -0.4 }
  };
  Gm.parlLean = function (G, opt) {
    if (!G.parl) { return 0; }
    var tot = 800, s = 0;
    Object.keys(G.parl.seats).forEach(function (grp) {
      var w = PARL_W[grp], v = 0;
      var a = { hawk: opt.lean || 0 };
      Object.keys(opt.attr || {}).forEach(function (k) { a[k] = opt.attr[k]; });
      Object.keys(w).forEach(function (k) { v += (w[k] || 0) * (a[k] || 0); });
      s += G.parl.seats[grp] / tot * clamp(v, -3, 3);
    });
    return s;
  };
  function parlReact(G, opt) {
    var s = Gm.parlLean(G, opt);
    G.parl.conf = clamp(G.parl.conf + s * (G.year >= 2045 ? 2.2 : 1.2), 0, 100);
  }

  /* ---------- Initiatives ---------- */
  Gm.INITIATIVES = {
    hearing: { name: "Monetary Dialogue hearing", text: "Answer questions in the Parliament's economic committee. Raises trust and public support for this year's disputed decisions." },
    persuade: { name: "Persuade a bloc", text: "Meet one bloc of the Governing Council in private. Improves relations with its members." },
    speech: { name: "Speech", text: "Set out the bank's view in public. Forward guidance lowers long-term rates; a speech against austerity gains support in the periphery and costs relations with the members who prioritized low inflation." },
    push: { name: "Pressure governments on a proposal", text: "Ask governments to adopt one of the bank's proposals. Raises its support in the European Council." },
    treaty: { name: "Treaty campaign", text: "Advance a treaty change under Art. 48 TEU. Slow and uncertain; each stage needs broad support." }
  };
  Gm.initiative = function (G, kind, arg) {
    if (G.initiatives <= 0 || Gm.closed(G)) { return false; }
    var trust = G.ea.v ? G.ea.v.trust : 40;
    switch (kind) {
      case "hearing":
        G.cover += 1; G.bonus.trust += 1.5;
        if (G.parl) { G.parl.conf = clamp(G.parl.conf + 4, 0, 100); }
        Gm.log(G, G.parl ? "The president reported to the Federal Parliament." : "The president answered the Parliament's economic committee in a Monetary Dialogue hearing.", "decision");
        break;
      case "persuade":
        G.council.forEach(function (m) { if (K.bloc(m) === arg) { m.rel = clamp(m.rel + 15, -100, 100); } });
        Gm.log(G, "The president met the " + K.BLOCS[arg].toLowerCase() + " bloc in private.", "decision");
        break;
      case "speech":
        if (arg === "guidance") { G.pol.guidance = true; G.bonus.backstop += 0.02; Gm.log(G, "Speech: the bank will keep rates low for as long as needed.", "decision"); }
        else {
          G.council.forEach(function (m) {
            var b = K.bloc(m);
            if (b === "hawks") { m.rel = clamp(m.rel - 10, -100, 100); }
            if (b === "periphery") { m.rel = clamp(m.rel + 10, -100, 100); }
          });
          G.bonus.trust += 1; G.bonus.far -= 0.5;
          Object.keys(G.proposals).forEach(function (k) { G.proposals[k].support += 2 * Gm.level(G).gain; });
          Gm.log(G, "Speech: the president argued that cuts in a recession make it worse.", "decision");
        }
        break;
      case "push":
        var p = G.proposals[arg];
        if (!p || p.passed) { return false; }
        p.support = clamp(p.support + (6 + trust / 8) * (1 - p.support / 120) * Gm.level(G).gain, 0, 100);
        Gm.log(G, "The president pressured governments on: " + S.PROPOSALS[arg].name + ".", "decision");
        break;
      case "treaty":
        if (G.year >= 2041) { return false; }
        if (!G.treaty.goal) { G.treaty.goal = arg; G.treaty.stage = 0; G.treaty.progress = 0; }
        G.treaty.progress += 15 + trust / 10;
        while (G.treaty.progress >= 100 && G.treaty.stage < 3) {
          G.treaty.progress -= 100; G.treaty.stage++;
          Gm.log(G, "Treaty campaign: the " + S.TREATY_STAGES[G.treaty.stage].toLowerCase() + " stage begins.", "news");
        }
        if (G.treaty.stage >= 3) { G.treaty.progress = Math.min(G.treaty.progress, 100); }
        break;
      default: return false;
    }
    G.initiatives--; G.initUsed.push(kind);
    return true;
  };
  Gm.swapAdvisor = function (G, seat, id) {
    if (G.swapYear === G.year || G.advisors.indexOf(id) >= 0 || Gm.closed(G)) { return false; }
    Gm.log(G, S.ADVISORS[G.advisors[seat]].name + " left the advisory team; " + S.ADVISORS[id].name + " joined.", "decision");
    G.advisors[seat] = id; G.swapYear = G.year;
    return true;
  };

  /* ---------- The end of a year ---------- */
  Gm.endYear = function (G) {
    if (!Gm.allDone(G) || G.over || G.finished) { return null; }
    var rng = Gm.rng(G), y = G.year, report = { year: y, events: [] };
    function ev(text, kind) { report.events.push({ t: text, k: kind || "info" }); Gm.log(G, text, kind); }
    M.step(G);
    var ea = G.ea.v;

    /* Temporary instruments run out: 1-year loans and covered bonds after 2
       years, the SMP, the 3-year loans and PEPP after 3; the negative rate
       ends when the main rate is raised above 0.5% */
    var DUR = { ltro1y: 2, cbpp: 2, smp: 3, ltro3y: 3, pepp: 3 };
    G.pol.since = G.pol.since || {};
    Object.keys(DUR).forEach(function (k) {
      if (!G.pol[k]) { G.pol.since[k] = null; return; }
      if (G.pol.since[k] == null) { G.pol.since[k] = y; }
      if (y - G.pol.since[k] >= DUR[k] - 1) { G.pol[k] = false; G.pol.since[k] = null; ev(S.INSTRUMENTS[k].name + " comes to an end.", "news"); }
    });
    ["omt", "qe", "tpi"].forEach(function (k) {
      if (!G.pol[k]) { G.pol.since[k] = null; } else if (G.pol.since[k] == null) { G.pol.since[k] = y; }
    });
    if (G.pol.neg && G.pol.rate > 0.5) { G.pol.neg = false; }
    /* Caps and freezes of emergency liquidity are decisions for one crisis year */
    G.pol.ela = {};
    if (G.flags.qeEnds === y) { G.pol.qe = false; G.flags.qeEnds = null; ev(S.INSTRUMENTS.qe.name + " comes to an end.", "news"); }
    if (G.pol.omt && y >= 2012 && G.pol.smp) { G.pol.smp = false; }
    /* Programs end */
    Object.keys(G.programs).forEach(function (k) {
      var pr = G.programs[k];
      if (pr.active && y >= pr.end) { pr.active = false; ev(S.COUNTRY[k].name + " leaves its loan program.", "news"); }
    });
    /* Exits */
    var exits = [];
    M.members(G).forEach(function (k) {
      var c = G.c[k];
      if (y < 2041 && c.exitRisk > 0.75 && rng() < (c.exitRisk - 0.75) * 2) {
        c.exited = y; exits.push(k);
        G.contagion = (G.contagion || 0) + 1.5; G.bonus.trust -= 6; G.bonus.far += 2;
        ev(S.COUNTRY[k].name + " leaves the euro and brings back a national currency.", "bad");
      }
    });
    if (exits.length) { K.sync(G); }
    /* Proposals */
    var per = S.PERIPHERY.filter(function (k) { return M.isMember(G, k); });
    var pressure = 0;
    per.forEach(function (k) { pressure += Math.max(0, G.c[k].v ? G.c[k].v.s - 2 : 0); });
    pressure = Math.min(10, pressure / Math.max(1, per.length) * 1.5);
    Object.keys(G.proposals).forEach(function (k) {
      var p = G.proposals[k], d = S.PROPOSALS[k];
      if (p.passed || y < d.from) { return; }
      var thr = d.threshold - (k === "eurobonds" && G.treaty.done.indexOf("debt") >= 0 ? 20 : 0) - (G.ngeu && k === "eurobonds" ? 10 : 0);
      /* A harder run keeps only part of each year's rise in support */
      var rise = d.drift + pressure - (ea.fr - 15) * 0.1 + (ea.trust - 40) * 0.1;
      p.support = clamp(p.support + (rise > 0 ? rise * Gm.level(G).gain : rise), 0, 100);
      if (p.support >= thr) {
        p.passed = true; p.year = y;
        ev("Governments adopt the proposal: " + d.name + ".", "good");
      }
    });
    /* Treaty ratification */
    if (G.treaty.goal && G.treaty.stage >= 3 && G.treaty.progress >= 60) {
      var ok = 0.75 - ea.fr / 100 - (ea.trust < 35 ? 0.15 : 0);
      if (rng() < ok) {
        G.treaty.done.push(G.treaty.goal);
        ev("Every member state ratifies the treaty change: " + S.TREATY_GOALS[G.treaty.goal].name + ".", "good");
        G.treaty.goal = null; G.treaty.stage = 0; G.treaty.progress = 0;
      } else {
        ev("A referendum rejects the treaty change. The governments return to negotiation.", "bad");
        G.treaty.stage = 2; G.treaty.progress = 50;
      }
    }
    /* Elections */
    if (H.EP_ELECTIONS.indexOf(y) >= 0) {
      ev("European Parliament election: the far-right groups win " + Math.round(ea.fr) + "% of the seats.", ea.fr > M.histFarRight(y) + 2 ? "bad" : "news");
      if (ea.fr > 50) { return gameOver(G, report, "farright"); }
    }
    if (H.FED_ELECTIONS.indexOf(y) >= 0) { fedElection(G, ev); if (ea.fr > 50) { return gameOver(G, report, "farright"); } }
    /* New members of the euro after 2026 */
    if (G.mode === "pre" && y >= 2026 && y < 2040) {
      Gm.states(G).forEach(function (c) {
        var st = G.c[c.code];
        if (st.joined !== null || st.applied || (st.delay && st.delay > y) || !Gm.inEU(G, c.code)) { return; }
        var appeal = 0.06 + (ea.trust - 40) / 300 - Math.max(0, ea.u - 8) / 50 + (y - 2026) * 0.012 - exits.length * 0.1;
        if (rng() < appeal) { st.applied = y; G.applicants.push(c.code); }
      });
    }
    if (G.mode === "pre" && y === 2040) {
      /* Every EU state takes the Federation's currency; a candidate not yet in the EU stays outside */
      Gm.states(G).forEach(function (c) {
        var st = G.c[c.code];
        if (st.joined === null && Gm.inEU(G, c.code)) { st.joined = 2041; ev(c.name + " will adopt the currency with the Federation in 2041.", "news"); }
      });
    }
    /* The Court of Justice rules on the cases of 2029 (js/data/cards-later.js).
       A decision to stop lending to a state's banks that the bank defended
       is annulled half the time, and the president's conduct questioned. An expulsion the
       bank defended is always annulled, since no treaty provides for it:
       the state returns to the euro, and seven times in ten the Court also
       retires the president, which ends the run. */
    var hd = G.flags.haltDefended;
    if (hd && hd.year === y) {
      G.flags.haltDefended = null;
      if (rng() < 0.5) {
        G.flags.authSqueeze = "annulled"; G.ethics += 0.3;
        ev("The Court of Justice annuls the decision to stop lending to " + S.COUNTRY[hd.code].name + "'s banks as disproportionate: one monetary policy cannot exclude one member.", "bad");
      } else { ev("The Court of Justice upholds the decision to stop lending to " + S.COUNTRY[hd.code].name + "'s banks.", "news"); }
    }
    if (G.flags.expulsionDefended === y && G.flags.expelled) {
      var xk = G.flags.expelled.code;
      G.flags.expulsionDefended = null; G.flags.expelled = null;
      G.c[xk].exited = null; K.sync(G);
      ev("The Court of Justice annuls the expulsion of " + S.COUNTRY[xk].name + " from the euro: no treaty provides for it. " + S.COUNTRY[xk].name + " returns to the euro.", "bad");
      if (rng() < 0.7) { return gameOver(G, report, "expulsion"); }
      ev("The Court finds no grounds to retire the president, who stays in office under a reprimand.", "warn");
      G.ethics += 0.4; G.bonus.trust -= 1.5;
    }
    /* Ethics */
    if (G.ethics > 0.5 && rng() < G.ethics * 0.3) {
      ev("A complaint over the president's conduct reaches the Court of Justice.", "bad");
      if (rng() < 0.5) {
        if (y < 2041) { return gameOver(G, report, "removal"); }
        G.parl.conf -= 30;
      } else { ev("The Court finds no serious misconduct.", "news"); }
    }
    G.ethics *= 0.7;
    /* Parliament: confidence drifts back toward its usual level and falls
       with high inflation or unemployment */
    if (G.parl) {
      G.parl.conf = clamp(G.parl.conf + (55 - G.parl.conf) * 0.12 - Math.max(0, ea.p - 3) * 3 - Math.max(0, ea.u - 8) * 1.5, 0, 100);
    }
    /* Parliament after 2045 */
    if (G.parl && y >= 2045) {
      if (G.parl.conf < 30) {
        var against = (100 - G.parl.conf) / 100 * 800 * (0.85 + rng() * 0.3);
        ev("The Federal Parliament votes on a motion of no confidence in the president: " + Math.round(Math.min(800, against)) + " of 800 in favor.", "bad");
        if (against > 400) { return gameOver(G, report, "noconfidence"); }
      }
    }
    if (G.parl && [2045, 2050, 2055, 2060, 2065].indexOf(y) >= 0) {
      var votes = Math.round(800 * clamp((G.parl.conf + 2) / 100, 0, 1));
      if (votes < 400) {
        ev("The Federal Parliament elects a different president: " + votes + " of 800 votes.", "bad");
        return gameOver(G, report, "notreelected");
      }
      ev("The Federal Parliament re-elects the president: " + votes + " of 800 votes.", "good");
    }
    /* Thresholds */
    G.counters.trustLow = ea.trust < 20 ? G.counters.trustLow + 1 : 0;
    G.counters.inflHigh = ea.p > 20 ? G.counters.inflHigh + 1 : 0;
    G.counters.unempHigh = ea.u > 20 ? G.counters.unempHigh + 1 : 0;
    if (G.counters.trustLow >= 2) { return gameOver(G, report, "trust"); }
    if (ea.p > 50 || G.counters.inflHigh >= 3 || G.counters.unempHigh >= 3) { return gameOver(G, report, "dissolution"); }
    var gone = Object.keys(G.c).filter(function (k) { return G.c[k].exited; });
    var goneW = 0, allW = 0;
    Gm.states(G).forEach(function (c) { if (G.c[c.code].joined !== null && G.c[c.code].joined <= y) { allW += c.weight; if (G.c[c.code].exited) { goneW += c.weight; } } });
    if (gone.some(function (k) { return ["DE", "FR", "IT"].indexOf(k) >= 0; }) || goneW >= allW / 3 || gone.length >= 3) {
      return gameOver(G, report, "breakup");
    }
    /* Resignations from the Council */
    K.resignations(G).forEach(function (n) { ev(n + " resigns from the Governing Council in protest.", "warn"); });
    /* Succession */
    if (G.mode === "pre" && Gm.TERM_ENDS.indexOf(y) >= 0) {
      var rel = 0;
      G.council.forEach(function (m) { rel += m.rel; });
      rel /= Math.max(1, G.council.length);
      var chance = clamp(0.45 + (ea.trust - 35) / 50 + rel / 200 + (ea.u < 10 ? 0.1 : -0.05) - exits.length * 0.2, 0.1, 0.95);
      var accepted = rng() < chance;
      G.pendingSuccession = { accepted: accepted, chance: chance };
      ev(accepted ? "The European Council accepts the president's chosen successor." : "The European Council rejects the chosen successor and appoints a compromise candidate.", accepted ? "good" : "warn");
    }
    /* One-off bonuses expire */
    G.bonus.trust = 0; G.bonus.far = 0; G.bonus.gap = 0; G.bonus.infl = 0;
    G.bonus.backstop *= 0.5;
    Object.keys(G.c).forEach(function (k) { G.c[k].forcedCut = 0; G.c[k].bankBonus = 0; G.c[k].bonusGap = 0; });
    report.ea = ea;
    G.reports.push(report);
    /* Next year */
    G.year++;
    if (G.mode === "pre" && G.year === 2041) {
      G.finished = "pre";
      Gm.log(G, "The Federal Treaty enters into force. The European Union becomes the Federation of Europe.", "news");
      return report;
    }
    if (G.year > 2070) {
      G.finished = "post";
      return report;
    }
    if ([2016, 2024, 2032, 2040].indexOf(G.year) >= 0) { K.renew(G); }
    K.sync(G);
    if (!G.pendingSuccession) { Gm.startYear(G); }
    return report;
  };
  /* A pre-federative run continues into the Federation */
  Gm.toFederation = function (G) {
    G.mode = "post"; G.finished = null;
    Gm.states(G).forEach(function (c) { if (G.c[c.code].joined === null && Gm.inEU(G, c.code)) { G.c[c.code].joined = 2041; } });
    G.parl = { seats: transitionalSeats(G), conf: clamp(50 + (G.ea.v.trust - 40) * 0.5, 20, 80), refused: 0, complied: 0 };
    G.flags.greekLegacy = !!G.programs.GR;
    G.esm = true;
    K.sync(G);
    Gm.startYear(G);
  };
  /* The player names the next president; the year then begins */
  Gm.succeed = function (G, p) {
    var weak = G.pendingSuccession && !G.pendingSuccession.accepted;
    G.pendingSuccession = null;
    Gm.installPresident(G, p, weak);
    Gm.startYear(G);
  };
  function fedElection(G, ev) {
    var y = G.year, base = H.fedSeats[y], ea = G.ea.v;
    var far = Math.round(800 * clamp(ea.fr, 0, 70) / 100);
    var shift = Math.round(clamp(G.ea.dTrust * 3 - G.ea.dFR * 6, -120, 120));
    var ela = clamp(base.ela + shift, 60, 600), lcb = clamp(base.lcb - shift / 2, 40, 500);
    var sdg = Math.max(20, 800 - far - ela - lcb);
    G.parl.seats = { ela: ela, sdg: sdg, lcb: 800 - far - ela - sdg, far: far };
    ev("Federal Parliament election: European Left Alliance " + ela + ", Social Democrats and Greens " + sdg +
      ", Liberal and Conservative Bloc " + G.parl.seats.lcb + ", far right " + far + " of 800 seats.", "news");
  }
  function gameOver(G, report, reason) {
    G.over = { reason: reason, year: G.year };
    report.ea = G.ea.v; G.reports.push(report);
    Gm.log(G, Gm.OVER[reason], "bad");
    return report;
  }
  /* The sentence of each bad ending (js/data/rules.js) */
  Gm.OVER = {};
  Object.keys(S.ENDINGS).forEach(function (k) { Gm.OVER[k] = S.ENDINGS[k].text; });

  /* ---------- Endings and grades ---------- */
  function avg(arr) { return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0; }
  function series(G, code, key, a, b) {
    var s = (G.series[code] || {})[key] || {}, out = [];
    for (var y = a; y <= b; y++) { if (s[y] != null) { out.push(s[y]); } }
    return out;
  }
  function histSeries(code, key, a, b) {
    var out = [];
    for (var y = a; y <= b; y++) {
      if (code === "EA") {
        var e = M.histEA(y, M.histMembers(Math.min(y, 2026)));
        out.push(e[key]);
      } else { out.push(M.base(code, key, y)); }
    }
    return out;
  }
  /* r: improvement over history, as a share (positive is better) */
  function letter(r) {
    if (r >= 0.2) { return "A"; } if (r >= 0.08) { return "B"; } if (r >= -0.05) { return "C"; }
    if (r >= -0.15) { return "D"; } if (r >= -0.3) { return "E"; } return "F";
  }
  function better(player, hist, floor) { return (hist - player) / Math.max(Math.abs(hist), floor || 1); }
  Gm.grades = function (G) {
    var a = G.mode === "post" ? Math.max(G.startYear, 2041) : G.startYear, b = Math.min(G.year - 1, G.mode === "pre" ? 2040 : 2070);
    if (b < a) { b = a; }
    var g = {};
    function S2(k) { return series(G, "EA", k, a, b); }
    var pu = avg(S2("u")), hu = avg(S2("hu")), pg = avg(S2("g")), hg = avg(S2("hg"));
    var pp = avg(S2("p").map(function (v) { return Math.abs(v - 2); })), hp = avg(S2("hp").map(function (v) { return Math.abs(v - 2); }));
    var ps = avg(S2("s")), hs = avg(S2("hs"));
    var exits = Object.keys(G.c).filter(function (k) { return G.c[k].exited; }).length;
    var stab = G.mode === "pre" ? (better(pp, hp, 1) + better(ps, hs, 1)) / 2 : better(pp, hp, 1);
    stab -= exits * 0.2;
    g.stability = { r: stab, l: letter(stab), p: pp + 2, hp: hp + 2, s: ps, hs: hs };
    var wel = (better(pu, hu, 1) + (pg - hg) / Math.max(1, Math.abs(hg))) / 2;
    g.welfare = { r: wel, l: letter(wel), u: pu, hu: hu, g: pg, hg: hg };
    var pt = avg(S2("trust")), ht = avg(S2("ht")), pf = avg(S2("fr")), hf = avg(S2("hf"));
    var dem = ((pt - ht) / ht + better(pf, hf, 5)) / 2 + (G.parl ? (G.parl.conf - 55) / 200 : 0);
    g.democracy = { r: dem, l: letter(dem), trust: pt, htrust: ht, fr: pf, hfr: hf };
    if (G.mode === "pre") {
      var e1 = Math.min(b, 2020);
      var gu = avg(series(G, "GR", "u", 2010, e1)), hgu = avg(histSeries("GR", "u", 2010, e1).slice(0, series(G, "GR", "u", 2010, e1).length));
      var lvl = 1, hl = 1;
      series(G, "GR", "g", 2008, Math.min(b, 2025)).forEach(function (v) { lvl *= 1 + v / 100; });
      histSeries("GR", "g", 2008, Math.min(b, 2025)).forEach(function (v) { hl *= 1 + v / 100; });
      var gr = G.c.GR.exited ? -0.5 : (better(gu, hgu, 1) + (lvl - hl) / hl * 2) / 2;
      g.greece = { r: gr, l: letter(gr), u: gu, hu: hgu, level: lvl, hlevel: hl, exited: !!G.c.GR.exited };
    } else {
      var green = G.flags.green || 0;
      var shockYears = [2051, 2053, 2056, 2058].filter(function (y) { return y <= b; });
      var dmg = avg(shockYears.map(function (y) { var e = (G.series.EA || {}); return ((e.hg || {})[y] || 0) - ((e.g || {})[y] || 0); }));
      var cl = green * 0.04 - dmg * 0.1;
      g.climate = { r: cl, l: letter(cl), green: green };
    }
    return g;
  };
  Gm.path = function (G) {
    var d = Object.keys(G.used.draghi), t = Object.keys(G.used.troika);
    return { draghi: d, troika: t, noDraghi: !d.length, noTroika: !t.length, intended: G.used.intended };
  };

  /* ---------- A run from outside ----------
     Checks a run read from a file (Settings > Storage > Import games)
     before it opens. The whole value must be plain JSON data of a bounded
     size: objects, arrays, finite numbers, short texts, true, false, null,
     no key that could reach an object's prototype. The fields the game
     reads must have their kinds and their ranges, every card and state
     must exist, and the agenda must build. Returns null when the run is
     sound, or the reason it is refused. */
  Gm.validate = function (G) {
    var nodes = 0, FORBIDDEN = { "__proto__": 1, "constructor": 1, "prototype": 1 };
    function bad(why) { throw new Error(why); }
    function walk(x, depth) {
      if (++nodes > 500000) { bad("the file holds too much data"); }
      if (depth > 16) { bad("the data is nested too deeply"); }
      if (x === null || typeof x === "boolean") { return; }
      if (typeof x === "number") { if (!isFinite(x)) { bad("a number is not finite"); } return; }
      if (typeof x === "string") { if (x.length > 5000) { bad("a text is too long"); } return; }
      if (Array.isArray(x)) { x.forEach(function (y) { walk(y, depth + 1); }); return; }
      /* A plain object: its prototype is the base object of some window, or none */
      var proto = typeof x === "object" ? Object.getPrototypeOf(x) : undefined;
      if (typeof x === "object" && (proto === null || Object.getPrototypeOf(proto) === null) && Object.prototype.toString.call(x) === "[object Object]") {
        Object.keys(x).forEach(function (k) {
          if (FORBIDDEN[k] || k.length > 100) { bad("a key is not allowed: " + k.slice(0, 20)); }
          walk(x[k], depth + 1);
        });
        return;
      }
      bad("a value is of an unknown kind");
    }
    function obj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
    function int(x, a, b) { return typeof x === "number" && Math.floor(x) === x && x >= a && x <= b; }
    function need(ok, what) { if (!ok) { bad(what); } }
    function yearOrNull(x) { return x === null || x === undefined || int(x, 1999, 2072); }
    try {
      need(obj(G), "it holds no game");
      walk(G, 0);
      need(G.v === 1, "it was saved by another version of the save format");
      need(G.mode === "pre" || G.mode === "post", "its period is unknown");
      need(G.startYear === 2008 || G.startYear === 2041, "its first year is wrong");
      need(int(G.year, G.startYear, 2071), "its year is out of range");
      need(G.id === undefined || (typeof G.id === "string" && /^[a-z0-9]{1,40}$/i.test(G.id)), "its id is malformed");
      need(typeof G.rng === "number", "its random state is missing");
      need(obj(G.president) && typeof G.president.name === "string" && G.president.name.length <= 60 &&
        S.COUNTRIES.some(function (c) { return c.code === G.president.country; }) && typeof G.president.background === "string", "its president is malformed");
      need(Array.isArray(G.presidents) && G.presidents.length <= 40 && G.presidents.every(obj), "its list of presidents is malformed");
      need(Array.isArray(G.advisors) && G.advisors.length === 3 && G.advisors.every(function (a) { return typeof a === "string" && !!S.ADVISORS[a]; }), "its advisors are unknown");
      ["pol", "used", "programs", "proposals", "treaty", "c", "ea", "bonus", "flags", "series"].forEach(function (k) { need(obj(G[k]), "its field " + k + " is malformed"); });
      need(obj(G.used.draghi) && obj(G.used.troika), "its record of measures is malformed");
      need(typeof G.pol.rate === "number", "its interest rate is missing");
      Object.keys(G.c).forEach(function (k) {
        var c = G.c[k];
        need(!!S.COUNTRY[k] && obj(c), "it names an unknown state");
        need(yearOrNull(c.joined) && yearOrNull(c.exited) && yearOrNull(c.eu), "a state's years are out of range");
        need(c.v === null || c.v === undefined || obj(c.v), "a state's figures are malformed");
      });
      S.COUNTRIES.forEach(function (c) { need(obj(G.c[c.code]), "a member state is missing"); });
      need(G.accession === undefined || (Array.isArray(G.accession) && G.accession.every(function (k) { return !!S.ACCESSION[k] && obj(G.c[k]) && G.c[k].cand === true; })), "its EU enlargement is malformed");
      Object.keys(G.c).forEach(function (k) { need(!S.ACCESSION[k] || (G.accession || []).indexOf(k) >= 0, "a candidate state is outside its EU enlargement"); });
      Object.keys(S.PROPOSALS).forEach(function (k) { need(obj(G.proposals[k]), "a proposal is missing"); });
      need(Array.isArray(G.agenda) && G.agenda.length <= 12, "its agenda is malformed");
      G.agenda.forEach(function (e) {
        need(obj(e) && typeof e.id === "string" && !!S.CARDS[e.id] && obj(e.args || {}) && typeof e.done === "boolean", "an agenda item is malformed or unknown");
        need(!e.args || e.args.code === undefined || !!G.c[e.args.code], "an agenda item names a state outside the run");
      });
      need(Array.isArray(G.council) && G.council.length <= 80 && G.council.every(function (m) { return obj(m) && typeof m.name === "string" && (!m.country || !!S.COUNTRY[m.country]); }), "its Governing Council is malformed");
      need(G.parl === null || G.parl === undefined || obj(G.parl), "its Parliament is malformed");
      need(Array.isArray(G.log) && G.log.every(function (l) { return obj(l) && typeof l.t === "string"; }), "its archive is malformed");
      need(Array.isArray(G.reports) && G.reports.every(obj), "its year reports are malformed");
      need(G.scope === undefined || !!Gm.SCOPE[G.scope], "its area of responsibility is unknown");
      need(G.difficulty === undefined || G.difficulty === "custom" || !!Gm.DIFFICULTY[G.difficulty], "its difficulty is unknown");
      need(G.customLevel === undefined || (obj(G.customLevel) && Object.keys(G.customLevel).every(function (k) { return !!Gm.CUSTOM_RANGE[k] && typeof G.customLevel[k] === "number"; })), "its custom difficulty is malformed");
      var AT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
      need(G.taint === undefined || (Array.isArray(G.taint) && G.taint.length <= 5000 && G.taint.every(function (t) { return obj(t) && int(t.y, 2008, 2072) && typeof t.a === "string" && t.a.length <= 200 && typeof t.at === "string" && AT.test(t.at); })), "its debug mark is malformed");
      need(G.sandbox === undefined || (obj(G.sandbox) && typeof G.sandbox.at === "string" && AT.test(G.sandbox.at) && int(G.sandbox.year, 2008, 2072) && Array.isArray(G.sandbox.met) &&
        G.sandbox.met.every(function (id) { return typeof id === "string" && (S.ACHIEVEMENTS || []).some(function (a) { return a.id === id; }); })), "its sandbox is malformed");
      need(G.levelLog === undefined || (Array.isArray(G.levelLog) && G.levelLog.length <= 1000 && G.levelLog.every(function (l) { return obj(l) && int(l.y, 2008, 2072) && (l.d === "custom" || !!Gm.DIFFICULTY[l.d]); })), "its changes of level are malformed");
      need(G.hide === undefined || (obj(G.hide) && Object.keys(G.hide).every(function (k) { return Gm.HIDE.indexOf(k) >= 0 && typeof G.hide[k] === "boolean"; })), "what it hides is malformed");
      need(G.over === null || G.over === undefined || (obj(G.over) && !!Gm.OVER[G.over.reason] && int(G.over.year, 2008, 2072)), "its ending is unknown");
      need(G.finished === null || G.finished === undefined || G.finished === "pre" || G.finished === "post", "its end of period is unknown");
      /* The run must build: its members, their weights and each card of the agenda */
      var members = M.members(G);
      need(members.length > 0 && members.every(function (k) { return !!G.c[k]; }), "it has no member states");
      M.weights(G, members);
      G.agenda.forEach(function (e) { var card = Gm.card(G, e); need(card && Array.isArray(card.options) && card.options.length > 0, "an agenda item cannot be built"); });
    } catch (e) {
      return e && e.message ? e.message : "it cannot be read";
    }
    return null;
  };
  /* Checks a whole export file: { app, games: [{ saves: [{ kind,
     number, name, save: { at, game } }] }] } (files made before carry
     v: 2 as well), or a file of the first format, { app, v: 1, game },
     read as one game with one autosave.
     Every key must be known, every list bounded, each game at most one
     autosave, and each run must pass Gm.validate. Returns { games } in the
     second format, or { error }. */
  Gm.validateExport = function (d) {
    function obj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
    function only(x, keys) { return obj(x) && Object.keys(x).every(function (k) { return keys.indexOf(k) >= 0; }); }
    var AT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
    if (!obj(d) || d.app !== "ecb-simulator") { return { error: "it is not an export of this game" }; }
    if (d.v === 1 && only(d, ["app", "v", "game"])) {
      var why1 = Gm.validate(d.game);
      return why1 ? { error: why1 } : { games: [{ saves: [{ kind: "automatic", save: { at: new Date().toISOString(), game: d.game } }] }] };
    }
    if ((d.v !== undefined && d.v !== 2) || !only(d, ["app", "v", "games"])) { return { error: "it is not an export of this game" }; }
    if (!Array.isArray(d.games) || !d.games.length || d.games.length > 50) { return { error: "it holds no games, or too many" }; }
    var total = 0;
    for (var i = 0; i < d.games.length; i++) {
      var g = d.games[i];
      if (!only(g, ["saves"]) || !Array.isArray(g.saves) || !g.saves.length || g.saves.length > 100) { return { error: "a game holds no saves, or too many" }; }
      if (g.saves.filter(function (x) { return x && x.kind === "automatic"; }).length > 1) { return { error: "a game holds two autosaves" }; }
      for (var j = 0; j < g.saves.length; j++) {
        var sv = g.saves[j];
        total++;
        if (total > 500) { return { error: "it holds too many saves" }; }
        if (!only(sv, ["kind", "number", "name", "save"]) || (sv.kind !== "automatic" && sv.kind !== "manual")) { return { error: "a save is malformed" }; }
        if (sv.number !== undefined && !(typeof sv.number === "number" && Math.floor(sv.number) === sv.number && sv.number >= 1 && sv.number <= 999)) { return { error: "a save's number is malformed" }; }
        if (sv.name !== undefined && !(typeof sv.name === "string" && sv.name.length <= 40)) { return { error: "a save's name is malformed" }; }
        if (!only(sv.save, ["at", "game"]) || typeof sv.save.at !== "string" || !AT.test(sv.save.at)) { return { error: "a save's date is malformed" }; }
        var why = Gm.validate(sv.save.game);
        if (why) { return { error: why }; }
      }
    }
    return { games: d.games };
  };
})();
