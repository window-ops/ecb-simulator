/* The map of Europe in the Countries view. Shapes come from js/data/map.js
   (Natural Earth outlines). The player chooses what the map shows: who is
   in the euro, or one indicator in five steps of one blue. Hovering or
   focusing a state shows its figures; clicking it opens its charts below.
   Every color has a legend, a state that left the euro is hatched, and the
   table under the map lists the same figures.

   Three flow modes draw arrows between the states: TARGET2 balances (from
   the states with liabilities to those with claims, shared out in
   proportion to the claims), the year's capital flight (from the states
   money left to those it reached), and the bank's lending to each state's
   banks (from the bank in Frankfurt). A table beside the arrows sorts the
   states by size, by name or by share of output, and the arrows follow
   the states the table shows. */
(function () {
  var S = window.ECBSIM, el = S.el, M = S.model, U = S.ui;
  /* The box of a state's figures stays where it opened on the screen, so a
     scroll of the page, after a tap on a phone or under the pointer,
     closes it, as it closes a popover */
  window.addEventListener("scroll", function (e) {
    var tips = document.querySelectorAll(".map-tip");
    if (!tips.length || (e.target.closest && e.target.closest(".map-tip"))) { return; }
    tips.forEach(function (t) { t.remove(); });
    U.keepTip = false;
    if (U.unpointMap) { U.unpointMap(); }
  }, true);
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  /* Steps for each indicator: five bins, the upper bound of the first four */
  var MODES = {
    member: { name: "Membership" },
    u: { name: "Unemployment", unit: "%", bins: [5, 8, 12, 18] },
    p: { name: "Inflation", unit: "%", bins: [0, 1.5, 3, 6] },
    s: { name: "Spread over Germany", unit: " points", bins: [0.5, 1.5, 3, 6] },
    d: { name: "Debt", unit: "% of output", bins: [40, 60, 90, 120] },
    bank: { name: "Bank stability", unit: "", bins: [30, 50, 70, 85] },
    t2: { name: "TARGET2 balances", flow: true, head: "Balance" },
    flight: { name: "Capital flight", flow: true, head: "Change" },
    lend: { name: "Central bank lending", flow: true, head: "Lending", unit: "% of output", bins: [1, 3, 6, 10] }
  };
  /* The flow figures of a state: the model's, or the record for the year
     before the first one the model ran */
  function flowValue(G, code, key) {
    var v = G.c[code].v, y = G.year - 1;
    if (v && v[key] != null) { return v[key]; }
    if (key === "t2") { return M.t2Record(code, y); }
    if (key === "flight") { return M.t2Record(code, y) - M.t2Record(code, y - 1); }
    return M.lendingRecord(y) * S.COUNTRY[code].weight / 100;
  }
  /* The time of the last touch, so a tap and a mouse place the box differently */
  var lastTouch = 0;
  document.addEventListener("touchstart", function () { lastTouch = Date.now(); }, { passive: true, capture: true });

  /* Small states drawn as a dot as well, so they can be found and clicked */
  var DOTS = { MT: 6, LU: 5, CY: 0 };

  /* The outlines a map draws in year y: Scotland (part: "GB") only once a
     run has made it independent, so the United Kingdom shows whole until
     then (tools/build-map.py) */
  S.mapShapes = function (G, y) {
    y = y == null ? (G ? G.year : 0) : y;
    return S.MAP.shapes.filter(function (sh) {
      if (!sh.part) { return true; }
      var c = G && G.c && G.c[sh.code];
      return !!(c && c.independent != null && c.independent <= y);
    });
  };
  /* A state the run's maps treat as one of the game's: an EU state, or a
     candidate the run assumes, once it is in the EU; before that it is
     drawn as land, as the states outside the EU are */
  S.mapKnown = function (G, code) { return !!(G && G.c && G.c[code]) && S.game.inEU(G, code); };
  function status(G, code) {
    var c = G.c[code];
    if (!c || !S.game.inEU(G, code)) { return "outside"; }
    if (c.exited) { return "left"; }
    if (c.joined !== null && c.joined <= G.year) { return G.programs[code] && G.programs[code].active ? "program" : "member"; }
    return "eu";
  }
  function bin(mode, v) {
    var b = MODES[mode].bins, i = 0;
    while (i < b.length && v >= b[i]) { i++; }
    return i + 1;
  }
  function fill(G, mode, code) {
    var st = status(G, code);
    if (MODES[mode].flow) {
      if (st !== "member" && st !== "program") { return st === "left" ? "url(#hatch)" : null; }
      var f = flowValue(G, code, mode);
      if (mode === "lend") { return "var(--ramp-" + bin(mode, 100 * f / M.gdp(code, G.year - 1)) + ")"; }
      if (Math.abs(f) < 1) { return "var(--map-member-soft)"; }
      return f > 0 ? "var(--flow-in)" : "var(--flow-out)";
    }
    if (mode === "member") {
      return { member: "var(--map-member)", program: "var(--map-program)", eu: "var(--map-eu)", left: "url(#hatch)" }[st];
    }
    if (st === "member" || st === "program") {
      var v = G.c[code].v;
      if (!v || v[mode] == null) { return null; }
      return "var(--ramp-" + bin(mode, v[mode]) + ")";
    }
    return st === "left" ? "url(#hatch)" : null;
  }
  function label(mode, i) {
    var b = MODES[mode].bins, u = MODES[mode].unit;
    if (i === 0) { return S.t("below {v}", { v: b[0] + u }); }
    if (i === b.length) { return S.t("{v} or more", { v: b[b.length - 1] + u }); }
    return b[i - 1] + " to " + b[i] + u;
  }

  S.mapView = function (G) {
    var box = el("section", "map-box");
    var mode = U.mapMode || "member";
    if (G.year >= 2041 && mode === "s") { mode = "member"; }
    var tools = el("div", "map-tools");
    tools.appendChild(el("label", "dim", S.t("Show")));
    var sel = el("select");
    sel.setAttribute("aria-label", S.t("What the map shows"));
    var flowGroup = el("optgroup"); flowGroup.label = S.t("Flows");
    Object.keys(MODES).forEach(function (k) {
      if (k === "s" && G.year >= 2041) { return; }
      var o = el("option", "", S.t(MODES[k].name));
      o.value = k;
      if (k === mode) { o.selected = true; }
      (MODES[k].flow ? flowGroup : sel).appendChild(o);
    });
    sel.appendChild(flowGroup);
    sel.addEventListener("change", function () { U.mapMode = sel.value; U.render(); });
    tools.appendChild(sel);
    /* The two-letter codes on the map can be switched off */
    var codes = U.mapCodes !== false;
    var cl = el("label", "check"), cb = el("input");
    cb.type = "checkbox"; cb.checked = codes;
    cb.addEventListener("change", function () { U.mapCodes = cb.checked; U.render(); });
    cl.appendChild(cb);
    cl.appendChild(document.createTextNode(S.t("State codes")));
    tools.appendChild(cl);
    tools.appendChild(el("span", "dim small", S.t("Click a state to see its charts.")));
    box.appendChild(tools);

    var frame = el("div", "map");
    var s = svg("svg", { viewBox: "0 0 " + S.MAP.w + " " + S.MAP.h, role: "group", "aria-label": S.t("Map of Europe") });
    var defs = svg("defs");
    var pat = svg("pattern", { id: "hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    pat.appendChild(svg("rect", { width: 6, height: 6, fill: "var(--map-land)" }));
    pat.appendChild(svg("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "var(--text-dim)", "stroke-width": 2 }));
    defs.appendChild(pat);
    var head = svg("marker", { id: "flow-head", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: "userSpaceOnUse", orient: "auto" });
    head.appendChild(svg("path", { d: "M0 0L10 5L0 10z", "class": "flow-head" }));
    defs.appendChild(head);
    s.appendChild(defs);
    /* Outlines of the selected and the pointed state, drawn above every
       state so that neighbors drawn later do not cover their borders */
    var ring = svg("path", { "class": "ring" }), hover = svg("path", { "class": "ring" });
    function point(d) { if (d) { hover.setAttribute("d", d); } else { hover.removeAttribute("d"); } }
    U.unpointMap = function () { point(null); };
    /* Pointing at a state or focusing it shows its figures; a click selects
       it and opens its charts below. The redraw a click starts keeps the
       box where it is, near the pointer (U.keepTip), so it does not flicker */
    var tip = U.keepTip ? document.querySelector(".map-tip") : null, handed = false;
    var tipX = U.tipAt ? U.tipAt[0] : 0, tipY = U.tipAt ? U.tipAt[1] : 0, tipRo = null;
    U.keepTip = false;
    /* When the box changes size, it is placed again by the last pointer */
    function watch() {
      if (!window.ResizeObserver || !tip || tipRo) { return; }
      tipRo = new ResizeObserver(function () { if (tip && tip.isConnected) { placeTip(tipX, tipY); } });
      tipRo.observe(tip);
    }
    watch();
    /* Once a click has handed the box to the next map, this one lets it be */
    function hide() {
      if (tipRo) { tipRo.disconnect(); tipRo = null; }
      if (!handed && tip && tip.parentNode) { tip.parentNode.removeChild(tip); }
      tip = null;
    }
    function show(code, x, y) {
      tipX = x; tipY = y;
      if (tip && tip.isConnected) { S.clear(tip); } else {
        tip = el("div", "popover chart-tip map-tip");
        tip.style.left = "0px"; tip.style.top = "0px";
        document.body.appendChild(tip);
      }
      watch();
      var c = S.COUNTRY[code], st = status(G, code), v = G.c[code] && G.c[code].v;
      if (code === "GR" && U.greeceHint) {
        tip.appendChild(el("div", "egg-hint", S.t("You seem obsessed with Greece and its euro crisis.")));
        placeTip(x, y);
        return;
      }
      tip.appendChild(el("h4", "", c.name));
      var line = { member: S.t("In the euro since {y}", { y: G.c[code].joined }), program: S.t("In the euro, under a loan program"),
        eu: S.t("In the EU, not yet in the euro"), left: S.t("Left the euro in {y}", { y: G.c[code].exited }) }[st];
      tip.appendChild(el("div", "", line));
      /* A state that has just joined shows last year's record */
      var fallback = !v && (st === "member" || st === "program");
      if (fallback) { v = M.recordFigures(code, G.year - 1); }
      /* The figures as a small table: a row each, the value with its unit
         and the change from the year before; the row of the map's mode is
         in bold */
      if (v && (st === "member" || st === "program")) {
        tip.appendChild(el("hr", "divider"));
        var yr = G.year - 1, data = el("div", "map-data");
        data.appendChild(el("div", "small dim", S.t("Figures for {y}, change from {p}", { y: yr, p: yr - 1 })));
        var tbl = el("table", "map-figs"), tb = el("tbody"), rows = [];
        function before(key) {
          var ser = (G.series[code] || {})[key];
          if (ser && ser[yr - 1] != null) { return ser[yr - 1]; }
          return yr - 1 >= S.FIRST_YEAR && yr - 1 <= S.LAST_DATA_YEAR ? M.base(code, key, yr - 1) : null;
        }
        function row(key, label, value, unit, dec, change) {
          /* A change that rounds to nothing shows as 0, with no sign */
          var shown = change == null || !isFinite(change) ? null : S.fmt(Math.abs(change), dec);
          var ch = shown == null ? null : Number(shown) === 0 ? S.fmt(0, dec) : (change > 0 ? "+" : "−") + shown;
          rows.push({ key: key, label: label, value: S.fmt(value, dec) + unit, ch: ch });
        }
        [["u", "Unemployment", "%", 1], ["p", "Inflation", "%", 1], ["d", "Debt to output", "%", 0], ["s", "Spread", " points", 1], ["bank", "Banks", " of 100", 0]].forEach(function (f) {
          if (f[0] === "s" && G.year >= 2042) { return; }
          if (v[f[0]] == null) { return; }
          var b = before(f[0]);
          row(f[0], f[1], v[f[0]], f[2], f[3], b == null ? null : v[f[0]] - b);
        });
        if (MODES[mode].flow) { row(mode, MODES[mode].name, flowValue(G, code, mode), " " + S.t("bn €"), 0, null); }
        var showChg = rows.some(function (r) { return r.ch != null; });
        rows.forEach(function (r) {
          var tr = el("tr", r.key === mode ? "on" : "");
          tr.appendChild(el("td", "", S.t(r.label)));
          tr.appendChild(el("td", "num", r.value));
          if (showChg) { tr.appendChild(el("td", "num chg", r.ch == null ? "" : r.ch)); }
          tb.appendChild(tr);
        });
        tbl.appendChild(tb); data.appendChild(tbl);
        tip.appendChild(data);
      }
      placeTip(x, y);
    }
    /* The box opens beside the pointer and follows it. Near the right edge
       it opens on the pointer's left. The pointer's arrow hangs to the right
       of its tip, about 11px wide, so the box keeps 12px from the tip on
       the right but only 6px on the left: the space between the arrow and
       the box looks the same on both sides. After a tap it moves above the point,
       or below it near the top, so the finger does not hide it and the state
       stays in sight for the next tap. */
    function placeTip(x, y) {
      if (!tip || !tip.isConnected) { return; }
      tipX = x; tipY = y; U.tipAt = [x, y];
      var w = tip.offsetWidth, h = tip.offsetHeight, pad = 20, left, top;
      if (Date.now() - lastTouch < 1000) {
        left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2));
        top = y - h - pad >= 8 ? y - h - pad : Math.min(window.innerHeight - h - 8, y + pad);
      } else {
        left = x + 12 + w <= window.innerWidth - 8 ? x + 12 : Math.max(8, x - 6 - w);
        top = Math.max(8, Math.min(window.innerHeight - h - 8, y - 10));
      }
      tip.style.left = left + "px"; tip.style.top = top + "px";
    }
    S.mapShapes(G).forEach(function (sh) {
      var known = S.mapKnown(G, sh.code);
      var f = known ? fill(G, mode, sh.code) : null;
      var p = svg("path", { d: sh.d, "class": known ? "st" : "land" });
      if (!known || !f) {
        p.setAttribute("class", known ? "st land" : "land");
        if (!known) { s.appendChild(p); return; }
      } else {
        p.style.fill = f;
      }
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.setAttribute("aria-label", S.COUNTRY[sh.code].name);
      if (U.country === sh.code) { ring.setAttribute("d", sh.d); }
      p.addEventListener("mousemove", function (e) { point(sh.d); show(sh.code, e.clientX, e.clientY); });
      p.addEventListener("mouseleave", function () { point(null); hide(); });
      /* Keyboard focus places the box beside the state; a click leaves it by the pointer */
      p.addEventListener("focus", function () { if (!p.matches(":focus-visible")) { return; } var r = p.getBoundingClientRect(); point(sh.d); show(sh.code, r.right, r.top); });
      p.addEventListener("blur", function () { point(null); hide(); });
      function pick(e) {
        if (e && e.type === "click" && tip) {
          if (tipRo) { tipRo.disconnect(); tipRo = null; }
          U.keepTip = true; handed = true;
        } else { hide(); }
        U.country = sh.code;
        S.sound.play("select"); U.countryClicked(sh.code); U.render();
      }
      p.addEventListener("click", pick);
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      s.appendChild(p);
      if (DOTS[sh.code] && known) {
        var dot = svg("circle", { cx: sh.cx, cy: sh.cy, r: DOTS[sh.code], "class": "tiny" });
        dot.style.fill = f || "var(--map-land)";
        dot.addEventListener("click", pick);
        dot.addEventListener("mousemove", function (e) { point(sh.d); show(sh.code, e.clientX, e.clientY); });
        dot.addEventListener("mouseleave", function () { point(null); hide(); });
        s.appendChild(dot);
      }
    });
    s.appendChild(ring);
    s.appendChild(hover);
    /* Codes on the states in the euro */
    S.mapShapes(G).forEach(function (sh) {
      if (!codes) { return; }
      var st = S.mapKnown(G, sh.code) ? status(G, sh.code) : "outside";
      if (st !== "member" && st !== "program" && st !== "left") { return; }
      var t = svg("text", { x: sh.cx, y: sh.cy + 4 + (DOTS[sh.code] ? -10 : 0), "class": "code" });
      t.textContent = sh.code;
      s.appendChild(t);
    });
    var flowRows = MODES[mode].flow ? flowTable(G, mode) : null;
    if (flowRows) { s.appendChild(arrows(G, mode, flowRows.shown)); }
    frame.appendChild(s);
    box.appendChild(frame);

    /* Legend */
    var leg = el("div", "legend");
    function item(color, text) {
      var it = el("span"), sw = el("span", "sw");
      sw.style.background = color;
      it.appendChild(sw);
      it.appendChild(document.createTextNode(text));
      leg.appendChild(it);
    }
    var hatch = "repeating-linear-gradient(45deg, var(--text-dim) 0 2px, var(--map-land) 2px 5px)";
    if (mode === "t2" || mode === "flight") {
      item("var(--flow-in)", mode === "t2" ? S.t("Claim: money arrived") : S.t("Money arrived this year"));
      item("var(--flow-out)", mode === "t2" ? S.t("Liability: money left") : S.t("Money left this year"));
      item("var(--flow-line)", S.t("Arrow: from where money left to where it went, as wide as the flow"));
      item(hatch, S.t("Left the euro"));
      item("var(--map-land)", S.t("Not in the euro"));
    } else if (mode === "lend") {
      for (var j = 0; j <= MODES.lend.bins.length; j++) { item("var(--ramp-" + (j + 1) + ")", label(mode, j)); }
      item("var(--flow-line)", S.t("Arrow: from the bank in Frankfurt, as wide as the lending"));
      item("var(--map-land)", S.t("Not in the euro"));
    } else if (mode === "member") {
      item("var(--map-member)", S.t("In the euro"));
      item("var(--map-program)", S.t("In the euro, under a loan program"));
      item("var(--map-eu)", S.t("In the EU, not yet in the euro"));
      item(hatch, S.t("Left the euro"));
      item("var(--map-land)", S.t("Outside the EU"));
    } else {
      for (var i = 0; i <= MODES[mode].bins.length; i++) { item("var(--ramp-" + (i + 1) + ")", label(mode, i)); }
      item(hatch, S.t("Left the euro"));
      item("var(--map-land)", S.t("Not in the euro"));
    }
    box.appendChild(leg);
    if (flowRows) { box.appendChild(flowRows.el); }
    box.appendChild(el("p", "dim small", S.t("Outlines: Natural Earth, 1:50m, public domain.")));
    return box;
  };

  /* ---------- Flows ---------- */
  var SORTS = [["size", "Size"], ["name", "State"], ["gdp", "Share of output"]];
  var TOPS = [[5, "Top 5"], [10, "Top 10"], [0, "All"]];
  function flowTable(G, mode) {
    var y = G.year - 1, sort = U.flowSort || "size", top = U.flowTop == null ? 10 : U.flowTop;
    var rows = M.members(G).map(function (code) {
      var v = flowValue(G, code, mode);
      return { code: code, name: S.COUNTRY[code].name, v: v, gdp: 100 * v / M.gdp(code, y) };
    });
    var key = { size: function (r) { return -Math.abs(r.v); }, gdp: function (r) { return -Math.abs(r.gdp); } }[sort];
    rows.sort(function (a, b) { return key ? key(a) - key(b) : a.name.localeCompare(b.name); });
    var shown = top ? rows.slice(0, top) : rows;
    var sec = el("section", "flows");
    var tools = el("div", "map-tools");
    function select(label, list, value, on) {
      tools.appendChild(el("label", "dim", label));
      var s = el("select"); s.setAttribute("aria-label", label);
      list.forEach(function (x) { var o = el("option", "", S.t(x[1])); o.value = x[0]; if (String(x[0]) === String(value)) { o.selected = true; } s.appendChild(o); });
      s.addEventListener("change", function () { on(s.value); U.render(); });
      tools.appendChild(s);
    }
    select(S.t("Sort by"), SORTS, sort, function (v) { U.flowSort = v; });
    select(S.t("Show"), TOPS, top, function (v) { U.flowTop = Number(v); });
    sec.appendChild(tools);
    var wrap = el("div", "table-wrap"), t = el("table"), tr = el("tr");
    /* Column heads sort too */
    [["name", S.t("State")], ["size", S.t(MODES[mode].head) + ", " + S.t("billion euros")], ["gdp", S.t("% of output")]].forEach(function (h, i) {
      var th = el("th"); if (i) { th.className = "num"; }
      var b = el("button", "th-sort", h[1]); b.type = "button";
      if (sort === h[0]) { b.setAttribute("aria-pressed", "true"); }
      b.addEventListener("click", function () { U.flowSort = h[0]; S.sound.play("select"); U.render(); });
      th.appendChild(b); tr.appendChild(th);
    });
    var thead = el("thead"); thead.appendChild(tr); t.appendChild(thead);
    var tb = el("tbody");
    shown.forEach(function (r) {
      var row = el("tr");
      row.appendChild(el("td", "", r.name));
      row.appendChild(el("td", "num", S.fmt(r.v, 0)));
      row.appendChild(el("td", "num", S.fmt(r.gdp, 1)));
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); sec.appendChild(wrap);
    sec.appendChild(el("p", "dim small", mode === "t2" ? S.t("End of {y}. A claim means money arrived in the state's banks from the rest of the euro area; a liability means it left.", { y: y })
      : mode === "flight" ? S.t("{y}: the change in each TARGET2 balance over the year.", { y: y })
      : S.t("End of {y}: refinancing operations and emergency liquidity.", { y: y })));
    return { el: sec, shown: shown };
  }
  function at(code) {
    var sh = S.MAP.shapes.filter(function (x) { return x.code === code; })[0];
    return sh ? [sh.cx, sh.cy] : null;
  }
  function arrows(G, mode, shown) {
    var g = svg("g", { "class": "flows-layer" }), pairs = [];
    if (mode === "lend") {
      var de = at("DE"), fr = de && [de[0] - 18, de[1] + 14];
      shown.forEach(function (r) { if (r.code !== "DE" && r.v > 0) { pairs.push({ a: fr, b: at(r.code), f: r.v, t: S.t("To {c}: {v} billion euros", { c: r.name, v: S.fmt(r.v, 0) }) }); } });
      if (fr) { var dot = svg("circle", { cx: fr[0], cy: fr[1], r: 5, "class": "flow-origin" }); var tt = svg("title"); tt.textContent = S.t("The bank, Frankfurt"); dot.appendChild(tt); g.appendChild(dot); }
    } else {
      var out = shown.filter(function (r) { return r.v < 0; }), inn = shown.filter(function (r) { return r.v > 0; });
      var total = inn.reduce(function (s, r) { return s + r.v; }, 0);
      out.forEach(function (o) {
        inn.forEach(function (i) {
          var f = -o.v * i.v / total;
          pairs.push({ a: at(o.code), b: at(i.code), f: f, t: S.t("{a} to {b}: {v} billion euros", { a: o.name, b: i.name, v: S.fmt(f, 0) }) });
        });
      });
    }
    var max = pairs.reduce(function (m, p) { return Math.max(m, p.f); }, 0);
    /* The 12 largest flows, so the map stays readable */
    pairs.filter(function (p) { return p.a && p.b && p.f >= max * 0.08; }).sort(function (x, y) { return y.f - x.f; }).slice(0, 12).forEach(function (p) {
      var dx = p.b[0] - p.a[0], dy = p.b[1] - p.a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ex = p.b[0] - dx / len * 6, ey = p.b[1] - dy / len * 6;
      var cx = (p.a[0] + ex) / 2 - dy / len * len * 0.18, cy = (p.a[1] + ey) / 2 + dx / len * len * 0.18;
      var path = svg("path", { d: "M" + p.a[0] + " " + p.a[1] + "Q" + cx + " " + cy + " " + ex + " " + ey, "class": "flow", "marker-end": "url(#flow-head)" });
      path.style.strokeWidth = (1.5 + 9 * Math.sqrt(p.f / max)).toFixed(1);
      var title = svg("title"); title.textContent = p.t; path.appendChild(title);
      g.appendChild(path);
    });
    return g;
  }
})();
