/* The ending, as a short film: the screen goes dark, a few screens tell
   the run in its own figures one after another, and a title closes it.
   Each ending has its colors and its last title: the Federation of 2041
   in blue and gold, with the twelve stars gathering into their ring; the
   last Greek payment of 2070 in slate; a run that ends early in dark red.
   The title waits for the player: its Show summary (Enter, Escape, Space
   or the right arrow) fades the film into the ending's screen, in the same
   colors (js/ui/finale.js and the crash screen below). Read (R) holds a
   screen; Next, the right arrow or Space moves on by one; Skip, Escape or
   Enter goes to the title. A click on the film does nothing. The film
   makes no sound of its own: a sound comes only from what the player
   presses. Under reduced motion the order and the timing stay the same
   and every change is a plain fade. The debug panel can play any of the
   three without ending the run; that film ends with Close. Removed with
   the inspector, the film comes back at once, as the required screens do. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, Gm = S.game;

  /* The twelve stars of the flag of Europe, each in a group of its own so
     it can arrive in turn */
  function ring() {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 120 120"); svg.setAttribute("class", "cine-ring"); svg.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, cx = 60 + 44 * Math.sin(a), cy = 60 - 44 * Math.cos(a), pts = [];
      for (var j = 0; j < 10; j++) {
        var b = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 3.2 : 8;
        pts.push((cx + r * Math.cos(b)).toFixed(2) + "," + (cy + r * Math.sin(b)).toFixed(2));
      }
      var p = document.createElementNS(ns, "polygon");
      p.setAttribute("points", pts.join(" "));
      p.style.setProperty("--i", i);
      p.style.transformOrigin = cx.toFixed(2) + "px " + cy.toFixed(2) + "px";
      svg.appendChild(p);
    }
    return svg;
  }

  /* The last payment's image: a page of the ledger, its entries written one
     after another, then the balance drawn under them and closed at zero */
  function ledger() {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 120 120"); svg.setAttribute("class", "cine-ledger"); svg.setAttribute("aria-hidden", "true");
    function line(d, cls, i) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d); p.setAttribute("pathLength", "100"); p.setAttribute("class", cls);
      p.style.setProperty("--i", i);
      svg.appendChild(p);
    }
    line("M22 14H98V106H22Z", "page", 0);
    [26, 40, 54, 68].forEach(function (y, i) { line("M30 " + y + "H70M80 " + y + "H90", "entry", i + 1); });
    line("M30 82H90M30 86H90", "total", 5);
    var t = document.createElementNS(ns, "text");
    t.setAttribute("x", "90"); t.setAttribute("y", "101"); t.setAttribute("text-anchor", "end"); t.setAttribute("class", "zero");
    t.textContent = "0";
    svg.appendChild(t);
    return svg;
  }

  /* A table of the film. Each cell is text or { text, rows, cls }; null
     stands where a cell above spans the row. With head, the first row is
     the table's head; the first cell of every other row names it */
  function table(rows, head) {
    var w = el("div", "table-wrap"), t = el("table", "cine-table"), hd = el("thead"), tb = el("tbody");
    rows.forEach(function (r, i) {
      var tr = el("tr"), top = head && i === 0;
      r.forEach(function (c, j) {
        if (c === null) { return; }
        var o = typeof c === "object" ? c : { text: c };
        var cell = el(top || j === 0 ? "th" : "td", o.cls || "", String(o.text));
        if (o.rows) { cell.rowSpan = o.rows; }
        if (!top && j === 0) { cell.scope = "row"; }
        tr.appendChild(cell);
      });
      (top ? hd : tb).appendChild(tr);
    });
    if (head) { t.appendChild(hd); }
    t.appendChild(tb); w.appendChild(t);
    return w;
  }
  /* The grades: each area with its letter, then each measure behind it,
     this run against history */
  function grades(G) {
    var gr = Gm.grades(G), LB = { stability: "Stability", welfare: "Welfare", democracy: "Democracy", greece: "Greece", climate: "Climate" };
    var M = {
      stability: [[S.t("Inflation, %"), gr.stability.p, gr.stability.hp]].concat(G.mode === "pre" ? [[S.t("Spread, points"), gr.stability.s, gr.stability.hs]] : []),
      welfare: [[S.t("Unemployment, %"), gr.welfare.u, gr.welfare.hu], [S.t("Growth, %"), gr.welfare.g, gr.welfare.hg]],
      democracy: [[S.t("Trust in the bank, %"), gr.democracy.trust, gr.democracy.htrust], [S.t("Far-right seats, %"), gr.democracy.fr, gr.democracy.hfr]]
    };
    if (gr.greece) {
      M.greece = gr.greece.exited ? [[S.t("Left the euro"), null, null]] :
        [[S.t("Unemployment 2010 to 2020, %"), gr.greece.u, gr.greece.hu], [S.t("Output in 2025, % of 2008"), gr.greece.level * 100, gr.greece.hlevel * 100]];
    }
    if (gr.climate) { M.climate = [[S.t("Climate actions"), gr.climate.green, null]]; }
    var rows = [[S.t("Area"), { text: S.t("Grade"), cls: "letter-head" }, S.t("Measure"), { text: S.t("This run"), cls: "num" }, { text: S.t("History"), cls: "num" }]];
    Object.keys(gr).forEach(function (k) {
      var n = (M[k] || []).length;
      (M[k] || []).forEach(function (m, i) {
        var f = function (v) { return { text: v == null ? "" : S.fmt(v, k === "climate" ? 0 : 1), cls: "num" }; };
        rows.push([i ? null : { text: S.t(LB[k]), rows: n }, i ? null : { text: gr[k].l, rows: n, cls: "letter" }, m[0], f(m[1]), f(m[2])]);
      });
    });
    /* The table, and under it what the letters mean */
    var box = el("div", "cine-grades");
    box.appendChild(table(rows, true));
    box.appendChild(el("p", "cine-note", S.t("Grades are from A to F, as on the EU energy label: A is the best, C is as in history, F is the worst.")));
    return box;
  }
  /* The opening shot: where and when, the president in large type and the
     role, then the euro area at the start and at the end as two large
     figures, then the presidents before in the run. The Federation's
     opening adds what the Federation shares. */
  function opening(G, kind, last) {
    var box = el("div", "cine-open"), bank = S.bankName().full, unnamed = G.president.name === S.t("The president");
    box.appendChild(el("div", "cine-cap", S.t("Frankfurt, {y}", { y: last > G.startYear ? S.t("{a} to {b}", { a: G.startYear, b: last }) : String(G.startYear) })));
    /* A president left unnamed is "The president", which reads as a title, not a name */
    box.appendChild(el("h2", "cine-name", unnamed ? S.t("The president of the {bank}", { bank: bank }) : G.president.name));
    if (!unnamed) { box.appendChild(el("p", "cine-role", S.t("President of the {bank}", { bank: bank }))); }
    var first = Object.keys(G.c).filter(function (k) { var c = G.c[k]; return c.joined !== null && c.joined <= G.startYear; }).length;
    var end = Object.keys(G.c).filter(function (k) { var c = G.c[k]; return c.joined !== null && c.joined <= last && !c.exited; }).length;
    var stats = el("div", "cine-stats");
    function stat(n, label) { var d = el("div", "cine-stat"); d.appendChild(el("div", "cine-num", String(n))); d.appendChild(el("div", "cine-cap", label)); stats.appendChild(d); }
    stat(first, S.t("States in the euro, {y}", { y: G.startYear }));
    stat(end, kind === "federation" ? S.t("States of the Federation, {y}", { y: last }) : S.t("States in the euro, {y}", { y: last }));
    box.appendChild(stats);
    if (kind === "federation") { box.appendChild(el("p", "cine-note", S.t("One budget and one debt for every member state"))); }
    /* Those before, each with the year they took office: "Before: A (2008) and B (2016)" */
    var before = G.presidents.slice(0, -1).map(function (p) { return S.t("{n} ({y})", { n: p.name, y: p.start }); });
    if (before.length) {
      var l = before.length > 1 ? S.t("{a} and {b}", { a: before.slice(0, -1).join(", "), b: before[before.length - 1] }) : before[0];
      box.appendChild(el("p", "cine-note", S.t("Before: {l}", { l: l })));
    }
    return box;
  }
  /* The shots of the film, [caption, line, table or opening], from the run's own figures */
  function shots(G, kind) {
    var last = kind === "over" && G.over ? G.over.year : Math.max(G.startYear, G.year - 1);
    var out = [];
    out.push([null, opening(G, kind, last)]);
    if (kind === "over" && G.over) { out.push([String(G.over.year), Gm.OVER[G.over.reason]]); }
    /* The run's path: Greece, the bank's two contested tools, the states
       that left and the proposals adopted */
    var p = Gm.path(G), none = S.t("None");
    var exits = Object.keys(G.c).filter(function (k) { return G.c[k].exited; });
    var passed = Object.keys(G.proposals).filter(function (k) { return G.proposals[k].passed && G.proposals[k].year; });
    var rows = [];
    if (G.mode === "pre" && G.c.GR) { rows.push([S.t("Greece"), G.c.GR.exited ? S.t("Left the euro in {y}", { y: G.c.GR.exited }) : S.t("In the euro")]); }
    rows.push([S.t("The Troika"), p.noTroika ? none : p.troika.join(", ")]);
    rows.push([S.t("Draghi measures"), p.noDraghi ? none : p.draghi.join(", ")]);
    rows.push([S.t("Left the euro"), exits.length ? exits.map(function (k) { return S.COUNTRY[k].name + " (" + G.c[k].exited + ")"; }).join(", ") : none]);
    rows.push([S.t("Proposals adopted"), passed.length ? passed.map(function (k) { return S.PROPOSALS[k].name + " (" + G.proposals[k].year + ")"; }).join(", ") : none]);
    out.push([S.t("The path"), table(rows, false)]);
    /* The last payment tells the federal years too: the Parliament, its
       instructions, the climate and the Greek loans */
    if (kind === "loans" && G.parl) {
      var fed = [
        [S.t("The Parliament's confidence"), S.t("{v} of 100", { v: Math.round(G.parl.conf) })],
        [S.t("Instructions followed"), String(G.parl.complied || 0)],
        [S.t("Instructions refused"), String(G.parl.refused || 0)],
        [S.t("Climate actions"), S.fmt(G.flags.green || 0, 0)],
        [S.t("The Greek loans"), G.flags.greekSettled ? S.t("Settled in {y}", { y: G.flags.greekSettled }) : S.t("Repaid in full in 2070")]
      ];
      out.push([S.t("The federal years, 2041 to {y}", { y: last }), table(fed, false)]);
    }
    out.push([S.t("Grades, against history"), grades(G)]);
    return out;
  }
  var KINDS = {
    federation: { cls: "fed", title: "The Federation of Europe", sub: "{y}: the Federal Treaty enters into force.", year: function () { return 2041; } },
    loans: { cls: "loans", title: "The last payment", sub: "{y}: the Greek loans of 2010 to 2018 are repaid.", year: function () { return 2070; } },
    over: { cls: "over", title: "The run ends", sub: "{y}", year: function (G) { return G.over ? G.over.year : G.year; } }
  };
  U.endingKind = function (G) { return G.over ? "over" : G.finished === "pre" ? "federation" : "loans"; };

  /* Tab stays among the buttons a full-window screen shows, so the focus
     never reaches the page under it */
  U.trapTab = function (box, e) {
    var bs = Array.prototype.filter.call(box.querySelectorAll("button"), function (b) { return !b.disabled && !b.closest("[hidden], [inert]") && b.getClientRects().length; });
    e.preventDefault();
    if (!bs.length) { box.focus({ preventScroll: true }); return; }
    var i = bs.indexOf(document.activeElement);
    bs[i < 0 ? 0 : (i + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus({ preventScroll: true });
  };

  /* A full-window screen removed with the inspector while it plays comes
     back at once with the focus; gone() says when it has ended for real.
     Returns the observer, to disconnect when the screen ends. */
  U.keepShown = function (box, gone) {
    var ob = new MutationObserver(function () {
      if (gone() || box.isConnected) { return; }
      document.body.appendChild(box);
      if (!box.contains(document.activeElement)) { box.focus({ preventScroll: true }); }
    });
    ob.observe(document.body, { childList: true });
    return ob;
  };

  /* Plays the film for the run; kind, when given, picks the ending
     (for the debug panel); then runs when it closes. covered runs once
     the film covers the window, so a page changed under it (the year
     that ended) never shows through its fade */
  U.cinema = function (G, kind, then, covered) {
    kind = kind || U.endingKind(G);
    /* The film tells the ending, so it plays with reduced motion too: its
       screens then fade in and out without moving */
    var K = KINDS[kind], calm = S.reducedMotion(), step = S.fast ? 350 : 4600;
    var box = el("div", "cine " + K.cls + (calm ? " calm" : ""));
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", S.t("The ending"));
    var stage = el("div", "cine-stage"), live = el("div", "sr-only"); live.setAttribute("aria-live", "polite");
    var list = shots(G, kind).map(function (s) {
      var d = el("div", "cine-shot");
      if (s[0]) { d.appendChild(el("div", "cine-cap", s[0])); }
      d.appendChild(typeof s[1] === "string" ? el("p", "cine-line", s[1]) : s[1]);
      stage.appendChild(d);
      return d;
    });
    var fin = el("div", "cine-shot cine-title");
    if (kind === "federation") { fin.appendChild(ring()); }
    if (kind === "loans") { fin.appendChild(ledger()); }
    fin.appendChild(el("h1", "", S.t(K.title)));
    /* Loans settled early are told as such */
    fin.appendChild(el("p", "cine-cap", kind === "loans" && G.flags.greekSettled ?
      S.t("{y}: the Greek loans, settled in {s}, would have ended this year.", { y: K.year(G), s: G.flags.greekSettled }) : S.t(K.sub, { y: K.year(G) })));
    /* The title stays until the player goes on: Show summary leads into
       the ending's screen, which sums up the run. The debug film, which
       leads nowhere, ends with Close. The title takes no focus or click
       until it shows. */
    var auto = !!then;
    var go = S.button(auto ? S.t("Show summary") : S.t("Close"), { cls: "primary", icon: auto ? "next" : "close", keyAction: "film.summary", onClick: function () { end(); } });
    fin.appendChild(go); fin.inert = true;
    stage.appendChild(fin);
    box.appendChild(stage); box.appendChild(live);
    /* Read holds the screen for as long as it takes, Next moves on by one
       screen, Skip goes to the title. Only these controls move the film:
       a click on the film itself does nothing. */
    var ctl = el("div", "cine-ctl"), held = false;
    var read = S.button(S.t("Read"), { icon: "pause", keyAction: "film.read", onClick: function (e) { e.stopPropagation(); hold(!held); } });
    read.setAttribute("aria-pressed", "false");
    var next = S.button(S.t("Next"), { icon: "next", keyAction: "film.next", onClick: function (e) { e.stopPropagation(); show(at + 1); } });
    var skip = S.button(S.t("Skip"), { icon: "skip", keyAction: "film.skip", onClick: function (e) { e.stopPropagation(); show(list.length, true); } });
    ctl.appendChild(read); ctl.appendChild(next); ctl.appendChild(skip);
    box.appendChild(ctl);
    function hold(on) {
      held = on;
      read.setAttribute("aria-pressed", String(on));
      read.querySelector("span").textContent = on ? S.t("Reading") : S.t("Read");
      clearTimeout(timer);
      if (!on && at >= 0 && at < list.length) { timer = setTimeout(function () { show(at + 1); }, step); }
    }
    /* The film takes the focus, so no key reaches the page under it */
    var before = document.activeElement;
    box.tabIndex = -1;
    document.body.appendChild(box);
    box.focus({ preventScroll: true });
    var keep = U.keepShown(box, function () { return closed; });
    /* The window is covered when the film's fade-in ends; the timer stands
       in when no animation runs */
    var coveredDone = false;
    function cover() { if (coveredDone) { return; } coveredDone = true; clearTimeout(coverTimer); if (covered) { covered(); } }
    box.addEventListener("animationend", function (e) { if (e.target === box) { cover(); } });
    var coverTimer = setTimeout(cover, 1100);
    /* The film opens in silence: the screen darkens, then the first shot
       rises; the title alone sounds */

    var at = -1, timer = null, closed = false;
    /* Shows line i, or the title when i is past the lines */
    function show(i, jump) {
      clearTimeout(timer);
      if (at >= list.length) { return; }
      if (at >= 0 && list[at]) { list[at].classList.remove("in"); list[at].classList.add("out"); }
      at = Math.min(i, list.length);
      if (at < list.length) {
        list[at].classList.add("in");
        live.textContent = list[at].textContent;
        /* Every screen stays as long as the others, unless Read holds it */
        if (!held) { timer = setTimeout(function () { show(at + 1); }, step); }
      } else {
        if (jump) { list.forEach(function (d) { d.classList.remove("in"); d.classList.add("out"); }); }
        fin.classList.add("in"); fin.inert = false;
        live.textContent = fin.textContent;
        /* The title waits for Continue, so Read, Next and Skip have nothing left */
        ctl.hidden = true;
        setTimeout(function () { if (go.isConnected && !closed) { go.focus({ preventScroll: true }); } }, 0);
      }
    }
    function end() {
      if (closed) { return; }
      closed = true; clearTimeout(timer); keep.disconnect();
      document.removeEventListener("keydown", key, true);
      /* A film left before its fade-in ended still lets the page change first */
      cover();
      /* The ending's screen is laid under the film as it fades, in the
         same colors, so the film leads into it */
      box.classList.add("closing", "lead");
      if (then) { then(); }
      /* The focus goes to the screen under the film, or back where it was */
      var scr = document.querySelector(".crash");
      if (scr) { scr.focus({ preventScroll: true }); } else if (before && before.isConnected && before.focus) { before.focus({ preventScroll: true }); }
      setTimeout(function () { box.remove(); }, S.fast ? 0 : 800);
    }
    /* While the film plays, the keys belong to it */
    function key(e) {
      e.stopPropagation();
      if (e.key === "Tab") { U.trapTab(box, e); return; }
      /* With the film's keys off (Settings > Keyboard), Enter and Space
         still press the button that has the focus */
      if (!S.keyOn("film")) { return; }
      /* On the title, each of these keys presses Show summary; a key held down
         from the screen before does not */
      if (at >= list.length) {
        if (S.keyIs(e, "film.summary") || S.keyIs(e, "film.skip") || S.keyIs(e, "film.next")) { e.preventDefault(); if (!e.repeat) { go.click(); } }
        return;
      }
      if (S.keyIs(e, "film.read")) { e.preventDefault(); if (!e.repeat) { hold(!held); } }
      else if (S.keyIs(e, "film.next")) { e.preventDefault(); show(at + 1); }
      else if (S.keyIs(e, "film.skip") || S.keyIs(e, "film.summary")) { e.preventDefault(); show(list.length, true); }
    }
    document.addEventListener("keydown", key, true);
    timer = setTimeout(function () { show(0); }, S.fast ? 50 : 1000);
  };
  /* After the film: the ending's screen, which the film has faded into */
  U.afterEnding = function () {
    if (!S.G) { return; }
    U.review = false; U.render();
  };
  U.playEnding = function (covered) { if (S.G) { U.cinema(S.G, null, U.afterEnding, covered); } };

  /* ---------- The crash screen ----------
     Every bad ending crashes the run, as systemd-bsod shows a failed boot:
     the whole window in the red of the early ending's film, one message in
     large plain type, and little else. The layout is the same for every
     reason: headline, reason, one panel of evidence that fits the reason,
     the same table of facts, the actions, and the stop code. The run can no
     longer be played; Review the run opens it read-only, and Back to the
     summary in its banner returns here. */
  var CRASH = S.ENDINGS;
  var SVG = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var n = document.createElementNS(SVG, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
  function legend(items) {
    var leg = el("div", "crash-legend");
    items.forEach(function (x) { var it = el("span"); it.appendChild(el("span", "sw " + x[0])); it.appendChild(document.createTextNode(x[1])); leg.appendChild(it); });
    return leg;
  }
  /* The map: the states that stayed filled, those that left hatched */
  function mapPanel(G) {
    var s = svg("svg", { viewBox: "0 0 " + S.MAP.w + " " + S.MAP.h, role: "img", preserveAspectRatio: "xMidYMid meet" });
    var defs = svg("defs"), pat = svg("pattern", { id: "crash-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    pat.appendChild(svg("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#ffffff", "stroke-width": 1.5 }));
    defs.appendChild(pat); s.appendChild(defs);
    var left = 0;
    S.mapShapes(G, G.over.year).forEach(function (sh) {
      var c = G.c[sh.code], k = c && c.exited ? "left" : c && c.joined !== null && c.joined <= G.over.year ? "stayed" : "";
      if (k === "left") { left++; }
      s.appendChild(svg("path", { d: sh.d, "class": k }));
    });
    s.setAttribute("aria-label", S.t("Map: {n} states left the euro", { n: left }));
    return [s, legend([["stayed", S.t("In the euro at the end")], ["left", S.t("Left the euro")]])];
  }
  /* A line for each series over the run, with the limit that ended it */
  function linePanel(G, C) {
    var ea = G.series.EA || {}, from = G.startYear, to = G.over.year, W = 600, H = 240, pad = 40, now = G.ea.v || {};
    /* A figure of the record; the last year, not yet in the record when
       the run ends before the year closes, takes the current figure, as
       the facts below do */
    function fig(k, y) { var v = ea[k] && ea[k][y]; return v != null ? v : y === to && now[k] != null ? now[k] : null; }
    var vals = [];
    C.keys.forEach(function (k) { for (var y = from; y <= to; y++) { var v = fig(k[0], y); if (v != null) { vals.push(v); } } });
    if (C.at != null) { vals.push(C.at); }
    var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max.apply(null, vals) * 1.1 || 1;
    /* A run that ends in its first year has one year: it stands in the middle */
    var one = to === from;
    function X(y) { return one ? W / 2 : pad + (y - from) / (to - from) * (W - 2 * pad); }
    function Y(v) { return H - pad - (v - lo) / (hi - lo) * (H - 2 * pad); }
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": C.keys.map(function (k) { return S.t(k[1]); }).join(", ") });
    s.appendChild(svg("line", { x1: pad, y1: H - pad, x2: W - pad, y2: H - pad, "class": "axis" }));
    /* The first and last years under the axis; one year is named once */
    (one ? [from] : [from, to]).forEach(function (y, i) { var t = svg("text", { x: X(y), y: H - 8, "text-anchor": one ? "middle" : i ? "end" : "start" }); t.textContent = String(y); s.appendChild(t); });
    if (C.at != null) { s.appendChild(svg("line", { x1: pad, y1: Y(C.at), x2: W - pad, y2: Y(C.at), "class": "limit" })); }
    var items = [];
    C.keys.forEach(function (k, i) {
      var pts = [], last = null;
      for (var y = from; y <= to; y++) { var v = fig(k[0], y); if (v != null) { pts.push(X(y).toFixed(1) + "," + Y(v).toFixed(1)); last = [y, v]; } }
      s.appendChild(svg("polyline", { points: pts.join(" "), "class": "series s" + i }));
      /* A single year draws no line, so its figure is a dot */
      if (pts.length === 1) { s.appendChild(svg("circle", { cx: X(last[0]), cy: Y(last[1]), r: 5, "class": "point s" + i })); }
      /* The last figure, at the end of its line */
      if (last) { var t = svg("text", { x: X(last[0]) + (pts.length === 1 ? 11 : 6), y: Y(last[1]) + 6, "class": "value" }); t.textContent = S.fmt(last[1]) + "%"; s.appendChild(t); }
      items.push(["line s" + i, S.t(k[1])]);
    });
    if (C.at != null) { items.push(["limit", S.t(C.atLabel)]); }
    return [s, legend(items)];
  }
  /* The record with the Parliament or the ethics committee, as bars out of 100 */
  function barsPanel(G, reason) {
    var rows = reason === "removal" || reason === "expulsion" ? [[S.t("Ethics concerns"), Math.min(100, Math.round((G.ethics || 0) * 100))]] :
      [[S.t("Parliament's confidence"), Math.round(G.parl ? G.parl.conf : 0)],
        [S.t("Instructions followed"), G.parl ? G.parl.complied : 0, true], [S.t("Instructions refused"), G.parl ? G.parl.refused : 0, true]];
    var box = el("div", "crash-bars");
    rows.forEach(function (r) {
      var row = el("div", "crash-bar");
      row.appendChild(el("span", "lbl", r[0]));
      var track = el("span", "track"), fill = el("span", "fill");
      fill.style.width = (r[2] ? Math.min(100, r[1] * 10) : r[1]) + "%";
      track.appendChild(fill); row.appendChild(track);
      row.appendChild(el("span", "val", r[2] ? String(r[1]) : r[1] + " / 100"));
      box.appendChild(row);
    });
    return [box];
  }
  U.crashScreen = function (G) {
    var C = CRASH[G.over.reason] || CRASH.breakup, v = G.ea.v || {};
    var box = el("div", "crash");
    box.setAttribute("role", "alertdialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "crash-title");
    var inner = el("div", "crash-inner");
    var h = el("h1", "", S.t(C.title)); h.id = "crash-title";
    inner.appendChild(h);
    inner.appendChild(el("p", "crash-reason", Gm.OVER[G.over.reason]));
    var panel = el("figure", "crash-panel");
    (C.panel === "map" ? mapPanel(G) : C.panel === "line" ? linePanel(G, C) : barsPanel(G, G.over.reason)).forEach(function (n) { panel.appendChild(n); });
    inner.appendChild(panel);
    var members = Object.keys(G.c).filter(function (k) { var c = G.c[k]; return c.joined !== null && c.joined <= G.over.year; });
    var left = members.filter(function (k) { return G.c[k].exited; });
    var facts = el("dl", "crash-facts");
    function fact(k, val) { facts.appendChild(el("dt", "", k)); facts.appendChild(el("dd", "", val)); }
    fact(S.t("Year"), String(G.over.year));
    fact(S.t("President"), G.president ? G.president.name : "");
    fact(S.t("Years in office"), String(Math.max(0, G.over.year - (G.president && G.president.start || G.startYear))));
    fact(S.t("States in the euro"), S.t("{n} of {m}", { n: members.length - left.length, m: members.length }));
    fact(S.t("Unemployment"), v.u != null ? S.fmt(v.u) + "%" : "n/a");
    fact(S.t("Inflation"), v.p != null ? S.fmt(v.p) + "%" : "n/a");
    fact(S.t("Trust in the bank"), v.trust != null ? S.fmt(v.trust) + "%" : "n/a");
    inner.appendChild(facts);
    /* The main action first, as on the other end screens */
    var acts = el("div", "crash-actions");
    acts.appendChild(S.button(S.t("New game"), { icon: "new", cls: "primary", keyAction: "end.new", press: true, onClick: function () { S.G = null; U.review = false; U.render(); } }));
    acts.appendChild(S.button(S.t("Watch the ending again"), { icon: "play", keyAction: "end.again", press: true, onClick: function () { U.cinema(G, null, U.afterEnding); } }));
    acts.appendChild(S.button(S.t("Review the run"), { icon: "view", keyAction: "end.review", press: true, onClick: function () { U.review = true; U.view = "archive"; U.render(); } }));
    if (S.saves.any()) { acts.appendChild(S.button(S.t("Load a save"), { icon: "open", keyAction: "end.load", press: true, onClick: function () { U.savesDialog("load"); } })); }
    inner.appendChild(acts);
    inner.appendChild(el("p", "crash-code", S.t("Stop code: {c}", { c: C.code })));
    box.appendChild(inner);
    return box;
  };
})();
