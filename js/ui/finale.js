/* The screens that end a period, after their film: the Federation of 2041
   in the film's blue, and the true ending of 2070 (the last Greek
   payment) in its slate. Both have the crash screen's layout (headline,
   reason, a panel, the table of facts, the actions). The film fades into
   them; the 2070 screen offers a time-lapse of the run to Bella ciao: the
   map year by year with the main figures and one headline a year, then
   the charts drawing themselves, then a coda that waits for Show
   summary. A
   screen stays until the player chooses what comes next; reviewing the
   run keeps it read-only. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, Gm = S.game;
  var SVG = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var n = document.createElementNS(SVG, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }

  /* The screen that takes the window at the end of a run or a period: the
     crash screen after a bad ending, the Federation after 2041, the
     finale after 2070 */
  U.endScreenFor = function (G) { return !G ? null : G.over ? "crash" : G.finished === "pre" ? "federation" : G.finished === "post" ? "finale" : null; };

  function years(G) { var out = [], last = Gm.shownYear(G); for (var y = G.startYear; y <= last; y++) { out.push(y); } return out; }
  function fig(G, k, y) { var s = G.series.EA && G.series.EA[k]; return s && s[y] != null ? s[y] : null; }
  function headline(G, y) {
    var news = G.log.filter(function (l) { return l.y === y && (l.k === "news" || l.k === "bad" || l.k === "good"); })[0];
    var dec = G.log.filter(function (l) { return l.y === y && l.k === "decision" && !/^Interest rates/.test(l.t); })[0];
    return (news || dec || {}).t || "";
  }
  /* The state of each member in a year: in the euro, under a loan program, or gone */
  function statusIn(G, code, y) {
    var c = G.c[code]; if (!c) { return ""; }
    if (c.exited && c.exited <= y) { return "left"; }
    if (c.joined === null || c.joined > y) { return ""; }
    var p = G.programs[code];
    return p && p.start <= y && y < p.end ? "program" : "stayed";
  }

  /* A period's end screen: the headline, the reason, the grades, the
     facts of the run, then the actions with the main one first */
  function periodScreen(G, o) {
    var box = el("div", "crash " + o.cls);
    box.setAttribute("role", "alertdialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", o.cls + "-title");
    var inner = el("div", "crash-inner");
    var h = el("h1", "", o.title); h.id = o.cls + "-title";
    inner.appendChild(h);
    inner.appendChild(el("p", "crash-reason", o.reason));
    var panel = el("figure", "crash-panel finale-grades");
    var gr = Gm.grades(G), names = { stability: S.t("Stable prices"), welfare: S.t("Jobs and output"), democracy: S.t("Trust and democracy"), climate: S.t("Climate"), greece: S.t("Greece") };
    var list = el("div", "finale-grade-list");
    Object.keys(gr).forEach(function (k) {
      if (!gr[k] || !gr[k].l) { return; }
      var it = el("div", "finale-grade");
      it.appendChild(el("span", "letter", gr[k].l));
      it.appendChild(el("span", "", names[k] || k));
      list.appendChild(it);
    });
    panel.appendChild(list);
    panel.appendChild(el("p", "crash-legend", S.t("Grades from A to F, against the record.")));
    inner.appendChild(panel);
    var facts = el("dl", "crash-facts"), v = G.ea.v || {}, yr = Gm.shownYear(G);
    function fact(k, val) { facts.appendChild(el("dt", "", k)); facts.appendChild(el("dd", "", val)); }
    var members = Object.keys(G.c).filter(function (k) { var c = G.c[k]; return c.joined !== null && c.joined <= yr; });
    var left = members.filter(function (k) { return G.c[k].exited; });
    fact(S.t("Year"), String(yr));
    fact(S.t("President"), G.president ? G.president.name : "");
    fact(S.t("Years in office"), String(Math.max(0, yr - (G.president && G.president.start || G.startYear))));
    fact(S.t("States in the euro"), S.t("{n} of {m}", { n: members.length - left.length, m: members.length }));
    fact(S.t("Unemployment"), v.u != null ? S.fmt(v.u) + "%" : "n/a");
    fact(S.t("Inflation"), v.p != null ? S.fmt(v.p) + "%" : "n/a");
    fact(S.t("Trust in the bank"), v.trust != null ? S.fmt(v.trust) + "%" : "n/a");
    inner.appendChild(facts);
    var acts = el("div", "crash-actions");
    /* Each action has its key (Settings > Keyboard > End screens) */
    o.actions.forEach(function (a) { acts.appendChild(S.button(a[0], { icon: a[1], cls: a[3] ? "primary" : "", keyAction: a[4], press: !!a[4], onClick: a[2] })); });
    inner.appendChild(acts);
    box.appendChild(inner);
    return box;
  }
  /* The actions of an end screen in one row when they fit at their full
     labels, else in two even rows, else in one column, so none is left
     alone on a line. Measured once the screen is in the page, and again
     when the window or the text size changes. */
  U.fitActions = function (screen) {
    var acts = screen && screen.querySelector(".crash-actions"); if (!acts) { return; }
    var btns = Array.prototype.slice.call(acts.children), n = btns.length;
    btns.forEach(function (b) { b.style.width = "max-content"; });
    var w = btns.map(function (b) { return b.getBoundingClientRect().width; });
    btns.forEach(function (b) { b.style.width = ""; });
    var W = acts.clientWidth, gap = parseFloat(getComputedStyle(acts).columnGap) || 10;
    var sum = w.reduce(function (a, b) { return a + b; }, 0), max = Math.max.apply(null, w);
    var one = sum + gap * (n - 1) <= W, two = n % 2 === 0 && max * 2 + gap <= W;
    acts.classList.toggle("one-row", one);
    acts.style.setProperty("--cols", one ? n : two ? 2 : 1);
  };
  window.addEventListener("resize", function () { U.fitActions(document.querySelector(".crash")); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { U.fitActions(document.querySelector(".crash")); }); }
  function again(G) { return [S.t("Watch the ending again"), "play", function () { U.cinema(G, null, U.afterEnding); }, false, "end.again"]; }
  function review() { return [S.t("Review the run"), "view", function () { U.review = true; U.view = "archive"; U.render(); }, false, "end.review"]; }
  function newGame() { return [S.t("New game"), "new", function () { S.G = null; U.review = false; U.render(); }, false, "end.new"]; }

  U.federationScreen = function (G) {
    return periodScreen(G, { cls: "federation", title: S.t("2041: the Federation of Europe"),
      reason: S.t("The Federal Treaty enters into force. The European Union becomes the Federation of Europe, with one budget and one debt shared by its member states."),
      actions: [[S.t("Continue into the Federation"), "next", function () { Gm.toFederation(G); S.saves.write("auto", G); U.cardIndex = 0; U.render(); }, true, "end.continue"],
        again(G), review(), newGame()] });
  };
  U.finaleScreen = function (G) {
    return periodScreen(G, { cls: "finale", title: S.t("Your presidency is complete"),
      reason: S.t("The last payment on the Greek loans of 2010 to 2018 falls due. The Federation's institutions continue without you, and the bank no longer needs its president."),
      actions: [[S.t("Watch the time-lapse"), "play", function () { U.timelapse(G); }, true, "end.timelapse"], again(G), review(), newGame()] });
  };

  /* ---------- The time-lapse ----------
     Read (R) holds a year; Speed (F) plays it at one, two or four times
     the pace; Skip (Escape) goes to the coda. After the last year of the
     charts holds, the coda brings back the map of the last year, with
     every border inside the Federation gone, while Bella ciao rings out
     into the finale's piece. Show summary (Enter or Escape) fades it back
     into the finale. Every change fades the whole stage at once (the
     first year with the time-lapse itself), so the map never fades apart
     from the year, the figures and the headline. */
  var SPEEDS = [1, 2, 4];
  U.timelapse = function (G) {
    /* One at a time: a second press of its button does not start another */
    if (document.querySelector(".timelapse:not(.closing)")) { return; }
    var ys = years(G), base = S.fast ? 120 : 650, speed = 0, half = ys.length, last = ys[ys.length - 1];
    function step() { return base / SPEEDS[speed]; }
    var box = el("div", "cine loans timelapse");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", S.t("Time-lapse of the run"));
    var stage = el("div", "tl-stage"), yearEl = el("div", "tl-year"), figs = el("div", "tl-figs"), head = el("p", "tl-head"), live = el("div", "sr-only");
    live.setAttribute("aria-live", "polite");
    stage.appendChild(yearEl);
    var draw = el("div", "tl-draw"); stage.appendChild(draw);
    stage.appendChild(figs); stage.appendChild(head);
    box.appendChild(stage); box.appendChild(live);
    /* The map: one path a state, recolored each year */
    var map = svg("svg", { viewBox: "0 0 " + S.MAP.w + " " + S.MAP.h, role: "img", "aria-label": S.t("Map of the euro area by year") });
    var defs = svg("defs"), pat = svg("pattern", { id: "tl-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    pat.appendChild(svg("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#ffffff", "stroke-width": 1.5 }));
    defs.appendChild(pat); map.appendChild(defs);
    var paths = S.MAP.shapes.map(function (sh) { var p = svg("path", { d: sh.d }); map.appendChild(p); return [sh.code, p]; });
    /* The borders between the Federation's members dissolve: from 2041
       each member's own outline turns, a little more each year, from the
       background's color to the white of its fill (--tl-t, css/app.css),
       and in the last year the two are the same and the borders are gone.
       No layer is laid over the borders: the edge of a stroke on top would
       share its pixels with the edge of the line under it and leave a
       faint line at every zoom, and a white outline on each member also
       closes the seam between two members' fills. The outlines of the
       states outside the Federation are drawn again on top in their own
       style from the first year, so its outer border keeps the same line
       throughout. */
    var outer = S.MAP.shapes.map(function (sh) { var p = svg("path", { d: sh.d, "class": "tl-outer" }); map.appendChild(p); return [sh.code, p]; });
    var legend = el("div", "crash-legend");
    [["stayed", S.t("In the euro")], ["program", S.t("Under a loan program")], ["left", S.t("Left the euro")]].forEach(function (x) {
      var it = el("span"); it.appendChild(el("span", "sw " + x[0])); it.appendChild(document.createTextNode(x[1])); legend.appendChild(it);
    });
    /* The charts: unemployment, inflation and trust, drawn up to the year shown */
    var W = 600, H = 260, pad = 40, KEYS = [["u", S.t("Unemployment")], ["p", S.t("Inflation")], ["trust", S.t("Trust in the bank")]];
    var chart = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": KEYS.map(function (k) { return k[1]; }).join(", ") });
    var hi = 0; KEYS.forEach(function (k) { ys.forEach(function (y) { var v = fig(G, k[0], y); if (v != null && v > hi) { hi = v; } }); }); hi = hi * 1.1 || 1;
    function X(y) { return pad + (ys.length > 1 ? (y - ys[0]) / (last - ys[0]) * (W - 2 * pad) : 0); }
    function Y(v) { return H - pad - Math.max(0, v) / hi * (H - 2 * pad); }
    chart.appendChild(svg("line", { x1: pad, y1: H - pad, x2: W - pad, y2: H - pad, "class": "axis" }));
    [ys[0], last].forEach(function (y, i) { var t = svg("text", { x: X(y), y: H - 10, "text-anchor": i ? "end" : "start" }); t.textContent = String(y); chart.appendChild(t); });
    var lines = KEYS.map(function (k, i) { var l = svg("polyline", { points: "", "class": "series s" + i }); chart.appendChild(l); return l; });
    var chartLegend = el("div", "crash-legend");
    KEYS.forEach(function (k, i) { var it = el("span"); it.appendChild(el("span", "sw line s" + i)); it.appendChild(document.createTextNode(k[1])); chartLegend.appendChild(it); });

    var ctl = el("div", "cine-ctl"), held = false, at = -1, timer = null, waits = [], closed = false, coda = false;
    var read = S.button(S.t("Read"), { icon: "pause", keyAction: "film.read", onClick: function (e) { e.stopPropagation(); hold(!held); } });
    read.setAttribute("aria-pressed", "false");
    var fast = S.button(S.t("Speed {n}×", { n: 1 }), { icon: "next", keyAction: "film.speed", onClick: function (e) { e.stopPropagation(); faster(); } });
    var skip = S.button(S.t("Skip"), { icon: "skip", keyAction: "film.skip", onClick: function (e) { e.stopPropagation(); toCoda(); } });
    ctl.appendChild(read); ctl.appendChild(fast); ctl.appendChild(skip); box.appendChild(ctl);
    /* The coda's way out, back to the finale's summary, shown with the coda */
    var out = el("div", "tl-end"); out.hidden = true;
    var go = S.button(S.t("Show summary"), { cls: "primary", icon: "next", keyAction: "film.summary", onClick: function () { end(); } });
    out.appendChild(go); stage.appendChild(out);
    /* The time-lapse takes the focus, so no key reaches the finale under it */
    box.tabIndex = -1;
    document.body.appendChild(box);
    box.focus({ preventScroll: true });
    var keep = U.keepShown(box, function () { return closed; });
    S.music.play("timelapse");
    function later(fn, ms) { waits.push(setTimeout(fn, ms)); }

    function figsFor(y) {
      S.clear(figs);
      [["u", S.t("Unemployment")], ["p", S.t("Inflation")], ["trust", S.t("Trust")]].forEach(function (k) {
        var v = fig(G, k[0], y), d = el("div", "tl-fig");
        d.appendChild(el("span", "tl-fig-v", v == null ? "n/a" : S.fmt(v) + "%")); d.appendChild(el("span", "tl-fig-k", k[1]));
        figs.appendChild(d);
      });
    }
    function showDrawing(charts) {
      S.clear(draw);
      if (charts) { draw.appendChild(chart); draw.appendChild(chartLegend); } else { draw.appendChild(map); draw.appendChild(legend); }
    }
    /* The stage fades out, changes while it is clear, and fades back in as
       one; fn runs in between. A later fade (Skip during this one) takes
       over, and this one then does nothing */
    var fades = 0, fading = false;
    function across(fn) {
      var n = ++fades; fading = true;
      stage.classList.add("tl-leave");
      later(function () { if (closed || n !== fades) { return; } fading = false; fn(); stage.classList.remove("tl-leave"); }, S.fast ? 0 : 900);
    }
    /* The map in year y. From 2041 to the last year the members' outlines
       turn from the background's color to white; ms is how long the change
       to this year's shade takes */
    function mapYear(y, ms) {
      var t = y >= 2041 && last > 2040 ? Math.min(1, (y - 2040) / (last - 2040)) : 0;
      /* Scotland's outline shows from the year a run makes it independent (S.mapShapes) */
      var drawn = {}; S.mapShapes(G, y).forEach(function (sh) { drawn[sh.code] = true; });
      paths.forEach(function (p, i) {
        var st = statusIn(G, p[0], y), member = st === "stayed";
        p[1].setAttribute("class", st);
        p[1].style.display = drawn[p[0]] ? "" : "none";
        outer[i][1].style.display = member || !drawn[p[0]] ? "none" : "";
        outer[i][1].setAttribute("class", "tl-outer" + (st ? " o-" + st : ""));
      });
      map.style.setProperty("--tl-ease", Math.round(ms || 0) + "ms");
      map.style.setProperty("--tl-t", t.toFixed(3));
    }
    function chartsTo(y) {
      lines.forEach(function (l, j) {
        var pts = []; ys.forEach(function (yy) { if (yy > y) { return; } var v = fig(G, KEYS[j][0], yy); if (v != null) { pts.push(X(yy).toFixed(1) + "," + Y(v).toFixed(1)); } });
        l.setAttribute("points", pts.join(" "));
      });
    }
    function show(i, ready) {
      clearTimeout(timer);
      if (coda || closed) { return; }
      /* The charts come in with the whole stage: it fades out on the map's
         last year and back in on the charts' first */
      if (i === half && !ready) { at = i; across(function () { show(half, true); }); return; }
      at = i;
      /* The last year of the charts holds a while before the coda */
      if (at >= 2 * half) { timer = setTimeout(toCoda, S.fast ? 100 : 1800); return; }
      var y = ys[at % half], charts = at >= half;
      if (at === 0 || at === half) { showDrawing(charts); }
      yearEl.textContent = String(y);
      if (charts) { chartsTo(y); } else { mapYear(y, at ? step() : 0); }
      figsFor(y);
      head.textContent = headline(G, y);
      live.textContent = y + ". " + head.textContent;
      if (!held) { timer = setTimeout(function () { show(at + 1); }, step()); }
    }
    function hold(on) {
      if (coda) { return; }
      held = on; read.setAttribute("aria-pressed", String(on));
      read.querySelector("span").textContent = on ? S.t("Reading") : S.t("Read");
      clearTimeout(timer);
      if (!on && at >= 0 && !fading) { timer = setTimeout(function () { show(at + 1); }, step()); }
    }
    /* Each press doubles the pace, up to four times, then starts again at
       the first; the year shown moves on at the new pace */
    function faster() {
      if (coda) { return; }
      speed = (speed + 1) % SPEEDS.length;
      fast.querySelector("span").textContent = S.t("Speed {n}×", { n: SPEEDS[speed] });
      fast.setAttribute("aria-pressed", String(speed > 0));
      if (!held && at >= 0 && at < 2 * half && !fading) { clearTimeout(timer); timer = setTimeout(function () { show(at + 1); }, step()); }
    }
    /* The coda: the stage fades out, then comes back with the map of the
       last year, the run's span and its last figures, and Continue. The
       music switches quickly back to the finale's piece. */
    function toCoda() {
      if (coda || closed) { return; }
      coda = true; clearTimeout(timer);
      ctl.hidden = true;
      S.music.stopForced();
      across(function () {
        stage.classList.add("tl-coda");
        showDrawing(false);
        mapYear(last, 0);
        yearEl.textContent = S.t("{a} to {b}", { a: ys[0], b: last });
        figsFor(last);
        head.textContent = S.t("{n} years of the run, from the first decision to the last payment on the Greek loans.", { n: ys.length });
        live.textContent = yearEl.textContent + ". " + head.textContent;
        out.hidden = false;
        go.focus({ preventScroll: true });
      });
    }
    function end() {
      if (closed) { return; }
      closed = true; clearTimeout(timer); waits.forEach(clearTimeout); keep.disconnect();
      document.removeEventListener("keydown", key, true);
      S.music.stopForced();
      /* It fades back into the finale under it, as the film fades into it,
         and the finale takes the focus again */
      box.classList.add("closing", "lead");
      var scr = document.querySelector(".crash");
      if (scr) { scr.focus({ preventScroll: true }); }
      setTimeout(function () { box.remove(); }, S.fast ? 0 : 800);
    }
    function key(e) {
      e.stopPropagation();
      if (e.key === "Tab") { U.trapTab(box, e); return; }
      /* With its keys off, Enter and Space still press the focused button */
      if (!S.keyOn("film")) { return; }
      if (coda) {
        if (S.keyIs(e, "film.summary") || S.keyIs(e, "film.skip") || S.keyIs(e, "film.next")) { e.preventDefault(); if (!e.repeat && !out.hidden) { go.click(); } }
        return;
      }
      if (S.keyIs(e, "film.read")) { e.preventDefault(); if (!e.repeat) { hold(!held); } }
      else if (S.keyIs(e, "film.speed")) { e.preventDefault(); if (!e.repeat) { faster(); } }
      else if (S.keyIs(e, "film.skip")) { e.preventDefault(); toCoda(); }
      /* Enter and Space act only on a control of the time-lapse that has the focus */
      else if ((e.key === "Enter" || e.key === " ") && !box.contains(document.activeElement)) { e.preventDefault(); }
    }
    document.addEventListener("keydown", key, true);
    /* The first year is in place as the time-lapse fades in, so it comes in
       whole; the years move on once the fade has ended */
    show(0);
    clearTimeout(timer);
    if (!held) { timer = setTimeout(function () { show(1); }, (S.fast ? 50 : 900) + step()); }
  };
})();
