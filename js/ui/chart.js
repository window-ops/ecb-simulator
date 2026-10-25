/* Line charts: this run against the record (or, after 2025, against the
   projection without the player's changes). One axis, 2px lines, the record
   dashed so the two series differ by more than color, a legend and direct
   labels at the line ends, a crosshair with a tooltip on hover or touch, and
   a table view. The line draws itself when the chart appears, an animation
   that shows information and runs under reduced motion too. */
(function () {
  var S = window.ECBSIM, el = S.el;
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  /* A scale of round steps: at most five, or fewer when a low chart asks for it */
  function nice(lo, hi, most) {
    most = most || 5;
    if (hi - lo < 1) { var mid = (hi + lo) / 2; lo = mid - 0.5; hi = mid + 0.5; }
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / 4)));
    [1, 2, 2.5, 5, 10, 20, 25, 50].some(function (m) { if (span / (step * m) <= most) { step *= m; return true; } return false; });
    return { lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step: step };
  }
  /* opts: { title, unit, run: {year: v}, rec: {year: v}, recLabel, from, to, width: the drawing width, 600 by default, near the column width in a grid so the text keeps its size, height: the drawing height } */
  S.chart = function (opts) {
    var box = el("div", "chart");
    var head = el("div", "chart-head");
    head.appendChild(el("h4", "", opts.title));
    var tableBtn = S.button(S.t("Table"), { cls: "flat", icon: "table" });
    head.appendChild(tableBtn);
    box.appendChild(head);
    var years = [], y;
    for (y = opts.from; y <= opts.to; y++) { years.push(y); }
    var run = years.map(function (yy) { return opts.run[yy]; }), rec = years.map(function (yy) { return opts.rec[yy]; });
    var vals = run.concat(rec).filter(function (v) { return v != null && isFinite(v); });
    if (!vals.length) { box.appendChild(S.placeholder("chart", S.t("No figures yet."))); return box; }
    /* A gridline every 18px at least, so the axis labels of a low chart never touch */
    var tall = opts.height || (opts.width ? 200 : 220);
    var sc = nice(Math.min.apply(null, vals), Math.max.apply(null, vals), Math.max(2, Math.min(5, Math.floor((tall - 34) / 18))));
    var W = opts.width || 600, Hh = opts.height || (opts.width ? 200 : 220), L = 40, R = opts.width ? 12 : 86, T = 10, B = 24;
    var X = function (i) { return L + (W - L - R) * (years.length === 1 ? 0.5 : i / (years.length - 1)); };
    var Y = function (v) { return T + (Hh - T - B) * (1 - (v - sc.lo) / (sc.hi - sc.lo)); };
    var s = svg("svg", { viewBox: "0 0 " + W + " " + Hh, role: "img", "aria-label": opts.title });
    var grid = svg("g", { "class": "grid" }), axis = svg("g", { "class": "axis" });
    for (var v = sc.lo; v <= sc.hi + 1e-9; v += sc.step) {
      grid.appendChild(svg("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v) }));
      var tx = svg("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }); tx.textContent = S.fmt(v, sc.step < 1 ? 1 : 0); axis.appendChild(tx);
    }
    var every = years.length > 30 ? 10 : years.length > 12 ? 5 : 2;
    years.forEach(function (yy, i) {
      if (yy % every === 0 || i === 0) {
        var t = svg("text", { x: X(i), y: Hh - 6, "text-anchor": "middle" }); t.textContent = yy; axis.appendChild(t);
      }
    });
    s.appendChild(grid); s.appendChild(axis);
    function path(arr) {
      var d = "", pen = false;
      arr.forEach(function (vv, i) {
        if (vv == null || !isFinite(vv)) { pen = false; return; }
        d += (pen ? "L" : "M") + X(i).toFixed(1) + " " + Y(vv).toFixed(1) + " "; pen = true;
      });
      return d;
    }
    var recP = svg("path", { "class": "rec", d: path(rec) });
    var runP = svg("path", { "class": "run draw", d: path(run) });
    s.appendChild(recP); s.appendChild(runP);
    function lastIdx(arr) { for (var i = arr.length - 1; i >= 0; i--) { if (arr[i] != null && isFinite(arr[i])) { return i; } } return -1; }
    var lr = lastIdx(run), lc = lastIdx(rec);
    var labY = [];
    if (lr >= 0) { labY.push({ y: Y(run[lr]), x: X(lr), t: S.t("This run"), c: "var(--series-run)" }); }
    if (lc >= 0) { labY.push({ y: Y(rec[lc]), x: X(lc), t: opts.recLabel, c: "var(--series-record)" }); }
    if (labY.length === 2 && Math.abs(labY[0].y - labY[1].y) < 13) {
      var mid = (labY[0].y + labY[1].y) / 2, up = labY[0].y <= labY[1].y ? 0 : 1;
      labY[up].y = mid - 7; labY[1 - up].y = mid + 7;
    }
    /* In a grid the legend names the lines, so the narrow drawing keeps its width for the plot */
    if (!opts.width) {
      labY.forEach(function (l) {
        var t = svg("text", { "class": "lab", x: W - R + 6, y: l.y + 4 }); t.textContent = l.t; s.appendChild(t);
      });
    }
    if (lr >= 0) { s.appendChild(svg("circle", { "class": "now", cx: X(lr), cy: Y(run[lr]), r: 4 })); }
    /* Crosshair and tooltip */
    var cross = svg("line", { "class": "cross", y1: T, y2: Hh - B, x1: -10, x2: -10, visibility: "hidden" });
    s.appendChild(cross);
    var hit = svg("rect", { "class": "hit", x: L, y: T, width: W - L - R, height: Hh - T - B });
    s.appendChild(hit);
    var tip = null;
    function show(ev) {
      var r = s.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * W / r.width;
      var i = Math.round((px - L) / (W - L - R) * (years.length - 1));
      i = Math.max(0, Math.min(years.length - 1, i));
      cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i)); cross.setAttribute("visibility", "visible");
      if (!tip) { tip = el("div", "popover chart-tip"); document.body.appendChild(tip); }
      S.clear(tip);
      tip.appendChild(el("h4", "", String(years[i])));
      tip.appendChild(el("div", "", S.t("This run") + ": " + (run[i] != null ? S.fmt(run[i]) + opts.unit : "n/a")));
      tip.appendChild(el("div", "", opts.recLabel + ": " + (rec[i] != null ? S.fmt(rec[i]) + opts.unit : "n/a")));
      var cx = r.left + X(i) * r.width / W, cy = r.top + 10;
      tip.style.left = Math.min(window.innerWidth - 180, Math.max(8, cx + 10)) + "px";
      tip.style.top = Math.max(8, cy) + "px";
    }
    function hide() { cross.setAttribute("visibility", "hidden"); if (tip && tip.parentNode) { tip.parentNode.removeChild(tip); } tip = null; }
    hit.addEventListener("mousemove", show); hit.addEventListener("mouseleave", hide);
    hit.addEventListener("touchstart", show, { passive: true }); hit.addEventListener("touchmove", show, { passive: true }); hit.addEventListener("touchend", hide);
    box.appendChild(s);
    requestAnimationFrame(function () {
      try { var len = runP.getTotalLength(); runP.style.setProperty("--len", len); } catch (e) { runP.classList.remove("draw"); }
    });
    var leg = el("div", "legend");
    [["var(--series-run)", S.t("This run"), false], ["var(--series-record)", opts.recLabel, true]].forEach(function (l) {
      var it = el("span");
      var sw = el("span", "sw"); sw.style.background = l[2] ? "repeating-linear-gradient(90deg," + l[0] + " 0 5px, transparent 5px 8px)" : l[0];
      it.appendChild(sw); it.appendChild(document.createTextNode(l[1])); leg.appendChild(it);
    });
    box.appendChild(leg);
    /* Table view */
    var tw = el("div", "table-wrap"); tw.hidden = true;
    var tb = el("table"), th = el("tr");
    [S.t("Year"), S.t("This run"), opts.recLabel].forEach(function (h, i) { th.appendChild(el("th", i ? "num" : "", h)); });
    var thead = el("thead"); thead.appendChild(th); tb.appendChild(thead);
    var tbody = el("tbody");
    years.forEach(function (yy, i) {
      if (run[i] == null && rec[i] == null) { return; }
      var tr = el("tr");
      tr.appendChild(el("td", "", String(yy)));
      tr.appendChild(el("td", "num", run[i] != null ? S.fmt(run[i]) : ""));
      tr.appendChild(el("td", "num", rec[i] != null ? S.fmt(rec[i]) : ""));
      tbody.appendChild(tr);
    });
    tb.appendChild(tbody); tw.appendChild(tb); box.appendChild(tw);
    tableBtn.addEventListener("click", function () { tw.hidden = !tw.hidden; s.style.display = tw.hidden ? "" : "none"; leg.hidden = !tw.hidden; });
    /* In a grid a chart is drawn again at the width it gets, at the same
       height, so its text keeps one size in every cell of every row */
    if (opts.width && opts.height && window.ResizeObserver) {
      var fit = new ResizeObserver(function () {
        var w = Math.round(box.clientWidth);
        if (!box.isConnected || !w || Math.abs(w - opts.width) < 24) { return; }
        fit.disconnect();
        var nb = S.chart(Object.assign({}, opts, { width: w }));
        nb.style.gridColumn = box.style.gridColumn;
        nb.className = box.className;
        box.parentNode.replaceChild(nb, box);
      });
      fit.observe(box);
    }
    return box;
  };
})();
